import type { Env, DeployRequestBody } from "../types";

export async function handleDeploy(request: Request, env: Env): Promise<Response> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    return new Response(JSON.stringify({ error: "Missing API credentials" }), { status: 403 });
  }

  try {
    const { scriptName, code } = (await request.json()) as DeployRequestBody;

    // Optional: prevent deployments in read-only mode
    if (env.READONLY) {
      return new Response(JSON.stringify({ error: "Deployment disabled" }), { status: 403 });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${scriptName}`;

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/javascript",
      },
      body: code,
    });

    const data = await resp.json();
    return new Response(JSON.stringify(data), { status: resp.status, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Deploy Error:", err);
    return new Response(JSON.stringify({ error: "Failed to deploy worker" }), { status: 500 });
  }
}
