import type { Env, ChatMessage, ChatRequestBody } from "../types";

const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

export async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const { messages = [] } = (await request.json()) as ChatRequestBody;

    // Ensure system prompt is always first
    if (!messages.some((m) => m.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    const response = await env.AI.run(
      MODEL_ID,
      { messages, max_tokens: 1024 },
      { returnRawResponse: true } // SSE streaming
    );

    return response;
  } catch (err) {
    console.error("Chat Error:", err);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
