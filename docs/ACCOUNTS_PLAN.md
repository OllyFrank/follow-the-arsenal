# Accounts with Supabase — Plan

Goal: let users create an account so their attendance and home addresses are saved and synced across devices. Handle their personal data properly, and let them export or delete it themselves with no admin involvement.

## Principles
- **Guest mode stays.** The app works without an account, with data kept in the browser. Signing in is how users save and sync.
- **Collect the minimum.** Store an email address (for sign-in), home postcodes, coordinates, date ranges and attendance only. No names, no full street addresses, no phone numbers.
- **Self-service rights.** Users can view, correct, export and delete everything from inside the app.
- **Fixture and ground data stay as static files in the app.** They are not personal data, and only user data goes in Supabase.

## 0. Environments: staging and production
Nothing goes straight to production any more. There are two environments:

| | Staging | Production |
|---|---|---|
| Code | Feature branches → Vercel preview URL (automatic on every push) | `main` branch → `follow-the-arsenal.vercel.app` |
| Database | Supabase project `follow-the-arsenal-staging` | Supabase project `follow-the-arsenal` |
| Vercel env vars | Set as **Preview** variables | Set as **Production** variables |
| Who uses it | Olly, test accounts, local development | Real users |

**Workflow for every change:**
1. Create a branch for the feature.
2. Build and test locally (local dev points at the **staging** database).
3. Push the branch. Vercel creates a preview URL that uses staging.
4. Test on the preview link, including on a phone.
5. Merge into `main`. Vercel deploys to production.
6. If the change included a database migration, apply it to production with the Supabase CLI **after** it has been tested on staging. Never edit the production schema by hand in the dashboard.

**Rules:**
- Test accounts and test data live only in staging.
- Migrations are files in the repo (`supabase/migrations`), applied to staging first, then production.
- Free Supabase projects pause after a period of inactivity. If staging seems broken after a break, resume it in the dashboard first.

## 1. Set-up steps (done by Olly in dashboards, before coding)
Do steps 1–5 for **both** Supabase projects unless noted.
1. **Create two Supabase projects**, `follow-the-arsenal-staging` and `follow-the-arsenal`, both in the **London (eu-west-2)** region so data stays in the UK.
2. **Auth providers:**
   - Enable email magic links, which work without passwords.
   - Optionally enable Google sign-in (needs a Google Cloud OAuth client; add the redirect URLs for both projects).
3. **Auth URLs:**
   - **Staging:** set the Site URL to `http://localhost:5173` and add the Vercel preview URLs as allowed redirect URLs, using a wildcard so every preview works, e.g. `https://follow-the-arsenal-*.vercel.app/**`.
   - **Production:** set the Site URL to `https://follow-the-arsenal.vercel.app`.
