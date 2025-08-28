import chatWorker from "./chat-worker";
import deployWorker from "./deploy-worker";
import authWorker from "./auth-worker";
import { Env } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    // --- Route: Chat API ---
    if (url.pathname.startsWith("/api/chat")) {
      return chatWorker.fetch(request, env, ctx);
    }

    // --- Route: Worker Deployment ---
    if (url.pathname.startsWith("/deploy")) {
      return deployWorker.fetch(request, env, ctx);
    }

    // --- Route: OpenAuth ---
    if (url.pathname.startsWith("/auth")) {
      return authWorker.fetch(request, env, ctx);
    }

    // --- Route: Frontend ---
    // Serve unified index.html with tabs/sections for chat + deploy + auth
    // The frontend HTML can live in `public/index.html` or be a string template
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return env.ASSETS.fetch(request); // Serve your combined HTML
    }

    // --- Dispatch: dynamic Workers in your namespace ---
    if (env.DISPATCHER) {
      const workerName = pathSegments[0];
      try {
        const worker = env.DISPATCHER.get(workerName);
        return await worker.fetch(request, env, ctx);
      } catch (e: any) {
        if (e.message?.startsWith("Worker not found")) {
          return new Response(`Worker '${workerName}' not found`, { status: 404 });
        }
        return new Response("Internal error", { status: 500 });
      }
    }

    // Fallback 404
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
