import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_BACKEND = "https://jb-end-production.up.railway.app";

function backendBase() {
  return (process.env["VITE_BACKEND_WS_URL"] || DEFAULT_BACKEND).replace(
    /\/+$/,
    "",
  );
}

async function proxy({ request, params }: any) {
  const splat = params._splat ?? "";
  const url = new URL(request.url);

  // The old Cloudflare Worker exposed /breinit as a startup gate (which also
  // enforced the KSA-only geo restriction). The Railway backend has no such
  // route, so answer it here without any geo restriction.
  if (splat.replace(/^\/+/, "") === "breinit") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "access-control-allow-origin": url.origin,
        "access-control-allow-credentials": "true",
      },
    });
  }
  const target = `${backendBase()}/${splat}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.set("origin", "https://gosuksa.com");
  headers.set("referer", "https://gosuksa.com/");

  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const res = await fetch(target, init);
  const outHeaders = new Headers(res.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  outHeaders.delete("transfer-encoding");
  outHeaders.set("access-control-allow-origin", url.origin);
  outHeaders.set("access-control-allow-credentials", "true");
  outHeaders.set("access-control-allow-headers", "*");
  outHeaders.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  return new Response(res.body, { status: res.status, headers: outHeaders });
}

export const Route = createFileRoute("/api-proxy/$")({
  server: {
    handlers: {
      GET: proxy,
      POST: proxy,
      PUT: proxy,
      PATCH: proxy,
      DELETE: proxy,
      OPTIONS: async ({ request }: any) => {
        const url = new URL(request.url);
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": url.origin,
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "*",
            "access-control-allow-methods":
              "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "access-control-max-age": "86400",
          },
        });
      },
    },
  },
});
