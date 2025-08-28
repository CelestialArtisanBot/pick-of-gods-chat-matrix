import { Env, AuthRequestBody, AuthResponseBody, AuthSession, AuthSubject, UserSubject } from "../types";
import { generateTimestamp, generateId } from "./utils";

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as AuthRequestBody;

    if (!body.email) {
      const res: AuthResponseBody = { success: false, error: "Email required" };
      return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
    }

    const session: AuthSession = {
      sessionId: generateId(),
      subject: { type: "user", user: { id: generateId(), email: body.email } } as AuthSubject,
      issuedAt: generateTimestamp(),
      expiresAt: generateTimestamp(60 * 60 * 24),
    };

    if (env.AUTH_STORAGE) {
      await env.AUTH_STORAGE.put(session.sessionId, JSON.stringify(session));
    }

    const res: AuthResponseBody = { success: true, session };
    return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error(err);
    const res: AuthResponseBody = { success: false, error: "Auth failed" };
    return new Response(JSON.stringify(res), { status: 500, headers: { "content-type": "application/json" } });
  }
}
