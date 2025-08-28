import { Env, ChatRequestBody, ChatResponseBody, ImageRequestBody, ImageResponseBody, DeployRequestBody, DeployResponseBody, AuthRequestBody, AuthResponseBody, ChatMessage } from "./types";

/**
 * Pick of Gods Worker - Chat + Image + Deployment + Auth
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // --- API Routing ---
    if (url.pathname.startsWith("/api/chat")) {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return handleChat(request, env);
    }

    if (url.pathname.startsWith("/api/image")) {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return handleImage(request, env);
    }

    if (url.pathname.startsWith("/api/deploy")) {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return handleDeploy(request, env);
    }

    if (url.pathname.startsWith("/api/auth")) {
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return handleAuth(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

//////////////////////
// 🔹 Handlers
//////////////////////

// --- Chat ---
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages: ChatMessage[] = body.messages || [];

    // Inject system prompt if missing
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({ role: "system", content: "You are Pick of Gods AI, helpful and concise." });
    }

    const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages,
      max_tokens: body.maxTokens || 1024,
      temperature: body.temperature || 0.7,
      top_p: body.topP || 0.9,
    }, { returnRawResponse: true });

    return aiResponse;
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Chat request failed" } as ChatResponseBody), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
}

// --- Image ---
async function handleImage(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ImageRequestBody;

    const result = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
      prompt: body.prompt,
      width: body.width || 512,
      height: body.height || 512,
      steps: body.steps || 20,
      seed: body.seed || Math.floor(Math.random() * 999999),
    });

    return new Response(result, { headers: { "content-type": "image/png" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Image generation failed" } as ImageResponseBody), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
}

// --- Deploy Worker ---
async function handleDeploy(request: Request, env: Env): Promise<Response> {
  try {
    if (!env.DISPATCHER) throw new Error("Dispatcher not configured");

    const body = (await request.json()) as DeployRequestBody;
    const timestamp = new Date().toISOString();

    env.DISPATCHER.set(body.scriptName, { code: body.code, routes: body.routes, deployedAt: timestamp });

    return new Response(JSON.stringify({ success: true, scriptName: body.scriptName, deployedAt: timestamp } as DeployResponseBody), {
      status: 200, headers: { "content-type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message } as DeployResponseBody), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
}

// --- Auth ---
async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as AuthRequestBody;

    // Simple session logic for example
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const session = {
      sessionId,
      subject: { type: "user", user: { id: body.email || "anon" } },
      issuedAt: now,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString()
    };

    if (env.AUTH_STORAGE) {
      await env.AUTH_STORAGE.put(sessionId, JSON.stringify(session), { expirationTtl: 3600 });
    }

    return new Response(JSON.stringify({ success: true, session } as AuthResponseBody), {
      status: 200, headers: { "content-type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message } as AuthResponseBody), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
}
