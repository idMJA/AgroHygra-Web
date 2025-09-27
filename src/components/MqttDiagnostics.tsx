"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Activity, MessageCircle, AlertCircle } from "lucide-react";
import type { SensorData } from "@/hooks/useMqtt";

interface SystemStatus {
	device: string;
	status: string;
	lastSeen: number;
}

interface MqttDiagnosticsProps {
	isConnected: boolean;
	error: string | null;
	logs: string[];
	clearLogs: () => void;
	sensorData: SensorData | null;
	systemStatus: SystemStatus | null;
}

export function MqttDiagnostics({ 
	isConnected, 
	error, 
	logs, 
	clearLogs,
	sensorData,
	systemStatus 
}: MqttDiagnosticsProps) {
	const lastSensorUpdate = sensorData ? new Date(sensorData.time * 1000).toLocaleString() : 'Never';
	
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{isConnected ? (
						<Wifi className="h-5 w-5 text-green-600" />
					) : (
						<WifiOff className="h-5 w-5 text-red-600" />
					)}
					MQTT Diagnostics
					<Badge variant={isConnected ? "default" : "destructive"}>
						{isConnected ? "Connected" : "Disconnected"}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Connection Status */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4" />
							<span className="font-medium">Connection Status</span>
						</div>
						<div className="text-sm space-y-1">
							<div>Broker: wss://broker.hivemq.com:8884/mqtt</div>
							<div>Status: {isConnected ? "✅ Connected" : "❌ Disconnected"}</div>
							{error && (
								<div className="flex items-center gap-1 text-red-600">
									<AlertCircle className="h-3 w-3" />
									{error}
								</div>
							)}
						</div>
					</div>
					
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<MessageCircle className="h-4 w-4" />
							<span className="font-medium">Data Status</span>
						</div>
						<div className="text-sm space-y-1">
							<div>Last sensor data: {lastSensorUpdate}</div>
							<div>System status: {systemStatus ? "✅ Received" : "❌ Waiting"}</div>
							<div>Total logs: {logs.length}</div>
						</div>
					</div>
				</div>

				{/* Recent Logs */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="font-medium">Recent Logs (last 10)</span>
						<Button variant="outline" size="sm" onClick={clearLogs}>
							Clear Logs
						</Button>
					</div>
					<div className="bg-muted p-3 rounded-md max-h-48 overflow-y-auto">
						{logs.length === 0 ? (
							<p className="text-sm text-muted-foreground">No logs received yet...</p>
						) : (
							<div className="text-xs space-y-1 font-mono">
								{logs.slice(-10).map((log) => (
									<div key={`${Date.now()}-${Math.random()}`} className="text-muted-foreground">
										{log}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Debug Info */}
				<div className="text-xs text-muted-foreground border-t pt-3">
					<strong>Debug:</strong> Check browser console for detailed MQTT messages. 
					Expected topics: agrohygra/sensors (every 2s), agrohygra/system/status (retained), 
					agrohygra/pump/status, agrohygra/logs
				</div>
			</CardContent>
		</Card>
	);
}