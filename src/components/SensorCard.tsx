"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	Beaker,
	Droplet,
	Sprout,
	TestTube,
	Thermometer,
	Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ReceivedIndicator({
	lastReceived,
	justReceived = false,
}: ReceivedIndicatorProps) {
	return (
		<motion.span
			title={
				lastReceived
					? `Last received: ${new Date(lastReceived).toLocaleString()}`
					: "No data yet"
			}
			className={`inline-block w-3 h-3 rounded-full mr-2 ${
				justReceived
					? "bg-green-500 shadow-lg shadow-green-500/50"
					: "bg-gray-300"
			}`}
			animate={{
				scale: justReceived ? [1, 1.3, 1] : 1,
				opacity: justReceived ? [1, 0.8, 1] : 0.5,
			}}
			transition={{ duration: 0.6 }}
			aria-hidden
		/>
	);
}

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

interface SensorItemProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	unit?: string;
	color?: string;
	badge?: React.ReactNode;
}

function SensorItem({
	icon,
	label,
	value,
	unit,
	color = "text-gray-700",
	badge,
}: SensorItemProps) {
	return (
		<motion.div
			variants={itemVariants}
			className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-center gap-2 mb-2">
				<div className={color}>{icon}</div>
				<span className="text-sm font-medium text-gray-600">{label}</span>
			</div>
			<div className="flex items-baseline justify-between">
				<div className={`text-3xl font-bold ${color}`}>
					{value}
					{unit && <span className="text-lg ml-1">{unit}</span>}
				</div>
				{badge}
			</div>
		</motion.div>
	);
}

