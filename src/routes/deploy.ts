import { Env, DeployRequestBody, DeployResponseBody } from "../types";
import { generateTimestamp } from "./utils";

export async function handleDeploy(request: Request, env: Env): Promise<Response> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || env.READONLY) {
    return new Response(JSON.stringify({ success: false, error: "Deploy not allowed" }), { status: 403 });
  }

  try {
    const body = (await request.json()) as DeployRequestBody;
    const timestamp = generateTimestamp();

    // Store in DISPATCHER registry
    env.DISPATCHER = env.DISPATCHER || new Map();
    env.DISPATCHER.set(body.scriptName, { code: body.code, routes: body.routes, deployedAt: timestamp });

    // Optionally call Cloudflare API for real deployment here (mocked free-tier)
    const res: DeployResponseBody = { success: true, scriptName: body.scriptName, workerId: body.scriptName, routes: body.routes };
    return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Deployment failed" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
