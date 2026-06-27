# english-agent Web Triage - 2026-06-27

## Repository

- GitHub: `ava-agent/english-agent`
- Live site: `https://english.rxcloud.group`
- Deployment: Vercel
- Stack: Next.js 16, React 19, Tailwind CSS 4, Supabase, Volcengine Ark CodingPlan API, ts-fsrs, Octokit, web-push

## Public Routes Checked

- `https://english.rxcloud.group`: HTTP 200, served by Vercel
- `https://english.rxcloud.group/login`: HTTP 200, served by Vercel
- `https://english.rxcloud.group/chat`: HTTP 307 to `/login`, then HTTP 200; expected for protected route without session

## Local State

- Untracked QA/design captures were present at triage time:
  - `check-01-landing.png`
  - `check-02-destinations.png`
  - `check-03-scenarios.png`
  - `check-04-characters.png`
  - `check-05-rls-error.png`
  - `check-06-guest-chat-working.png`
  - `check-07-guest-chat-reply.png`
  - `check-08-guest-summary.png`
  - `check-09-login.png`
  - `redesign-landing.png`
  - `redesign-login.png`
- Runtime/build outputs were already ignored:
  - `.env.local`
  - `.next/`
  - `.vercel/`
  - `next-env.d.ts`
  - `node_modules/`
  - `supabase/.temp/`
  - `tsconfig.tsbuildinfo`

## Actions Taken

- Added `AGENTS.md` with maintenance, credential, screenshot, and validation rules.
- Added `npm run test` as a conservative validation alias for `npm run lint`.
- Added precise ignore rules for root-level QA/design captures: `check-*.png` and `redesign-*.png`.
- Recorded live route checks and current local artifact categories.

## Follow-Up

- Add real tests for chat streaming, guest mode, vocabulary extraction, RLS-sensitive Supabase operations, and cron routes.
- Decide whether any root-level QA captures should be curated into `docs/screenshots/`; otherwise keep them local.
- Address Next.js build warnings:
  - `middleware` file convention is deprecated in favor of `proxy`.
  - `metadataBase` is not set, so social image resolution falls back to `http://localhost:3000`.
- Re-check Vercel environment variables before deployment changes:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ARK_API_KEY`
  - `ARK_BASE_URL`
  - `ARK_CHAT_MODEL`
  - `CRON_SECRET`
  - `GITHUB_TOKEN`
  - `TELEGRAM_BOT_TOKEN`
  - VAPID keys

## Validation

- `npm run lint`: passed
- `npm run test`: passed
- `npm run build`: passed with the two Next.js warnings recorded above
- `git diff --check`: passed
- Common secret pattern scan: matched only environment variable reads for Ark, cron, Telegram, and GitHub tokens; no hardcoded production credential identified
- Global inventory refresh: completed; readiness is now 100
