"use client";

import { motion } from "framer-motion";
import {
	Activity,
	Clock,
	Droplets,
	Settings,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { MqttDiagnostics } from "@/components/MqttDiagnostics";
import { PumpControl } from "@/components/PumpControl";
import { SensorCard } from "@/components/SensorCard";
import { SoilRecommendation } from "@/components/SoilRecommend";
import { SystemInfo } from "@/components/SystemInfo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMqtt } from "@/hooks/useMqtt";

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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring" as const,
				stiffness: 100,
			},
		},
	};

	const [activeTab, setActiveTab] = useState<string>("dashboard");

	return (
		<div className="flex flex-col flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
			{/* Header */}
			<motion.header
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ type: "spring", stiffness: 100 }}
				className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
			>
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<motion.div
							className="flex items-center gap-3"
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400 }}
						>
							<motion.div
								animate={{ rotate: pumpStatus ? 360 : 0 }}
								transition={{
									duration: 2,
									repeat: pumpStatus ? Infinity : 0,
									ease: "linear",
								}}
							>
								<Droplets className="h-8 w-8 text-green-600" />
							</motion.div>
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
									AgroHygra
								</h1>
								<p className="text-sm text-muted-foreground">
									Smart Agriculture Monitoring System
								</p>
							</div>
						</motion.div>
						<div className="flex items-center gap-2">
							<motion.div
								key={isConnected ? "connected" : "disconnected"}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								<Badge
									variant={isConnected ? "default" : "destructive"}
									className={isConnected ? "bg-green-600" : ""}
								>
									{isConnected ? "● Connected" : "○ Disconnected"}
								</Badge>
							</motion.div>
							{error && (
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
								>
									<Badge variant="destructive">Error</Badge>
								</motion.div>
							)}
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="flex-1 container mx-auto px-4 py-6 w-full max-w-7xl">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<div className="w-full mt-16 mb-16">
						{/* Navigation - Vertical on mobile, horizontal on desktop */}
						<TabsList className="w-full flex flex-col gap-1.5 md:flex-row md:gap-0 md:grid md:grid-cols-4 bg-transparent md:bg-white/80 backdrop-blur-md md:rounded-none md:shadow-none md:border-0 md:p-0 md:mt-0">
							<TabsTrigger
								value="dashboard"
								className="flex w-full items-center gap-2 whitespace-nowrap justify-start md:justify-center px-3 py-2 md:px-0 md:py-0 rounded-md md:rounded-none hover:bg-gray-50 md:hover:bg-transparent"
							>
								<Activity className="h-4 w-4" />
								<span>Dashboard</span>
							</TabsTrigger>
							<TabsTrigger
								value="ai"
								className="flex w-full items-center gap-2 whitespace-nowrap justify-start md:justify-center px-3 py-2 md:px-0 md:py-0 rounded-md md:rounded-none hover:bg-gray-50 md:hover:bg-transparent"
							>
								<TrendingUp className="h-4 w-4" />
								<span>AI Analysis</span>
							</TabsTrigger>
							<TabsTrigger
								value="control"
								className="flex w-full items-center gap-2 whitespace-nowrap justify-start md:justify-center px-3 py-2 md:px-0 md:py-0 rounded-md md:rounded-none hover:bg-gray-50 md:hover:bg-transparent"
							>
								<Droplets className="h-4 w-4" />
								<span>Pump Control</span>
							</TabsTrigger>
							<TabsTrigger
								value="system"
								className="flex w-full items-center gap-2 whitespace-nowrap justify-start md:justify-center px-3 py-2 md:px-0 md:py-0 rounded-md md:rounded-none hover:bg-gray-50 md:hover:bg-transparent"
							>
								<Settings className="h-4 w-4" />
								<span>System</span>
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="dashboard" className="space-y-6 mt-6">
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							<motion.div variants={itemVariants}>
								<SensorCard
									data={sensorData}
									isConnected={isConnected}
									lastReceived={lastReceived}
									justReceived={justReceived}
								/>
							</motion.div>

							<motion.div
								variants={itemVariants}
								className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
							>
								<PumpControl
									pumpStatus={pumpStatus}
									isConnected={isConnected}
									onPumpCommand={sendPumpCommand}
									error={error}
								/>

								{/* Quick Stats */}
								<motion.div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<TrendingUp className="h-5 w-5 text-green-600" />
										Quick Stats
									</h3>
									{sensorData ? (
										<motion.div
											variants={containerVariants}
											initial="hidden"
											animate="visible"
											className="grid grid-cols-2 gap-4"
										>
											<motion.div
												variants={itemVariants}
												whileHover={{ scale: 1.03 }}
												className="p-4 border rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm"
											>
												<div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
													<Zap className="h-3 w-3" />
													Device
												</div>
												<div className="font-semibold text-sm">
													{sensorData.device}
												</div>
											</motion.div>
											<motion.div
												variants={itemVariants}
												whileHover={{ scale: 1.03 }}
												className="p-4 border rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm"
											>
												<div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Uptime
												</div>
												<div className="font-semibold text-sm">
													{Math.floor(sensorData.uptime / 3600)}h{" "}
													{Math.floor((sensorData.uptime % 3600) / 60)}m
												</div>
											</motion.div>
											<motion.div
												variants={itemVariants}
												whileHover={{ scale: 1.03 }}
												className="p-4 border rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm"
											>
												<div className="text-xs text-muted-foreground mb-1">
													Watering Count
												</div>
												<div className="font-semibold text-lg text-green-600">
													{sensorData.count}
												</div>
											</motion.div>
											<motion.div
												variants={itemVariants}
												whileHover={{ scale: 1.03 }}
												className="p-4 border rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm"
											>
												<div className="text-xs text-muted-foreground mb-1">
													Total Watering
												</div>
												<div className="font-semibold text-lg text-orange-600">
													{sensorData.wtime}s
												</div>
											</motion.div>
										</motion.div>
									) : (
										<motion.div
											animate={{ opacity: [0.5, 1, 0.5] }}
											transition={{ duration: 2, repeat: Infinity }}
											className="text-muted-foreground p-8 text-center bg-white rounded-xl border"
										>
											No data available
										</motion.div>
									)}
								</motion.div>
							</motion.div>
						</motion.div>
					</TabsContent>

					<TabsContent value="ai" className="mt-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<SoilRecommendation
								sensorData={sensorData}
								isConnected={isConnected}
								justReceived={justReceived}
							/>
						</motion.div>
					</TabsContent>

					<TabsContent value="control" className="mt-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="grid grid-cols-1 lg:grid-cols-2 gap-6"
						>
							<PumpControl
								pumpStatus={pumpStatus}
								isConnected={isConnected}
								onPumpCommand={sendPumpCommand}
								error={error}
							/>

							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className="space-y-4"
							>
								<h3 className="text-lg font-semibold">Pump Information</h3>
								<div className="space-y-3 text-sm bg-white p-6 rounded-xl shadow-sm border">
									<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
										<strong>Current Status:</strong>{" "}
										<span
											className={
												pumpStatus
													? "text-blue-600 font-medium"
													: "text-gray-600"
											}
										>
											{pumpStatus ? "🌊 Running" : "⏸️ Stopped"}
										</span>
									</div>
									<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
										<strong>Connection:</strong>{" "}
										<span
											className={
												isConnected
													? "text-green-600 font-medium"
													: "text-red-600 font-medium"
											}
										>
											{isConnected ? "✅ Connected" : "❌ Disconnected"}
										</span>
									</div>
									<div className="p-2 bg-gray-50 rounded">
										<strong>MQTT Topic:</strong>
										<code className="ml-2 text-blue-600">
											agrohygra/pump/command
										</code>
									</div>
									<div className="p-2 bg-gray-50 rounded">
										<strong>Supported Commands:</strong>
										<div className="mt-1 font-mono text-xs">
											<span className="bg-blue-100 px-2 py-0.5 rounded mr-1">
												ON
											</span>
											<span className="bg-blue-100 px-2 py-0.5 rounded mr-1">
												OFF
											</span>
											<span className="bg-blue-100 px-2 py-0.5 rounded mr-1">
												1
											</span>
											<span className="bg-blue-100 px-2 py-0.5 rounded mr-1">
												0
											</span>
											<span className="bg-blue-100 px-2 py-0.5 rounded">{`{"pump": true}`}</span>
										</div>
									</div>
								</div>

								<Separator />

								<div className="space-y-2 bg-amber-50 p-4 rounded-xl border border-amber-200">
									<h4 className="font-medium flex items-center gap-2">
										<Activity className="h-4 w-4 text-amber-600" />
										Safety Notes:
									</h4>
									<ul className="text-sm text-muted-foreground space-y-1.5">
										<li className="flex items-start gap-2">
											<span className="text-amber-600 font-bold">•</span>
											<span>Always monitor soil moisture levels</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-amber-600 font-bold">•</span>
											<span>Use emergency stop if needed</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-amber-600 font-bold">•</span>
											<span>Check system logs for errors</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="text-amber-600 font-bold">•</span>
											<span>Ensure proper water supply</span>
										</li>
									</ul>
								</div>
							</motion.div>
						</motion.div>
					</TabsContent>

					<TabsContent value="system" className="mt-6">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="space-y-6"
						>
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
						</motion.div>
					</TabsContent>
				</Tabs>
			</main>

			{/* Footer */}
			<motion.footer
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="border-t mt-auto bg-white/80 backdrop-blur-md w-full"
			>
				<div className="container mx-auto px-4 py-4 w-full max-w-7xl">
					<div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
						<p>AgroHygra - Smart Agriculture Monitoring System</p>
						<p className="font-mono text-xs">
							MQTT: broker.hivemq.com:8884 (WSS)
						</p>
					</div>
				</div>
			</motion.footer>
		</div>
	);
}