export function SensorCard({
	data,
	isConnected,
	lastReceived = null,
	justReceived = false,
}: SensorCardProps) {
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
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="w-full">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ReceivedIndicator
								lastReceived={lastReceived}
								justReceived={justReceived}
							/>
							<Sprout className="h-5 w-5 text-green-600" />
							Sensor Data
							<Badge variant="destructive">Disconnected</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.div
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="text-muted-foreground"
						>
							Connecting to MQTT broker...
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (!data) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<Card className="w-full">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ReceivedIndicator
								lastReceived={lastReceived}
								justReceived={justReceived}
							/>
							<Sprout className="h-5 w-5 text-green-600" />
							Sensor Data
							<Badge variant="outline">Waiting for data</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<motion.p
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="text-muted-foreground"
						>
							Waiting for sensor data from device...
						</motion.p>
					</CardContent>
					<div className="p-3 text-xs text-muted-foreground border-t">
						Last received: {timeAgo(lastReceived)}
					</div>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Card className="w-full overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
					<CardTitle className="flex items-center gap-2">
						<ReceivedIndicator
							lastReceived={lastReceived}
							justReceived={justReceived}
						/>
						<Sprout className="h-5 w-5 text-green-600" />
						Sensor Data
						<Badge variant="default" className="bg-green-600">
							Online
						</Badge>
					</CardTitle>
					<p className="text-sm text-muted-foreground">Device: {data.device}</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					{/* Main Sensors */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
					>
						<SensorItem
							icon={<Thermometer className="h-5 w-5" />}
							label="Temperature"
							value={data.temp.toFixed(1)}
							unit="°C"
							color="text-red-500"
						/>

						<SensorItem
							icon={<Droplet className="h-5 w-5" />}
							label="Humidity"
							value={data.hum.toFixed(1)}
							unit="%"
							color="text-blue-500"
						/>

						<SensorItem
							icon={<Droplet className="h-5 w-5" />}
							label="Soil Moisture"
							value={data.soil}
							unit="%"
							color={getMoistureColor(data.soil)}
						/>

						<SensorItem
							icon={<Wind className="h-5 w-5" />}
							label="Air Quality"
							value={data.air}
							unit="%"
							color="text-green-500"
							badge={
								<Badge className={getAirQualityColor(data.airGood)}>
									{data.airGood ? "Good" : "Poor"}
								</Badge>
							}
						/>
					</motion.div>

					{/* Air Quality Details */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100"
					>
						<div className="flex items-center gap-2 mb-2">
							<Wind className="h-4 w-4 text-cyan-600" />
							<span className="text-sm font-semibold text-cyan-900">
								Air Quality Details
							</span>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">PPM:</span>
								<span className="ml-2 font-bold text-cyan-700">{data.ppm}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Raw ADC:</span>
								<span className="ml-2 font-bold text-cyan-700">
									{data.airRaw}
								</span>
							</div>
						</div>
					</motion.div>

					{/* TDS Sensor */}
					{(data.tds !== undefined || data.tdsRaw !== undefined) && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100"
						>
							<div className="flex items-center gap-2 mb-2">
								<Beaker className="h-4 w-4 text-purple-600" />
								<span className="text-sm font-semibold text-purple-900">
									TDS Meter (Water Quality)
								</span>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">TDS Value:</span>
									<span className="ml-2 font-bold text-purple-700">
										{data.tds || 0} ppm
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">Raw ADC:</span>
									<span className="ml-2 font-bold text-purple-700">
										{data.tdsRaw || 0}
									</span>
								</div>
							</div>
						</motion.div>
					)}

					{/* NPK Sensor Data */}
					<AnimatePresence>
						{data.npk && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.5 }}
								className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200"
							>
								<div className="flex items-center gap-2 mb-4">
									<TestTube className="h-5 w-5 text-amber-600" />
									<span className="text-lg font-bold text-amber-900">
										NPK Sensor 7-in-1 (RS485)
									</span>
								</div>

								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate="visible"
									className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
								>
									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											Nitrogen (N)
										</div>
										<div className="text-2xl font-bold text-amber-600">
											{data.npk.n.toFixed(0)}
											<span className="text-sm ml-1">mg/kg</span>
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											Phosphorus (P)
										</div>
										<div className="text-2xl font-bold text-orange-600">
											{data.npk.p.toFixed(0)}
											<span className="text-sm ml-1">mg/kg</span>
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											Potassium (K)
										</div>
										<div className="text-2xl font-bold text-yellow-600">
											{data.npk.k.toFixed(0)}
											<span className="text-sm ml-1">mg/kg</span>
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											pH Level
										</div>
										<div className="text-2xl font-bold text-green-600">
											{data.npk.ph.toFixed(1)}
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											EC (Conductivity)
										</div>
										<div className="text-2xl font-bold text-cyan-600">
											{data.npk.ec.toFixed(3)}
											<span className="text-sm ml-1">mS/cm</span>
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm"
									>
										<div className="text-xs text-muted-foreground mb-1">
											Soil Temperature
										</div>
										<div className="text-2xl font-bold text-red-500">
											{data.npk.soilTemp.toFixed(1)}
											<span className="text-sm ml-1">°C</span>
										</div>
									</motion.div>

									<motion.div
										variants={itemVariants}
										className="bg-white p-3 rounded-lg shadow-sm col-span-2"
									>
										<div className="text-xs text-muted-foreground mb-1">
											Soil Moisture (NPK)
										</div>
										<div className="text-2xl font-bold text-blue-600">
											{(data.npk.soilMoisture || 0).toFixed(1)}
											<span className="text-sm ml-1">%</span>
										</div>
									</motion.div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* System Info */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="border-t pt-4"
					>
						<div className="flex items-center gap-2 mb-3">
							<Activity className="h-4 w-4 text-gray-600" />
							<h4 className="text-sm font-semibold">System Information</h4>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
							<div className="bg-gray-50 p-3 rounded-lg">
								<span className="text-muted-foreground">Uptime:</span>
								<span className="ml-2 font-medium block mt-1">
									{formatUptime(data.uptime)}
								</span>
							</div>
							<div className="bg-gray-50 p-3 rounded-lg">
								<span className="text-muted-foreground">Watering Count:</span>
								<span className="ml-2 font-medium block mt-1">
									{data.count}
								</span>
							</div>
							<div className="bg-gray-50 p-3 rounded-lg">
								<span className="text-muted-foreground">
									Total Watering Time:
								</span>
								<span className="ml-2 font-medium block mt-1">
									{data.wtime}s
								</span>
							</div>
						</div>
					</motion.div>

					{/* Timestamp */}
					<div className="text-xs text-muted-foreground">
						Last updated: {new Date(data.time * 1000).toLocaleString()}
					</div>
				</CardContent>
				<motion.div
					className="p-3 text-xs text-muted-foreground border-t flex justify-between items-center bg-gray-50"
					animate={{ opacity: justReceived ? [1, 0.5, 1] : 1 }}
					transition={{ duration: 0.5 }}
				>
					<div>Last received: {timeAgo(lastReceived)}</div>
					<div className="text-right font-medium">
						{justReceived ? (
							<span className="text-green-600">● Live</span>
						) : (
							<span className="text-gray-400">○ Idle</span>
						)}
					</div>
				</motion.div>
			</Card>
		</motion.div>
	);
}
