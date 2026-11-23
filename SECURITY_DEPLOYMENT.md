# Security hardening — staging / deployment checklist

This branch is a **review-only** security migration. Do **not** merge or deploy
until the checks below pass. Changing GitHub files does not publish Firestore rules
or populate Vercel environment variables.

## 1. Rotate credentials (required)

- Revoke the bot token that appeared in Git history through Telegram BotFather.
  Removing the string from code does not remove Git history. A rotated token must
  never be copied into code, Firestore, an agent chat, or an issue.
- Set the new `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as Vercel server-side
  environment variables, not `VITE_*` variables.
- Do not expose or screenshot real token values.

## 2. Configure Vercel **before preview testing**

| Variable | What to set |
| --- | --- |
| `FIREBASE_API_KEY` | Firebase Web API Key; enables server-side ID-token lookup |
| `ADMIN_UPLOAD_EMAILS` | Comma-separated exact emails allowed to upload admin media (artist and moderator) |
| `ADMIN_MODERATOR_EMAILS` | Comma-separated exact moderator emails allowed to test Telegram |
| `TELEGRAM_BOT_TOKEN` | New, revoked-and-reissued secret from BotFather |
| `TELEGRAM_CHAT_ID` | Target Telegram chat |
| `CLOUDINARY_CLOUD_NAME` | Existing Cloudinary cloud |
| `CLOUDINARY_UPLOAD_PRESET` | Existing preset; see unsigned upload warning below |

The new admin-media endpoint fails closed (503) if the Firebase API key or
upload allowlist is missing. Avoid a broken live admin uploader: verify on
a protected preview first. Add Vercel Preview values as needed.

## 3. Firestore security rules require a separate deployment

The repository `firestore.rules` is **not automatically live** merely because
Vercel deploys frontend code. Paste/review them in Firebase Console -> Firestore
Database -> Rules, or use a reviewed Firebase CLI configuration. Check the
active Firebase project ID before publishing rules.

The rules:
- block public reads of legacy `content/telegram`;
- remove the permissive recursive signed-in catch-all;
- guard staff, moderator-only incidents, and role settings by approved identity;
- limit anonymous commission creation to expected fields;
- limit analytics write shapes (not an anti-spam guarantee).

### Legacy sensitive data cleanup (manual and deliberate)

**After** the new code and token are deployed, delete the legacy
`content/telegram` document, and remove `botToken` from `settings/telegram`.
These legacy documents may contain an old credential. Do not accidentally
delete `settings/roles` or any active commission requests.

Firebase Console authenticated delete is an administrative action and is NOT
performed by this GitHub branch.

## 4. Test via Antigravity / browser

- `npm ci`
- `npm run lint`
- `npx vite build` (skip the network-dependent Medium sync until deployment)
- Login as the approved moderator; verify that requests, incident review,
  dynamic roles, and Telegram test work.
- Login as the approved artist; verify the gallery, writings, admin uploads,
  commissions, and profile updates.
- Verify that an unknown Firebase account cannot open the admin dashboard or
  edit portfolio data.
- Verify that `/api/upload` and `/api/commission-test` without bearer token
  return 401; authenticated, non-allowlisted accounts return 403.
- Verify that Telegram test uses only server environment variables and that
  no token appears in page responses, localStorage, or browser app state.
- Verify no unauthenticated visitor can read `content/telegram` or
  `settings/telegram` after rules are published.
- Check the art request UX with a public anonymous visitor.
- Verify default, daytime, and nighttime presentation of all public pages.
- Smoke-test on mobile as well as desktop.

## 5. Known blockers / deliberately not declared fixed

1. **Public request live status:** `CommissionModal` still subscribes to
   `commission_requests/{id}` without an authenticated visitor. Current
   deny-by-default rules prevent this. Implement privacy-preserving visitor
   tracking (server-issued opaque capability + secure API, or Firebase anonymous
   auth + request ownership), then test end-to-end before enabling this ruleset.
2. **Artist data isolation:** Existing `commission_requests` documents contain
   raw fingerprint/IP and contact fields while the artist UI filters records
   client-side. Firestore cannot redact fields from a document for only one
   role. Split into moderator-only raw records and sanitized artist-facing
   records, with an authenticated approval process. **Do not call the artist
   commission inbox fully private until this migration is complete.**
3. **Unsigned Cloudinary upload preset:** Public commission submissions still
   use an unsigned preset. It can be abused if the preset permits uploads from
   anyone. Harden with a signed upload or Cloudinary restrictions, plus a
   persistent server-side quota. Client fingerprint/localStorage and the
   in-memory API limiter are not security boundaries.
4. **Analytics:** Counters remain publicly incrementable and do not provide
   abuse-resistant analytics. Migrate to server-side rate-limited tracking.
5. **Historic secrets:** The revoked bot token still exists in Git history.
   Rotation neutralizes it; Git history rewriting is a separate, coordinated
   maintenance operation.
6. **Behavioral verification:** This branch has not yet completed real Firebase
   emulator, UI integration, or live environment tests. Check CI and
   Antigravity before any merge.

## 6. Rollout sequence

1. Revoke leaked token; set environment variables and allowlists.
2. Run builds/preview tests.
3. Resolve the public status and artist-data privacy blockers.
4. Apply and test Firestore rules against emulator/staging.
5. Merge only after review and deploy with a rollback plan.
6. Remove sensitive legacy docs/fields in Firebase Console.
7. Perform production smoke tests and monitor Telegram, Cloudinary, and Firebase
   error logs.

Never put bot tokens, service account credentials, or private visitor information
in pull request descriptions or assistant prompts.
