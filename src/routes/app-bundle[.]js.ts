import { createFileRoute } from "@tanstack/react-router";
import bundleRaw from "../../public/assets/index-BORbUPXS.js?raw";

// The original gosuksa.com bundle has the old API base compiled in as a
// fallback. We serve it through this route so the backend URL comes from
// configuration (VITE_BACKEND_WS_URL) instead of being hard-coded.
const ORIGINAL_API_BASE = "https://doctamworkerme.mysemitgo.workers.dev";
const DEFAULT_API_BASE = "https://jb-end-production.up.railway.app";

// Captcha keys compiled into the original bundle (registered for gosuksa.com).
// Override via env so the app can use keys registered for its own domain.
const ORIGINAL_RECAPTCHA_KEY = "6LdBVyAtAAAAAGd0sLVB5wM2g-nFnvDCrZJyKGzE";
const ORIGINAL_TURNSTILE_KEY = "0x4AAAAAADBVJXDKno5ekmDP";

export const Route = createFileRoute("/app-bundle.js")({
  server: {
    handlers: {
      GET: () => {
        const apiBase = (
          process.env["VITE_BACKEND_WS_URL"] || DEFAULT_API_BASE
        ).replace(/\/+$/, "");
        let body = bundleRaw
          .split(ORIGINAL_API_BASE)
          .join("/api-proxy")
          .split(apiBase)
          .join("/api-proxy");
        const recaptchaKey = process.env["VITE_RECAPTCHA_SITE_KEY"];
        if (recaptchaKey) body = body.split(ORIGINAL_RECAPTCHA_KEY).join(recaptchaKey);
        const turnstileKey = process.env["VITE_TURNSTILE_SITE_KEY"];
        if (turnstileKey) body = body.split(ORIGINAL_TURNSTILE_KEY).join(turnstileKey);
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
