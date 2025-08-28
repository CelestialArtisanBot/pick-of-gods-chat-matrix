import type { Env, DeployRequestBody } from "../types";
import { ok, err } from "./utils";

/**
 * POST /deploy
 * Body: { scriptName, code, routes?, envVars? }
 *
 * Behavior:
 *  - If env.DISPATCHER (Map) exists, register the script there (dev/local mode).
 *  - Else, if CLOUDFLARE_API_TOKEN & CLOUDFLARE_ACCOUNT_ID are present, respond with an instruction or (optionally) attempt a deploy via Cloudflare REST (not implemented here for safety).
 *  - Otherwise, return 501 with guidance to run the Node deploy script (scripts/deploy-wfp.ts).
 */
export async function handleDeploy(request: Request, env: Env): Promise<Response> {
  try {
    if (request.method !== "POST") return err("method_not_allowed", "POST required", 405);

    const body = await request.json().catch(() => null) as DeployRequestBody | null;
    if (!body || !body.scriptName || !body.code) return err("invalid_body", "scriptName and code required", 400);

    const { scriptName, code, routes, envVars } = body;

    // Dev path: in-memory dispatcher
    if (env.DISPATCHER && typeof env.DISPATCHER.set === "function") {
      env.DISPATCHER.set(scriptName, {
        code,
        routes,
        deployedAt: new Date().toISOString(),
        envVars: envVars ?? {}
      });
      return ok({ success: true, scriptName, message: "Registered in DISPATCHER (dev)", routes });
    }

    // If account token present, recommend using Node deploy script (safer).
    if (env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID) {
      return err("deploy_not_supported_in_worker", "Automatic deploy from Worker runtime is not recommended. Use the Node deploy script 'scripts/deploy-wfp.ts' with your CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.", 501, {
        hint: `node scripts/deploy-wfp.ts ${scriptName} ./path/to/module.mjs`
      });
    }

    // Default: instruct user to use scripts
    return err("deploy_not_configured", "Deploy not configured on this runtime. Run scripts/deploy-wfp.ts with your Cloudflare API token.", 501, {
      hint: "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID required for automated deploys from CI or local Node script."
    });
  } catch (e: any) {
    console.error("deploy handler error:", e);
    return err("internal_error", e?.message ?? "Internal error");
  }
}
