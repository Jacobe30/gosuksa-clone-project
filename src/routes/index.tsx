import { createFileRoute } from "@tanstack/react-router";
import shellHtml from "../spa-shell.html?raw";
import { isBotRequest, botBlockedResponse } from "@/lib/bot-guard";

// The original gosuksa.com build is served verbatim: the exported bundle lives
// in /public/assets and this route returns its index.html shell untouched.
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (isBotRequest(request)) return botBlockedResponse();
        return new Response(shellHtml, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "x-robots-tag": "index, follow",
          },
        });
      },
    },
  },
});
