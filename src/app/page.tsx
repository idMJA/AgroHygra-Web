"use client";

import { useMqtt } from "@/hooks/useMqtt";
import { SensorCard } from "@/components/SensorCard";
import { PumpControl } from "@/components/PumpControl";
import { SystemInfo } from "@/components/SystemInfo";
import { MqttDiagnostics } from "@/components/MqttDiagnostics";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Droplets, Settings } from "lucide-react";

export default function Home() {
	const {
		sensorData,
		pumpStatus,
		systemStatus,
		logs,
		isConnected,
		error,
		sendPumpCommand,
		clearLogs,
		// new fields from hook
		lastReceived,
		justReceived,
	} = useMqtt();

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-card">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Droplets className="h-8 w-8 text-green-600" />
							<div>
								<h1 className="text-2xl font-bold">AgroHygra</h1>
								<p className="text-sm text-muted-foreground">
									Smart Agriculture Monitoring System
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant={isConnected ? "default" : "destructive"}>
								{isConnected ? "Connected" : "Disconnected"}
							</Badge>
							{error && <Badge variant="destructive">Error</Badge>}
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-6">
				<Tabs defaultValue="dashboard" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="dashboard" className="flex items-center gap-2">
							<Activity className="h-4 w-4" />
							Dashboard
						</TabsTrigger>
						<TabsTrigger value="control" className="flex items-center gap-2">
							<Droplets className="h-4 w-4" />
							Pump Control
						</TabsTrigger>
						<TabsTrigger value="system" className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							System
						</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard" className="space-y-6 mt-6">
						<SensorCard
							data={sensorData}
							isConnected={isConnected}
							lastReceived={lastReceived}
							justReceived={justReceived}
						/>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<PumpControl
								pumpStatus={pumpStatus}
								isConnected={isConnected}
								onPumpCommand={sendPumpCommand}
								error={error}
							/>

							{/* Quick Stats */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Quick Stats</h3>
								{sensorData ? (
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 border rounded-lg">
											<div className="text-sm text-muted-foreground">
												Device
											</div>
											<div className="font-semibold">{sensorData.device}</div>
										</div>
										<div className="p-4 border rounded-lg">
											<div className="text-sm text-muted-foreground">
												Uptime
											</div>
											<div className="font-semibold">
												{Math.floor(sensorData.uptime / 3600)}h{" "}
												{Math.floor((sensorData.uptime % 3600) / 60)}m
											</div>
										</div>
										<div className="p-4 border rounded-lg">
											<div className="text-sm text-muted-foreground">
												Watering Count
											</div>
											<div className="font-semibold">
												{sensorData.count}
											</div>
										</div>
										<div className="p-4 border rounded-lg">
											<div className="text-sm text-muted-foreground">
												Total Watering
											</div>
											<div className="font-semibold">
												{sensorData.wtime}s
											</div>
										</div>
									</div>
								) : (
									<div className="text-muted-foreground">No data available</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="control" className="mt-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<PumpControl
								pumpStatus={pumpStatus}
								isConnected={isConnected}
								onPumpCommand={sendPumpCommand}
								error={error}
							/>

							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Pump Information</h3>
								<div className="space-y-2 text-sm">
									<p>
										<strong>Current Status:</strong>{" "}
										{pumpStatus ? "Running" : "Stopped"}
									</p>
									<p>
										<strong>Connection:</strong>{" "}
										{isConnected ? "Connected" : "Disconnected"}
									</p>
									<p>
										<strong>MQTT Topic:</strong> agrohygra/pump/command
									</p>
									<p>
										<strong>Supported Commands:</strong> ON, OFF, 1, 0,{" "}
										{`{"pump": true}`}
									</p>
								</div>

								<Separator />

								<div className="space-y-2">
									<h4 className="font-medium">Safety Notes:</h4>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Always monitor soil moisture levels</li>
										<li>• Use emergency stop if needed</li>
										<li>• Check system logs for errors</li>
										<li>• Ensure proper water supply</li>
									</ul>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="system" className="mt-6">
						<div className="space-y-6">
							<MqttDiagnostics
								isConnected={isConnected}
								error={error}
								logs={logs}
								clearLogs={clearLogs}
								sensorData={sensorData}
								systemStatus={systemStatus}
							/>
							<SystemInfo
								systemStatus={systemStatus}
								logs={logs}
								isConnected={isConnected}
								onClearLogs={clearLogs}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</main>

			{/* Footer */}
			<footer className="border-t mt-12">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<p>AgroHygra - Smart Agriculture Monitoring System</p>
						<p>MQTT Broker: broker.hivemq.com:8884 (WSS)</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
