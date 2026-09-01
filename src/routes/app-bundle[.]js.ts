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
        const body = bundleRaw.split(ORIGINAL_API_BASE).join(apiBase);
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
