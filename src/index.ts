// src/index.ts
import { Env } from './types';
import { handleChat } from './routes/chat';
import { handleAuth } from './routes/auth';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/chat')) {
      return handleChat(request, env);
    }

    if (url.pathname.startsWith('/api/auth')) {
      return handleAuth(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
