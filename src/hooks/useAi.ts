"use client";

import { useCallback, useState } from "react";
import type { SensorData } from "@/hooks/useMqtt";
import { getSoilRecommendations } from "@/lib/openrouter";

export interface UseAiRecommendationReturn {
	recommendation: string | null;
	loading: boolean;
	error: string | null;
	fetchRecommendation: (sensorData: SensorData) => Promise<void>;
	clearRecommendation: () => void;
}

export function useAiRecommendation(): UseAiRecommendationReturn {
	const [recommendation, setRecommendation] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchTime, setLastFetchTime] = useState<number>(0);
	const DEBOUNCE_MS = 30000; // 30 seconds - prevent spamming requests

	const fetchRecommendation = useCallback(
		async (sensorData: SensorData) => {
			const now = Date.now();
			if (now - lastFetchTime < DEBOUNCE_MS) {
				console.log("⏳ Debounce: Please wait before requesting again");
				return;
			}
			setLastFetchTime(now);

			setLoading(true);
			setError(null);

			try {
				console.log("🤖 Fetching AI recommendation...");
				const result = await getSoilRecommendations(sensorData);
				setRecommendation(result);
				console.log("✅ AI recommendation received");
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to fetch recommendations";
				setError(errorMessage);
				console.error("❌ AI recommendation error:", errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[lastFetchTime],
	);

	const clearRecommendation = useCallback(() => {
		setRecommendation(null);
		setError(null);
	}, []);

	return {
		recommendation,
		loading,
		error,
		fetchRecommendation,
		clearRecommendation,
	};
}
