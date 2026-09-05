import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_BACKEND = "https://gosuksa-edge.bcare.workers.dev";
const FALLBACK_BACKEND = "https://jbackend-production-dc1b.up.railway.app";

function backendBase() {
  return (process.env["VITE_BACKEND_WS_URL"] || DEFAULT_BACKEND).replace(
    /\/+$/,
    "",
  );
}

// Lightweight cached health check for the edge proxy. When it is down
// (e.g. Cloudflare 530), requests go straight to the main server and we
// re-probe at most once per interval.
const HEALTH_TTL_MS = 30_000;
const DOWN_TTL_MS = 60_000;
let health: { ok: boolean; at: number } | undefined;

function markEdgeDown() {
  health = { ok: false, at: Date.now() };
}

async function edgeHealthy(): Promise<boolean> {
  const now = Date.now();
  if (health && now - health.at < (health.ok ? HEALTH_TTL_MS : DOWN_TTL_MS)) {
    return health.ok;
  }
  try {
    const res = await fetch(`${backendBase()}/breinit`, { method: "GET" });
    health = { ok: res.status < 500, at: now };
  } catch {
    health = { ok: false, at: now };
  }
  return health.ok;
}

async function proxy({ request, params }: any) {
  const splat = params._splat ?? "";
  const url = new URL(request.url);

  // The old Cloudflare Worker exposed /breinit as a startup gate that also
  // enforced the KSA-only geo restriction. Restore that behavior here: allow
  // Saudi Arabia visitors through, otherwise fail the gate so the frontend
  // stays on its loading/blocked screen (same UX as the original site).
  const cleanPath = splat.replace(/^\/+/, "");
  const country = (
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    ""
  ).toUpperCase();
  // Geo gate temporarily disabled — allow every visitor (KSA and non-KSA) into
  // the full form flow so Google Ads / crawlers can reach the landing page.
  const allowed = true;

  if (cleanPath === "breinit" || cleanPath === "geo") {
    const headers = {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": url.origin,
      "access-control-allow-credentials": "true",
    };
    // The homepage now opens for everyone. Visitors outside KSA are handled by
    // the lead form at the bottom of the page instead of a hard block.
    return new Response(
      JSON.stringify({ ok: true, allowed, countryCode: country || "XX" }),
      { headers },
    );
  }

  const target = `${backendBase()}/${splat}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.set("origin", "https://gosuksa-tmin.lovable.app");
  headers.set("referer", "https://gosuksa-tmin.lovable.app/");

  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  let bodyBuf: ArrayBuffer | null = null;
  if (!["GET", "HEAD"].includes(request.method)) {
    bodyBuf = await request.arrayBuffer();
    init.body = bodyBuf;
  }

  async function send(base: string) {
    const bodyInit: RequestInit = { ...init };
    if (bodyBuf) bodyInit.body = bodyBuf;
    return fetch(`${base}/${splat}${url.search}`, bodyInit);
  }

  const edgeIsFallback = backendBase().includes("railway");
  const preferOrigin = !edgeIsFallback && !(await edgeHealthy());

  let res: Response;
  try {
    res = preferOrigin ? await send(FALLBACK_BACKEND) : await fetch(target, init);
    // 5xx from the edge worker (e.g. Cloudflare 530 origin failure) → retry
    // straight against the origin backend so the app never blanks out.
    if (res.status >= 500 && !preferOrigin && !edgeIsFallback) {
      markEdgeDown();
      try {
        const alt = await send(FALLBACK_BACKEND);
        if (alt.status < 500) res = alt;
      } catch {}
    }
  } catch {
    if (!preferOrigin) markEdgeDown();
    try {
      res = await send(FALLBACK_BACKEND);
    } catch {
      res = new Response(JSON.stringify({ ok: false, error: "upstream_unavailable" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // The backend's /api/user/init reply omits the `userInfo` block the frontend
  // requires (it throws "Server did not return UUID" and spins forever).
  // Fill it in from the client-sent uuid when the backend leaves it out.
  if (/^\/?api\/user\/init\/?$/.test(splat)) {
    try {
      const data: any = res.ok ? await res.clone().json() : {};
      if (!data?.userInfo?.uuid) {
        let sentUuid = "";
        try {
          sentUuid =
            JSON.parse(new TextDecoder().decode(bodyBuf ?? new ArrayBuffer(0)))
              ?.uuid ?? "";
        } catch {}
        const uuid = sentUuid || data?._id || crypto.randomUUID();
        const patched = {
          ...data,
          ok: true,
          userInfo: {
            uuid,
            visitTime: new Date().toISOString(),
            ip: request.headers.get("cf-connecting-ip") || "Unknown",
            country: "Unknown",
            countryCode: "XX",
            city: undefined,
            region: undefined,
          },
        };
        return new Response(JSON.stringify(patched), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
            "access-control-allow-origin": url.origin,
            "access-control-allow-credentials": "true",
          },
        });
      }
    } catch {}
  }

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
