"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Power, AlertTriangle } from "lucide-react";
import { useState } from "react";

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
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Power className="h-5 w-5" />
					Pump Control
					<Badge variant={pumpStatus ? "default" : "secondary"}>
						{pumpStatus ? "ON" : "OFF"}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{!isConnected && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Not connected to MQTT broker. Cannot control pump.
						</AlertDescription>
					</Alert>
				)}

				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="text-sm font-medium">Pump Status</div>
						<div className="text-sm text-muted-foreground">
							{pumpStatus
								? "Pump is currently running"
								: "Pump is currently stopped"}
						</div>
					</div>
					<Switch
						checked={pumpStatus}
						onCheckedChange={handlePumpToggle}
						disabled={!isConnected || isLoading}
					/>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => handlePumpToggle(true)}
						disabled={!isConnected || pumpStatus || isLoading}
						className="flex-1"
					>
						Start Pump
					</Button>
					<Button
						variant="outline"
						onClick={() => handlePumpToggle(false)}
						disabled={!isConnected || !pumpStatus || isLoading}
						className="flex-1"
					>
						Stop Pump
					</Button>
				</div>

				<Button
					variant="destructive"
					onClick={handleEmergencyStop}
					disabled={!isConnected}
					className="w-full"
				>
					<AlertTriangle className="h-4 w-4 mr-2" />
					Emergency Stop
				</Button>

				<div className="text-xs text-muted-foreground">
					Commands are sent to topic: agrohygra/pump/command
				</div>
			</CardContent>
		</Card>
	);
}
