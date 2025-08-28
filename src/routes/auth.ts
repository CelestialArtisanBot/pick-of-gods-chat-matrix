import type { Env, UserSubject, AuthResponseBody } from "../types";
import { ok, err, makeCookie, getCookie, json } from "./utils";

/**
 * Minimal auth routes (dev-friendly) — wire up real OpenAuth in place of these for production.
 *
 * - POST /api/auth/dev-login  -> sets uid cookie
 * - GET  /api/auth/me         -> returns current subject if cookie present (reads AUTH_DB if bound)
 * - POST /api/auth/logout     -> clears cookie
 *
 * Notes:
 *  - AUTH_DB (D1) or AUTH_STORAGE (KV) integration is optional and best-effort.
 *  - Replace dev-login with a secure OAuth/OpenAuth flow for production.
 */

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path.endsWith("/dev-login") && request.method === "POST") {
      // create lightweight dev UID
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const cookie = makeCookie("uid", id, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, path: "/", sameSite: "Lax" });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" } });
    }

    if (path.endsWith("/me") && request.method === "GET") {
      const cookieHeader = request.headers.get("cookie");
      const uid = getCookie(cookieHeader, "uid");
      if (!uid) return err("not_authenticated", "Not authenticated", 401);

      // Attempt to load from AUTH_DB (D1) if available
      if (env.AUTH_DB) {
        try {
          const row = await env.AUTH_DB.prepare("SELECT id, email, created_at FROM users WHERE id = ?").bind(uid).first<{ id: string; email?: string; created_at?: string }>();
          if (row && row.id) {
            const subject: UserSubject = { id: row.id, email: row.email };
            return ok({ sessionId: uid, subject });
          }
        } catch (e) {
          console.warn("AUTH_DB lookup failed:", e);
        }
      }

      // Fallback: return uid-only subject (dev)
      const subject: UserSubject = { id: uid };
      return ok({ sessionId: uid, subject });
    }

    if (path.endsWith("/logout") && request.method === "POST") {
      // clear cookie
      const cookie = makeCookie("uid", "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "Lax" });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" } });
    }

    // Not found for other auth routes
    return err("not_found", "Auth route not found", 404);
  } catch (e: any) {
    console.error("auth handler error:", e);
    return err("internal_error", e?.message ?? "Internal error");
  }
}
