import {
  Env,
  ChatRequestBody,
  ChatResponseBody,
  ImageRequestBody,
  ImageResponseBody,
  DeployRequestBody,
  DeployResponseBody,
  AuthRequestBody,
  AuthResponseBody,
  ChatMessage
} from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // --- API Routing ---
    if (url.pathname.startsWith("/api/chat") && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname.startsWith("/api/image") && request.method === "POST") {
      return handleImage(request, env);
    }

    if (url.pathname.startsWith("/api/deploy") && request.method === "POST") {
      return handleDeploy(request, env);
    }

    if (url.pathname.startsWith("/api/auth") && request.method === "POST") {
      return handleAuth(request, env);
    }

    return new Response("Not found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;

// =========================
// 🔹 Handlers
// =========================

// --- Chat ---
async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages: ChatMessage[] = body.messages || [];

    if (!messages.some(m => m.role === "system")) {
      messages.unshift({ role: "system", content: "You are Pick of Gods AI, helpful, concise, and creative." });
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
      width: body.width || 1024,
      height: body.height || 1024,
      steps: body.steps || 25,
      seed: body.seed || Math.floor(Math.random() * 999999),
    });

    return new Response(result, { headers: { "content-type": "image/png" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success:false, error:"Image generation failed" } as ImageResponseBody), { 
      status: 500, headers: { "content-type":"application/json" } 
    });
  }
}

// --- Deploy ---
async function handleDeploy(request: Request, env: Env): Promise<Response> {
  try {
    if (!env.DISPATCHER) throw new Error("Dispatcher not configured");
    const body = (await request.json()) as DeployRequestBody;
    const timestamp = new Date().toISOString();

    env.DISPATCHER.set(body.scriptName, { code: body.code, routes: body.routes || [], deployedAt: timestamp });

    return new Response(JSON.stringify({ success:true, scriptName:body.scriptName, workerId:body.scriptName, routes:body.routes, error:"" } as DeployResponseBody), {
      status: 200, headers: { "content-type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success:false, error:(err as Error).message } as DeployResponseBody), {
      status: 500, headers: { "content-type":"application/json" }
    });
  }
}

// --- Auth ---
async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as AuthRequestBody;
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const session = {
      sessionId,
      subject: { type:"user", user: { id: body.email || "anon" } },
      issuedAt: now,
      expiresAt: new Date(Date.now()+3600*1000).toISOString()
    };

    if (env.AUTH_STORAGE) {
      await env.AUTH_STORAGE.put(sessionId, JSON.stringify(session), { expirationTtl:3600 });
    }

    return new Response(JSON.stringify({ success:true, session } as AuthResponseBody), { 
      status: 200, headers: { "content-type":"application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success:false, error:(err as Error).message } as AuthResponseBody), { 
      status: 500, headers: { "content-type":"application/json" }
    });
  }
}
