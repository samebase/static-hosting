import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { components } from "./_generated/api.js";
import server from "../dist/server/server.js";

const http = httpRouter();
registerStaticRoutes(http, components.staticHosting, {
  spaFallback: false,
  fallback: async (request) => {
    // Missing scripts must remain 404s, not become TanStack HTML responses.
    const path = decodeURIComponent(new URL(request.url).pathname);
    if (path.startsWith("/assets/")) return null;
    const response = await server.fetch(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  },
});
export default http;
