# API Test Inventory

Full source of truth: three test files, **run separately** (see note on why):
- `backend/src/modules/auth/iam-rbac-security.test.ts` — 17 tests, IAM/token/RBAC
- `backend/src/modules/auth/iam-rbac-idor.test.ts` — 7 tests, IDOR/BOLA/mass-assignment/role-escalation
- `backend/src/modules/auth/iam-rbac-admin-sweep.test.ts` — 153 tests, admin-dashboard/zones/analytics/meat/vendor endpoint sweep

Run each with: `node --require ts-node/register/transpile-only --test <file>`, test backend running.

## Verification-method legend (used below, per your instruction to distinguish these explicitly)
- **Live-tested**: a real HTTP request was fired and the response asserted in an automated test
- **Code-reviewed**: the implementation was read and traced, not exercised with a live request
- **Untested**: neither — genuinely unverified, not claimed to pass

| Test ID | Endpoint(s) | Scenario | Expected | Actual (latest run) | Status |
|---|---|---|---|---|---|
| IAM-T01 | `POST /auth/login-password`, `POST /vendors/login` | Valid login, every role | 200 + token | 200 + token | Pass |
| IAM-T02 | `POST /auth/login-password` | Wrong password vs. non-existent account | Identical generic 401 message | Identical | Pass |
| IAM-T03 | `GET /users/addresses` | No token | 401 | 401 | Pass |
| IAM-T04 | `GET /users/addresses` | Tampered token | 401 | 401 | Pass |
| IAM-T05 | `POST /auth/logout` then `GET /users/addresses` | Reuse logged-out token | 200 then 401 | 200 then 401 | Pass |
| IAM-T06 | `POST /auth/logout-all` then `GET /users/addresses` (×2 sessions) | Reuse after logout-all | both 401 | both 401 | Pass |
| IAM-T07 | `POST /users/change-password` then `GET /users/addresses` | Reuse old token after password change | 401 | 401 (was 200 before fix) | Pass |
| IAM-T08 | `PUT /admin/users/:id` (isBlocked) then `GET /users/addresses` | Blocked user's active session | 401 | 401 | Pass |
| IAM-T09 | `PUT /vendors/change-password` then `GET /vendors/me` | Reuse old vendor token after password change | 401 | 401 (was 200 before fix) | Pass |
| IAM-T10 | `PUT /vendors/:id` (onboardingStatus) then `GET /vendors/me` | Rejected vendor's active session | 401 | 401 (was 200 before fix) | Pass |
| RBAC-T01 | `GET /admin/users` | Driver/User/Support tokens on admin-only route | 403 ×3 | 403 ×3 | Pass |
| RBAC-T02 | `GET /admin/users` | Admin token | 200 | 200 | Pass |
| RBAC-T03 | `GET /admin/tickets`, `GET /admin/users`, `GET /admin/config` | Support token: shared-ok, admin-only-blocked | 200, 403, 403 | 200, 403, 403 | Pass |
| RBAC-T04 | `GET /drivers/profile` | User/Support/Admin tokens on driver-only route | 403 ×3 | 403 ×3 | Pass |
| RBAC-T05 | `GET /drivers/profile` | Driver token | 200 | 200 | Pass |
| RBAC-T06 | `GET /vendors/me` | Cross-vendor resource isolation | each vendor sees only own `_id` | confirmed | Pass |
| RBAC-T07 | `PUT /vendors/:id` | Vendor token on admin-only vendor-update route, targeting another vendor | 403 | 403 | Pass |

## IDOR / BOLA / mass-assignment / role-escalation batch

