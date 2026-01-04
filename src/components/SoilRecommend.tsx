"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Brain, Lightbulb, Loader, X } from "lucide-react";
import React, { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAiRecommendation } from "@/hooks/useAi";
import type { SensorData } from "@/hooks/useMqtt";

// Allow-list sanitizer: keep only simple content tags and strip attributes
const ALLOWED_TAGS = new Set([
	"p",
	"ul",
	"ol",
	"li",
	"strong",
	"em",
	"b",
	"i",
	"br",
]);

function sanitizeHtml(raw: string) {
	let html = raw;
	// strip scripts/styles entirely
	html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
	html = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
	// strip event handler attributes
	html = html.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "");
	html = html.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "");
	// keep only allowed tags, drop others; remove attributes
	html = html.replace(/<\/?\s*([a-z0-9-]+)([^>]*)>/gi, (m, tagName) => {
		const name = tagName.replace(/^\//, "").toLowerCase();
		if (!ALLOWED_TAGS.has(name)) return "";
		return m.startsWith("</") ? `</${name}>` : `<${name}>`;
	});
	return html;
}

// Fallback formatter for plain text / markdown-ish input
function formatRecommendation(raw: string) {
	// if looks like HTML, sanitize and return
	if (/[<>]/.test(raw)) {
		return sanitizeHtml(raw);
	}

	// otherwise, convert simple markdown-ish bullets and bold to HTML
	const bolded = raw.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	const lines = bolded.split(/\n+/);
	const blocks: string[] = [];
	let list: string[] = [];

	const flushList = () => {
		if (list.length) {
			blocks.push(
				`<ul>${list.map((item) => `<li>${item}</li>`).join("")}</ul>`,
			);
			list = [];
		}
	};

	for (const line of lines) {
		if (/^\s*[*-]\s+/.test(line)) {
			list.push(line.replace(/^\s*[*-]\s+/, ""));
			continue;
		}
		flushList();
		const trimmed = line.trim();
		if (trimmed) {
			blocks.push(`<p>${trimmed}</p>`);
		}
	}
	flushList();

	return blocks.join("");
}

function renderHtmlToNodes(html: string) {
	const clean = sanitizeHtml(html);
	const parser = new DOMParser();
	const doc = parser.parseFromString(clean, "text/html");

	const toNode = (node: Node, key: string): React.ReactNode | null => {
		if (node.nodeType === Node.TEXT_NODE) {
			return (node as Text).textContent;
		}
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			const tag = el.tagName.toLowerCase();
			if (!ALLOWED_TAGS.has(tag)) return null;

			const mappedTag = tag === "b" ? "strong" : tag === "i" ? "em" : tag;
			const children = Array.from(el.childNodes)
				.map((child, idx) => toNode(child, `${key}-${idx}`))
				.filter((c): c is React.ReactNode => Boolean(c));
			return React.createElement(mappedTag, { key }, children);
		}
		return null;
	};

	return Array.from(doc.body.childNodes)
		.map((n, idx) => toNode(n, `n-${idx}`))
		.filter((c): c is React.ReactNode => Boolean(c));
}

interface SoilRecommendationProps {
	sensorData: SensorData | null;
	isConnected: boolean;
	justReceived?: boolean;
}

export function SoilRecommendation({
	sensorData,
	isConnected,
}: SoilRecommendationProps) {
	const {
		recommendation,
		loading,
		error,
		fetchRecommendation,
		clearRecommendation,
	} = useAiRecommendation();

	const renderedRecommendation = useMemo(() => {
		if (!recommendation) return null;
		return renderHtmlToNodes(formatRecommendation(recommendation));
	}, [recommendation]);

	const handleGenerateAnalysis = () => {
		if (sensorData && isConnected) {
			fetchRecommendation(sensorData);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4 }}
		>
			<Card className="w-full overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<motion.div
								animate={{ rotateZ: loading ? 360 : 0 }}
								transition={{
									duration: 2,
									repeat: loading ? Infinity : 0,
									ease: "linear",
								}}
							>
								<Brain className="h-5 w-5 text-purple-600" />
							</motion.div>
							AI Soil Analysis & Recommendations
							<AnimatePresence mode="wait">
								<motion.div
									key={loading ? "loading" : "ready"}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.8, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Badge
										variant={loading ? "secondary" : "default"}
										className={loading ? "" : "bg-purple-600"}
									>
										{loading ? (
											<span className="flex items-center gap-1">
												<Loader className="h-3 w-3 animate-spin" />
												Analyzing...
											</span>
										) : recommendation ? (
											"Complete"
										) : (
											"Idle"
										)}
									</Badge>
								</motion.div>
							</AnimatePresence>
						</CardTitle>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							onClick={clearRecommendation}
							disabled={!recommendation}
							className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
						>
							<X className="h-4 w-4" />
						</motion.button>
					</div>
				</CardHeader>

				<CardContent className="space-y-4 pt-6">
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
									Not connected to MQTT broker. Cannot generate recommendations
									without sensor data.
								</AlertDescription>
							</Alert>
						</motion.div>
					)}

					<AnimatePresence mode="wait">
						{loading ? (
							<motion.div
								key="loading"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex flex-col items-center justify-center py-8"
							>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ duration: 1.5, repeat: Infinity }}
									className="mb-3"
								>
									<Brain className="h-8 w-8 text-purple-600" />
								</motion.div>
								<p className="text-sm text-muted-foreground">
									🤖 AI is analyzing your soil data. Please wait...
								</p>
							</motion.div>
						) : recommendation ? (
							<motion.div
								key="recommendation"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
									<div className="flex gap-2 mb-3">
										<Lightbulb className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<div className="text-sm text-green-900 font-medium">
											AI-Generated Soil Analysis
										</div>
									</div>
									<ScrollArea className="h-64">
										<div className="pr-4 text-sm leading-relaxed text-gray-700 space-y-2 [&_ul]:list-disc [&_ul]:ml-5 [&_li]:mb-1 [&_li]:marker:text-green-600 [&_p]:mb-2">
											{renderedRecommendation}
										</div>
									</ScrollArea>
								</div>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={handleGenerateAnalysis}
									disabled={loading || !isConnected}
									className="w-full p-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors disabled:opacity-50"
								>
									🔄 Refresh Analysis
								</motion.button>
							</motion.div>
						) : (
							<motion.div
								key="waiting"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex flex-col items-center justify-center py-8 text-center"
							>
								<Brain className="h-8 w-8 text-gray-300 mb-3" />
								<p className="text-sm text-muted-foreground mb-4">
									{sensorData
										? "Sensor data is available. Ready to generate analysis."
										: "Waiting for sensor data from MQTT broker..."}
								</p>
								<Button
									onClick={handleGenerateAnalysis}
									disabled={!sensorData || !isConnected || loading}
									className="bg-purple-600 hover:bg-purple-700"
								>
									<Brain className="h-4 w-4 mr-2" />
									Generate Analysis
								</Button>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
						<strong>💡 Disclaimer:</strong> Recommendations are AI-generated and
						should be reviewed by agricultural experts before making critical
						farming decisions.
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
