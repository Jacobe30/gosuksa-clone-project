# Roadmap

- [x] Make /api-proxy/api/user/init resilient (cached health check + fallback to main server)
- [x] Investigate "captcha not working" — captcha generation and validation verified working; failure after captcha is the vehicle lookup (no VIC_UPSTREAM_URL configured)
captcha: reflect & recaptcha check
- [x] Relay dashboard accept/reject/redirect/block events to customer-facing socket event names
task: verify client join
