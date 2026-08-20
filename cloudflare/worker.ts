import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cloudflareAppRouter, createCloudflareContext } from "./routers";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return Response.json({ ok: true, service: "area50-worker" });
    if (url.pathname.startsWith("/api/trpc")) {
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: cloudflareAppRouter,
        createContext: createCloudflareContext,
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
