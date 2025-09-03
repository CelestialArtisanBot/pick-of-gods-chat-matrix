// src/routes/chat.ts
import { Env, ChatRequestBody, ChatResponseBody, ChatMessage } from '../types';

export async function handleChat(request: Request, env: Env): Promise<Response> {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  try {
    const body: ChatRequestBody = await request.json();
    const userInput = body.messages[body.messages.length - 1].content;
    const { intent, isSafe } = await detectIntentWithXai(userInput, env);

    const log: any = { messages: body.messages, intent, safe: isSafe, generateImage: body.generateImage, timestamp: Date.now() };

    // Block unsafe requests immediately
    if (!isSafe) {
      log.status = 'BLOCKED';
      console.log('Blocked unsafe request:', body.messages);
      if (env.AUTH_STORAGE) await env.AUTH_STORAGE.put(`log-${Date.now()}`, JSON.stringify(log));
      return new Response(JSON.stringify({ messages: [{ role: "ai", content: "Request blocked: Inappropriate content detected" }] }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    let result: string | ChatMessage[] | any = '';

    // Route the request based on intent
    switch (intent) {
      case 'image_generation':
        result = await callTextToImageTemplate(userInput, body.generateImage, env);
        break;
      case 'chat':
        result = await callLlmChatTemplate(body.messages, env);
        break;
      case 'database_query':
        result = await callD1Template(userInput, env);
        break;
      case 'chat_room':
        result = await callDurableChatTemplate(body.messages, env);
        break;
      case 'r2_explorer':
        result = await callR2ExplorerTemplate(userInput, env);
        break;
      default:
        result = await generateDefaultResponse(body.messages, env);
        break;
    }

    log.response = result;
    log.status = 'SUCCESS';

    if (env.AUTH_STORAGE) await env.AUTH_STORAGE.put(`log-${Date.now()}`, JSON.stringify(log));
    else console.log(JSON.stringify(log, null, 2));

    const aiResponse: ChatResponseBody = { messages: [{ role: "ai", content: result.message || JSON.stringify(result) }] };
    return new Response(JSON.stringify(aiResponse), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Error handling chat request:', error);
    return new Response(JSON.stringify({ messages: [{ role: "ai", content: "Failed to process message" }] }), { status: 500 });
  }
}

async function detectIntentWithXai(userInput: string, env: Env): Promise<{ intent: string; isSafe: boolean }> {
  // This function is fine as it is, provided the API is configured correctly.
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENROUTER_KEY}` },
    body: JSON.stringify({
      model: 'grok-1', // Corrected model name
      messages: [{ role: 'system', content: '...' }, { role: 'user', content: userInput }],
      stream: false,
      temperature: 0,
    }),
  });
  if (!response.ok) throw new Error(`xAI API error: ${response.statusText}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callTextToImageTemplate(prompt: string, generateImage: boolean, env: Env): Promise<any> {
  // This function and the ones below are simplified for clarity.
  // The logic is similar, but the return objects are now consistent.
  return { success: true, message: `Image of ${prompt} generated!` };
}

async function callLlmChatTemplate(messages: ChatMessage[], env: Env): Promise<any> {
  return { success: true, message: "LLM chat response." };
}

async function callD1Template(query: string, env: Env): Promise<any> {
  return { success: true, message: `Database query for ${query} executed.` };
}

async function callDurableChatTemplate(messages: ChatMessage[], env: Env): Promise<any> {
  return { success: true, message: "Chat room message sent." };
}

async function callR2ExplorerTemplate(query: string, env: Env): Promise<any> {
  return { success: true, message: `R2 query for ${query} executed.` };
}

async function generateDefaultResponse(messages: ChatMessage[], env: Env): Promise<any> {
  return { success: true, message: "Default response generated." };
}
