// src/types.ts

// Worker Environment placeholder
export interface Env {
  OPENROUTER_KEY?: string;
}

// Auth types
export interface AuthRequestBody {}
export interface AuthResponseBody {}
export interface AuthSession {}
export interface AuthSubject {}
export interface UserSubject {}

// Chat types
export interface ChatRequestBody {
  messages: { role: string; content: string }[];
  generateImage?: boolean;
}
export interface ChatMessage { role: string; content: string }
export interface ChatResponseBody { messages: ChatMessage[] }

// Deploy types
export interface DeployRequestBody {}
export interface DeployResponseBody {}

// General request wrapper if needed
export interface RequestWithBody {
  messages: ChatMessage[];
  generateImage?: boolean;
}
