import { handleChat } from "./routes/chat";

addEventListener("fetch", (event) => {
  event.respondWith(router(event.request));
});

async function router(request: Request) {
  const url = new URL(request.url);
  if(url.pathname.startsWith("/api/chat") && request.method === "POST") {
    return await handleChat(request);
  }
  return new Response("Not Found", { status: 404 });
}
