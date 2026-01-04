import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { SensorData } from "@/hooks/useMqtt";

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as { sensorData: SensorData };
		const { sensorData } = body;

		if (!sensorData) {
			return NextResponse.json(
				{ error: "Sensor data is required" },
				{ status: 400 },
			);
		}

		// Initialize OpenAI client with OpenRouter - API key is only on server
		const openai = new OpenAI({
			baseURL: "https://openrouter.ai/api/v1",
			apiKey: process.env.OPENROUTER_API_KEY,
			defaultHeaders: {
				"HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
				"X-Title": "AgroHygra Smart Agriculture",
			},
		});

		const prompt = `Based on soil data (moisture: ${sensorData.soil}%, temp: ${sensorData.temp}°C, humidity: ${sensorData.hum}%, NPK N:${sensorData.npk?.n} P:${sensorData.npk?.p} K:${sensorData.npk?.k}, pH: ${sensorData.npk?.ph}, EC: ${sensorData.npk?.ec}), provide ONLY essential actions to improve soil health.

Be extremely concise. List only:
- 1-2 immediate actions needed
- Recommended fertilizer/nutrients if needed
- Irrigation adjustment if needed
- Timeline (days/weeks)

Do NOT repeat the input data or device info. Be direct and practical for farmers.

Return output as simple HTML using only <p>, <ul>, <li>, <strong>. No markdown, no additional text beyond the recommendations.`;

		const completion = await openai.chat.completions.create({
			model: "google/gemini-2.5-flash-lite",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: 300,
		});

		const recommendation =
			completion.choices[0].message.content ||
			"Unable to generate recommendation";

		return NextResponse.json({ recommendation });
	} catch (error) {
		console.error("Error in AI recommendation API:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		return NextResponse.json(
			{ error: `Failed to generate recommendation: ${errorMessage}` },
			{ status: 500 },
		);
	}
}
