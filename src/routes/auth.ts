import type { Env, UserSubject } from "../types";

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const { method } = request;

    if (method === "POST") {
      const { id, email } = await request.json() as UserSubject;
      if (!id) return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400 });

      const sessionToken = crypto.randomUUID();

      if (env.AUTH_STORAGE) {
        await env.AUTH_STORAGE.put(sessionToken, JSON.stringify({ id, email }), { expirationTtl: 3600 });
      }

      return new Response(JSON.stringify({ sessionToken }), { headers: { "Content-Type": "application/json" } });
    }

    if (method === "GET") {
      const sessionToken = new URL(request.url).searchParams.get("token");
      if (!sessionToken) return new Response(JSON.stringify({ error: "No token provided" }), { status: 400 });

      const userData = env.AUTH_STORAGE ? await env.AUTH_STORAGE.get(sessionToken, "json") : null;
      if (!userData) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });

      return new Response(JSON.stringify(userData), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error("Auth Error:", err);
    return new Response(JSON.stringify({ error: "Auth request failed" }), { status: 500 });
  }
}
