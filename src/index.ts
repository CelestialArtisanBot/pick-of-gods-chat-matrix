// src/index.ts
import { Env, ChatRequestBody, ChatResponseBody } from "./types";

// Router placeholder (expand with routes later)
async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Chat route
  if (url.pathname === "/api/chat" && req.method === "POST") {
    try {
      const body: ChatRequestBody = await req.json();
      // Placeholder AI response logic
      const aiResp: ChatResponseBody = { messages: [{ role: "ai", content: "Hello from Cloudflare AI!" }] };

      return new Response(JSON.stringify(aiResp), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

// Main event listener
addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(router(event.request));
});
