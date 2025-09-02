// src/types.ts

// Worker Environment
export interface Env {
  OPENROUTER_KEY?: string;
  AI?: any; // placeholder for Cloudflare AI binding
  AUTH_STORAGE?: any; // KV or Durable Object
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  READONLY?: any;
  DISPATCHER?: any;
}

// Auth types
export interface AuthRequestBody {
  email?: string;
  password?: string;
}
export interface AuthResponseBody {}
export interface AuthSession { sessionId?: string }
export interface AuthSubject {}
export interface UserSubject {}

// Chat types
export interface ChatRequestBody {
  messages: { role: string; content: string }[];
  generateImage?: boolean;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}
export interface ChatMessage { role: string; content: string }
export interface ChatResponseBody { messages: ChatMessage[]; success?: boolean }

// Deploy types
export interface DeployRequestBody {
  scriptName?: string;
  code?: string;
  routes?: string[];
}
export interface DeployResponseBody { success?: boolean }
