// Cloudflare Worker edge front door for the Railway backend.
// Proxies every path, including REST, /breinit, and /socket.io.

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = allowedOrigins(env);
  const headers = new Headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    Vary: "Origin",
  });

  if (origin && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

export default {
  async fetch(request, env) {
    const origin = new URL(env.ORIGIN_URL);
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, origin);
    const headers = new Headers(request.headers);

    headers.set("Host", origin.host);
    headers.set("X-Forwarded-Host", incoming.host);
    headers.set("X-Forwarded-Proto", incoming.protocol.replace(":", ""));

    if (request.method === "OPTIONS") {
      const responseHeaders = corsHeaders(request, env);
      for (const [key, value] of Object.entries(NO_CACHE)) {
        responseHeaders.set(key, value);
      }
      return new Response(null, { status: 204, headers: responseHeaders });
    }

    const proxiedRequest = new Request(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    });

    // Cloudflare forwards the Upgrade header and WebSocket body untouched.
    const response = await fetch(proxiedRequest, {
      cf: { cacheEverything: false, cacheTtl: -1 },
    });
    const responseHeaders = corsHeaders(request, env);
    for (const [key, value] of Object.entries(NO_CACHE)) {
      responseHeaders.set(key, value);
    }

    const output = new Response(response.body, response);
    for (const [key, value] of responseHeaders) {
      output.headers.set(key, value);
    }
    return output;
  },
};