4. **Vercel environment variables:**
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` twice: the staging values under **Preview** and the production values under **Production**.
   - Put the staging values in a local `.env.local` file for development. This file must be in `.gitignore`.
   - The **service role key must never go in the front end or the repo.** It is only stored as an Edge Function secret in each Supabase project.
5. **Email (custom SMTP):** not needed for building. Supabase's built-in email delivers magic links to members of your own Supabase team, which is enough for testing with your own address, although it is heavily rate-limited. Before launch (production only):
   - Sign up for an email service (e.g. Resend) and verify a sending domain.
   - Add its SMTP details under Authentication → SMTP settings.
   - Set the email service's log retention as short as it allows.

## 2. Database (create with Supabase CLI migrations so the schema lives in the repo)
| Table | Columns |
|---|---|
| `profiles` | `id` (uuid, PK, references `auth.users` **on delete cascade**), `units` ('mi'/'km'), `privacy_version_accepted`, `age_confirmed_13_plus` (bool), `created_at` |
| `addresses` | `id`, `user_id` (references `auth.users` **on delete cascade**), `postcode`, `lat`, `lng`, `from_date`, `to_date`, `created_at` |
| `attendance` | `user_id` (references `auth.users` **on delete cascade**), `match_id`, `created_at` — primary key (`user_id`, `match_id`) |

- **Row-level security** must be ON for every table, with policies allowing users to select, insert, update and delete only rows where `user_id = auth.uid()` (or `id = auth.uid()` for profiles).
- **Coordinates:** store them rounded to 3 decimal places (roughly 100 m). That is plenty for distance totals and reduces precision held about where someone lives.
- **New users:** a trigger creates the `profiles` row automatically when they sign up.

## 3. Sign-up and sign-in flow
- **Sign up:** the user enters their email, ticks "I'm 13 or over" and "I've read the privacy notice", then receives a magic link.
  - Users under 13 can't sign up without parental consent under UK rules, so the age tick is required.
- **First sign-in on a device with guest data:** prompt "Upload your X matches and Y addresses from this device to your account?"
  - Attendance is merged as a union.
  - Addresses are imported only if the account has none; otherwise ask which set to keep.
  - After upload, clear the guest copy from the browser.
- **While signed in:** Supabase is the source of truth. Keep a local cache for speed only.
- **Sign out:** clears the local cache on that device.

## 4. Automated deletion (no admin needed)
- **Settings → "Delete my account":**
  - A warning screen explains what will be removed.
  - The user must type `DELETE` to confirm.
  - If their last sign-in was more than 24 hours ago, require a fresh magic-link sign-in first, which protects against someone using an unattended logged-in device.
- **Edge Function `delete-account`:**
  1. Verify the caller's session (JWT) and take the user ID from it. Never accept a user ID from the request body.
  2. Use the service role key, server-side only, to call `auth.admin.deleteUser(userId)`.
  3. The cascades remove the `profiles`, `addresses` and `attendance` rows.
  4. Return success.
- **In the app:** after success, sign out, clear all local data, and show a "Your account and data have been deleted" screen.
- **No deletion log** containing email or user ID is kept.
- **Backups:** deleted data may remain in Supabase's backups until they expire. State the retention period (check your plan) in the privacy notice.
- **Only remaining manual case:** someone who can no longer access their email can't prove who they are. They use the contact email in the privacy notice. This should be rare.

## 5. Data export and correction
- **Settings → "Download my data":** produces a JSON file containing the profile, addresses and attended matches (match ID, date, teams and venue for readability). This can be done client-side from the user's own data, with no server work.
- **Correction:** every field can already be edited in the app.

## 6. Privacy notice (a page linked from sign-up and the footer)
Write it in plain English, covering:
- who runs the app and a contact email;
- what's collected and why (to provide the service);
- the lawful basis (contract: the user asked for the service);
- the services involved: Supabase (database and auth, London), Vercel (hosting), the email provider (magic links), and postcodes.io / OpenStreetMap Nominatim (postcode lookups, where the postcode is sent at lookup time);
- how long data is kept (until the user deletes their account, plus backup expiry);
- the user's rights and how to use them in-app;
- the right to complain to the ICO.

Store a version number, and re-prompt users to accept the notice when it changes.

**Cookies:** Supabase sign-in uses strictly necessary storage only, so no cookie banner is needed, as long as no analytics or tracking is added. Adding analytics later would change this.

## 7. Security checklist
- RLS on every table, tested with two accounts: user A must not be able to read or write user B's rows, even via direct API calls.
- Service role key only in Edge Function secrets.
- The anon key is safe to be public, because RLS protects the data.
- Rate-limit sign-in attempts (Supabase defaults are fine with custom SMTP).
- Keep `@supabase/supabase-js` up to date.

## 8. Testing before launch
Run all of these on **staging** (via a preview link) before the first production release, and again after any change to auth, the database or deletion.
- Sign up, sign in, sign out and sign in again on a second device. Data should sync.
- Guest data migration covering an empty account, an account with existing data, and a declined migration.
- Deletion: confirm all rows are gone, the user can't sign in, and signing up again with the same email gives a fresh empty account.
- The export file opens and contains everything.
- RLS cross-account test (see section 7).

## Pre-launch checklist (before inviting anyone)
- Custom SMTP set up on the production project and magic links tested from a non-team email address.
- ICO data protection fee self-assessment completed: https://ico.org.uk/for-organisations/data-protection-fee/self-assessment/
- Privacy notice live with a working contact email.
- All tests in section 8 passed on staging; production migrations applied and matching staging.
- Sign-up, export and deletion checked once on production with your own account.

## Build order
0. Staging setup: branch workflow, staging Supabase project, Preview/Production env vars, `.env.local` for local development, Supabase CLI linked to both projects.
1. Supabase client, environment variables and magic-link sign-in/out (guest mode untouched).
2. Migrations: tables, cascades, RLS policies, profile trigger.
3. Read and write attendance and addresses from Supabase when signed in.
4. Guest-data migration prompt.
5. Settings page: units, export, delete account (Edge Function).
6. Privacy notice page, sign-up ticks, version re-prompt.
7. Run the full test list, then launch.

## Not in this phase
Social features, public profiles, inactive-account auto-deletion (consider later with a scheduled job and warning emails), and analytics.
