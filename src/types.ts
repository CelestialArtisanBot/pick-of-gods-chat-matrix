/**
 * Type definitions for the Pick of Gods Chat + Worker Publisher + OpenAuth app.
 */

/**
 * Represents a chat message.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Environment bindings for the Worker.
 */
export interface Env {
  // --- Chat bindings ---
  AI: any; // Workers AI binding
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  // --- Worker Publisher bindings ---
  DISPATCHER?: Map<string, any>; // Map of deployed workers
  CLOUDFLARE_API_TOKEN?: string; // API token for worker deployment
  CLOUDFLARE_ACCOUNT_ID?: string; // Account ID for worker deployment
  READONLY?: boolean | string; // Disable deployments

  // --- OpenAuth bindings ---
  AUTH_STORAGE?: any; // KV or Durable Object storage for auth sessions
  AUTH_DB?: any; // D1 database for users
}

/**
 * OpenAuth subject payload for the 'user' type.
 */
export interface UserSubject {
  id: string;
  email?: string;
}

/**
 * Optional: request body for chat endpoint
 */
export interface ChatRequestBody {
  messages: ChatMessage[];
}

/**
 * Optional: request body for deploying a worker
 */
export interface DeployRequestBody {
  scriptName: string;
  code: string;
}