| Test ID | Endpoint(s) | Scenario | Expected | Actual | Status |
|---|---|---|---|---|---|
| IDOR-T01 | `POST /orders/:id/cash-collected` | A driver acting on an order assigned to a DIFFERENT driver | 404 (existence concealed) | 404 | Pass |
| IDOR-T02 | `POST /orders/:id/decline` | Any driver declining an order they were never offered | Documents actual behavior — see `RBAC-003` in `02_FINDINGS_REGISTER.md` | 200 (no ownership check) | **Finding, not auto-fixed — see register** |
| IDOR-T03 | `PATCH /orders/:id/status` | A different customer attempting to cancel someone else's order | 404 | 404 | Pass |
| IDOR-T04 | `PATCH /orders/:id/status` | The actual order owner cancelling their own order | 200 | **200 — confirmed**, verified against a separate isolated replica-set MongoDB instance after the original standalone test DB couldn't run the transaction | Pass |
| IDOR-T05 | `PATCH /users/addresses/:id` | A different user editing someone else's saved address by id | 404 (scoped lookup) | 404 | Pass |
| MASS-T01 | `PATCH /users/profile` | Injecting `role`/`isBlocked`/`tokenVersion` into the request body | Fields ignored, no privilege change | Ignored (explicit field allowlist in controller); re-verified via a separate admin lookup, not just the response echo | Pass |
| MASS-T02 | `POST /auth/verify-otp` | Self-registration attempting `role: "ADMIN"` | Rejected | Rejected | Pass |

## Why these two files run separately, not combined

Both suites create/log-in-as real accounts against the same isolated database. When invoked as two file arguments to `node --test` together, Node runs them as **concurrent worker processes** — and both files share test account `9000000001` (and its driver/vendor counterparts). `IAM-T07`/`T08` in the security suite briefly mutate that account's password/tokenVersion mid-test; running concurrently with the IDOR suite's calls to the same account produces real, reproducible race-condition failures. This is a **test-fixture isolation limitation in how these two files were written**, not applicable to the application itself — confirmed by each file passing 100% cleanly when run on its own, repeatedly.

## Admin-dashboard / zones / analytics / meat / vendor sweep (153 tests, all live-tested)

Every route below: fired with no token (expect 401), fired with a role **not** in "allowed roles" (expect 403), and fired with an allowed role (expect past-auth). Routes marked ✅CRUD additionally had a real resource created as admin, a non-admin write attempt rejected, and the admin write/delete confirmed to actually work, then cleaned up.

