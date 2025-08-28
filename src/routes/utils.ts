import type { ApiResponse } from "../types";

/** Small helper to return JSON responses. */
export function json(data: unknown, status = 200): Response {
  const body = JSON.stringify(data);
  return new Response(body, {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Standard API success wrapper. */
export function ok<T = unknown>(data: T): Response {
  const payload: ApiResponse<T> = { success: true, data };
  return json(payload, 200);
}

/** Standard API error wrapper. */
export function err(code = "error", message = "An error occurred", status = 500, details?: Record<string, any>): Response {
  const payload: ApiResponse = {
    success: false,
    error: { code, message, details },
  };
  return json(payload, status);
}

/** Parse a cookie value by name from the Cookie header. */
export function getCookie(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.split(";").map(s => s.trim()).find(s => s.startsWith(name + "="));
  if (!m) return null;
  return decodeURIComponent(m.split("=").slice(1).join("="));
}

/** Create a Set-Cookie header string (simple). */
export function makeCookie(name: string, value: string, opts?: { maxAge?: number; httpOnly?: boolean; path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean; domain?: string; }) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts?.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts?.path) parts.push(`Path=${opts.path}`);
  if (opts?.httpOnly) parts.push("HttpOnly");
  if (opts?.secure) parts.push("Secure");
  if (opts?.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts?.domain) parts.push(`Domain=${opts.domain}`);
  return parts.join("; ");
}

/** Very small HTML escape (for safety when injecting). */
export function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}
