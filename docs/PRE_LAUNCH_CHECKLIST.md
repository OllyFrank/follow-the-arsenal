# Pre-launch checklist — accounts feature

The accounts feature (see `ACCOUNTS_PLAN.md`) is built and feature-flagged off in
production via `VITE_ACCOUNTS_ENABLED` (see `src/lib/featureFlags.ts`). The account
icon shows a "coming soon" message until this is flipped on.

**Do not set `VITE_ACCOUNTS_ENABLED=true` in Vercel's Production environment, or
remove the `AccountComingSoon` fallback in `App.tsx`, until everything below is
checked off.**

## Tests (ACCOUNTS_PLAN.md section 8) — run on staging via a preview link

- [ ] Sign up, sign in, sign out
- [ ] Sign in again on a **second device/browser** — confirm attendance and addresses sync
- [ ] Guest migration: an account with **no** existing guest data (nothing to offer)
- [ ] Guest migration: guest data on an **empty** account (silent import)
- [ ] Guest migration: guest has addresses **and** the account already has some — confirm
      the keep-account's/replace-with-these choice both work correctly
- [ ] Guest migration: **declined** — confirm nothing is uploaded and the local guest
      data is still there afterwards
- [ ] Deletion: confirm the `profiles`/`addresses`/`attendance` rows are actually gone
      (check the Table Editor), that you can't sign back in without a fresh sign-up,
      and that re-signing up with the *same* email afterward gives a completely empty
      account, not old data reappearing
- [ ] Downloaded data (the three CSVs) opens correctly and contains everything
- [ ] **RLS cross-account test**: two separate test accounts, confirm account A cannot
      read or write account B's rows — this is the actual security guarantee behind
      "your data is private," so don't skip it

## Production environment (currently only staging has been set up)

- [ ] Apply all migrations in `supabase/migrations/` to the **production** Supabase
      project (ref `bfnyqhnejjpadewzailh`), not just staging
- [ ] Deploy the `delete-account` Edge Function to production too
- [ ] Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for the **production**
      Supabase project under Vercel's **Production** environment variables (only
      staging's values exist anywhere right now, in `.env.local` and presumably
      Preview)
- [ ] Set up custom SMTP on the production Supabase project, and test a magic link
      from a non-team email address — the built-in email provider is heavily
      rate-limited and (per Supabase) only reliably reaches your own team's addresses

## Legal / content

- [ ] Fill in the actual backup retention period in `PrivacyNotice.tsx`'s "How long
      we keep it" section — it's currently generic ("the normal course of their
      retention cycle") because it depends on your specific Supabase plan/tier
- [ ] ICO data protection fee self-assessment completed:
      https://ico.org.uk/for-organisations/data-protection-fee/self-assessment/
- [ ] Confirm `privacy@weallfollowthearsenal.co.uk` is live and checked

## Final check, then launch

- [ ] Sign-up, export and deletion each checked once on **production** with your own
      real account
- [ ] Flip `VITE_ACCOUNTS_ENABLED=true` in Vercel's Production environment variables
- [ ] Optional cleanup once confident: remove the `ACCOUNTS_ENABLED` branching and
      `AccountComingSoon` from `App.tsx` — not required, the flag can just stay `true`
      indefinitely instead
