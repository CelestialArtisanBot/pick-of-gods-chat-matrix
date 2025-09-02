import type { RequestHandler } from "@cloudflare/workers-types";

// Example helper function for AI calls
async function callAI(apiKey: string, messages: any[], type: string): Promise<any> {
  let url = "https://api.openai.com/v1/chat/completions";
  let payload: any = {
    model: "gpt-5-mini",
    messages
  };

  // Add generation type for image/video/3D
  if(type === "image") payload.size = "1024x1024";
  if(type === "video") payload.video = true;      // hypothetical
  if(type === "3d") payload.render3D = true;      // hypothetical

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return data;
}

// ================== Chat Route Handler ==================
export const POST: RequestHandler = async (req) => {
  try {
    const { messages, apiKey, type } = await req.json();

    if(!apiKey) return new Response(JSON.stringify({ error: "API key required." }), { status: 400 });

    const aiResponse = await callAI(apiKey, messages, type);

    // Format response for frontend
    const responseMessages = [];

    if(type === "text") {
      // standard AI text
      responseMessages.push({ role: "ai", content: aiResponse.choices?.[0]?.message?.content || "No response" });
    } else if(type === "image") {
      // return image URL(s)
      const url = aiResponse.data?.[0]?.url || "";
      responseMessages.push({ role: "ai", content: url });
    } else if(type === "video") {
      const url = aiResponse.data?.[0]?.url || "";
      responseMessages.push({ role: "ai", content: url });
    } else if(type === "3d") {
      const url = aiResponse.data?.[0]?.url || "";
      responseMessages.push({ role: "ai", content: url });
    }

    return new Response(JSON.stringify({ messages: responseMessages }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch(err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to process chat." }), { status: 500 });
  }
};
