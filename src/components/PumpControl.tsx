"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Droplets, Power } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface PumpControlProps {
	pumpStatus: boolean;
	isConnected: boolean;
	onPumpCommand: (command: boolean) => void;
	error: string | null;
}

export function PumpControl({
	pumpStatus,
	isConnected,
	onPumpCommand,
	error,
}: PumpControlProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handlePumpToggle = async (checked: boolean) => {
		setIsLoading(true);
		onPumpCommand(checked);
		// Add a small delay to show loading state
		setTimeout(() => setIsLoading(false), 500);
	};

	const handleEmergencyStop = () => {
		onPumpCommand(false);
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<Card className="w-full overflow-hidden">
				<CardHeader
					className={`${pumpStatus ? "bg-gradient-to-r from-blue-50 to-cyan-50" : "bg-gradient-to-r from-gray-50 to-slate-50"} transition-colors duration-500`}
				>
					<CardTitle className="flex items-center gap-2">
						<motion.div
							animate={pumpStatus ? { rotate: 360 } : { rotate: 0 }}
							transition={{
								duration: 2,
								repeat: pumpStatus ? Infinity : 0,
								ease: "linear",
							}}
						>
							<Droplets
								className={`h-5 w-5 ${pumpStatus ? "text-blue-600" : "text-gray-600"}`}
							/>
						</motion.div>
						Pump Control
						<AnimatePresence mode="wait">
							<motion.div
								key={pumpStatus ? "on" : "off"}
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.8, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<Badge
									variant={pumpStatus ? "default" : "secondary"}
									className={pumpStatus ? "bg-blue-600" : ""}
								>
									{pumpStatus ? "ON" : "OFF"}
								</Badge>
							</motion.div>
						</AnimatePresence>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					<AnimatePresence>
						{error && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Alert variant="destructive">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							</motion.div>
						)}

						{!isConnected && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										Not connected to MQTT broker. Cannot control pump.
									</AlertDescription>
								</Alert>
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div
						className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl"
						animate={{
							boxShadow: pumpStatus
								? [
										"0px 0px 0px rgba(59, 130, 246, 0)",
										"0px 0px 20px rgba(59, 130, 246, 0.3)",
										"0px 0px 0px rgba(59, 130, 246, 0)",
									]
								: "0px 0px 0px rgba(59, 130, 246, 0)",
						}}
						transition={{ duration: 2, repeat: pumpStatus ? Infinity : 0 }}
					>
						<div className="space-y-1">
							<div className="text-sm font-medium">Pump Status</div>
							<motion.div
								className="text-sm text-muted-foreground"
								animate={{ opacity: [1, 0.6, 1] }}
								transition={{ duration: 2, repeat: pumpStatus ? Infinity : 0 }}
							>
								{pumpStatus
									? "🌊 Pump is currently running"
									: "⏸️ Pump is currently stopped"}
							</motion.div>
						</div>
						<motion.div
							whileTap={{ scale: 0.9 }}
							transition={{ type: "spring", stiffness: 400 }}
						>
							<Switch
								checked={pumpStatus}
								onCheckedChange={handlePumpToggle}
								disabled={!isConnected || isLoading}
								className="data-[state=checked]:bg-blue-600"
							/>
						</motion.div>
					</motion.div>

					<div className="flex gap-2">
						<motion.div
							className="flex-1"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Button
								variant="outline"
								onClick={() => handlePumpToggle(true)}
								disabled={!isConnected || pumpStatus || isLoading}
								className="w-full border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
							>
								<Power className="h-4 w-4 mr-2" />
								Start Pump
							</Button>
						</motion.div>
						<motion.div
							className="flex-1"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Button
								variant="outline"
								onClick={() => handlePumpToggle(false)}
								disabled={!isConnected || !pumpStatus || isLoading}
								className="w-full border-gray-200 hover:bg-gray-50"
							>
								<Power className="h-4 w-4 mr-2" />
								Stop Pump
							</Button>
						</motion.div>
					</div>

					<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
						<Button
							variant="destructive"
							onClick={handleEmergencyStop}
							disabled={!isConnected}
							className="w-full bg-red-600 hover:bg-red-700"
						>
							<AlertTriangle className="h-4 w-4 mr-2" />
							Emergency Stop
						</Button>
					</motion.div>

					<div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
						<strong>MQTT Topic:</strong> agrohygra/pump/command
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
