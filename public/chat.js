import { RequestWithBody, ChatResponse } from "../types";

// Ping secrets AI first, fallback Cloudflare AI
async function callAI(body: RequestWithBody): Promise<ChatResponse> {
  const secretsKey = await SECRET_OPENROUTER(); // placeholder for secret fetch
  try {
    const res = await fetch("https://openrouter.ai/api/chat", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${secretsKey}`
      },
      body: JSON.stringify(body)
    });
    if(!res.ok) throw new Error("Secret AI failed");
    return await res.json();
  } catch(err) {
    console.warn("Falling back to Cloudflare AI", err);
    const cfRes = await fetch("https://api.cloudflare.com/ai/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    return await cfRes.json();
  }
}

export async function handleChat(request: Request): Promise<Response> {
  const body: RequestWithBody = await request.json();
  const aiResp = await callAI(body);
  return new Response(JSON.stringify(aiResp), { status: 200, headers: { "Content-Type":"application/json" } });
}
