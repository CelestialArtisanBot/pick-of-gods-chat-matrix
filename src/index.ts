// src/index.ts
/**
 * Pick of Gods - Chat + Worker Publisher + OpenAuth
 * Main Worker Entrypoint
 */

import { ChatMessage, Env, ChatRequestBody, DeployRequestBody, UserSubject } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      // Routing
      if (url.pathname.startsWith("/chat")) {
        return await handleChat(request, env);
      }

      if (url.pathname.startsWith("/deploy")) {
        return await handleDeploy(request, env);
      }

      if (url.pathname.startsWith("/auth")) {
        return await handleAuth(request, env);
      }

      // Serve static assets (frontend)
      return env.ASSETS.fetch(request);
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message ?? "Unexpected error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};

/* ------------------------------
 * CHAT ENDPOINT
 * ------------------------------ */
async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body: ChatRequestBody = await request.json();
  const messages: ChatMessage[] = body.messages ?? [];

  const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
    messages,
  });

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
}

/* ------------------------------
 * WORKER DEPLOYMENT ENDPOINT
 * ------------------------------ */
async function handleDeploy(request: Request, env: Env): Promise<Response> {
  if (env.READONLY === true || env.READONLY === "true") {
    return new Response("Deployments are disabled in READONLY mode", { status: 403 });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body: DeployRequestBody = await request.json();

  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    return new Response("Missing Cloudflare API credentials", { status: 500 });
  }

  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${body.scriptName}`;

  const deployResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/javascript",
    },
    body: body.code,
  });

  const result = await deployResponse.json();

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}

/* ------------------------------
 * OPENAUTH ENDPOINT
 * ------------------------------ */
async function handleAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Example: /auth/login
  if (url.pathname.endsWith("/login") && request.method === "POST") {
    const { email } = await request.json();
    const sessionId = crypto.randomUUID();

    if (env.AUTH_STORAGE) {
      await env.AUTH_STORAGE.put(sessionId, JSON.stringify({ email }));
    }

    return new Response(JSON.stringify({ sessionId }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Example: /auth/me
  if (url.pathname.endsWith("/me")) {
    const sessionId = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing session" }), { status: 401 });
    }

    const userData = env.AUTH_STORAGE ? await env.AUTH_STORAGE.get(sessionId) : null;

    if (!userData) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    return new Response(userData, { headers: { "Content-Type": "application/json" } });
  }

  return new Response("Not Found", { status: 404 });
}
