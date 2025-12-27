"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ScrollText, Server, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4 }}
			>
				<Card>
					<CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
						<CardTitle className="flex items-center gap-2">
							<Server className="h-5 w-5 text-purple-600" />
							System Status
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6">
						<AnimatePresence mode="wait">
							{systemStatus ? (
								<motion.div
									key="status-available"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-3"
								>
									<div className="flex items-center gap-2">
										<motion.div
											animate={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 2, repeat: Infinity }}
										>
											<Badge className={getStatusColor(systemStatus.status)}>
												{systemStatus.status}
											</Badge>
										</motion.div>
										<span className="text-sm text-muted-foreground">
											Device: <strong>{systemStatus.device}</strong>
										</span>
									</div>
									<div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
										Last seen:{" "}
										<strong>
											{new Date(systemStatus.lastSeen * 1000).toLocaleString()}
										</strong>
									</div>
								</motion.div>
							) : (
								<motion.div
									key="status-unavailable"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="text-sm text-muted-foreground"
								>
									<motion.div
										animate={{ opacity: [0.5, 1, 0.5] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										{isConnected
											? "⏳ Waiting for system status..."
											: "🔌 Not connected"}
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</CardContent>
				</Card>
			</motion.div>

			{/* Logs Card */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				<Card>
					<CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<ScrollText className="h-5 w-5 text-blue-600" />
								System Logs
								<motion.div
									key={logs.length}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<Badge variant="outline">{logs.length}</Badge>
								</motion.div>
							</CardTitle>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									variant="outline"
									size="sm"
									onClick={onClearLogs}
									disabled={logs.length === 0}
									className="border-red-200 hover:bg-red-50 hover:text-red-700"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Clear
								</Button>
							</motion.div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50">
							<AnimatePresence mode="popLayout">
								{logs.length > 0 ? (
									<div className="space-y-1">
										{logs.map((log, index) => (
											<motion.div
												key={`log-${index}-${log.slice(0, 20)}`}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 10 }}
												transition={{ duration: 0.2, delay: index * 0.02 }}
												layout
												className="text-sm font-mono bg-white p-2 rounded border border-gray-200 hover:border-blue-300 transition-colors"
											>
												{log}
											</motion.div>
										))}
									</div>
								) : (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="text-sm text-muted-foreground flex items-center justify-center h-full"
									>
										<motion.div
											animate={{ opacity: [0.5, 1, 0.5] }}
											transition={{ duration: 2, repeat: Infinity }}
										>
											{isConnected ? "📝 No logs yet..." : "🔌 Not connected"}
										</motion.div>
									</motion.div>
								)}
							</AnimatePresence>
						</ScrollArea>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
