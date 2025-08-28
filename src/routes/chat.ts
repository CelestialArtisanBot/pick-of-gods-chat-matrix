import { Env, ChatRequestBody, ChatMessage, ChatResponseBody } from "../types";

const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const SYSTEM_PROMPT = "You are Pick of Gods AI. Friendly and concise.";

export async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages: ChatMessage[] = body.messages || [];

    if (!messages.some(m => m.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    const aiResponse = await env.AI.run(
      MODEL_ID,
      {
        messages,
        max_tokens: body.maxTokens ?? 1024,
        temperature: body.temperature ?? 0.7,
        top_p: body.topP ?? 0.9,
      },
      { returnRawResponse: true }
    );

    return aiResponse;
  } catch (err) {
    console.error(err);
    const res: ChatResponseBody = { messages: [], success: false, error: "Failed to process chat" };
    return new Response(JSON.stringify(res), { status: 500, headers: { "content-type": "application/json" } });
  }
}
