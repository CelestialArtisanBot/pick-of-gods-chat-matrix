import { Env, ChatRequestBody } from "./types";
import * as chatRoutes from "./routes/chat";
import * as deployRoutes from "./routes/deploy";
import * as authRoutes from "./routes/auth";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Serve static frontend
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // Chat route
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return chatRoutes.handleChat(request, env);
    }

    // Deploy route
    if (url.pathname === "/api/deploy" && request.method === "POST") {
      return deployRoutes.handleDeploy(request, env);
    }

    // Auth route
    if (url.pathname.startsWith("/api/auth")) {
      return authRoutes.handleAuth(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
