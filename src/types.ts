// ========================
// Global Types
// ========================

export interface Env {
  AI: any; // Cloudflare AI
  OPENROUTER_KEY: string;
  AUTH_STORAGE: KVNamespace;
  DISPATCHER: any;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  READONLY: KVNamespace;
}

export interface AuthRequestBody {
  email: string;
  password: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

export interface ChatRequestBody {
  messages: { role: string; content: string }[];
  generateImage?: boolean;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatResponseBody {
  messages: ChatMessage[];
}

export interface DeployRequestBody {
  scriptName: string;
  code: string;
  routes: string[];
}
