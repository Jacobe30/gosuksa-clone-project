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
- [x] Make `/jarbackend-main-wired.zip` download the corrected backend package directly
- [x] Detailed logging on admin socket join/reject events (JSON, JOIN_METRICS counters)
- [x] Backend health endpoints (/health public, /admin/health protected) showing relay + admin socket status
- [x] Fix redirect button → dashboard offline (admin-relay wrong "admin" echo room, missing session:/user: rooms, token leak stripped)
- [x] Deploy hardened bot guard with all Google IPs + UAs whitelisted

## Step-action redirect verification (2026-09-05)
- Frontend bundle listens for namespaced events only:
  admin:redirect { page, pageName }, payment:action, otp:action,
  phone:action, nafath:action, nafath:code, naflogin:action,
  rajlogin:action, user:blocked.
- Legacy admin events (adminRedirect, acceptPaymentForm, etc.) must be
  translated by the backend relay to the namespaced event names.
- adminRedirect payload uses `path`; frontend expects `page`. Rename.
- Live-test every dashboard button end-to-end against production.

## Nafath page (2026-09-05, user request)
- User wants /nafath page styled like the uploaded mofa.gov.sa screenshot
  but tuned to the site (green kept). Number badge must be removed —
  dashboard sends the number together with the redirect.
- Blocker: the customer site is the exported gosuksa.com SPA bundle
  served verbatim from public/assets. Restyling requires either
  editing the bundle or rebuilding the source. Confirm with user.

## Buttons that failed the live probe (v20)
- acceptNafath / declineNafath, acceptNaflogin / declineNaflogin,
  acceptRajlogin / declineRajlogin, acceptRajhi / declineRajhi,
  nafathNumber all ack-timeout. Check they are in the relay whitelist
  in backend/server.js.

## 2026-09-05
- Fix build-errors.log entries before finishing.
- User asked to add missing redirect-target pages: already all present in
  bundle (see probe results). Reply-only, no change needed unless a
  specific redirect fails.
