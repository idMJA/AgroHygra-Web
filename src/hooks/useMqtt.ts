"use client";

import mqtt, { type MqttClient } from "mqtt";
import { useCallback, useEffect, useState } from "react";

export interface NPKData {
	n: number; // Nitrogen (mg/kg)
	p: number; // Phosphorus (mg/kg)
	k: number; // Potassium (mg/kg)
	ph: number; // pH level
	ec: number; // Electrical conductivity (mS/cm)
	soilTemp: number; // Soil temperature (°C)
	soilMoisture: number; // Soil moisture (%)
}

export interface SensorData {
	device: string;
	time: number;
	soil: number;
	temp: number;
	hum: number;
	air: number;
	airRaw: number;
	airGood: boolean;
	ppm: number;
	pump: boolean;
	count: number;
	wtime: number;
	uptime: number;
	tdsRaw?: number;
	tds?: number;
	npk?: NPKData;
}

interface SystemStatus {
	device: string;
	status: string;
	lastSeen: number;
}

interface MqttData {
	sensorData: SensorData | null;
	pumpStatus: boolean;
	systemStatus: SystemStatus | null;
	logs: string[];
	isConnected: boolean;
	error: string | null;
}

// Use the HiveMQ public broker WebSocket endpoint for browser clients.
// The ESP32/embedded device can use plain TCP on port 1883, but browsers
// must connect via WebSockets (default HiveMQ websockets port is 8000).
const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt";

export function useMqtt(): MqttData & {
	sendPumpCommand: (command: boolean) => void;
	clearLogs: () => void;
	lastReceived: number | null;
	justReceived: boolean;
} {
	const [client, setClient] = useState<MqttClient | null>(null);
	const [sensorData, setSensorData] = useState<SensorData | null>(null);
	const [pumpStatus, setPumpStatus] = useState<boolean>(false);
	const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
	const [logs, setLogs] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// NEW: last received timestamp + transient flag
	const [lastReceived, setLastReceived] = useState<number | null>(null);
	const [justReceived, setJustReceived] = useState<boolean>(false);
	const JUST_RECEIVED_MS = 1500; // duration of flash indicator

	useEffect(() => {
		console.log("Initializing MQTT connection to:", MQTT_BROKER);

		const mqttClient = mqtt.connect(MQTT_BROKER, {
			clientId: `agrohygra-web-${Math.random().toString(36).substr(2, 9)}`,
			reconnectPeriod: 1000,
			keepalive: 60,
			protocolVersion: 4,
			clean: true,
		});

		mqttClient.on("connect", () => {
			console.log("✅ Connected to MQTT broker");
			setIsConnected(true);
			setError(null);

			const topics = [
				"agrohygra/sensors",
				"agrohygra/pump/status",
				"agrohygra/system/status",
				"agrohygra/logs",
			];

			topics.forEach((topic) => {
				mqttClient.subscribe(topic, { qos: 0 }, (err) => {
					if (err) {
						console.error(`❌ Failed to subscribe to ${topic}:`, err);
					} else {
						console.log(`✅ Subscribed to ${topic}`);
					}
				});
			});

			// If broker uses retained messages for system status, we'll receive it immediately
			console.log("🔄 Requesting retained system status...");
		});

		mqttClient.on("error", (err) => {
			console.error("❌ MQTT connection error:", err);
			setError(err.message ?? String(err));
			setIsConnected(false);
		});

		mqttClient.on("offline", () => {
			console.log("🔌 MQTT client offline");
			setIsConnected(false);
		});

		mqttClient.on("reconnect", () => {
			console.log("🔄 MQTT client reconnecting...");
		});

		mqttClient.on("message", (topic, message) => {
			const payload = message.toString();
			console.log(`📨 Received message on ${topic}:`, payload);

			// update lastReceived + transient justReceived flag for UI
			setLastReceived(Date.now());
			setJustReceived(true);
			// clear the "justReceived" flag after a short duration
			window.setTimeout(() => setJustReceived(false), JUST_RECEIVED_MS);

			try {
				switch (topic) {
					case "agrohygra/sensors": {
						console.log("🌱 Processing sensor data...");
						const sensorPayload = JSON.parse(payload) as SensorData;
						setSensorData(sensorPayload);
						// 🔄 Auto-update pump status from sensor data
						setPumpStatus(sensorPayload.pump);
						console.log("✅ Sensor data updated:", sensorPayload.device);
						console.log(
							"💧 Pump status auto-updated from sensor:",
							sensorPayload.pump,
						);
						break;
					}

					case "agrohygra/pump/status":
						console.log("💧 Processing pump status...");
						setPumpStatus(payload.toUpperCase() === "ON");
						break;

					case "agrohygra/system/status": {
						console.log("🖥️ Processing system status...");
						const systemPayload = JSON.parse(payload) as SystemStatus;
						setSystemStatus(systemPayload);
						break;
					}

					case "agrohygra/logs":
						console.log("📝 Processing log message...");
						setLogs((prev) => [
							...prev.slice(-49),
							`${new Date().toLocaleTimeString()}: ${payload}`,
						]);
						break;

					default:
						console.log(`❓ Unknown topic: ${topic}`);
				}
			} catch (err) {
				console.error(
					`❌ Error parsing message from ${topic}:`,
					err,
					"Raw payload:",
					payload,
				);
				// treat as plain text log if parsing failed and topic is logs
				if (topic === "agrohygra/logs") {
					setLogs((prev) => [
						...prev.slice(-49),
						`${new Date().toLocaleTimeString()}: ${payload}`,
					]);
				}
			}
		});

		setClient(mqttClient);

		return () => {
			console.log("🔌 Cleaning up MQTT connection...");
			if (mqttClient) {
				mqttClient.end();
			}
		};
	}, []);

	// sendPumpCommand and clearLogs remain same as before
	const sendPumpCommand = useCallback(
		(command: boolean) => {
			if (client && isConnected) {
				const payload = command ? "ON" : "OFF";
				client.publish("agrohygra/pump/command", payload, { qos: 0 }, (err) => {
					if (err) {
						console.error("Failed to send pump command:", err);
						setError(`Failed to send pump command: ${err.message}`);
					} else {
						console.log(`Pump command sent: ${payload}`);
					}
				});
			} else {
				setError("Not connected to MQTT broker");
			}
		},
		[client, isConnected],
	);

	const clearLogs = useCallback(() => {
		setLogs([]);
	}, []);

	return {
		sensorData,
		pumpStatus,
		systemStatus,
		logs,
		isConnected,
		error,
		sendPumpCommand,
		clearLogs,
		// NEW exported fields:
		lastReceived,
		justReceived,
	};
}
