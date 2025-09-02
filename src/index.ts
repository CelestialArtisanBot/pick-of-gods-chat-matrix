import { Env } from "./types";
import { handleAuth } from "./routes/auth";
import { handleChat } from "./routes/chat";
import { handleDeploy } from "./routes/deploy";

addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/auth")) {
    event.respondWith(handleAuth(event.request, event as unknown as Env));
  } else if (url.pathname.startsWith("/api/chat")) {
    event.respondWith(handleChat(event.request, event as unknown as Env));
  } else if (url.pathname.startsWith("/api/deploy")) {
    event.respondWith(handleDeploy(event.request, event as unknown as Env));
  } else {
    event.respondWith(new Response("Pick of Gods Chat Matrix Worker"));
  }
});
