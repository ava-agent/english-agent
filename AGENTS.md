# Repository Notes

This repository powers `english.rxcloud.group`, a Next.js English-learning assistant with Supabase auth/data, GLM-powered conversation, SRS review, notifications, and Vercel cron jobs.

## Working Rules

- Treat `.env.local` and production Vercel/Supabase/GLM credentials as sensitive. Keep real keys out of git.
- Keep root-level `check-*.png` and `redesign-*.png` as local QA/design captures unless intentionally moving curated screenshots into `docs/screenshots/`.
- Use `docs/screenshots/` and `docs/diagrams/` for committed product documentation assets.
- Verify unauthenticated and authenticated flows separately. `/chat` redirects guests without the guest-mode cookie to `/login`.
- Keep Supabase migrations and RLS changes reviewable in isolated commits.

## Validation

```bash
npm run lint
npm run test
npm run build
git diff --check
```

`npm run test` currently delegates to lint as a conservative smoke check. Add focused tests for chat streaming, guest mode, vocabulary extraction, and cron routes when those flows are next changed.

