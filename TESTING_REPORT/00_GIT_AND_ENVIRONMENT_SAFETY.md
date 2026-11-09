# Git & Environment Safety — Verification Log

## Git state (verified 2026-10-25)

| Check | Result |
|---|---|
| Repository | `C:\Users\91901\adios-iam-rbac-test` |
| Active branch | `iam-rbac-token-api-testing` |
| Tracking | `origin/dev` |
| Working tree | Clean, nothing uncommitted |
| HEAD commit | `a5beaf3f3127eade5adfc9818daed608cc4741d9` |
| Recorded starting commit | `a5beaf3` |
| Match | **Confirmed identical** — no drift |
| `origin/dev` tip (after fetch) | `a5beaf3f3127eade5adfc9818daed608cc4741d9` — same commit |

**Conclusion:** no discrepancy. The branch is exactly where it was reported to be, and `origin/dev` has not advanced since. No corrective action needed.

## Database / cache isolation (verified 2026-10-25)

| Check | Result |
|---|---|
| Real database before test backend started | `projectx`: 14 users, 11 drivers, 7 vendors |
| Real database after test backend started | `projectx`: **14 users, 11 drivers, 7 vendors — unchanged** |
| Test database | `projectx_iam_rbac_test` (new, separate name, same local MongoDB instance) — 0 users/drivers/vendors at creation |
| Redis | Real backend default logical DB (index 0); test backend isolated to index 2 |
| JWT signing key | Freshly generated 32-byte random key for the test backend only — tokens from one environment cannot validate against the other |
| `.env` handling | **Not copied from the real project.** Built fresh for the isolated test backend: only `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV` are meaningful/real (all isolated values); every third-party integration (Razorpay, Cloudinary, Surepass, SMTP, DigiLocker, Gemini, Google Maps) is a placeholder, since none of those are in scope for IAM/RBAC/token/API testing |

### One deviation worth recording
Placeholder values for `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` caused the server to **crash at boot** (`web-push`'s `setVapidDetails` validates the key is a real 65-byte decodable EC public key, even though no push notification is ever sent in this testing scope). Fixed by generating a real-format (but disposable, test-only) VAPID keypair with the project's own documented command (`node -e "console.log(require('web-push').generateVAPIDKeys())"`). This is a format requirement, not a real external service credential — no push notifications will actually be delivered, there's no real VAPID subscriber relationship behind these keys.

## Backend/frontend endpoints for this assignment

| Service | URL | Notes |
|---|---|---|
| Test backend API | `http://localhost:3000` | Isolated DB/Redis/JWT as above |
| Admin SPA (when started) | `http://localhost:8080` | Run from `C:\Users\91901\adios-iam-rbac-test\admin`, pointed at the test backend |

## Safety rules being followed throughout this assignment
- No destructive operations against `projectx` (the real database) at any point.
- No real payments, OTPs, emails, or pushes triggered (DigiLocker in sandbox mode, Razorpay/SMTP/push are placeholder credentials that cannot reach real services).
- No merge into `dev`/`main`, no new branch/clone, no push, no PR — everything stays local on `iam-rbac-token-api-testing` until explicitly authorized.
- No secrets will be printed in any report; test account passwords are randomly generated, disposable, and scoped only to the isolated test database.
