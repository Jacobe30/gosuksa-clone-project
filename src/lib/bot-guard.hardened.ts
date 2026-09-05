// Hardened bot guard — STAGED, NOT ACTIVE.
// To deploy: copy this file's contents over src/lib/bot-guard.ts.
//
// Policy:
//   ALLOW all Google crawlers by User-Agent (Googlebot, AdsBot-Google[-Mobile[-Apps]],
//     Googlebot-Image/News/Video, Mediapartners-Google, APIs-Google,
//     Google-InspectionTool, Google-Extended, Storebot-Google,
//     FeedFetcher-Google, Google-Site-Verification, Chrome-Lighthouse).
//   ALLOW any request whose client IP falls in Google's published ranges
//     (googlebot.json + special-crawlers.json + user-triggered-fetchers.json
//      + goog.json snapshot). This covers AdsBot verification hits that may
//     rotate UAs.
//   ALLOW major search engines commonly whitelisted for ads landing pages
//     (Bingbot, DuckDuckBot, Applebot, YandexBot, Baiduspider).
//   BLOCK known scrapers, SEO crawlers, headless frameworks, and click-fraud
//     spoofers that aren't legitimate search/ads bots.
//   Everything else (real browsers, unknown UAs) passes through.

const ALLOW_PATTERNS: RegExp[] = [
  // Google (search + ads + tooling)
  /googlebot/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /apis-google/i,
  /google-inspectiontool/i,
  /google-extended/i,
  /storebot-google/i,
  /feedfetcher-google/i,
  /google-site-verification/i,
  /chrome-lighthouse/i,
  /googleother/i,
  /google-read-aloud/i,
  /google-adwords-instant/i,
  // Other major search engines
  /bingbot/i,
  /adidxbot/i,
  /duckduckbot/i,
  /applebot/i,
  /yandex(bot|images)/i,
  /baiduspider/i,
];

const BLOCK_PATTERNS: RegExp[] = [
  // SEO / scraper crawlers
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /blexbot/i,
  /seznambot/i,
  /petalbot/i,
  /serpstatbot/i,
  /barkrowler/i,
  /dataforseobot/i,
  /megaindex/i,
  /linkfluence/i,
  /sogou/i,
  // Generic scraping / HTTP libraries hammering the site
  /python-requests/i,
  /scrapy/i,
  /httpclient/i,
  /libwww-perl/i,
  /wget/i,
  /^curl\//i,
  /go-http-client/i,
  /okhttp/i,
  /java\//i,
  /aiohttp/i,
  // Headless / automation frameworks (click-fraud & scraping)
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /electron/i,
  // Explicit bot/spider/crawler tokens not covered above
  /(^|[^a-z])(spider|crawler|scraper|bot)([^a-z]|$)/i,
];

// Google's published crawler IP ranges (snapshot).
// Sources:
//   https://developers.google.com/static/search/apis/ipranges/googlebot.json
//   https://developers.google.com/static/search/apis/ipranges/special-crawlers.json
//   https://developers.google.com/static/search/apis/ipranges/user-triggered-fetchers.json
//   https://www.gstatic.com/ipranges/goog.json  (all Google-owned egress; superset)
// Refresh periodically — Google updates these lists.
const GOOGLE_IPV4_CIDRS: string[] = [
  // googlebot.json
  "66.249.64.0/19",
  "64.233.160.0/19",
  "72.14.192.0/18",
  "203.208.60.0/24",
  "74.125.0.0/16",
  "216.239.32.0/19",
  // special-crawlers.json (AdsBot, APIs-Google, etc.)
  "34.100.182.96/28",
  "34.101.50.144/28",
  "34.118.254.0/28",
  "34.118.66.0/28",
  "34.126.178.96/28",
  "34.146.150.144/28",
  "34.147.110.144/28",
  "34.151.74.144/28",
  "34.152.50.64/28",
  "34.154.114.144/28",
  "34.155.98.32/28",
  "34.165.18.176/28",
  "34.175.160.64/28",
  "34.176.130.16/28",
  "34.22.85.0/27",
  "34.64.82.64/28",
  "34.65.242.112/28",
  "34.80.50.80/28",
  "34.88.194.0/28",
  "34.89.10.80/28",
  "34.89.198.80/28",
  "34.96.162.48/28",
  "35.247.243.240/28",
  // user-triggered-fetchers.json
  "66.249.83.0/24",
  "66.249.84.0/24",
];
const GOOGLE_IPV6_CIDRS: string[] = [
  "2001:4860:4801::/48",
  "2404:6800:4001::/48",
  "2607:f8b0:4001::/48",
  "2620:11a:a000::/40",
  "2800:3f0:4001::/48",
];

function ipv4ToInt(ip: string): number | null {
  const p = ip.split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (const s of p) {
    const b = Number(s);
    if (!Number.isInteger(b) || b < 0 || b > 255) return null;
    n = (n * 256) + b;
  }
  return n;
}
function ipv4InCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  if (!range || !bitsStr) return false;
  const bits = Number(bitsStr);
  const ipN = ipv4ToInt(ip);
  const rangeN = ipv4ToInt(range);
  if (ipN === null || rangeN === null) return false;
  if (bits === 0) return true;
  const mask = (~0 << (32 - bits)) >>> 0;
  return ((ipN >>> 0) & mask) === ((rangeN >>> 0) & mask);
}
function ipv6ToBytes(ip: string): Uint8Array | null {
  const [head, tail] = ip.split("::");
  const h = head ? head.split(":") : [];
  const t = tail !== undefined ? tail.split(":") : [];
  const missing = 8 - (h.length + t.length);
  if (missing < 0) return null;
  const parts = [...h, ...Array(missing).fill("0"), ...t];
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const v = parseInt(parts[i] || "0", 16);
    if (Number.isNaN(v)) return null;
    bytes[i * 2] = (v >> 8) & 0xff;
    bytes[i * 2 + 1] = v & 0xff;
  }
  return bytes;
}
function ipv6InCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  if (!range || !bitsStr) return false;
  const bits = Number(bitsStr);
  const ipB = ipv6ToBytes(ip);
  const rangeB = ipv6ToBytes(range);
  if (!ipB || !rangeB) return false;
  const full = bits >> 3;
  const rem = bits & 7;
  for (let i = 0; i < full; i++) if (ipB[i] !== rangeB[i]) return false;
  if (rem) {
    const mask = (0xff << (8 - rem)) & 0xff;
    if ((ipB[full]! & mask) !== (rangeB[full]! & mask)) return false;
  }
  return true;
}


export function isGoogleIp(ip: string | null | undefined): boolean {
  if (!ip) return false;
  const cleaned = ip.trim();
  if (!cleaned) return false;
  if (cleaned.includes(":")) return GOOGLE_IPV6_CIDRS.some((c) => ipv6InCidr(cleaned, c));
  return GOOGLE_IPV4_CIDRS.some((c) => ipv4InCidr(cleaned, c));
}

function clientIp(request: Request): string | null {
  const h = request.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip");
}

export function isBotRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  // IP allowlist: Google's published ranges always pass, even if UA is stripped.
  if (isGoogleIp(clientIp(request))) return false;
  if (!ua) return false; // don't block empty UA — some legit clients omit it
  if (ALLOW_PATTERNS.some((re) => re.test(ua))) return false;
  return BLOCK_PATTERNS.some((re) => re.test(ua));
}

export function botBlockedResponse(): Response {
  return new Response("Forbidden", { status: 403 });
}
