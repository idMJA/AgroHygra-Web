"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplet, Wind, Sprout } from "lucide-react";
import type { SensorData } from "@/hooks/useMqtt";

interface SensorCardProps {
	data: SensorData | null;
	isConnected: boolean;
	lastReceived?: number | null;
	justReceived?: boolean;
}

interface ReceivedIndicatorProps {
	lastReceived?: number | null;
	justReceived?: boolean;
}

export function ReceivedIndicator({ lastReceived, justReceived = false }: ReceivedIndicatorProps) {
	return (
		<span
			title={lastReceived ? `Last received: ${new Date(lastReceived).toLocaleString()}` : "No data yet"}
			className={`inline-block w-3 h-3 rounded-full mr-2 transition-all duration-200 ${
				justReceived ? "bg-green-500 scale-125 shadow-md" : "bg-gray-300"
			}`}
			aria-hidden
		/>
	);
}

export function SensorCard({ data, isConnected, lastReceived = null, justReceived = false }: SensorCardProps) {
	const getAirQualityColor = (good: boolean) => {
		return good ? "bg-green-500" : "bg-red-500";
	};

	const getMoistureColor = (moisture: number) => {
		if (moisture > 70) return "text-blue-600";
		if (moisture > 30) return "text-yellow-600";
		return "text-red-600";
	};

	const formatUptime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return `${hours}h ${minutes}m ${remainingSeconds}s`;
	};

	const timeAgo = (ts: number | null) => {
		if (!ts) return "never";
		const sec = Math.floor((Date.now() - ts) / 1000);
		if (sec < 1) return "just now";
		if (sec < 60) return `${sec}s ago`;
		const m = Math.floor(sec / 60);
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		return `${h}h ago`;
	};


	if (!isConnected) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ReceivedIndicator />
						<Sprout className="h-5 w-5 text-green-600" />
						Sensor Data
						<Badge variant="destructive">Disconnected</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Connecting to MQTT broker...</p>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ReceivedIndicator />
						<Sprout className="h-5 w-5 text-green-600" />
						Sensor Data
						<Badge variant="outline">Waiting for data</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Waiting for sensor data from device...
					</p>
				</CardContent>
				<div className="p-3 text-xs text-muted-foreground border-t">
					Last received: {timeAgo(lastReceived)}
				</div>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ReceivedIndicator />
					<Sprout className="h-5 w-5" />
					Sensor Data
					<Badge variant="default">Online</Badge>
				</CardTitle>
				<p className="text-sm text-muted-foreground">Device: {data.device}</p>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Temperature */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Thermometer className="h-4 w-4 text-red-500" />
							<span className="text-sm font-medium">Temperature</span>
						</div>
						<div className="text-2xl font-bold">{data.temp}°C</div>
					</div>

					{/* Humidity */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Droplet className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Humidity</span>
						</div>
						<div className="text-2xl font-bold">{data.hum}%</div>
					</div>

					{/* Soil Moisture */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Droplet className="h-4 w-4 text-brown-500" />
							<span className="text-sm font-medium">Soil Moisture</span>
						</div>
						<div
							className={`text-2xl font-bold ${getMoistureColor(data.soil)}`}
						>
							{data.soil}%
						</div>
					</div>

					{/* Air Quality */}
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Wind className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Air Quality</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-2xl font-bold">{data.air}°C</span>
							<Badge className={getAirQualityColor(data.airGood)}>
								{data.airGood ? "Good" : "Poor"}
							</Badge>
						</div>
						<div className="text-sm text-muted-foreground">
							{data.air} PPM (Raw: {data.airRaw})
						</div>
					</div>
				</div>

				{/* System Info */}
				<div className="border-t pt-4">
					<h4 className="text-sm font-medium mb-2">System Information</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Uptime:</span>
							<span className="ml-2 font-medium">
								{formatUptime(data.uptime)}
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">Watering Count:</span>
							<span className="ml-2 font-medium">{data.count}</span>
						</div>
						<div>
							<span className="text-muted-foreground">
								Total Watering Time:
							</span>
							<span className="ml-2 font-medium">
								{data.wtime}s
							</span>
						</div>
					</div>
				</div>

				{/* Timestamp */}
				<div className="text-xs text-muted-foreground">
					Last updated: {new Date(data.time * 1000).toLocaleString()}
				</div>
			</CardContent>
			<div className="p-3 text-xs text-muted-foreground border-t flex justify-between items-center">
				<div>Last received: {timeAgo(lastReceived)}</div>
				<div className="text-right">{justReceived ? "New data ✓" : "No recent data"}</div>
			</div>
		</Card>
	);
}
