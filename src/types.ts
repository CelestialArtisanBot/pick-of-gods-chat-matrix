// src/types.ts

export interface Env {
  OPENROUTER_KEY?: string;
  AI?: any; // Cloudflare AI binding
  AUTH_STORAGE?: any; // KV or Durable Object binding
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  READONLY?: any;
  DISPATCHER?: any;
}

export interface AuthRequestBody {
  email?: string;
  password?: string;
}

export interface AuthResponseBody {
  success?: boolean;
}

export interface AuthSession {
  sessionId?: string;
}

export interface UserSubject {}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  generateImage?: boolean;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ChatResponseBody {
  messages: ChatMessage[];
  success?: boolean;
}

export interface DeployRequestBody {
  scriptName?: string;
  code?: string;
  routes?: string[];
}

export interface DeployResponseBody {
  success?: boolean;
}
