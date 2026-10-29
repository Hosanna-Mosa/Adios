# Security Findings Register

Status legend: **Confirmed bug** (reproducible, violates stated security requirement) · **Fixed and verified** (fix applied + regression test passes) · **Not a bug** (intentional/compliant) · **Blocked** · **Not tested**

---

## IAM-001 — User password change does not invalidate existing sessions

| Field | Value |
|---|---|
| Severity | High |
| Status | **Fixed and verified** — see `03_BUG_FIX_REPORT.md` |
| Affected file | `backend/src/modules/users/users.controller.ts` — `changePassword` (~line 221) |
| Preconditions | A logged-in user with a valid token |
| Reproduction | 1) Log in, obtain token A. 2) Call `POST /users/change-password` with a new password using token A. 3) Immediately call any protected endpoint (e.g. `GET /users/addresses`) with the **same old token A**. |
| Expected behavior | Token A should be rejected (401) — the account's credentials changed, so prior sessions should die, matching the existing `logoutAll`/`tokenVersion` mechanism already used elsewhere in this codebase. |
| Actual behavior | Token A **still works** (200) after the password change. |
| Evidence | Test `IAM-T07` in `backend/src/modules/auth/iam-rbac-security.test.ts`, run 2026-10-25: `AssertionError: 200 !== 401` on first execution; after harness cleanup fix, reproduced cleanly on 3/3 subsequent runs. |
| Root cause | `changePassword` saves the new password but never increments `User.tokenVersion`. The `tokenVersion` check already exists and is already enforced by `auth.middleware.ts:65` on every request — it's simply never triggered here. `logoutAll` (`auth.service.ts:177-189`) does exactly the increment needed, just isn't called from this code path. |
| Fix implemented | See `03_BUG_FIX_REPORT.md` |
| Regression test | `IAM-T07` |

---

## IAM-002 — Vendor/meat-centre accounts have no session-revocation mechanism at all

