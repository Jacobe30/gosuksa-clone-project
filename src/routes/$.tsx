import { createFileRoute } from "@tanstack/react-router";
import shellHtml from "../spa-shell.html?raw";

// Client-side routes of the original SPA (/details, /pay, /invoice, ...) must
// all resolve to the same shell so deep links and refreshes keep working.
export const Route = createFileRoute("/$")({
  server: {
    handlers: {
      GET: () =>
        new Response(shellHtml, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
