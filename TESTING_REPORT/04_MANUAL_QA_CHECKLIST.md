# Manual QA Checklist — IAM / RBAC / Token / API Assignment

**Status note (2026-10-27):** 18 of the original 19 checklist items passed and have been removed from this file to keep it focused on what's actually left — see "Already completed" below for the one-line record. Only genuinely pending items have full write-ups now.

## Already completed, no action needed (passed 2026-10-26)

- QA-01 (Admin sees everything) — PASS
- QA-02 (Support role restrictions) — PASS
- QA-03 (Vendor isolation, UI level) — PASS
- QA-04 (Account blocking via Admin UI kills session) — PASS
- Customer (User) app — login, logout/force-close/reopen, block-user session-kill — all PASS
- QA-07 / Driver app — sign out, force-close, reopen after sign-out, block-driver session-kill — all PASS
- Driver app — production token/logout mechanics (token works, logout works, old token rejected, no-token rejected) — all PASS, verified directly against production
- QA-08 (confirm `IAM-001` fix directly via API) — PASS
- QA-09 (confirm RBAC boundary directly via API) — PASS
- QA-10 (regression recheck — QA-04 and QA-08 repeated, 2026-10-27) — **PASS**, including cleanup (unblock confirmed via successful re-login; password reset back to baseline confirmed)
- **QA-05a (Food-Partner app — vendor password change kills session, 2026-10-29) — PASS.** Logged in as test vendor, orders screen loaded with no auth error, changed password in-app, app itself showed "Password changed... signed out for security," landed on a "Session expired — please sign in again" prompt back at the sign-in screen. Cleanup done: password restored to `TestVendor#2026`, re-login confirmed working.
- **QA-05b (Food-Partner app — admin changing vendor status kills session, 2026-10-29) — PASS.** Vendor logged in, Orders screen loaded fine. In Admin SPA, changed vendor status Approved → Rejected ("Vendor updated successfully"). Back in the still-open Food-Partner app: "Session expired — Please sign in again to continue," returned to sign-in screen. **Cleanup complete:** status restored to Approved (confirmed in Admin SPA), vendor re-login verified successful.

Full original detail for these is preserved in git history of this file if ever needed again.

---

## Test accounts still needed for what's below (isolated test database only)

| Role | Phone | Password | Needed for |
|---|---|---|---|
| Admin | `9999999999` | `admin123` | QA-05b, QA-10 |
| User (customer) | `9000000001` | `TestUser#2026` | QA-10 |
| Vendor (restaurant) | `9000000005` | `TestVendor#2026` | QA-05a, QA-05b |
| MeatCenter | *(none exist — 0 documents in the isolated test DB)* | — | QA-05c — accepted known gap, not pursued |

**Services needed:** test backend running at `http://localhost:3000`; Admin SPA at `http://localhost:8080` run from `C:\Users\91901\adios-iam-rbac-test\admin` pointed at the test backend (`VITE_API_URL=http://localhost:3000/api/v1` in that folder's `.env`) — needed for QA-05b. Food-Partner app pointed at the test backend (`EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1`) — needed for QA-05a/b/c.

---

## IAM-002 live verification — final status

**Both must-do checks (QA-05a, QA-05b) are PASS with cleanup confirmed complete — see "Already completed" above.** IAM-002 is fixed for both account types at the code level, and fully verified live for the Vendor account type.

**QA-05c (MeatCenter account type) — accepted known gap, not attempted. Decision made 2026-10-29.**
- Fixed in code (same `tokenVersion` mechanism as Vendor), but unverified, live or automated.
- The password-change trigger is technically testable (`/meat/login`, `/meat/change-password` both exist), but zero MeatCenter accounts currently exist in the isolated test database — would need a new account seeded first.
- The admin-status-change trigger is **not testable at all through the real app/admin flow as the codebase currently stands** — confirmed by reading the code: `PUT /vendors/:id` (the admin update endpoint) only operates on the `Vendor` model (`Vendor.findById`, 404s otherwise); there is no equivalent admin route anywhere that updates a `MeatCenter`'s status. Testing it would require either adding new admin functionality (out of scope for a testing assignment) or a raw database edit that bypasses the real admin flow entirely (not an equivalent test).
- **Conclusion:** MeatCenter is a legacy, lower-traffic account type. Documented here as a known, code-verified gap rather than a failure or an oversight — not a "ran out of time" skip.

---

**Note on QA-10:** done as of 2026-10-27 (see "Already completed" above) — but that run reflects the branch *before* any RBAC-003 fix. If a code change for RBAC-003 lands later, repeat QA-04 and QA-08 one more time after it, same steps as before, to confirm that change didn't regress anything.

---

## What I have already executed automatically (no need to repeat yourself)

- `IAM-T01` through `IAM-T10`, `RBAC-T01` through `RBAC-T07` — see `02_FINDINGS_REGISTER.md`, all 17/17 passing after the fix
- Full project regression suite (43 existing tests) — still passing
- Typecheck and lint on all changed files — clean

## What's still not covered by either of us yet

See `06_PENDING_AND_BLOCKED.md`.
