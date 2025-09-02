/// <reference types="@cloudflare/workers-types" />

import { Env, ChatRequestBody, ChatResponseBody } from "./types";

async function router(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/api/chat" && req.method === "POST") {
    const body: ChatRequestBody = await req.json();

    const aiResp: ChatResponseBody = body.generateImage
      ? { messages: [{ role: "ai", content: "Image AI placeholder" }] }
      : { messages: [{ role: "ai", content: "Text AI placeholder" }] };

    return new Response(JSON.stringify(aiResp), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(router(event.request, {} as Env));
});
