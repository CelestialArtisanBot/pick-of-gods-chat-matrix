export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
  id?: string;
  metadata?: Record<string, any>;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  stream?: boolean;
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

export interface AuthRequestBody {
  email?: string;
  password?: string;
  token?: string;
}

export interface AuthResponseBody {
  success: boolean;
  session?: any;
  error?: string;
}

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

export interface Env {
  AI: any;
  ASSETS: { fetch(request: Request): Promise<Response> };
  DISPATCHER?: Map<string, any>;
  AUTH_STORAGE?: KVNamespace;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  READONLY?: boolean;
}
