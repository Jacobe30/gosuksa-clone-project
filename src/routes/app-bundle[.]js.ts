import { createFileRoute } from "@tanstack/react-router";
import bundleRaw from "../../public/assets/index-BORbUPXS.js?raw";

// The original gosuksa.com bundle has the old API base compiled in as a
// fallback. We serve it through this route so the backend URL comes from
// configuration (VITE_BACKEND_WS_URL) instead of being hard-coded.
const ORIGINAL_API_BASE = "https://doctamworkerme.mysemitgo.workers.dev";
const DEFAULT_API_BASE = "https://gosuksa-edge.gosktmin.workers.dev";

export const Route = createFileRoute("/app-bundle.js")({
  server: {
    handlers: {
      GET: () => {
        const apiBase = (
          process.env["VITE_BACKEND_WS_URL"] || DEFAULT_API_BASE
        ).replace(/\/+$/, "");
        const body = bundleRaw
          .split(ORIGINAL_API_BASE).join("/api-proxy")
          .split(apiBase).join("/api-proxy")
          // REST goes through the same-origin proxy, but Socket.IO must talk to
          // the backend directly (WebSocket upgrades can't go through the proxy
          // route), so point the socket base at the configured backend URL.
          .split("rz = `${Hl}/`").join(`rz = ${JSON.stringify(apiBase + "/")}`)
          // Bypass the "desktop blocked" gate so the site renders on all devices.
          .replace(/blockDesktop:\s*wU\(\)/g, "blockDesktop: false");

        return new Response(body, {
          headers: {
            "content-type": "application/javascript; charset=utf-8",
            "cache-control": "no-cache",
          },
        });
      },
    },
  },
});
