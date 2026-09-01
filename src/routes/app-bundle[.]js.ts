import { createFileRoute } from "@tanstack/react-router";
import bundleRaw from "../../public/assets/index-BORbUPXS.js?raw";

// The original gosuksa.com bundle has the old API base compiled in as a
// fallback. We serve it through this route so the backend URL comes from
// configuration (VITE_BACKEND_WS_URL) instead of being hard-coded.
const ORIGINAL_API_BASE = "https://doctamworkerme.mysemitgo.workers.dev";
const DEFAULT_API_BASE = "https://jb-end-production.up.railway.app";

export const Route = createFileRoute("/app-bundle.js")({
  server: {
    handlers: {
      GET: () => {
        const apiBase = (
          process.env["VITE_BACKEND_WS_URL"] || DEFAULT_API_BASE
        ).replace(/\/+$/, "");
        let body = bundleRaw.split(ORIGINAL_API_BASE).join("/api-proxy").split(apiBase).join("/api-proxy");
        // TEMP DEBUG: trace the boot gate
        body = body
          .split("if ((await M5(), v)) return;")
          .join('console.log("[dbg] M5 resolved"); if ((await M5(), v)) return;')
          .split("r($ae()), o(!0), u(!1), s(!1), g(), y();")
          .join('console.log("[dbg] clearing loading"), r($ae()), o(!0), u(!1), s(!1), g(), y(), console.log("[dbg] loading cleared");')
          .split("function Wae({ blockDesktop: e = !1 }) {")
          .join('function Wae({ blockDesktop: e = !1 }) { console.log("[dbg] Wae render");');
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
