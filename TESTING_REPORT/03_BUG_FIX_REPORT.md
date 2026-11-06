# Bug-Fix Report

Both confirmed findings (`IAM-001`, `IAM-002`) are **fixed and verified** as of 2026-10-25.

## IAM-001 — User password change now invalidates old sessions

**Changed file:** `backend/src/modules/users/users.controller.ts` (`changePassword`)

**Fix:** bumps `user.tokenVersion` in the same save as the password change — reuses the exact mechanism `logoutAll` already uses elsewhere in this codebase, just triggers it from this additional code path. 4 lines added, nothing removed, nothing else touched.

## IAM-002 — Vendor/meat-centre accounts now have a real session-revocation mechanism

This one needed a small structural addition since the mechanism didn't exist for this identity type at all. Five files touched, each a small, targeted change:

| File | Change |
|---|---|
| `backend/src/database/models/Vendor.ts` | Added `tokenVersion: Number, default 0` field |
| `backend/src/database/models/MeatCenter.ts` | Same addition, same reasoning (a `meat_vendor`-role token can back onto either collection) |
| `backend/src/utils/generateToken.ts` | Token now carries a `tv` claim, same shape as the existing User-token `tv` claim |
| `backend/src/modules/vendors/vendors.controller.ts` | `loginVendor` now passes the vendor's current `tokenVersion` into the token. `changeVendorPassword` bumps it. Admin's `updateVendor` bumps it whenever an admin sets a new password directly, or whenever `onboardingStatus` changes (covers the reject/suspend scenario) |
| `backend/src/modules/meat/meat.controller.ts` | Same two changes, mirrored for `MeatCenter` (`loginMeatCenter`, `changeMeatVendorPassword`) |
| `backend/src/middleware/auth.middleware.ts` | **The actual enforcement point.** Added an `else if` branch for vendor-role tokens that looks up the backing `Vendor` (falling back to `MeatCenter` for `meat_vendor` roles — the exact same resolution order already used by the existing `GET /vendors/me` handler, kept consistent rather than inventing a new pattern) and rejects the request with 401 if the token's `tv` claim doesn't match the account's current `tokenVersion` |

**Deliberately not done:** did not add a live re-check of `getVendorAccessBlock` on every request (the way `isBlocked` is re-checked for Users). The `tokenVersion` bump on `onboardingStatus` change achieves the same practical outcome (an already-issued token dies the moment status changes) without adding a second, overlapping revocation mechanism. Noted here so this scoping decision is visible, not silent.

## Re-verification (second pass, requested explicitly)

Both fixes were re-reviewed and re-tested independently in this second batch, not just taken as settled from the first pass:
- Re-read `users.controller.ts:245-249` and `auth.middleware.ts:58-78` together, tracing the exact chain: password change → `tokenVersion` incremented → next request's token carries the old `tv` claim → middleware's `(payload.tv ?? 0) !== (user.tokenVersion ?? 0)` catches the mismatch → 401. Confirmed logically sound.
- Re-read `vendors.controller.ts` (`changeVendorPassword`, `updateVendor`), `meat.controller.ts` (`changeMeatVendorPassword`), and the middleware's vendor branch together, tracing the same chain for both the Vendor and MeatCenter paths, and for both trigger scenarios (password change, `onboardingStatus` change). Confirmed sound for both backing collections.
- Reran `IAM-T07`, `IAM-T09`, `IAM-T10` individually (not just as part of the full suite) multiple times across this session, including after further unrelated test-file changes and backend restarts — consistently passing every time, no flakiness observed in these three specifically.

## Verification

| Check | Result |
|---|---|
| `IAM-T07` (user password-change session kill) | **Pass** (was failing before the fix) |
| `IAM-T09` (vendor password-change session kill) | **Pass** (was failing before the fix) |
| `IAM-T10` (vendor rejection session kill) | **Pass** (was failing before the fix) |
| Full `iam-rbac-security.test.ts` suite | **17/17 pass** |
| Existing project test suite (`npm test`, 6 files) | **43/43 pass — no regressions** |
| `tsc --noEmit` | Clean, 0 errors |
| `npm run lint` | 22 pre-existing errors, **all in files this change never touched** (`admin.controller.ts`, `invoice.service.ts`, `socket.manager.ts`) — zero lint errors in any of the 7 changed files |
| Diff review | `git diff --stat`: 7 files, 63 insertions / 7 deletions, all directly tied to the two findings — no unrelated changes, no secrets |

## Adjacent-flow regression check

Manually reasoned through (not yet device-tested — flagged for your manual QA):
- A vendor/meat-centre account that **never** changes password or gets its status changed keeps `tokenVersion: 0` forever, and `generateToken(..., 0)` always matches — so this change is invisible to every account that doesn't trigger one of these two actions. No behavior change for the common case.
- Existing vendor tokens minted **before** this fix carry no `tv` claim at all (`payload.tv` is `undefined`). The check uses `(payload.tv ?? 0) !== (account.tokenVersion ?? 0)` — both sides default to `0`, so a pre-existing token for an account that has never had its password changed or status changed since this deploy continues to work exactly as before. No one gets logged out by deploying this fix.
