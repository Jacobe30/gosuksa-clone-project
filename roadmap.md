# Roadmap — gosuksa.com clone

## Constraints
- Clone gosuksa.com exactly from the uploaded export. No new pages/fields/features/redesign.
- NO Lovable Cloud / Supabase / new backend. Reuse existing deployed API.
- Existing API base (from the site bundle): `https://doctamworkerme.mysemitgo.workers.dev`
  (env: `VITE_API_BASE`). Endpoints observed:
  - `GET /api/vicinfomain/captcha`
  - `POST /api/vicinfomain/createRequest`
  - `GET /api/user/init`, `GET /api/chat/enabled`, `/breinit`
  - reCAPTCHA v3 site key + Turnstile site key from bundle
- Submissions must land in the existing admin dashboard → same endpoints, same payload shape.

## Tasks
- [ ] Inspect original export: routes, sections, forms, fields, copy, styles
- [ ] Port assets (logos, hero, icons) via lovable-assets
- [ ] Rebuild pages/routes in TanStack Start (RTL, Cairo font)
- [ ] Wire forms to existing API with identical request/response contract
- [ ] Responsive parity (mobile/desktop) + final visual comparison