| Route | Methods | Allowed roles | Verification |
|---|---|---|---|
| `/admin/orders` | GET | ADMIN | Live-tested |
| `/admin/orders` | POST | ADMIN | Live-tested (write-denial only — not round-tripped, avoids creating noise orders) |
| `/admin/orders/:id` | PUT | ADMIN | Live-tested (write-denial only) |
| `/admin/orders/:orderId/chat`, `/admin/orders/:id` (GET) | GET | ADMIN | **Untested** — needs a real order id fixture, not yet set up |
| `/admin/drivers` | GET | ADMIN | Live-tested |
| `/admin/drivers/:id` | GET | ADMIN | **Untested** — needs a real driver id fixture |
| `/admin/drivers/:id` | PUT, DELETE | ADMIN | Live-tested (write-denial only) |
| `/admin/stats` | GET | ADMIN | Live-tested |
| `/admin/users` | GET, POST | ADMIN | Live-tested |
| `/admin/users/:id` | GET | ADMIN | **Untested** — needs a real user id fixture beyond what was used elsewhere |
| `/admin/users/:id` | PUT, DELETE | ADMIN | Live-tested (write-denial only) |
| `/admin/payments` | GET | ADMIN | Live-tested |
| `/admin/analytics` | GET | ADMIN | Live-tested |
| `/admin/multistop` | GET | ADMIN | Live-tested |
| `/admin/tickets` | GET, POST, PUT | ADMIN, SUPPORT | Live-tested, including confirming SUPPORT can create a ticket but not touch `/admin/users` |
| `/admin/support-members` | GET | ADMIN | Live-tested |
| `/admin/support-members` | POST | ADMIN | Live-tested (write-denial only — deliberately not round-tripped, creates a real staff login credential) |
| `/admin/support-members/:id/password`, `/admin/support-members/:id` | PUT, DELETE | ADMIN | Live-tested (write-denial only) |
| `/admin/support-intents` (+`/resolvers`) | GET, POST, PUT, DELETE | ADMIN | Live-tested ✅CRUD |
| `/admin/config` | GET | ADMIN | Live-tested |
| `/admin/config` | PUT | ADMIN | Live-tested (write-denial only — a global system-config write wasn't round-tripped) |
| `/admin/coupons` | GET, POST, PUT (toggle), DELETE | ADMIN | Live-tested ✅CRUD |
| `/admin/dev-drivers` (+`/seed`, `/:id`) | GET, POST, PUT, DELETE | ADMIN | GET live-tested; writes live-tested (write-denial only) |
| `/admin/banners` | GET, POST, PUT, DELETE | ADMIN | Live-tested ✅CRUD |
| `/admin/offers` | GET, POST, DELETE | ADMIN | Live-tested ✅CRUD (PUT not separately exercised, same controller pattern as POST) |
| `/admin/app-versions` | GET | ADMIN | Live-tested |
| `/admin/app-versions` | PUT | ADMIN | Live-tested (write-denial only) |
| `/analytics/live`, `/analytics/summary` | GET | ADMIN | Live-tested |
| `/zones`, `/zones/:id` | GET | any authenticated role | Live-tested — confirmed intentionally open to all roles (not sensitive data) |
| `/zones` | POST | ADMIN | Live-tested ✅CRUD |
| `/zones/:id` | PUT | ADMIN | **Untested** (DELETE was, PUT wasn't — same controller pattern) |
| `/zones/:id` | DELETE | ADMIN | Live-tested ✅CRUD |
| `/vendors` | POST | ADMIN | Live-tested (write-denial only) |
| `/vendors/:id` | DELETE | ADMIN | Live-tested (write-denial only — deliberately not round-tripped, would destroy the shared vendor fixture other tests depend on) |
| `/meat` | POST | ADMIN | Live-tested (write-denial only) |
| `/meat/:id` | PUT, DELETE | ADMIN | **Untested** — needs a real meat-centre id fixture beyond the create-denial check |
| `/meat/global-prices` | PUT | ADMIN | Live-tested (write-denial only) |

## Final batch — all remaining gaps closed (31 tests, `iam-rbac-final-gaps.test.ts`, 31/31 pass)

| Route | Methods | Verification |
|---|---|---|
| `/admin/orders/:id` | GET | Live-tested with a real fixture order — admin gets the correct record, non-admin gets 403 |
| `/admin/orders/:orderId/chat` | GET | Live-tested — admin passes auth, non-admin 403 |
| `/admin/drivers/:id` | GET | Live-tested with a real fixture driver — non-admin 403, admin passes auth |
| `/admin/users/:id` | GET | Live-tested with a real fixture user — admin gets the correct record, non-admin 403 |
| `/meat/:id` | PUT, DELETE | Live-tested ✅CRUD — created a real meat-centre as admin, non-admin update/delete denied, admin delete confirmed working, cleaned up |
| `/zones/:id` | PUT | Live-tested ✅CRUD — non-admin update denied, admin update confirmed working, cleaned up |
| `/onboarding` (+6 sub-routes: verify-aadhaar, verify-pan, complete, digilocker/auth-url, verify-digilocker) | GET, PATCH, POST | Live-tested — all 7 endpoints × (no-token 401, USER-denied 403, DRIVER passes auth) = 21 cases |
| `/admin/verifications/drivers`, `/admin/verifications/vendors` | GET | Live-tested — admin-only confirmed, both directions |
| `/admin/verifications/drivers/:id/approve`, `/reject`, `/request-documents` | POST | Live-tested — non-admin denial confirmed |
| `/admin/verifications/vendors/:id/approve`, `/reject`, `/request-documents` | POST | Live-tested — non-admin denial confirmed |

**Two test-script bugs caught and fixed while building this batch** (not app bugs): a leftover fixture from an earlier interrupted run caused a false "duplicate" error (fixed with idempotent pre-test cleanup), and a wrong assumed response-field path for the meat-centre create endpoint (actual shape is `{meatCenter: {...}, menuItemsCreated}`, fixed by reading the controller).

## Now genuinely fully covered — nothing left untested from the original gap list

The only items never individually re-verified in isolation: pagination/filtering/bulk-operation-specific edge cases beyond what's inherent in the endpoints above (e.g. a crafted filter parameter reaching across a boundary) — not probed as a distinct category in this assignment.

## Breadth note (honest limitation)

This is 17 tests covering the **highest-risk, highest-value** paths: the full token lifecycle, both confirmed bugs, and a representative cross-section of role boundaries (admin-only, support-shared, driver-only, vendor resource isolation). It is **not** every one of the ~80 `authorizeRole`-protected endpoints inventoried in `01_ROUTE_AND_AUTH_INVENTORY.md` — those were mapped by reading the code, not individually runtime-tested. See `06_PENDING_AND_BLOCKED.md` for exactly what's left.
