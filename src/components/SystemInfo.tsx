"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Trash2 } from "lucide-react";

interface SystemStatus {
	device: string;
	status: string;
	lastSeen: number;
}

interface SystemInfoProps {
	systemStatus: SystemStatus | null;
	logs: string[];
	isConnected: boolean;
	onClearLogs: () => void;
}

export function SystemInfo({
	systemStatus,
	logs,
	isConnected,
	onClearLogs,
}: SystemInfoProps) {
	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "online":
				return "bg-green-500";
			case "offline":
				return "bg-red-500";
			default:
				return "bg-yellow-500";
		}
	};

	return (
		<div className="space-y-4">
			{/* System Status Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5" />
						System Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					{systemStatus ? (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge className={getStatusColor(systemStatus.status)}>
									{systemStatus.status}
								</Badge>
								<span className="text-sm text-muted-foreground">
									Device: {systemStatus.device}
								</span>
							</div>
							<div className="text-sm text-muted-foreground">
								Last seen:{" "}
								{new Date(systemStatus.lastSeen * 1000).toLocaleString()}
							</div>
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							{isConnected ? "Waiting for system status..." : "Not connected"}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Logs Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5" />
							System Logs
							<Badge variant="outline">{logs.length}</Badge>
						</CardTitle>
						<Button
							variant="outline"
							size="sm"
							onClick={onClearLogs}
							disabled={logs.length === 0}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Clear
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[300px] w-full rounded-md border p-4">
						{logs.length > 0 ? (
							<div className="space-y-1">
								{logs.map((log, index) => (
									<div
										key={`log-${index}-${log.slice(0, 20)}`}
										className="text-sm font-mono bg-muted p-2 rounded"
									>
										{log}
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-muted-foreground">
								{isConnected ? "No logs yet..." : "Not connected"}
							</div>
						)}
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
}
