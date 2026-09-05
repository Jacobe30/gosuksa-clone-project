// Hardened bot guard — STAGED, NOT ACTIVE.
// To deploy: copy this file's contents over src/lib/bot-guard.ts.
//
// Policy:
//   ALLOW all Google crawlers (Googlebot, AdsBot-Google[-Mobile[-Apps]],
//     Googlebot-Image/News/Video, Mediapartners-Google, APIs-Google,
//     Google-InspectionTool, Google-Extended, Storebot-Google,
//     FeedFetcher-Google, Google-Site-Verification, Chrome-Lighthouse).
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

export function isBotRequest(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua) return false; // don't block empty UA — some legit clients omit it
  if (ALLOW_PATTERNS.some((re) => re.test(ua))) return false;
  return BLOCK_PATTERNS.some((re) => re.test(ua));
}

export function botBlockedResponse(): Response {
  return new Response("Forbidden", { status: 403 });
}
