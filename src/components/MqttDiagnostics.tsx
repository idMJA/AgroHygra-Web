"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Activity, MessageCircle, AlertCircle } from "lucide-react";
import type { SensorData } from "@/hooks/useMqtt";
import { motion, AnimatePresence } from "framer-motion";

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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Card className="w-full overflow-hidden">
				<CardHeader className={`${isConnected ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-orange-50'} transition-colors duration-500`}>
					<CardTitle className="flex items-center gap-2">
						<motion.div
							animate={isConnected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
							transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
						>
							{isConnected ? (
								<Wifi className="h-5 w-5 text-green-600" />
							) : (
								<WifiOff className="h-5 w-5 text-red-600" />
							)}
						</motion.div>
						MQTT Diagnostics
						<AnimatePresence mode="wait">
							<motion.div
								key={isConnected ? 'connected' : 'disconnected'}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.8, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? 'bg-green-600' : ''}>
									{isConnected ? "Connected" : "Disconnected"}
								</Badge>
							</motion.div>
						</AnimatePresence>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					{/* Connection Status */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="space-y-2"
						>
							<div className="flex items-center gap-2">
								<Activity className="h-4 w-4 text-blue-600" />
								<span className="font-medium">Connection Status</span>
							</div>
							<div className="text-sm space-y-1 bg-blue-50 p-3 rounded-lg">
								<div><strong>Broker:</strong> wss://broker.hivemq.com:8884/mqtt</div>
								<div className="flex items-center gap-2">
									<strong>Status:</strong> 
									<span className={isConnected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
										{isConnected ? "✅ Connected" : "❌ Disconnected"}
									</span>
								</div>
								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="flex items-center gap-1 text-red-600"
										>
											<AlertCircle className="h-3 w-3" />
											{error}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
						
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="space-y-2"
						>
							<div className="flex items-center gap-2">
								<MessageCircle className="h-4 w-4 text-purple-600" />
								<span className="font-medium">Data Status</span>
							</div>
							<div className="text-sm space-y-1 bg-purple-50 p-3 rounded-lg">
								<div>
									<strong>Last sensor data:</strong> 
									<span className="ml-1 text-purple-700 font-medium">{lastSensorUpdate}</span>
								</div>
								<div>
									<strong>System status:</strong> 
									<span className={`ml-1 font-medium ${systemStatus ? 'text-green-600' : 'text-orange-600'}`}>
										{systemStatus ? "✅ Received" : "⏳ Waiting"}
									</span>
								</div>
								<div>
									<strong>Total logs:</strong> 
									<span className="ml-1 text-purple-700 font-medium">{logs.length}</span>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Recent Logs */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="space-y-2"
					>
						<div className="flex items-center justify-between">
							<span className="font-medium">Recent Logs (last 10)</span>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button variant="outline" size="sm" onClick={clearLogs} className="border-orange-200 hover:bg-orange-50">
									Clear Logs
								</Button>
							</motion.div>
						</div>
						<div className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 rounded-md max-h-48 overflow-y-auto border">
							<AnimatePresence mode="popLayout">
								{logs.length === 0 ? (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="text-sm text-muted-foreground"
									>
										No logs received yet...
									</motion.p>
								) : (
									<div className="text-xs space-y-1 font-mono">
										{logs.slice(-10).map((log, index) => (
											<motion.div
												key={`${Date.now()}-${Math.random()}-${index}`}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												transition={{ duration: 0.2 }}
												layout
												className="text-muted-foreground bg-white p-1.5 rounded border hover:border-blue-300 transition-colors"
											>
												{log}
											</motion.div>
										))}
									</div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* Debug Info */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="text-xs text-muted-foreground border-t pt-3 bg-amber-50 p-3 rounded-lg"
					>
						<strong>Debug:</strong> Check browser console for detailed MQTT messages. 
						<br />
						<strong>Expected topics:</strong> agrohygra/sensors (every 2s), agrohygra/system/status (retained), 
						agrohygra/pump/status, agrohygra/logs
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
}