/**
 * 📌 Type definitions for Pick of Gods Chat + Worker Publisher + OpenAuth + AI Image endpoints.
 * Covers chat messages, API requests/responses, auth, worker publishing, and environment bindings.
 */

//////////////////////
// 🔹 Chat Types
//////////////////////

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;             // ISO timestamp
  id?: string;                    // Unique message ID
  metadata?: Record<string, any>; // Optional extensibility
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  stream?: boolean;               // Enable streaming responses
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface ChatResponseBody {
  messages: ChatMessage[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  success: boolean;
  error?: string;
}

//////////////////////
// 🔹 Worker Publisher Types
//////////////////////

export interface DeployRequestBody {
  scriptName: string;
  code: string;
  routes?: string[];
  envVars?: Record<string,string>;
  compatibilityDate?: string;
}

export interface DeployResponseBody {
  success: boolean;
  workerId?: string;
  scriptName?: string;
  routes?: string[];
  error?: string;
}

export type DispatcherRegistry = Map<
  string,
  {
    code: string;
    routes?: string[];
    deployedAt: string;
  }
>;

//////////////////////
// 🔹 OpenAuth Types
//////////////////////

export interface AuthSubject {
  type: "user" | "service";
  user?: UserSubject;
  service?: ServiceSubject;
}

export interface UserSubject {
  id: string;
  email?: string;
  username?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceSubject {
  id: string;
  name: string;
  permissions: string[];
}

export interface AuthSession {
  sessionId: string;
  subject: AuthSubject;
  issuedAt: string;
  expiresAt: string;
  metadata?: Record<string,any>;
}

export interface AuthRequestBody {
  email?: string;
  password?: string;
  token?: string;
}

export interface AuthResponseBody {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

//////////////////////
// 🔹 AI Image Generation Types
//////////////////////

export interface ImageRequestBody {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export interface ImageResponseBody {
  imageBase64: string;
  success: boolean;
  error?: string;
}

//////////////////////
// 🔹 Worker Environment Bindings
//////////////////////

export interface Env {
  // --- Chat ---
  AI: any; // Workers AI binding
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  // --- Worker Publisher ---
  DISPATCHER?: DispatcherRegistry;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  READONLY?: boolean | string;

  // --- OpenAuth ---
  AUTH_STORAGE?: KVNamespace | DurableObjectNamespace;
  AUTH_DB?: D1Database;

  // --- Image Generation ---
  // Placeholder: any other AI image endpoints
}

//////////////////////
// 🔹 Utility Types
//////////////////////

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string,any>;
}

export interface ApiResponse<T=unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
