# Phase A — Route & Authorization Implementation Inventory

Built from direct code inspection (not yet runtime-verified unless marked). See `02_FINDINGS_REGISTER.md` for confirmed bugs.

## 1. Identity types in this system

| Identity | Model | Role claim in JWT | In `UserRole` enum? | Self-registerable? |
|---|---|---|---|---|
| Customer | `User` (role=USER) | `USER` | Yes | Yes, via OTP |
| Driver | `User` (role=DRIVER) | `DRIVER` | Yes | Yes, via OTP |
| Admin | `User` (role=ADMIN) | `ADMIN` | Yes | No — only the one seeded `ADMIN_PHONE` account can mint an admin token, even if other rows carry role=ADMIN (`auth.service.ts:162`) |
| Support | `User` (role=SUPPORT) | `SUPPORT` | Yes | No — created only via Admin → support-members endpoints |
| Restaurant Vendor | `Vendor` | `restaurant_vendor` | **No** | No — created via onboarding/admin |
| Meat-centre Vendor | `Vendor` (partnerType=meat) or `MeatCenter` | `meat_vendor` | **No** | No |

**Implication (structural, verified by code):** the entire `tokenVersion`/`isBlocked` re-check in `auth.middleware.ts:58` is gated by `Object.values(UserRole).includes(payload.role)`. Vendor/meat tokens never satisfy this, so **that whole check is skipped for every vendor/meat request, unconditionally.** See Finding `IAM-002`.

## 2. Auth flows — implementation status

