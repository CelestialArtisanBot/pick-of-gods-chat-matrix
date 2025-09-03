// ========================
// Global Types
// ========================

import type { KVNamespace, Fetcher } from '@cloudflare/workers-types';

export interface Env {
  AI: any; 
  OPENROUTER_KEY: string;
  AUTH_STORAGE: KVNamespace;
  READONLY: KVNamespace;
  DISPATCHER: Fetcher; 
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}

export interface AuthRequestBody {
  email: string;
  password?: string;
}

export interface AuthResponseBody {
  success: boolean;
  error?: string;
  session?: {
    sessionId: string;
    userId: string;
    expiresAt: number;
  };
}

export interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  generateImage?: boolean;
}

export interface ChatResponseBody {
  messages: ChatMessage[];
}

export interface DeployRequestBody {
  scriptName: string;
  code: string;
  routes: string[];
}

export interface DeployResponseBody {
  success: boolean;
  scriptName: string;
  workerId: string;
  routes: string[];
}
