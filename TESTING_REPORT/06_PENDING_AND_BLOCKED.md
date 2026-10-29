# Pending and Blocked Items

## Status as of latest update

Draft PR opened: **[#46 — Fix session invalidation on password/status change (IAM-001, IAM-002) + security test suite [DRAFT]](https://github.com/Hosanna-Mosa/Adios/pull/46)**, `iam-rbac-token-api-testing` → `dev`, head commit `8107198`. The PR body's own "before this can be merged" checklist matches this file's open items below — treat the two lists as the same list.

**Confirmed (2026-10-27):** `npm run test:iam-rbac` run live against the isolated backend — real TAP output, 212 tests, 212 pass, 0 fail (17+7+153+31+4, pagination/bulk tests included and passing). `npm test` — 43 pass, 0 fail, no regressions. The PR's "212/212" claim is now genuinely verified, not just stated.

**Confirmed (2026-10-29):** All manual QA done. QA-05a and QA-05b (IAM-002 live verification on the real Food-Partner app, both triggers — password change and admin status change) both PASS, cleanup confirmed. QA-10 (regression recheck) PASS. QA-05c (MeatCenter account type) marked as an accepted known gap, not a failure — see `04_MANUAL_QA_CHECKLIST.md` for the full reasoning (no MeatCenter test accounts exist, and the admin-status-change trigger has no testable code path for that account type at all, confirmed by reading `vendors.controller.ts`'s `updateVendor`).

**Confirmed (2026-10-29):** RBAC-003 fix implemented, per lead's explicit "Fix now" decision. 5 new dedicated regression tests (`rbac-003.decline-authorization.test.ts`) — 5/5 pass. Full IAM/RBAC suite now 217/217 pass (was 212, +5 new). Existing suite 43/43 pass. `tsc --noEmit` clean. Lint: same 22 pre-existing errors, 0 new. Full detail in `02_FINDINGS_REGISTER.md`. **Still awaiting dispatch-owner review before merge — not fully closed.**

**Confirmed (2026-10-29):** RBAC-004 (the `handleDriverAccept` follow-up found during RBAC-003's investigation) fix also implemented, per explicit "fix now" decision. 3 new dedicated regression tests (`handle-driver-accept-authorization.test.ts`) — 3/3 pass. A separate one-off end-to-end verification against the throwaway replica-set MongoDB (same environment used for `IDOR-T04`) — 9/9 checks pass, confirming the full transactional `acceptOrder` flow actually rejects an unauthorized accept and that the new atomic claim prevents a double-acceptance race. Full IAM/RBAC suite now 220/220 pass (was 217, +3 new). Existing suite 43/43 pass. `tsc --noEmit` clean. Lint unchanged. Full detail in `02_FINDINGS_REGISTER.md`. **Also awaiting dispatch-owner review — not fully closed.**

## Blocked, waiting on you

| Item | Why blocked | What's needed |
|---|---|---|
| Killing an orphaned test-backend process (PID conflicts during nodemon restart churn) | Auto-mode safety classifier refuses process-kill commands from me, twice, on two different tools | You ran `taskkill` yourself once already — may recur if nodemon restarts rapidly again during further code edits. If the backend seems unresponsive, check `Get-NetTCPConnection -LocalPort 3000` and kill stale PIDs yourself |

## Resolved this batch

**Owning-customer order-cancel transactional path** — originally blocked (standalone MongoDB, no replica set). Resolved without touching your shared server: stood up a completely separate, throwaway `mongod` instance (own port, own data directory, single-node replica set) and verified it there. Now confirmed passing — see `02_FINDINGS_REGISTER.md`. The throwaway instance and its backend process (port 3001) can be torn down whenever convenient; they don't interact with anything else.

## RBAC-003 — fixed and tested, awaiting dispatch-owner review (not yet closed)

Lead decision received: **"Fix now — implement the proposed fix, you or someone who owns dispatch reviews it before merge."** Implemented accordingly (2026-10-29):

- `orders.service.ts`'s `declineOrder` now checks, before recording anything, whether the driver was actually offered the order (via two new read-only helpers — one per dispatch mode)
- `dispatch.manager.ts`'s `handleDriverDecline` now rejects a decline from any driver who isn't the current candidate, instead of silently advancing the queue
- 5 new dedicated regression tests added and passing (`RBAC-003-T01` through `T05`) — see `02_FINDINGS_REGISTER.md` for full detail, including confirmation that dispatch timeouts, retries, and legitimate declines (both sequential and broadcast/food) are unaffected

**This is NOT fully closed.** Per the lead's own instruction, it needs sign-off from whoever owns dispatch before merge. **Dispatch-owner review has not happened yet** — nobody has reviewed this diff besides the implementation and self-testing done here. See `02_FINDINGS_REGISTER.md`'s "Review readiness" row for exactly what a reviewer needs to check.

## RBAC-004 — fixed and tested, awaiting dispatch-owner review (not yet closed)

The `handleDriverAccept` issue found while investigating RBAC-003 — higher severity than RBAC-003 itself (actual order-assignment bypass, not just analytics pollution, plus an independent concurrency race). Explicit "fix now" decision received; implemented (2026-10-29):

- `dispatch.manager.ts`'s `handleDriverAccept` now actually returns `false` on a candidate mismatch, instead of only warning
- `orders.service.ts`'s `acceptOrder` now checks that return value and rejects before any write, and the assignment itself is now an atomic conditional update instead of a plain save — closing both the authorization gap and a silent-overwrite race in one change
- `orders.controller.ts` maps the new rejection to a proper `403`, not a generic 500
- 3 new dedicated tests (`ACCEPT-T01`–`T03`) plus a separate 9-check end-to-end verification against the replica-set environment — see `02_FINDINGS_REGISTER.md` for full detail

**This is NOT fully closed either.** Same gate as RBAC-003 — dispatch-owner review required before merge, not yet obtained.

## Explicitly not attempted (would need your authorization first)

| Item | Why |
|---|---|
| Testing the *real* login/OTP rate limit (10 attempts/15min) | Only reachable with `NODE_ENV=production` set, which is a config change beyond "testing" scope — didn't do this without asking first |
| Full endpoint-by-endpoint sweep of all ~80 role-protected routes | Large scope; the tests already run cover the structurally important cases (every distinct role-boundary pattern, both confirmed bugs). Expanding to literally every endpoint is possible as a next batch if you want it — tell me and I'll continue |

## Deliberately out of scope (not bugs, not gaps — product/business decisions)

- Real OTP delivery (currently dummy mode, any 6-digit code works) — intentional per an explicit code comment, not something to "fix" without a product decision to actually integrate SMS
- Refresh tokens — this system doesn't have them by design (single 30-day JWT), not a gap to fill in
- Vendor onboarding-status state machine rules (what counts as a legitimate status transition) — out of scope, this assignment covers whether sessions are correctly killed on a status change, not whether the status change itself is business-correct

## Resolved — all remaining gaps from the 3rd batch are now closed (4th batch)

GET-by-id endpoints, meat-centre/zone update-delete cycles, all 7 onboarding routes, and the full verification module are now live-tested — 31/31 passing, no new bugs found. See `05_API_TEST_INVENTORY.md`.

## Resolved — pagination/filter/bulk-operation coverage added (5th batch)

Written, committed, and now execution-confirmed: `iam-rbac-pagination-bulk.test.ts` (4 tests — `BULK-T01/02`, `PAGE-T01/02`), confirming a vendor can't bulk-add food items to another vendor's menu via a spoofed `vendorId`, and can't read another vendor's order history via query-filter params. Live run on 2026-10-27, all 4 passing as part of the full 212/212.

## Not yet tested, no blocker — next batch if you want to continue

- Remaining Phase D items: malformed/boundary request bodies, mass-assignment / role-escalation attempts specifically on registration endpoints, idempotency checks on sensitive operations
- Phase F (frontend/mobile code-level inspection, as opposed to manual click-through) — Admin SPA token-storage behavior, User/Driver/Food-Partner app session code
- Expanding the RBAC sweep beyond the current representative sample to the remaining ~70 endpoints in `01_ROUTE_AND_AUTH_INVENTORY.md`

None of the above block you from using this report today — the two highest-severity findings (session invalidation on password change / account status change, for both User and Vendor identity types) are confirmed fixed and verified. This is the honest state of what's covered vs. not, not a claim of total completeness.

## Housekeeping (not blocking, just outstanding)

- **Orphaned port-3001 process (PID 11408 as of 2026-10-29)** — a `TaskStop` on the background task that started it reported success, but the underlying `node`/`ts-node` process survived and kept holding port 3001 (same orphaned-process pattern documented earlier in this assignment). It's currently serving the correct, up-to-date code and isn't causing any problem, but can't be killed from this session (same auto-mode restriction as before) — kill it yourself with `taskkill /F /PID 11408` (confirm the PID first, it may have changed) whenever convenient.
- Tear down the throwaway port-3001 backend and port-27118 `mongod` once this assignment is done
- Delete the untracked `mongo-replset-data/` directory (never commit it — binary replica-set data)
- ~~`TESTING_REPORT/` is currently untracked~~ — resolved: committed and pushed to PR #46 (commit `cfbc73a`)
