// inside your AI chat worker
async function signalApp(workerUrl: string, payload: any) {
  try {
    await fetch(workerUrl + "/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Signal failed:", err);
  }
}
/// <reference types="@cloudflare/workers-types" />

import type { ChatMessage, ChatRequestBody, ChatResponseBody, ImageRequestBody, ImageResponseBody, DeployRequestBody, DeployResponseBody, AuthRequestBody, AuthResponseBody, AuthSession, Env } from "./types";

/**
 * Execution context provided by Cloudflare Workers
 */
interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
    props: any;
}

/**
 * Standard exported handler types
 */
type ExportedHandlerFetchHandler<EnvType = unknown, CfHostMetadata = unknown> =
    (request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: EnvType, ctx: ExecutionContext) => Response | Promise<Response>;

type ExportedHandlerTailHandler<EnvType = unknown> =
    (events: TraceItem[], env: EnvType, ctx: ExecutionContext) => void | Promise<void>;

type ExportedHandlerTraceHandler<EnvType = unknown> =
    (traces: TraceItem[], env: EnvType, ctx: ExecutionContext) => void | Promise<void>;

type ExportedHandlerTailStreamHandler<EnvType = unknown> =
    (event: TailStream.TailEvent, env: EnvType, ctx: ExecutionContext) => TailStream.TailEventHandlerType | Promise<TailStream.TailEventHandlerType>;

type ExportedHandlerScheduledHandler<EnvType = unknown> =
    (controller: ScheduledController, env: EnvType, ctx: ExecutionContext) => void | Promise<void>;

type ExportedHandlerQueueHandler<EnvType = unknown, Message = unknown> =
    (batch: MessageBatch<Message>, env: EnvType, ctx: ExecutionContext) => void | Promise<void>;

type ExportedHandlerTestHandler<EnvType = unknown> =
    (controller: TestController, env: EnvType, ctx: ExecutionContext) => void | Promise<void>;

/**
 * Main exported handler
 */
interface ExportedHandler<EnvType = unknown, QueueHandlerMessage = unknown, CfHostMetadata = unknown> {
    fetch?: ExportedHandlerFetchHandler<EnvType, CfHostMetadata>;
    tail?: ExportedHandlerTailHandler<EnvType>;
    trace?: ExportedHandlerTraceHandler<EnvType>;
    tailStream?: ExportedHandlerTailStreamHandler<EnvType>;
    scheduled?: ExportedHandlerScheduledHandler<EnvType>;
    test?: ExportedHandlerTestHandler<EnvType>;
    email?: EmailExportedHandler<EnvType>;
    queue?: ExportedHandlerQueueHandler<EnvType, QueueHandlerMessage>;
}

/**
 * AI Handler Input/Output Types
 */
export interface AIRequestOptions {
    messages?: ChatRequestBody["messages"];
    prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    seed?: number;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
}

export interface AIResponse {
    success: boolean;
    messages?: ChatMessage[];
    imageBase64?: string;
    error?: string;
}

/**
 * Cloudflare AI binding
 */
export interface AIBinding {
    run(model: string, inputs: AIRequestOptions, options?: { returnRawResponse?: boolean }): Promise<any>;
}

/**
 * Worker Environment
 */
export interface WorkerEnv extends Env {
    AI: AIBinding;
    ASSETS: { fetch(request: Request): Promise<Response> };
    DISPATCHER?: Map<string, any>;
    AUTH_STORAGE?: KVNamespace;

    CLOUDFLARE_API_TOKEN?: string;
    CLOUDFLARE_ACCOUNT_ID?: string;
    READONLY?: boolean;
}
