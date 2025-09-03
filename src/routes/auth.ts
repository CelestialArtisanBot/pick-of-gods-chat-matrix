// src/routes/auth.ts
import { Env, AuthRequestBody, AuthResponseBody } from '../types';

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body: AuthRequestBody = await request.json();

    if (!body.email) {
      const res: AuthResponseBody = { success: false, error: "Email required" };
      return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });
    }

    const session = {
      sessionId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      expiresAt: Date.now() + (1000 * 60 * 60 * 24), // 24 hours
    };

    await env.AUTH_STORAGE.put(session.sessionId, JSON.stringify(session));

    const res: AuthResponseBody = { success: true, session };
    return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    const res: AuthResponseBody = { success: false, error: "Auth failed" };
    return new Response(JSON.stringify(res), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
