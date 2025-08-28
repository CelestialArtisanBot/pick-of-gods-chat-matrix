import type { Env, ChatBody, ChatMessage } from "../types";
import { json, err } from "./utils";

/**
 * POST /api/chat
 * Expects: { messages: ChatMessage[] }
 * Streams response from env.AI.run(..., { returnRawResponse: true })
 * Persists non-system messages to D1 (best-effort via ctx.waitUntil)
 */
export async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    if (request.method !== "POST") return err("method_not_allowed", "Only POST allowed", 405);

    const body = await request.json().catch(() => null) as ChatBody | null;
    if (!body?.messages || !Array.isArray(body.messages)) return err("invalid_body", "messages array required", 400);

    const messages: ChatMessage[] = body.messages;

    // Ensure system prompt present
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({ role: "system", content: "You are a helpful, friendly assistant. Provide concise and accurate responses." });
    }

    // Persist chat (non-blocking)
    ctx.waitUntil(persistMessages(env, request.headers.get("cookie") || "", messages));

    // Use Workers AI streaming mode if available
    // The env.AI.run call should return a Response when returnRawResponse: true
    if (env.AI && typeof env.AI.run === "function") {
      const resp = await env.AI.run(env.MODEL_ID ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: 1024 }, { returnRawResponse: true });
      // resp is assumed to be a Response (streaming) — pass-through
      return resp;
    }

    // Fallback: simple echo if AI binding not configured
    const fallback = { role: "assistant", content: "AI binding not configured. This is a fallback echo." };
    return json({ messages: [fallback], success: true });
  } catch (e: any) {
    console.error("chat handler error:", e);
    return err("internal_error", e?.message ?? "Internal error");
  }
}

/** Best-effort persistence to D1 */
async function persistMessages(env: Env, cookie: string, messages: ChatMessage[]) {
  try {
    if (!env.CHAT_DB) return;
    const uid = getUidFromCookie(cookie);
    const insert = env.CHAT_DB.prepare("INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)");

    const batch = messages
      .filter(m => m.role !== "system")
      .map(m => insert.bind(uid, m.role, m.content));

    if (batch.length) await env.CHAT_DB.batch(batch);
  } catch (e) {
    // Log but don't throw — persistence is best-effort
    console.warn("persistMessages failed:", e);
  }
}

function getUidFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = /(?:^|;\s*)uid=([^;]+)/.exec(cookieHeader);
  return m ? decodeURIComponent(m[1]) : null;
}
