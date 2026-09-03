// Cloudflare Worker edge front door.
// Proxies REST + Socket.IO (polling and WebSocket upgrade) to the Railway service.

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allow = allowed.length === 0 || allowed.includes(origin) ? origin || "*" : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      request.headers.get("Access-Control-Request-Headers") || "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = new URL(env.ORIGIN_URL);
    url.protocol = target.protocol;
    url.hostname = target.hostname;
    url.port = target.port;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const headers = new Headers(request.headers);
    headers.set("host", target.host);
    headers.set("x-forwarded-host", new URL(request.url).host);
    headers.set("x-forwarded-proto", "https");

    const isUpgrade = (request.headers.get("Upgrade") || "").toLowerCase() === "websocket";

    const proxied = new Request(url.toString(), {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    });

    // WebSocket upgrades must pass through untouched.
    if (isUpgrade) return fetch(proxied);

    const res = await fetch(proxied);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(corsHeaders(request, env))) out.headers.set(k, v);
    return out;
  },
};