| Field | Value |
|---|---|
| Severity | **Critical** (broader than IAM-001 — not a missed call, the underlying mechanism doesn't exist for this identity type) |
| Status | **Fixed and verified** — see `03_BUG_FIX_REPORT.md` |
| Affected files | `backend/src/middleware/auth.middleware.ts` (the `tokenVersion`/`isBlocked` check is gated to `UserRole` only, skipping vendor/meat tokens entirely); `backend/src/database/models/Vendor.ts` (no `tokenVersion` field); `backend/src/utils/generateToken.ts` (vendor tokens carry no `tv` claim) |
| Preconditions | A logged-in vendor or meat-centre account |
| Reproduction (two independent scenarios, both confirmed) | **(a)** Vendor changes their own password via `PUT /vendors/change-password` — old token still works afterward. **(b)** An admin rejects/disables a vendor's application via `PUT /vendors/:id` — the vendor's already-issued token still works afterward, for the full remaining 30-day token lifetime. |
| Expected behavior | Both actions should kill the vendor's existing session(s), the same way they do for `User`-role accounts. |
| Actual behavior | Confirmed 200 (still works) in both scenarios where 401 was expected. |
| Evidence | Tests `IAM-T09` and `IAM-T10` in `iam-rbac-security.test.ts`, run 2026-10-25, both `AssertionError: 200 !== 401`; reproduced cleanly on 3/3 subsequent runs after harness fix. |
| Root cause | Structural, not a missed call like IAM-001: `auth.middleware.ts:58` only runs the tokenVersion/blocked re-check `if (Object.values(UserRole).includes(payload.role))`. Vendor/meat tokens carry role `"restaurant_vendor"` / `"meat_vendor"`, which are not members of the `UserRole` enum — so this entire check is **unconditionally skipped** for every vendor/meat request, by design of the current code, not an edge case. There is also no `logoutAll`-equivalent for vendors at all. |
| Fix implemented | See `03_BUG_FIX_REPORT.md` |
| Regression test | `IAM-T09`, `IAM-T10` |

---

## RBAC-003 — Declining an order does not verify the driver was ever offered it

| Field | Value |
|---|---|
| Severity | **Low** (`declineOrder`'s own gap — analytics-pollution only, no privilege escalation or data exposure) plus a related **Medium** issue found during investigation (sequential dispatch queue could be force-advanced out of turn) |
| Status | **Fix implemented and regression-tested (2026-10-29). Awaiting dispatch-owner review before merge — NOT fully closed.** |
| Affected files | `backend/src/modules/orders/orders.service.ts` (`declineOrder`), `backend/src/services/dispatch.manager.ts` (`handleDriverDecline`, new `isCurrentCandidate`), `backend/src/services/foodDispatch.service.ts` (new `wasOfferedTo`) |
| Original reproduction | Any driver with a valid token could `POST /orders/:id/decline` on **any** order id, including one they were never offered. For sequential dispatch (ride/package/helper/meat/scheduled — food already validated correctly), this could also force-advance the live dispatch queue, skipping the driver who legitimately held the offer. |
| Root cause | `declineOrder` recorded a decline unconditionally; `dispatch.manager.ts`'s `handleDriverDecline` advanced the dispatch queue without checking the declining driver was the current candidate. |
| **Fix implemented** | Added two new read-only checks — `dispatchManager.isCurrentCandidate(orderId, driverUserId)` (sequential dispatch) and `foodDispatch.wasOfferedTo(order, driverUserId)` (broadcast/food dispatch) — called by `declineOrder` *before* anything is recorded or mutated. `handleDriverDecline` also independently validates the current candidate as defense-in-depth. Full diff: `git diff` on the three files above, 47 insertions / 4 deletions total. |
| **Regression tests added** | `backend/src/modules/orders/rbac-003.decline-authorization.test.ts` (new, 5 tests, `RBAC-003-T01` through `T05`) — covers: unauthorized decline on sequential dispatch is rejected and doesn't corrupt the queue; legitimate decline still works and the queue correctly advances; decline on an order with no active session is rejected; broadcast/food decline correctly rejects non-offered drivers and accepts legitimate ones. Added to `npm run test:iam-rbac`. |
| **Test results (2026-10-29)** | New targeted tests: **5/5 pass**. Full IAM/RBAC suite (now includes the 5 new tests): **217/217 pass, 0 fail**. Existing project suite: **43/43 pass, 0 fail**. `tsc --noEmit`: clean. Lint: 22 pre-existing errors, same 5 baseline files, 0 new errors. |
| **Confirmed NOT broken by this fix** | Dispatch timeouts (the 16s fallback timer closure calls `recordDeclineInDb` directly, never goes through `handleDriverDecline` — untouched by this change, confirmed by reading the code). Driver accept flow (`handleDriverAccept` — untouched, not part of this fix's scope). Legitimate declines, both sequential and broadcast (test-confirmed, `T02`/`T05`). |
| **Known, separate, out-of-scope issue found during this investigation** | `handleDriverAccept` (`dispatch.manager.ts`) detects when the accepting driver isn't the current candidate but only logs a warning — it doesn't block the accept. Same class of bug as RBAC-003, but on the accept path, not the decline path this fix addresses. Not fixed here — flagged separately, needs its own decision. |
| **Review readiness — not yet approved** | Dispatch-owner review has **not** happened yet. Needs a human reviewer to look at: (1) `dispatch.manager.ts`'s `handleDriverDecline`/`isCurrentCandidate` diff — does the candidate-matching logic correctly reflect how offers are actually supposed to work, including any edge case around concurrent dispatch sessions or driver reconnection this testing pass might not have covered; (2) `orders.service.ts`'s reordered `declineOrder` — confirm the upfront gate doesn't change any other caller's expectations; (3) whether the newly-found `handleDriverAccept` gap should be fixed in a follow-up. |

## Environment limitation — now resolved via a separate isolated instance

| Item | Detail |
|---|---|
| Transactional order-status updates (`updateOrderStatus` in `orders.service.ts`) initially could not be exercised | MongoDB transactions require a replica set; the original isolated test database runs as a **standalone** MongoDB instance on the shared local server (not a replica set). |
| Resolution | Rather than reconfigure the shared MongoDB server (which also hosts the real `projectx` database — out of scope without authorization), stood up a **completely separate, throwaway** `mongod` instance — own data directory (`C:\Users\91901\adios-iam-rbac-test\mongo-replset-data`), own port (`27118`), initiated as a single-node replica set (`rs-iam-test`). Zero contact with the shared server or the real database. Ran a second backend instance (port 3001) pointed at it, seeded the same test fixtures, and reran `IDOR-T04` there. |
| Result | **`IDOR-T04` passes for real** — confirmed the request actually reached and completed the transactional code path (200, not the earlier transaction-unavailable error), not just the fallback branch. The owning customer's cancel flow is now verified end-to-end, not just its authorization layer. |
| Cleanup note | This throwaway MongoDB instance and the second backend process (port 3001) are separate from the main isolated test setup — can be torn down once this assignment is done; noted in `08_EXECUTION_SUMMARY.md`. |

## Items verified correct — no bug (listed so this isn't mistaken for untested)

| Item | Test(s) | Result |
|---|---|---|
| Valid login succeeds for every role (admin/user/driver/support/vendor) | `IAM-T01` | Pass |
| Wrong password and non-existent account return the identical generic message (no enumeration) | `IAM-T02` | Pass |
| Protected endpoint rejects requests with no token | `IAM-T03` | Pass |
| Protected endpoint rejects a tampered token | `IAM-T04` | Pass |
| Logout revokes that specific token; reuse is rejected | `IAM-T05` | Pass |
| Logout-all kills every session for a user, not just the one that called it | `IAM-T06` | Pass |
| A blocked **User**'s active session dies immediately (not just future logins) | `IAM-T08` | Pass — this is the User-side equivalent of IAM-002's scenario (b), and it works correctly for Users; the gap is specifically in the Vendor/MeatCenter code path |
| Non-admin roles get 403 on admin-only endpoints | `RBAC-T01` | Pass |
| Admin reaches admin-only endpoints | `RBAC-T02` | Pass |
| Support reaches shared admin+support endpoints but not admin-only ones | `RBAC-T03` | Pass |
| Driver-only endpoints reject user/support/admin tokens | `RBAC-T04` | Pass |
| Driver-only endpoint accepts a real driver token | `RBAC-T05` | Pass |
| Vendor's own-resource endpoint (`/vendors/me`) returns only that vendor's data — no cross-vendor leak | `RBAC-T06` | Pass |
| A vendor token cannot call the admin-only vendor-update route on another vendor's record | `RBAC-T07` | Pass |
| All 19 GET-list admin/analytics endpoints correctly reject USER/DRIVER tokens (and SUPPORT where not explicitly shared) with 403, and no-token with 401 | `SWEEP` suite, 101 cases | Pass |
| Full create→non-admin-write-denied→admin-write-succeeds→cleanup cycle for banners, coupons, offers, zones, support-intents | `SWEEP-CRUD`, 5 full cycles | Pass |
| `/zones` GET is intentionally open to any authenticated role (not sensitive data); write operations remain admin-only | `SWEEP-CRUD` zones test | Pass — confirmed intentional, not a gap |
| Write-boundary denial (403/401) confirmed for every other sensitive admin write route: user/driver/support-member/dev-driver CRUD, system config, app-versions, order create/update, ticket create/update | `SWEEP-WRITE-DENY`, 51 cases across 17 routes × 3 checks | Pass |
| SUPPORT role can create/update tickets but is correctly denied every other admin-only write (e.g. user creation) | `SWEEP-WRITE-DENY` support-specific test | Pass |
| A driver cannot confirm cash-collected on an order assigned to a different driver (IDOR) | `IDOR-T01` | Pass — 404, existence concealed rather than revealed |
| A different customer cannot cancel another customer's order (IDOR) | `IDOR-T03` | Pass — 404 |
| The actual owning customer CAN cancel their own order, end-to-end including the transaction | `IDOR-T04` | Pass — verified against a separate isolated replica-set MongoDB instance (see below) |
| A user's saved address is always scoped to their own account (IDOR) | `IDOR-T05` | Pass |
| Profile update cannot inject `role`/`isBlocked`/`tokenVersion` (mass assignment) | `MASS-T01` | Pass — controller uses an explicit field allowlist, confirmed by re-fetching the account via admin afterward, not just trusting the response echo |
| OTP self-registration cannot mint an ADMIN/SUPPORT account (role escalation) | `MASS-T02` | Pass |
| `restaurantAccept` and `updateStatus` scope correctly to the actual customer/vendor/driver relation (`getOrderForActor`) | Code-reviewed, consistent with `IDOR-T01`/`T03` results | Pass |
| Support ticket reply/resolve endpoints check `ticket.userId` ownership even though the route itself has no role restriction | Code-reviewed (`support.controller.ts:58-113`) | Pass |
| Food item update/delete/availability-toggle (`food.controller.ts`) scope to `item.vendorId === req.user.userId` (or admin), with an explicit field allowlist — not mass-assignable | Code-reviewed | Pass |
| Meat item availability/price update (`meat.controller.ts`) scope to `item.meatCenterId === req.user.userId` | Code-reviewed | Pass |
| Vendor's own-profile update (`vendor-profile.controller.ts: updateMyVendorProfile`) uses an explicit field allowlist, scoped via the token's own id — not mass-assignable | Code-reviewed | Pass |
| Driver cash-out (`drivers.controller.ts: cashOut`) scopes to the token's own `userId`, and additionally requires password re-confirmation before moving money | Code-reviewed | Pass |
| Admin refunds/payouts routes (`admin.money.routes.ts`) are entirely router-level `authorizeRole([ADMIN])` — no non-admin can reach any payout/refund data at all | Code-reviewed | Pass |
| Codebase-wide scan for the actual mass-assignment risk pattern (`...req.body` spread directly into a DB write) | `grep` across all of `backend/src/modules` | Only **one** occurrence found (`supportBot.controller.ts:63`, `SupportIntent.create`) — on an ADMIN-only route, writing to a schema with no sensitive/permission fields (FAQ-bot content only). Confirmed low/no real risk. |

## Noted during testing, not a bug, informational only

- Updating a vendor's `onboardingStatus` via the admin API attempts to send a real email notification. In this isolated test environment (placeholder SMTP credentials), this failed safely and was logged, not thrown: `Invalid login: 535-5.7.8 Username and Password not accepted`. No real email was sent — expected and safe given this environment's deliberately-placeholder SMTP config.
- OTP flow is intentionally "dummy mode" (any 6-digit code accepted, no real SMS) per an explicit code comment. This is a documented product decision, not a bug — not something this assignment should "fix."
- Login/OTP rate limiting exists (`authRateLimiter`) but is configured for 1000 attempts/15min outside production, making the *actual* limit (10/15min) untestable without temporarily overriding `NODE_ENV`, which was not done (would require explicit authorization — flagged as a **Pending/Blocked item**, see that document).

## Not yet tested (see 06_PENDING_AND_BLOCKED.md)

- Admin SPA frontend-level checks (Phase F) — needs your manual testing
- User app / Driver app / Food-Partner app mobile session behavior (Phase F) — needs your manual testing or a connected device
- Full endpoint-by-endpoint sweep of all ~80 `authorizeRole`-protected routes (only a representative sample was runtime-tested; the rest were inventoried by code reading only — see `01_ROUTE_AND_AUTH_INVENTORY.md`)
- Request-body mass-assignment / role-escalation attempts (e.g. can a USER registration request smuggle `role: "ADMIN"` into the body and have it accepted?) — not yet tested, flagged as next batch
- Pagination/filter/bulk-operation authorization bypass checks (Phase D) — not yet started
