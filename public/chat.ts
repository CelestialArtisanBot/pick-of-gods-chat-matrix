// src/routes/chat.ts
import { Env, ChatRequestBody, ChatResponseBody } from "../types";

export async function handleChat(req: Request, env: Env): Promise<Response> {
  const body: ChatRequestBody = await req.json();

  // Attempt secrets-based AI first
  const secretsKey = env.OPENROUTER_KEY;
  let aiResp: ChatResponseBody;

  if (secretsKey) {
    // Placeholder: call your txt-txt AI secret
    aiResp = { messages: [{ role: "ai", content: "Response from txt-txt secret AI" }] };
  } else {
    // Fallback Cloudflare AI
    aiResp = { messages: [{ role: "ai", content: "Fallback Cloudflare AI response" }] };
  }

  return new Response(JSON.stringify(aiResp), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
