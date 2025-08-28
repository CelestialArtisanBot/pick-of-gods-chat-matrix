import { ChatRequest, ChatResponse } from "./types";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body: ChatRequest = await request.json();

      // Call AI model (Workers AI / external API)
      const replyText = await handleAI(body.message, env);

      const response: ChatResponse = { reply: replyText };
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleAI(message: string, env: any): Promise<string> {
  try {
    // Example with Cloudflare Workers AI
    const aiRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/${env.AI_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: message }),
    });
    const result = await aiRes.json();
    return result.result?.response || "⚠️ AI did not return a response.";
  } catch (err: any) {
    return "⚠️ Error: " + err.message;
  }
}
