import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error("Gemini API Key is missing. Please configure it in the .env file.");
  }
  return new GoogleGenAI({ apiKey });
};

// ---------------------------------------------------------------------------
// Retry helper — retries on rate-limit (429) or transient errors
// ---------------------------------------------------------------------------
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err?.message?.includes('429') || err?.message?.toLowerCase().includes('rate');
      const isTransient = err?.message?.includes('503') || err?.message?.includes('500');

      if ((isRateLimit || isTransient) && attempt < maxRetries) {
        const waitMs = delayMs * Math.pow(2, attempt); // Exponential back-off
        console.warn(`[Gemini] Attempt ${attempt + 1} failed (${err.message}). Retrying in ${waitMs}ms...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Queue Prediction
// ---------------------------------------------------------------------------
export async function getQueuePrediction(stationName: string, stationType: string, time: string = "current") {
  try {
    const ai = getAI();
    console.log(`[Gemini] Predicting queue for ${stationName} (${stationType})`);

    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an expert in Indian EV and CNG infrastructure.
Predict the queue time and provide a brief insight for a ${stationType} station named "${stationName}" in India at ${time} time.
Consider realistic Indian traffic patterns, peak hours (7–10 AM, 5–8 PM), and station type.
Return ONLY valid JSON with these exact keys:
- "predictedTime": number (minutes, realistic for India)
- "insight": string (1–2 sentences, specific and practical)
- "congestionLevel": "Low" | "Medium" | "High"
- "recommendation": "Good to go" | "Wait" | "Choose alternate station"
- "confidence": number between 0 and 1`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    });
  } catch (error: any) {
    console.error("Gemini API Error (getQueuePrediction):", error?.message || error);
    // Graceful fallback — use time-of-day heuristic
    const hour = new Date().getHours();
    const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    return {
      predictedTime: isPeak ? 18 : 8,
      insight: "AI service temporarily unavailable. Estimate based on typical Indian peak-hour patterns.",
      congestionLevel: isPeak ? "High" : "Low",
      recommendation: isPeak ? "Wait" : "Good to go",
      confidence: 0.45
    };
  }
}

// ---------------------------------------------------------------------------
// Smart Charge Doctor
// ---------------------------------------------------------------------------
export async function getSmartChargeAnalysis(expectedSpeed: number, actualSpeed: number) {
  try {
    const ai = getAI();
    const efficiency = expectedSpeed > 0 ? Math.round((actualSpeed / expectedSpeed) * 100) : 0;
    console.log(`[Gemini] Analyzing charge performance: ${actualSpeed}/${expectedSpeed} kW (${efficiency}%)`);

    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Analyze EV charging performance:
- Expected charging speed: ${expectedSpeed} kW
- Actual charging speed: ${actualSpeed} kW
- Efficiency: ${efficiency}%

Provide a practical diagnosis. Consider battery state of charge, cable condition, charger compatibility, and thermal throttling.
Return ONLY valid JSON with these exact keys:
- "diagnosis": string (concise, 5–10 words)
- "efficiency": number (0–100)
- "recommendation": string (1–2 practical sentences)`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    });
  } catch (error: any) {
    console.error("Gemini API Error (getSmartChargeAnalysis):", error?.message || error);
    const efficiency = expectedSpeed > 0 ? Math.round((actualSpeed / expectedSpeed) * 100) : 0;
    return {
      diagnosis: efficiency >= 90 ? "Normal operation" : efficiency >= 70 ? "Slightly reduced throughput" : "Significant efficiency loss",
      efficiency,
      recommendation: efficiency >= 90
        ? "Charging is performing normally. No action needed."
        : "Check cable connection and ensure the charger is compatible with your vehicle's onboard charger rating."
    };
  }
}

// ---------------------------------------------------------------------------
// Arya Chatbot Stream — with context injection + graceful error handling
// ---------------------------------------------------------------------------
export interface AryaContext {
  origin?: string;
  destination?: string;
  vehicleType?: 'EV' | 'CNG';
  stationsFound?: number;
  selectedStation?: string;
  userName?: string;
}

export async function chatWithAryaStream(
  messages: { role: 'user' | 'model', parts: { text: string }[] }[],
  context?: AryaContext
) {
  const ai = getAI();

  // Build a rich context paragraph to inject into the system instruction
  const contextParts: string[] = [];
  if (context?.userName) contextParts.push(`The user's name is ${context.userName}.`);
  if (context?.vehicleType) contextParts.push(`They are using a ${context.vehicleType} vehicle.`);
  if (context?.origin && context?.destination) {
    contextParts.push(`Their current planned route is from ${context.origin} to ${context.destination}.`);
  }
  if (context?.stationsFound !== undefined) {
    contextParts.push(`The app has found ${context.stationsFound} ${context.vehicleType || ''} stations along their route.`);
  }
  if (context?.selectedStation) {
    contextParts.push(`The user is currently viewing ${context.selectedStation}.`);
  }

  const contextBlock = contextParts.length > 0
    ? `\n\nCurrent trip context:\n${contextParts.join(' ')}\n`
    : '';

  const systemInstruction = `You are Arya, a friendly and knowledgeable AI copilot embedded in FuelFlow AI — an app that helps EV and CNG vehicle owners in India find stations, predict queue wait times, and monitor charging performance.
Be concise, practical, and warm. Use simple language. Prioritize safety and sustainability.
If asked about specific stations, queue times, or routes, refer to the context provided.
Never make up station addresses or prices — say you don't have live data if you're unsure.${contextBlock}`;

  try {
    console.log(`[Gemini] Starting Arya chat stream (${messages.length} messages, context: ${contextParts.length} items)`);
    const response = await withRetry(() =>
      ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: messages,
        config: { systemInstruction }
      })
    );
    return response;
  } catch (error: any) {
    console.error("Gemini API Error (chatWithAryaStream):", error?.message || error);
    // Return a fake stream-compatible object with a fallback message
    const fallbackText = "I'm having trouble connecting right now. Please check your internet connection or try again in a moment. In the meantime, you can use the Queue Predictor or browse stations on the map.";
    const fakeStream = {
      async *[Symbol.asyncIterator]() {
        yield { text: fallbackText };
      }
    };
    return fakeStream as any;
  }
}
