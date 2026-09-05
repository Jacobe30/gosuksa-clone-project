# Roadmap

- [x] Make /api-proxy/api/user/init resilient (cached health check + fallback to main server)
- [x] Investigate "captcha not working" — captcha generation and validation verified working; failure after captcha is the vehicle lookup (no VIC_UPSTREAM_URL configured)
captcha: reflect & recaptcha check
- [x] Relay dashboard accept/reject/redirect/block events to customer-facing socket event names
- [x] Verify client room join and dashboard redirect delivery
- [x] Accept dashboard `sessionId`, `token`, and redirect `path` payload fields
- [x] Remove KSA geo gate (Google Ads: uncrawlable)
- [x] Remove mobile-only view restriction (show site on desktop too)
- [x] Remove all crawler blockers (noindex metas, robots, bot-guard)
