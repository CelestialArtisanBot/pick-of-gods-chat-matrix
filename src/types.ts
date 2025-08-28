/**
 * 📌 Type definitions for the Pick of Gods Chat + Worker Publisher + OpenAuth app.
 * Centralized type contracts for API, Worker bindings, Auth, and Chat operations.
 */

//////////////////////
// 🔹 Chat Types
//////////////////////

/**
 * Represents a chat message exchanged in the system.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string; // ISO timestamp
  id?: string; // Optional message ID
  metadata?: Record<string, any>; // Optional extensibility
}

/**
 * Request body for chat endpoint.
 */
export interface ChatRequestBody {
  messages: ChatMessage[];
  stream?: boolean; // Enable streaming responses
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Response body from chat endpoint.
 */
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

/**
 * Request body for deploying a worker.
 */
export interface DeployRequestBody {
  scriptName: string;
  code: string;
  routes?: string[];
  envVars?: Record<string, string>;
  compatibilityDate?: string;
}

/**
 * Deployment response.
 */
export interface DeployResponseBody {
  success: boolean;
  workerId?: string;
  scriptName?: string;
  routes?: string[];
  error?: string;
}

/**
 * Dispatcher registry for deployed workers.
 */
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

/**
 * Authenticated subject.
 */
export interface AuthSubject {
  type: "user" | "service";
  user?: UserSubject;
  service?: ServiceSubject;
}

/**
 * User payload.
 */
export interface UserSubject {
  id: string;
  email?: string;
  username?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service account payload.
 */
export interface ServiceSubject {
  id: string;
  name: string;
  permissions: string[];
}

/**
 * Authentication session data.
 */
export interface AuthSession {
  sessionId: string;
  subject: AuthSubject;
  issuedAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

/**
 * Auth request payloads.
 */
export interface AuthRequestBody {
  email?: string;
  password?: string;
  token?: string; // For API tokens or refresh
}

export interface AuthResponseBody {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

//////////////////////
// 🔹 Worker Environment Bindings
//////////////////////

export interface Env {
  // --- Chat bindings ---
  AI: any; // Workers AI binding
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  // --- Worker Publisher bindings ---
  DISPATCHER?: DispatcherRegistry;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  READONLY?: boolean | string;

  // --- OpenAuth bindings ---
  AUTH_STORAGE?: KVNamespace | DurableObjectNamespace;
  AUTH_DB?: D1Database;
}

//////////////////////
// 🔹 Utility Types
//////////////////////

/**
 * Standardized error type for all APIs.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Generic API response wrapper.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
