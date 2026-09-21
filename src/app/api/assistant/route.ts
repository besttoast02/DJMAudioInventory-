import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Initialize the OpenRouter client using the OpenAI compatible endpoint
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://djmaudio.com', // Optional, for OpenRouter rankings
    'X-Title': 'DJM Audio Chatbot', // Optional, for OpenRouter rankings
  }
});

const systemPrompt = `You are the official DJM Audio AI Assistant, representing an elite event production company in Los Angeles (established in 2023).

KEY DETAILS:
- Name: DJM Audio (also DJM Audio & Lighting)
- Phone: (626) 506-3824
- Email: info@djmaudio.com or contact via the website
- Location: Los Angeles, CA (travel available across SoCal)
- Main Services: DJ & MC Services, Live Band/Performance Audio, Event Lighting (Uplighting, Moving heads, Wash), and Equipment Rentals.
- Vibe: Professional, energetic, reliable, and premium.
- Known For: Crystal-clear sound, seamless transitions, and completely packing the dance floor.

RULES:
- Be helpful and concise.
- If someone asks for a quote, direct them to click "Get My Event Quote" in the navigation.
- Answer questions about our services (Weddings, Corporate, Private Parties, Rentals).
- If someone is rude, stay professional. 

You are an expert audio engineer and DJ, speak confidently about QSC, Pioneer DJ, Shure, and Chauvet lighting gear.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openrouter('nousresearch/hermes-3-llama-3.1-70b'),
      messages,
      system: systemPrompt,
      temperature: 0.7,
    });

    // @ts-expect-error AI SDK version mismatch
    return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("AI Error:", error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), { status: 500 });
  }
}
