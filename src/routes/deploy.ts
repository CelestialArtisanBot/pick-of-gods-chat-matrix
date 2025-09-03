// src/routes/deploy.ts
import { Env, DeployRequestBody, DeployResponseBody } from '../types';

export async function handleDeploy(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }

  // Check if the deployment is allowed based on the READONLY binding
  if (env.READONLY) {
    return new Response(JSON.stringify({ success: false, error: "Deployment not allowed on this account." }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body: DeployRequestBody = await request.json();
    const { scriptName, code } = body;

    // Use the Cloudflare API to deploy the worker script
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${scriptName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/javascript',
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      },
      body: code,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ success: false, error: `Deployment failed: ${JSON.stringify(errorData)}` }), { status: 500 });
    }

    const res: DeployResponseBody = {
      success: true,
      scriptName,
      workerId: `worker-${scriptName}`,
      routes: body.routes,
    };
    return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Deployment error:", err);
    return new Response(JSON.stringify({ success: false, error: "Deployment failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