| Flow | Endpoint | Status | Notes |
|---|---|---|---|
| OTP request | `POST /auth/request-otp` | Implemented and verified (by inspection) | **Dummy mode** — no real SMS sent, this is intentional per the code comment, not a gap to fix |
| OTP verify / self sign-up | `POST /auth/verify-otp` | Implemented and verified (by inspection) | Accepts **any 6-digit code** (dummy mode, intentional). Correctly rejects ADMIN/SUPPORT role requests (`isSelfSignupRole`), checked at both schema and service layer. Correctly refuses a blocked account a new session. |
| Password login | `POST /auth/login-password` | Implemented and verified (by inspection) | Generic error message + dummy-hash timing defense against user enumeration — already correct, no fix needed. Blocked-account check happens only after password match (correct — doesn't leak account existence). |
| Logout (single token) | `POST /auth/logout` | Implemented and verified (by inspection) | Deliberately not gated by `authenticateToken` — decodes by hand, treats any already-broken token as "already logged out." Revokes by `jti` into `RevokedToken` (TTL-indexed, self-expiring). Works for User-role tokens; **untested whether vendor tokens reach this same route from the Food-Partner app** — flagged for runtime verification. |
| Logout-all (User only) | `POST /auth/logout-all` | Implemented, **not wired to password change** | Bumps `User.tokenVersion`. No equivalent exists for Vendor/MeatCenter at all. |
| Password change (User) | `PUT /users/change-password` (users.controller.ts:221) | **Confirmed bug** | Does not bump `tokenVersion` — see `IAM-001`. |
| Password change (Vendor) | `vendors.controller.ts:795 changeVendorPassword` | **Confirmed bug (structural)** | No `tokenVersion` mechanism exists for Vendor at all — see `IAM-002`. |
| Account blocking (User) | admin → users update sets `isBlocked` | Implemented and verified (by inspection) | `auth.middleware.ts` re-checks `isBlocked` on **every** request for User-role tokens — correctly kills active sessions, not just future logins. |
| Account blocking/suspension (Vendor) | `getVendorAccessBlock` (`vendor-verification.service.ts:176`) | **Confirmed bug (structural)** | Only checked at **login time**. Never re-checked per-request. An already-issued vendor token keeps working for its full 30-day life even after the vendor is suspended/disabled. Same root cause as `IAM-002`. |
| Refresh tokens | — | **Not applicable** | No refresh-token mechanism exists in this codebase. Sessions are a single 30-day JWT; "session renewal" is just the client staying logged in until that JWT's `exp`. Not a gap — just not how this system is designed. |
| OTP rate limiting | `authRateLimiter` on `/request-otp`, `/verify-otp` | Implemented, **effectively untestable in dev** | 10 attempts/15min in production, 1000/15min in dev — by design, can't realistically trigger the real limit locally without temporarily overriding `NODE_ENV`. |
| Login rate limiting | `authRateLimiter` on `/login-password`, vendor `/login`, meat `/login` | Same as above | Present, same dev/prod gap. |

## 3. RBAC — role-protected endpoint inventory (backend `authorizeRole` usage)

Full grep of every `authorizeRole([...])` call across `backend/src/modules/`. Representative sample selected for automated testing (not literally all ~80 — see `03_API_TEST_INVENTORY.md` for exactly which were executed).

| Module | Roles required | Endpoint count (approx) |
|---|---|---|
| `admin` | `ADMIN` (most), `ADMIN`+`SUPPORT` (tickets, support-intents) | ~45 |
| `analytics` | `ADMIN` | 2 |
| `zones` | `ADMIN` | 3 |
| `payments` (admin money routes) | `ADMIN` | several |
| `meat` (center CRUD, global prices) | `ADMIN` | 4 |
| `onboarding` | `DRIVER` | 7 |
| `verification` | `ADMIN` (router-level `.use()`) | all routes in module |
| `support` | `ADMIN`+`SUPPORT` (router-level) | all routes in module |
| `food` (restaurant-menu admin ops) | `ADMIN` | 5 |
| `orders` | `ADMIN` (scheduled, schedule-decision), `DRIVER` (driver-scoped actions) | mixed |
| `drivers` | `DRIVER` | 9 |
| `vendors` (admin CRUD) | `ADMIN` | 3 |

**Resource-ownership (not just role) checks** — these are the ones most likely to hide IDOR bugs, since `authorizeRole` alone only proves "this role is allowed to call this route," not "this specific user owns this specific resource." Flagged for targeted testing:
- Driver endpoints reading `req.user.userId` to scope data (e.g. `/drivers/profile`, `/drivers/earnings`) — need to verify they use the **authenticated** user's ID, not a client-supplied one.
- Vendor endpoints (orders, menu, payouts) — need to verify a vendor's token can only ever reach **that vendor's own** `Vendor._id`, never another vendor's, via any route parameter.

## 4. Frontend/mobile token handling (for Phase F, not yet executed)

| App | Token storage | Notes |
|---|---|---|
| Admin SPA | `localStorage`: `admin_token`, `support_token`, `vendor_token` — three separate keys | Per `RootRedirect` in `admin/src/App.tsx`. Worth checking whether logging in as one role actually clears/replaces the others, or leaves stale tokens sitting in storage. |
| User app / Driver app | Not yet inspected — deferred to Phase F | |
| Food-Partner app | Not yet inspected — deferred to Phase F | |

## 5. Classification summary (per assignment's required categories)

| Feature | Classification |
|---|---|
| Password hashing | Implemented and verified |
| Login timing/enumeration defense | Implemented and verified |
| Admin account restriction to seeded phone | Implemented and verified |
| OTP role restriction (no admin/support self-signup) | Implemented and verified |
| User account blocking mid-session | Implemented and verified |
| User logout (single token) | Implemented and verified (by inspection — runtime check pending) |
| User logout-all | Implemented and verified (by inspection — runtime check pending) |
| User password-change session invalidation | **Missing** — confirmed bug candidate `IAM-001` |
| Vendor/meat-centre session revocation (any form) | **Missing entirely** — confirmed bug candidate `IAM-002` |
| Refresh tokens | Not applicable (not part of this system's design) |
| Real OTP delivery/verification | Not applicable — intentionally dummy mode, out of scope to "fix" (business decision, not a bug) |
| RBAC role-gating on endpoints | Implemented — breadth not yet fully runtime-tested, see `03_API_TEST_INVENTORY.md` |
| Resource-ownership checks (IDOR) | Requires targeted verification — not yet tested |
