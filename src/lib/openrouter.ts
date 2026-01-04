import type { SensorData } from "@/hooks/useMqtt";

export async function getSoilRecommendations(
	sensorData: SensorData,
): Promise<string> {
	try {
		console.log("🤖 Fetching AI recommendation from server...");

		const response = await fetch("/api/recommendations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ sensorData }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to fetch recommendation");
		}

		const data = (await response.json()) as { recommendation: string };
		console.log("✅ AI recommendation received from server");
		return data.recommendation;
	} catch (error) {
		console.error("Error fetching soil recommendations:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch AI recommendation",
		);
	}
}
