/**
 * Main entry point for Pick of Gods Chat + Worker Publisher + OpenAuth.
 *
 * Routes:
 *   /api/chat   -> Chat with Pick of Gods AI (Workers AI)
 *   /api/deploy -> Deploy Worker scripts dynamically
 *   /api/auth   -> Simple OpenAuth login/session handling
 *
 * Static assets are served via ASSETS binding.
 */

import type { Env } from "./types";
import * as chatRoute from "./routes/chat";
import * as deployRoute from "./routes/deploy";
import * as authRoute from "./routes/auth";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets (frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // Route requests
    try {
      if (url.pathname.startsWith("/api/chat")) {
        if (request.method === "POST") return chatRoute.handleChat(request, env);
        return new Response("Method Not Allowed", { status: 405 });
      }

      if (url.pathname.startsWith("/api/deploy")) {
        if (request.method === "POST") return deployRoute.handleDeploy(request, env);
        return new Response("Method Not Allowed", { status: 405 });
      }

      if (url.pathname.startsWith("/api/auth")) {
        return authRoute.handleAuth(request, env);
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      console.error("Unhandled Error:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
} satisfies ExportedHandler<Env>;
