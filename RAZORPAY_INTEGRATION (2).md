# Razorpay Payments: Secure Implementation Plan

This is a **plan only**. It is the implementation specification for customer payments (Razorpay), refunds, cash handling, refusal and goods return, earnings ledger and payouts (RazorpayX). It says what to build, the exact states and transitions, and which security rules each part must follow. It doesn't prescribe code changes.

**Decision defaults.** Every product decision (D1 to D9, §15) has an explicit *implementation default* in this document. Each is labelled **"Implementation default — requires product-owner confirmation before production."** All numeric defaults live in versioned server settings (§15.2), so confirming or changing one needs no code change and no other section changes.

---

## 1. Scope and payment model

**Every service is "pay later".** The customer books or orders first, the service happens, and the customer pays at the end, either in **cash** or **online through Razorpay**.

| Service | Amount is locked | Payable from (the single rule, §6.2) | Enforcement point |
|---|---|---|---|
| **Food** (restaurants) | When the order is placed. It only goes down if an item is unavailable (§6.1). | The driver picks the order up (`pickedUpAt`) | "Delivered" is blocked until the order is paid and the delivery OTP is confirmed |
| **Meat** (meat centers) | Same as food | Same as food | Same as food |
| **₹149 Store** | Same as food | Same as food | Same as food |
| **Package delivery** | At booking (route and pricing) | `at_pickup`: the driver arrives at pickup. `at_drop`: the driver picks the package up. | `at_pickup`: pickup handover is blocked until paid. `at_drop`: delivery is blocked until paid. |
| **Rides** (bike, auto, cab, cab prime) | At trip end: metered distance, time, waiting, surge, plus any accepted price supplement (§6.10) | Trip end (`tripEndedAt`) | None. The service is already delivered (accepted risk, §6.11). |
| **Task helper** | At task end: agreed offer plus approved extra hours | Task end (`tripEndedAt`) | None (accepted risk, §6.11) |

Also in scope:

- **Tips and cancellation fees**, which are separate online payments with their own rules (§6.4)
- **Refused deliveries, the goods afterwards, and the incident, goods-return and dispute state machines** (§6.9)
- **Refunds** for online payments (Razorpay) and for cash-paid orders (recorded manual refunds, never sent through Razorpay) (§6.13)
- **Earnings ledger**: driver and vendor earnings, holds, cash owed, reversals and liabilities (§6.16)
- **Driver and vendor payouts**: through RazorpayX (when enabled), or recorded manual payouts (§11)
- **Admin panel** views and actions for payments, refunds, disputes, incidents, goods returns, approvals, ledger and payouts (§10)

**Out of scope, stated explicitly:**

- The public partner website in `frontend/` (vendor sign-up and menu preview). It has no payment UI, so it needs no payment or payment-i18n work in this plan.
- Receiver online payment (D1). It does not exist anywhere in this plan.
- Customer refunds or payouts sent through RazorpayX. Refunds go through Razorpay (online payments) or are recorded manual refunds (cash payments). Payouts go only to drivers and vendors.

**What "pay later" means in this app:**

- No money is taken when the customer places an order or books a ride.
- For **goods** (food, meat, store) the driver doesn't hand over until the order is paid (online, or cash marked collected) and the delivery OTP is confirmed. For **packages** the enforcement point is set by `paymentTiming` (table above), and the delivery OTP is always required at drop.
- For **rides and helpers**, the service is already delivered when the customer pays. Unpaid trips are handled by the controls and the explicitly accepted risk in §6.11.

**Who pays, and the payer of record (D1).** The **booking customer** is the payer of record for every order, tip and fee. Only the booking customer can pay online, from their own logged-in app. A package **receiver** can hand **cash** to the driver, which is recorded as cash collected *on behalf of the booking customer's order* (§6.8). The receiver has no login, no payment session, no payment link and no payment OTP. The receiver may get a 4-digit **handover code** (§6.8), which is not a payment or login code. **Implementation default — requires product-owner confirmation before production.**

**Two separate money systems.** *Razorpay* takes money **from customers** (orders, tips, cancellation fees) and refunds it. *RazorpayX* sends money **to drivers and vendors**. They use separate config, separate clients, separate webhook endpoints, secrets, deduplication stores and queues, and separate code paths (§5, §11). Nothing in a customer payment flow can trigger a payout, and nothing in a payout flow can create, settle or refund a customer payment.

---

## 2. Security principles

These rules apply to every service. If a design decision conflicts with one of them, the rule wins.

1. **The server decides every price.** The app sends *what* is being bought: items and quantities, meat weights, vendor, coupon, stops, ride tier, helper hours. It never sends a total that the server trusts. The only amounts a customer can choose are a helper offer, a ride price supplement (§6.10) and a tip (§6.4). The server bounds each one, and the final amount is always calculated and locked by the server.
2. **The amount to pay is locked and versioned on the server.** Every lock or change increments an **amount version** on the Order. After locking, nobody (customer, driver or vendor) can change it from an app.
3. **A payment is valid only for the exact amount and version it was created for.** If the locked amount changes, every open payment for the old amount is voided and can never settle the order (§6.1, §6.7).
4. **Never trust the client's word that a payment succeeded.** The backend fetches every payment from Razorpay and checks signature, status, amount, currency and order id.
5. **Secrets stay on the server.** Key secrets, both webhook secrets and the RazorpayX account number never go into the mobile apps, the admin SPA, the partner site, logs or git. The customer app only ever receives the public `key_id`.
6. **Exactly one settlement per target, recorded durably.** Online settlement, cash collection, method switching, cancelling and writing off are single conditional updates on the same Order document. The settling update also records **which Payment and PaymentAttempt settled the target** (`paidPaymentId`, `paidAttemptId`), so any retry can tell "my own earlier success" from "someone else's payment" (§6.5). Any money that loses is refunded automatically (§6.7, §6.13).
7. **Every step is idempotent, and every timeout is safe.** Retries, double taps, duplicate webhooks and unknown API outcomes can't settle a target, charge a customer, or create a refund or payout twice. Money-changing requests carry an `Idempotency-Key` (§6.17), and outcomes of external calls that time out are resolved by lookup, never by guessing (§6.13, §11).
8. **Webhooks are the source of truth, and the payload is a hint.** The app's "payment done" call is only the fast path. Razorpay's webhook, and a fetch from Razorpay, settle every payment. State is always taken from a fetched entity, never trusted from the event alone.
9. **No handover without payment and proof of handover.** For goods, "Delivered" needs the order paid (`paid` or `partially_refunded`) and the delivery OTP confirmed. A "customer refused" claim starts an incident with server-verified evidence checks, and the goods must be returned and confirmed (§6.9).
10. **The delivery OTP is a handover code only.** It has no payment, login or account capability (§6.8).
11. **The payment method can't be abused.** Switching between cash and online is logged, needs the customer's confirmation, and is locked once money is in motion (a payment `processing`, an attempt `authorized` or `captured`) or the order is paid (§6.7.12).
12. **Customer payments and payouts stay separate.** Razorpay (money in) and RazorpayX (money out) never share a webhook, a secret, a client object, a queue or a code path (§5, §11).
13. **No test shortcuts in production.** Any mock or bypass must be switched on explicitly by a flag and must be impossible to enable in the production environment.
14. **Every money event leaves an audit trail.** Every payment attempt, refund, cash collection, dispute, approval, ledger entry and payout is recorded with who, what, when and the external ids, in an append-only AuditLog (§6.15).
15. **Least privilege and isolation.** Customers, drivers and vendors see and act only on their own records. Support can initiate but never approve money actions. A different admin approves (§6.13). Cross-account access returns "not found" (§6.17).
16. **Sensitive data is minimised.** No card data is stored. No OTP or OTP hash is stored. GPS, call logs and photos have retention limits and role-restricted, audited access (§6.19).
17. **Cash is controlled.** Cash collected is recorded server-side, creates a driver liability in the ledger, is capped per driver, is notified to the customer, and is reconciled against remittances (§6.16, §6.19).

---

## 3. The payment flow

One flow covers every order payment. The only differences between services are **when the amount is locked** and **when the order becomes payable** (§6.2). Tips and cancellation fees follow the same verify and webhook steps with their own create endpoints (§6.4).

```
 CUSTOMER APP                  BACKEND                                   DRIVER / HELPER APP
 ────────────                  ───────                                   ───────────────────
 1. Place order / book
    (items, weights, stops,
    tier, hours; NO amount)
    choose Cash or Online ───▶ 2. Authenticate, validate input
                                  Calculate the price from the database
                                  Goods/package: LOCK the amount (version 1)
                                  Rides/helper: save the estimate only
                                  Save the Order:
                                    paymentMethod = cash | online
                                    paymentStatus = pending
    ◀──── order confirmed (no money taken)
                                                                          3. Service happens
                               4. The order becomes PAYABLE when the server sets payableFromAt:
                                  goods / package at_drop : driver "Picked up"
                                  package at_pickup       : driver "Arrived" at pickup
                                  rides / helper          : "Complete trip" (final amount LOCKED here)

 ─── If ONLINE ───────────────────────────────────────────────────────────────────────────────
 5. App shows "Pay ₹X" ─────▶ 6. Create a Payment + Razorpay order for the
    (sends only order id)         LOCKED amount and version
    ◀──── order_id, key_id, amount
 7. Razorpay checkout opens ──────────────────────────▶ RAZORPAY: customer pays (UPI/card/…)
    (may make several attempts)
    ◀──────────────────────────── payment_id, order_id, signature
 8. Send the three values ───▶ 9. Verify signature, fetch the attempt from Razorpay, check amount
                                   and version, then ONE conditional update marks the Order paid
                                   AND records paidPaymentId / paidAttemptId (exactly once)
                                   Tell the driver app "Paid" by socket ─▶ 10. Driver sees "Paid"
                                                                              Goods: get the delivery OTP,
                                                                              hand over, tap Delivered
                               11. Webhook from Razorpay confirms the same payment (safety net)

 ─── If CASH ─────────────────────────────────────────────────────────────────────────────────
                                                                          5. Driver collects cash
                                                                             Taps "Cash collected"
                               6. ONE conditional update marks the Order paid (cash).
                                  Cash liability + earnings are written to the ledger.
                                                                          7. Goods: get the delivery OTP,
                                                                             hand over, tap Delivered
```

If the locked amount changes while a payment is open, the open payment is voided and the customer pays again for the new amount (§6.1). One Razorpay checkout can involve several payment attempts (for example a card that fails and then a UPI payment that works). They all belong to the same Payment record (§6.7).

---

## 4. Threats and how the plan blocks them

**Pricing and amounts**

| # | Threat | Control |
|---|---|---|
| T1 | App sends its own price (edited total, fake meat weight, ₹1 helper offer, custom ride fare) | The server calculates every price (§6.1). App amounts are only a preview. |
| T2 | The amount is changed after it's locked (a vendor raising a menu price, a driver inflating a fare) | The amount is locked on the Order, computed from a price snapshot, and versioned. Payment is always created from the locked amount. No app can edit it. |
| T3 | Driver inflates the final ride or helper fare | The final fare is calculated from GPS and timestamps on the server. Helper extra hours need the customer's approval. The customer can dispute the fare (§6.10). |
| T4 | Someone raises or lowers another customer's price, or lowers their own after a driver accepts | The price supplement and helper offer changes are limited to the order owner, only upwards, only before acceptance, capped, and logged (§6.10) |
| T5 | Coupon or discount abuse | Coupons are validated and applied on the server when the order is placed |
| T6 | The amount goes down after a Razorpay order exists, and the old payment settles the new amount (or the customer is charged the old amount) | Amount versioning. Every Payment stores the amount and version. A change voids open Payments, and a Payment whose amount or version doesn't match the Order can never settle it. Money captured on it is refunded (§6.1, §6.5). |

**Payment verification and settlement**

| # | Threat | Control |
|---|---|---|
| T7 | User sends a fake "payment successful" response | HMAC-SHA256 signature check plus a direct fetch from Razorpay |
| T8 | User replays a real payment from an earlier order | Each Payment is bound to one user, one order and one purpose. Each Razorpay payment id is one PaymentAttempt. A target records the single attempt that settled it. |
| T9 | User pays with someone else's Razorpay order id | The Payment stores `userId`. Verification rejects a mismatch. |
| T10 | Double tap or retry settles twice | One open Payment per order and purpose (unique index), a leased lock, a unique index on Razorpay ids, and a single conditional update that also records the settling attempt |
| T11 | Customer is charged twice (two Razorpay orders, or two attempts, both captured) | The first captured attempt to win the conditional update settles. Every other captured attempt is unapplied and is auto-refunded once, under one deterministic refund identity per attempt (§6.13). |
| T12 | Timing attack on signature comparison | Constant-time comparison |
| T13 | A late payment on an expired, voided or stale Payment | One rule (§6.7.2): a late capture settles only if the target is still valid for that exact amount and version and the Payment is not `void` or `flagged`. Everything else is refunded. |
| T14 | Webhook or verify reports an amount, currency or order id that doesn't match the saved Payment | Handled by the single mismatch rule (§6.5.3). A legitimate settled Payment is never changed by a mismatching later attempt. |
| T15 | A crash or lease expiry between "Order paid" and "Payment captured" makes a retry refund a legitimate payment | The Order records `paidAttemptId` in the same conditional update. A retry that finds its own attempt recorded treats it as success and rolls the remaining steps forward (§6.5). |

**Webhooks**

| # | Threat | Control |
|---|---|---|
| T16 | Forged webhooks (customer payments or payouts) | Each endpoint verifies its **own** HMAC secret over the **raw body**. The secrets differ, and each endpoint accepts only its own event types (§6.6). |
| T17 | Razorpay delivers the same event twice, or out of order | `WebhookEvent` unique on (source, eventId). State transitions are monotonic and idempotent (§6.6, §6.7). |
| T18 | App crashes or loses network after the customer paid | The webhook and the reconciliation job settle the payment. The driver app updates by socket. |

**Cash and online at the same time**

| # | Threat | Control |
|---|---|---|
| T19 | Online settlement and cash collection both succeed | Both are conditional updates on the same Order, filtered on `paymentStatus = pending`, `paymentMethod`, `methodVersion` and `amountVersion`. Only one can match. Losing online money is refunded (§6.7.1). |
| T20 | Driver marks cash collected while the customer's online payment is in progress | Cash needs `paymentMethod = cash`. Switching to cash first checks Razorpay's real state and is rejected while money is in motion (§6.7.12). |
| T21 | Driver marks cash collected without collecting, or keeps the cash | Switching to cash needs the customer's confirmation. Cash collection notifies the customer, creates a driver liability in the ledger, and is capped and reconciled (§6.16, §6.19). |
| T22 | Customer claims they paid cash when they didn't, or the reverse | "Cash collected" is marked by the driver. The customer is notified and can dispute through support within 48 hours. Support decides with the trip log. |
| T23 | Driver keeps cash and never remits | The driver's ledger balance goes negative by the cash owed. Cash orders are paused beyond the cash limit. Remittances are recorded by admins (§6.16). |

**Pay-later risks**

| # | Threat | Control |
|---|---|---|
| T24 | Customer orders food, then refuses to pay or isn't reachable | No handover without payment. Final refusals are counted. Customers are limited or blocked. Limits for new accounts (§6.11). |
| T25 | Fake or spam orders | Verified phone number, rate limits, open-order limits, order value limits for new or flagged accounts |
| T26 | Customer takes a ride or helper task and never pays | Unpaid-balance block and cap, reminders, and the accepted-risk statement (§6.11) |
| T27 | Driver taps "Delivered" before being paid | The server rejects "Delivered" unless `paymentStatus` is `paid` or `partially_refunded` and the OTP is confirmed |
| T28 | Driver falsely claims "customer refused / unreachable" to keep the goods, including with spoofed GPS or staged photos | Every incident runs server-side evidence checks. Any failed or unavailable check forces support review. There is a 24-hour customer dispute window, pattern flags, attestation, and mandatory goods return with earnings holds and liability (§6.9). Residual risk is stated in §6.9. |
| T29 | Customer disputes a valid refusal or fare in bad faith | Support decides from stored evidence. Bad-faith disputes are counted against the account. |

**Tips, fees and receivers**

| # | Threat | Control |
|---|---|---|
| T30 | Tip abuse: huge amount, wrong recipient, duplicate tips, tip on someone else's order | Own endpoint. Server bounds the amount, copies the recipient from the order, allows one tip per order, and requires an `Idempotency-Key` (§6.4). |
| T31 | Cancellation-fee manipulation: app sets the fee, fee charged twice, or skipped | The fee is calculated by the server at cancellation, only for eligible customer-initiated cancellations, shown before confirmation, paid from the stored amount, one per order (§6.4). |
| T32 | Someone other than the booking customer pays online, or reads another customer's order | Online payment is only possible for the authenticated booking customer. Receivers can hand over cash only (§6.8). |

**Refunds, secrets, access and payouts**

| # | Threat | Control |
|---|---|---|
| T33 | Refund abuse: too much, twice, by retry, or after a timeout | Refunds are server-only and role-gated. Each has a deterministic identity with a unique index, a reservation capped at the captured amount, and no re-call while an earlier call may still be in flight (§6.13). |
| T34 | Test bypass left on in production | Startup fails if any mock flag is on in production |
| T35 | Secret leaked through an app bundle, logs or git | Secrets only in server env or a secret manager. Never in `EXPO_PUBLIC_*` or `VITE_*`. Logs are redacted. |
| T36 | Brute force or spam against payment, OTP, SMS or payout endpoints | Rate limits per user and IP (§6.19). Per-order OTP attempt lockout. SMS caps per order and per phone. |
| T37 | Payout fraud (changing a bank account and cashing out) | Password re-confirmation, penny-drop verification, a 24-hour cooling-off after bank changes, limits, and idempotency keys (§11) |
| T38 | Insider abuse of manual refunds, waivers, write-offs, fare reductions, adjustments or manual payouts | Support can only initiate. A different admin approves above the threshold. Every action is audited (§6.13) |
| T39 | Money moved outside the system (a refund in the Razorpay dashboard) | Unmatched refund events are recorded as `external` refunds, capped, alerted and shown to admins. A daily comparison finds any the webhook missed. |
| T40 | Forged or missed payout events, or payouts made outside the system | Separate RazorpayX endpoint and secret, state taken from a fetched payout, and a payout reconciliation job (§11) |
| T41 | A driver keeps goods after a valid or false refusal, or claims they were returned | Goods stay in the driver's custody until the goods return is `completed` or closed as a loss. Earnings are held, liability can be debited, and the driver can be paused (§6.9, §6.16). |
| T42 | Duplicate money-changing admin requests (double click, retry) | `Idempotency-Key` on every money-changing endpoint, stored in `IdempotencyRecord` with a request hash (§6.17) |
| T43 | Cross-vendor, cross-driver or cross-customer data access | Ownership predicates on every endpoint, "not found" on failure, and tests for each (§6.17, §12) |
| T44 | Evidence, GPS or call-log data exposed or kept too long | Private storage with signed URLs, admin/support-only access with audited reads, and fixed retention (§6.19) |
| T45 | Ledger tampering or drift | Append-only ledger entries with deterministic idempotency keys, balances updated in the same transaction, and a daily recomputation check (§6.16) |

---

## 5. Setup, secrets and dependencies

### 5.1 Razorpay and RazorpayX dashboards

**Razorpay (customer payments):**

- Complete business KYC. Use **test mode** until go-live.
- Generate API keys. Test keys start with `rzp_test_`, live keys with `rzp_live_`.
- Set **Payment Capture → Automatic**, so payments aren't left merely "authorized". The backend never captures manually.
- Add a webhook to `POST /api/v1/payments/webhook` with its own strong random secret. Configure it **separately for test and live mode**.
  Events: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, `refund.failed`.

**RazorpayX (payouts):**

- Set up the RazorpayX account, its funding balance and its KYC separately.
- Add a **separate** webhook to `POST /api/v1/payouts/webhook` with its **own** strong random secret.
  Events: every payout status event RazorpayX offers (at least queued, initiated, processed, failed, rejected and reversed). The payload is only a hint. The payout's state is always taken from a fetch (§6.6, §11).

**Both:**

- Enable **two-factor authentication** for every dashboard user, and give each team member only the role they need. Refund permission in the Razorpay dashboard is limited to a few people (§6.13 covers refunds made there).

### 5.2 Secrets, feature flags and startup checks

| Secret or setting | Lives in | Never in |
|---|---|---|
| `RAZORPAY_KEY_ID` (public) | Backend env. Sent to the customer app per payment. | — |
| `RAZORPAY_KEY_SECRET` | Backend env or secret manager only | Customer app, driver app, admin, frontend, git, logs |
| `RAZORPAY_WEBHOOK_SECRET` | Backend env or secret manager only. Used only by `/payments/webhook`. | Same as above |
| `RAZORPAYX_KEY_ID`, `RAZORPAYX_KEY_SECRET`, `RAZORPAYX_ACCOUNT_NUMBER` | Backend env or secret manager only. Read only by the payouts module, under their own names and their own client. | Same as above |
| `RAZORPAYX_WEBHOOK_SECRET` | Backend env or secret manager only. Used only by `/payouts/webhook`. | Same as above |
| `OTP_SERVER_SECRET` | Backend env or secret manager only. Derives delivery OTPs (§6.8). | Same as above |
| Feature flags (below) | Backend env. Server config, never controlled by any app. | — |

**Feature flags** (all default to `false` except `ATTESTATION_MODE`, which defaults to `report_only`):

| Flag | Effect |
|---|---|
| `PAYMENTS_ONLINE_ENABLED` | Customers may choose Online. Payment, verify, webhook and refund engine are active. |
| `PAYOUTS_ENABLED` | RazorpayX payouts are active. Cash-out in the apps is enabled. |
| `REFUSAL_FLOW_ENABLED` | The refusal, incident, goods-return, evidence and "deliver without OTP" endpoints are active (§6.8, §6.9). |
| `TIPS_ENABLED`, `CANCELLATION_FEES_ENABLED` | Tips or cancellation fees are active. Each requires `PAYMENTS_ONLINE_ENABLED`. |
| `SMS_ENABLED` | The handover SMS to a package receiver is sent (§6.8). |
| `CALL_LOGGING_ENABLED` | In-app calls are logged, and call attempts count as refusal evidence (§6.9). |
| `ATTESTATION_MODE` | `enforce`, `report_only` or `off`. See §6.9 for the effect. |

**Startup checks** (the server refuses to start if any fails):

- `PAYMENTS_ONLINE_ENABLED=true`: the Razorpay key pair and webhook secret must be present.
- `PAYOUTS_ENABLED=true`: the RazorpayX keys, account number (not a placeholder) and webhook secret must be present, and the ledger must be enabled (always true after P2).
- `TIPS_ENABLED=true` or `CANCELLATION_FEES_ENABLED=true` with `PAYMENTS_ONLINE_ENABLED=false`: refuse to start. Fees are online-only (D5). They must never exist when they can't be paid.
- `OTP_SERVER_SECRET` must be present in every mode.
- MongoDB must be a replica set (the ledger uses transactions, §6.16). Startup verifies transaction support in every environment. The supported local development setup is in §5.4 C7.
- In every mode, if any mock or bypass flag is on while `NODE_ENV=production`, the server refuses to start.

**Behaviour when a flag is off:**

- `PAYMENTS_ONLINE_ENABLED=false`: order placement rejects `paymentMethod = online` (`ONLINE_NOT_AVAILABLE`). The apps read `GET /config/payments` (§6.12) and hide Online.
- `PAYOUTS_ENABLED=false`: RazorpayX endpoints return `FEATURE_DISABLED`. Cash-out is hidden in the driver and vendor apps. Earnings still accrue in the ledger and are settled by recorded manual payouts (§11).
- `REFUSAL_FLOW_ENABLED=false`: the refusal endpoints return `FEATURE_DISABLED`. Until it is enabled, existing operational handling applies, and none of the incident states exist for any order.

**Other rules:**

- Use different keys for dev, staging and production. Test keys never reach production, and live keys never reach dev machines.
- Rotate keys immediately if a leak is suspected, and on a regular schedule after that.
- Neither mobile app needs a Razorpay env variable. The customer app receives `key_id` from the backend, and the driver app never talks to Razorpay or RazorpayX. Remove the unused `EXPO_PUBLIC_RAZORPAY_KEY_ID` from `driver/.env.example`.
- Payments and payouts use **separate client objects**, even if the account shares keys (the existing code shares one client, which must be split). The payouts client calls the RazorpayX HTTP API directly, because the installed SDK does not expose payouts (§5.4 C5).

### 5.3 Infrastructure and third-party dependencies

Classification: **RBI** = required before implementation starts. **RBT** = required before testing the phase. **RBP** = required before production traffic for the phase. **OPT** = optional, with the defined behaviour when unavailable. "Verified" means this plan has confirmed it exists in the repository. Anything else is a required task in P0 (§13), not an assumption.

| Dependency | Needed for | Classification | Verified? | If unavailable |
|---|---|---|---|---|
| **MongoDB replica set** (transactions) | Ledger and balance writes, payout creation (§6.16) | **RBI** (P0) | Unverified. Checked by the startup check. | The server does not start. Nothing is degraded. |
| **Redis and BullMQ** | Webhook jobs, reconciliation, refund and payout resolution, all jobs in §6.14 | **RBI** (P0) | Yes, exist in the backend | Server does not start |
| **Socket.IO** | "Paid" and status events to the apps | **RBI** (P2) | Yes, exists in the backend | Apps fall back to polling `GET /payments/status/:orderId` (§6.12) |
| **Push notifications** | Handover code, payment notices, "driver is waiting", disputes, reminders (there are no reminder SMS) | **RBI** for P2 and P3 | Unverified. P0 task: confirm the customer and driver apps register push tokens. | Blocks P3 (notification evidence). P2 falls back to in-app banners only. |
| **GPS history stored on the server** (driver pings with timestamps) | Arrival and wait evidence, plausibility checks (§6.9) | **RBI** and **RBP** for P3 | Unverified. P0 task: confirm pings are stored with ≥ 90 days retention. | P3 cannot ship. `REFUSAL_FLOW_ENABLED` stays false. |
| **Geofence check** (server-side distance calculation against stored coordinates) | Arrival verification (§6.9) | **RBI** for P3 | No external dependency. Pure server logic. | n/a |
| **Device attestation** (Play Integrity, App Attest) | Trust level of arrival, evidence and return submissions (§6.9) | **RBT** for P3. `enforce` mode is **RBP** only when chosen. | Unverified | If the SDK is not integrated, or a device cannot attest, the result is `unavailable`. Every incident is then created `under_review` (never `provisional`) and the refusal flow still works. `ATTESTATION_MODE=off` requests no attestation at all, with the same effect (§6.9). |
| **Photo storage** (Cloudinary is already used) | Evidence and return photos | **RBI** for P3 | Cloudinary exists. P0 task: private (authenticated) delivery type and signed URLs. | P3 cannot ship |
| **SMS provider** with template registration (for example DLT in India) | The handover code to a package receiver (§6.8). SMS is used in exactly two places: login OTP (existing) and this. | **OPT** (D7) | Unverified | `SMS_ENABLED=false`: the receiver's code is shown only in the booking customer's app, who passes it on (§6.8) |
| **In-app calling with call logging** | Call-attempt evidence (§6.9) | **OPT** (D7) | Unverified | `CALL_LOGGING_ENABLED=false`: call evidence is `not_available`, and every incident is created `under_review` |
| **Public HTTPS endpoint** reachable by Razorpay | Payments and payouts webhooks | **RBT** for P4 (tunnel is fine). **RBP** for P4 and P6. | Production API host exists (`x-api.triozen.tech`) | Reconciliation still settles payments, but slower. Not acceptable for production. |
| **Razorpay account** (test keys, live KYC) | Online payments, refunds | **RBT** for P4 (test). **RBP** for P4 (live). | n/a | P4 stays off. Cash-only continues. |
| **RazorpayX account** | Automated payouts | **RBP** for P6 only | n/a | `PAYOUTS_ENABLED=false`. Manual payouts continue (§11). |
| **Data retention and privacy sign-off** | GPS, call logs, photos, OTP attempt logs, audit logs (§6.19) | **RBP** for P3 | n/a | P3 cannot ship |

### 5.4 P0: Existing repository security and compatibility fixes

This section records what was found in the current repository, and what must be done about it before the payment and handover guarantees of this plan can be relied on. **The findings in group A are compatibility and security prerequisites for implementing the design safely. They are not evidence that the new design is wrong.** Three groups are kept apart:

- **A. Confirmed repository findings.** Checked against the code. Paths are under `backend/src/` unless stated.
- **B. Repository items requiring verification.** Not yet verified. Nothing about them is assumed. Each is a P0 inventory task.
- **C. New payment-plan requirements.** What this plan adds because of A and B.

#### A. Confirmed repository findings

| # | Finding | Where |
|---|---|---|
| A1 | `PATCH /orders/:id/status` requires only authentication. It has no role or ownership check, so it can allow unauthorized order-status changes. | `modules/orders/orders.routes.ts`, line 36 |
| A2 | A hardcoded `9999` is accepted as a master restaurant pickup code. | `modules/orders/orders.controller.ts`, line 306 |
| A3 | A `deliveryOtp` (a plain 4-digit number saved on the order) is created when the order is placed. Existing code also uses it as the ride-start PIN in messages. This is a different lifecycle from the OTP in §6.8. | `modules/orders/orders.service.ts`, lines 196 (creation), 1076 and 1355 (use as a PIN) |
| A4 | `UserRole` exists in the user model. Existing vendor tokens carry the roles `restaurant_vendor` and `meat_vendor`. The role names used in this plan (`customer`, `driver`, `vendor`, `support`, `admin`) are not the code's names. | `database/models/User.ts` (`UserRole`), and the vendor token roles |
| A5 | `GET /orders/vendor/:vendorId` has no `authenticateToken`, so it is reachable without a login. | `modules/orders/orders.routes.ts`, line 28 |
| A6 | The installed `razorpay` package does not expose contacts or payout resources. The existing payout code calls `contacts`, `fundAccount` and `payouts` on the SDK object through a type cast. | `node_modules/razorpay`, and `modules/payments/payment.service.ts` |
| A7 | `npm test` in the backend only prints an error, and no test framework is configured in `backend/package.json`. | `backend/package.json` |
| A8 | `.env.example` points to a standalone MongoDB (`DATABASE_URL=mongodb://localhost:27017/projectx`). | `backend/.env.example` |
| A9 | The Order model contains `scheduledFor` and `isReserved`. | `database/models/Order.ts` |
| A10 | The admin i18n setup exists at `admin/src/i18n.ts` on the branch `feature/admin-i18n-foundation`. It is **not yet merged into `main`**, so it is not yet available on `main`. | branch `feature/admin-i18n-foundation` |

#### B. Repository items requiring verification (P0 inventory tasks)

Nothing below is assumed to exist or not to exist. P0 produces a written inventory for each item, and the plan is adjusted only from that inventory.

| # | Item to verify |
|---|---|
| B1 | Whether **driver or vendor balance and payout records** exist today, how a balance is calculated, and whether two cash-outs at the same moment can both pass the balance check. |
| B2 | The **existing payment endpoints** (including today's create-order and verify) and their callers: what each accepts, what each creates, which installed app versions call them, and whether the existing app-version mechanism can force an update. |
| B3 | How **scheduled deliveries and multi-stop deliveries** are modelled, and whether this plan's one-pickup, one-drop assumption holds for them. |
| B4 | Whether the deployed MongoDB version supports the partial unique index filter used in §6.7.2 (`status` in `created`, `processing`). A fallback is a boolean `isOpen` field kept in step with `status`, with the unique index on `(orderId, purpose)` where `isOpen = true`. |
| B5 | How many **admin accounts** exist, because the approval rule (§6.13.9) needs a second admin. If only one exists, a second admin account is created before P2. |
| B6 | **Sizing.** The plan adds many collections, state machines and endpoints. Before P2 starts, the team and the product owner decide whether any part (for example the ledger or approvals) moves to a later phase. No conclusion is assumed here. |
| B7 | The other repository tasks already listed in §5.3 (push tokens, GPS history, private Cloudinary delivery, app i18n) and the existing actions this plan calls "existing" (start trip, vendor preparing and ready, support tickets, the existing order `status` values). |

#### C. New payment-plan requirements

| # | Requirement |
|---|---|
| C1 | **Order status route and the `9999` code (from A1, A2).** Before any payment or handover guarantee is claimed: (a) `PATCH /orders/:id/status` is removed or replaced by transitions that check the caller's role and ownership; (b) a status change that sets a milestone of §6.2 (`pickedUpAt`, `arrivedAt`, `tripEndedAt`, `deliveredAt`), or cancels an order, can be made only through the endpoints of §6.17 (or the existing actions this plan names), and never through a generic status update; (c) the `9999` code is removed, and the pickup-code check uses only the order's own code. Tests: a logged-in user changing another user's order status is rejected, and `9999` is rejected. |
| C2 | **Existing OTP and PIN (from A3).** The OTP of §6.8 is stored on the Order as **`handoverOtp`**. Wherever this plan writes `Order.deliveryOtp`, the stored field is `Order.handoverOtp`, because the existing schema already has a different, plain `deliveryOtp` field. New code never reads the legacy `deliveryOtp` for handover. P0 lists every read and write of `deliveryOtp` and `restaurantPickupCode`. The ride and helper start PIN is not part of this plan's payment scope: it keeps working, it must not be derived from the handover OTP, and it moves to its own field so the two cannot conflict. **Implementation default — requires product-owner confirmation before production:** orders created before the cutover keep their legacy value until they complete, orders created after it use only the new fields, and legacy plain values are cleared once the order is closed. |
| C3 | **Roles (from A4).** P0 verifies the exact `UserRole` values and the vendor token shape, then adds the mapping used by every endpoint in §6.17: customer = the customer role of `UserRole`, driver = the driver role, support = the support role, admin = the admin role, **vendor = the existing `restaurant_vendor` and `meat_vendor` token roles**, with the vendor id taken from the token. `authorizeRole`, or a vendor authorization step beside it, must accept the vendor token roles. If a role migration is needed, it is decided and done in P0. |
| C4 | **Vendor orders route (from A5).** `GET /orders/vendor/:vendorId` requires authentication and an ownership check (the token's vendor id equals `:vendorId`, or the caller is admin or support). Until this is done, the cross-account isolation of §2 principle 15 and §6.17 is not satisfied. Test: an unauthenticated call, and a call by another vendor, are rejected. |
| C5 | **RazorpayX client (from A6).** The payouts module uses the **RazorpayX HTTP API directly** (its own client, with the RazorpayX keys). It does not use the `razorpay` package for contacts, fund accounts or payouts. The existing payout code that calls those on the SDK object is replaced. |
| C6 | **Test infrastructure (from A7).** P0 sets up a backend test framework, a MongoDB replica set for tests (in memory or in a container), and a fault-injecting stub for Razorpay and RazorpayX. Until it exists, S1 to S50 (§12) cannot be run, and P1's pricing tests also depend on it. |
| C7 | **Local MongoDB (from A8).** The replica-set and transaction requirement (§5.2) applies to staging and production and is also checked at startup locally. Supported local setups: a single-node local replica set (started with `--replSet` and initiated once), a hosted development cluster, or the in-memory replica set used by the tests. `.env.example` documents the local replica-set connection string. No environment is exempt from the startup check. |
| C8 | **Scheduled and reserved orders (from A9).** Before P2, define for orders with `scheduledFor` or `isReserved`: when they become payable, how the system-cancel timeouts are measured (from placement or from the scheduled time), whether the cancellation-fee rules apply, and their refund and status behaviour. Until this is defined, the immediate-order rules of §6.2, §6.4 and §6.10 must not be assumed to cover them. |
| C9 | **Admin i18n (from A10).** The admin screens of this plan depend on the i18n branch being merged into `main` first. §6.18 states this exactly. Customer and driver app i18n stay P0 verification and implementation items (§5.3, §6.18). |
| C10 | **Existing money and endpoints (from B1, B2).** If B1 finds existing driver or vendor balances, P2 includes opening-balance ledger entries for every owner (idempotency key `opening:{ownerType}:{ownerId}`), and existing orders get the new payment fields. If B2 finds existing payment endpoints that accept an amount or create orders from app data, they are retired or reduced to the behaviour of §6.3 before P4, and installed app versions are handled as B2 finds. |

**Ordering (also in §13).** C1 to C4 and C6 are done in P0. They are prerequisites for P2 and every later phase, because the handover and payment guarantees depend on the status route, the roles and the ownership checks. C5 is done before P6. C7 is done before P0 exits. C8 and C10 (balances) are resolved before P2. C10 (endpoints) is resolved before P4.

---

## 6. Backend plan

### 6.1 Server-side pricing, amount locking and amount changes

The server calculates the price of every service on its own. This is the most important security task, because some prices are still taken from the app today.

| Service | Server calculates from | Locked at |
|---|---|---|
| Food | Item prices from `FoodItem` in the database × quantity, vendor delivery fee, zone surge, coupon | Order placed |
| Meat | Per-kg or per-unit prices from `MeatItem` / `MeatGlobalPrice` × weight or quantity, fees, coupon | Order placed |
| ₹149 Store | Fixed store item prices from the database, fees, coupon | Order placed |
| Package delivery | Distance and route from the routing service, pricing config, zone surge | Booking |
| Rides | Tier rate card × actual distance and time, waiting charges, zone surge, plus the accepted price supplement (§6.10). An estimate is shown at booking. | Trip end (`complete-trip`) |
| Task helper | Agreed offer (at least the server minimum) plus approved extra hours priced at the agreed hourly rate (§6.10) | Task end (`complete-trip`) |

Rules:

- Any `total`, `subtotal`, `deliveryFee` or `customerPrice` sent by the app is **only a preview**. It's never used as the amount charged.
- The coupon re-check on the server stays and is applied the same way to every service that accepts coupons.
- There is one shared server price function per service. It's used for the saved Order and for every Payment, so they can never disagree.
- **Price snapshot.** When the amount is locked, the Order stores a `priceSnapshot`: item prices and quantities, items subtotal, delivery fee, surge, coupon and discount, the platform commission, and the vendor and driver shares (from the existing commission settings). Later recalculations and all ledger entries (§6.16) use the snapshot, never today's prices.
- **Tips are not part of the order amount.** They're a separate payment (§6.4).
- **Zero amounts.** If the locked `payableAmount` is 0 (for example a full discount), the server sets `paymentStatus = paid`, `paidVia = zero_amount` at lock time, and no Payment is ever created. Razorpay orders are only created for amounts of at least ₹1 (100 paise), so `create-order` rejects an amount below that.

**Amount versioning.** The Order stores `payableAmount` (in paise) and `amountVersion`. Locking sets `amountVersion = 1`. Every later change increments it.

**When the locked amount changes.** A change is allowed only:

- from the server (never from an app)
- downwards: the vendor marks an item unavailable, or support reduces a fare after a dispute (§6.10)
- while `paymentStatus = pending`

**Recalculation rule (item unavailable).** The server recomputes the order from the remaining items with the shared price function and the `priceSnapshot`, then sets the new amount to the **smaller** of the recomputed amount and the current `payableAmount`, so the amount can never rise. Delivery fee and surge stay as locked in the snapshot. A coupon is re-checked against the remaining items. If it would no longer qualify, the customer keeps the **original discount amount**, floored so the result is never below the delivery fee (Implementation default, D4). If every item becomes unavailable, the order is cancelled by the vendor and closed as not payable (§6.7.1), with no fee.

Each change runs as follows:

1. **Amount change** writer (§6.7.1): a conditional update on the Order (filter: `paymentStatus = pending`, the current `amountVersion`, and no `activeIncidentId`) sets the new `payableAmount`, increments `amountVersion`, appends to `priceHistory`, and recomputes the commission and the vendor and driver shares in `priceSnapshot` for the new amount, in proportion to the old shares.
2. Immediately after it succeeds, every open Payment (`created` or `processing`) for that Order with purpose `order` is **voided** (`void`, reason `amount_changed`). A `processing` Payment is voided by the same rule as in §6.7.2. Its lease holder refunds any captured attempt.
3. The customer is notified ("Amount changed to ₹Y"), and the vendor and driver apps show the new amount.

What happens next:

- The customer taps "Pay" again. `create-order` (§6.3) sees no open Payment and creates a new one for the new amount and version.
- Razorpay can't cancel an order, so the customer may still complete a payment for the old amount. That capture can't settle the Order, because the Order's `amountVersion` no longer matches the Payment's. It is refunded automatically (§6.5, §6.13).
- If the Order is already `paid`, the amount can **not** change. Adjustments after payment go through refunds only (§6.13).
- Between step 1 and step 2, an old Payment is briefly still open. It is harmless: it cannot settle (versions differ) and `create-order` voids it on sight (§6.3).

### 6.2 Ordering, milestones and the single payable rule

**Placing the order.**

- The customer chooses **Cash** or **Online**. Online is accepted only if `PAYMENTS_ONLINE_ENABLED`. It's stored as `paymentMethod` with `methodVersion = 1` and `paymentStatus = pending`.
- The server calculates the price (§6.1) and locks it (goods and package at placement, rides and helpers at trip end).
- For a **package**, the booking also stores `paymentTiming` (`at_pickup` or `at_drop`) and the receiver's name and phone number (the phone is used only for the handover SMS, §6.8). Who physically hands over cash is not asked at booking: the payment method alone decides (§6.8).
- **Pay-later checks before accepting the order** (each uses the exact counting rules in §6.11):
  - the customer has no counted unpaid order and no counted unpaid cancellation fee
  - the customer isn't blocked for final refusals
  - the order is within the value limit for their account
  - they're below the maximum number of open orders
  - their counted unpaid balance is below the cap
- No Razorpay call happens at this stage.

**Milestones.** The server records these timestamps on the Order. They are set only by server actions, never by a client-supplied time.

| Milestone | Set by |
|---|---|
| `driverAssignedAt` | Dispatch assigns a driver (cleared if the driver cancels, §6.10) |
| `preparingAt` | The vendor marks the order "preparing" (existing action) |
| `pickedUpAt` | `POST /orders/:id/picked-up` |
| `arrivedAt`, `arrivedStage` | `POST /orders/:id/arrive` (`pickup` or `drop` for goods and packages. Rides and helpers have only `pickup`, which is recorded for the cancellation-fee rule and never affects payment.) |
| `tripStartedAt` | The existing "start trip / start task" action |
| `tripEndedAt` | `POST /orders/:id/complete-trip` |
| `deliveredAt` | `POST /orders/:id/deliver` |
| `payableFromAt` | The payable rule below |

**The single payable rule (authoritative).** `Order.payableFromAt` is set **exactly once**, by exactly these server actions. Every section, endpoint and app screen uses only this field.

| Service | `payableFromAt` is set by |
|---|---|
| Food, meat, ₹149 Store | `picked-up` (the driver takes the order out for delivery) |
| Package, `at_drop` | `picked-up` |
| Package, `at_pickup` | `arrive` with `stage = pickup` |
| Rides, helpers | `complete-trip` (which also locks the final amount) |

An order is **payable** when `payableFromAt` is set, `paymentStatus = pending`, and `activeIncidentId` is empty. Both online payment (`create-order`) and cash collection (`cash-collected`) require a payable order. An order that is not payable yet cannot be paid online or in cash. An order that becomes non-payable (an incident starts, it is cancelled or written off, or a driver cancellation clears `payableFromAt`) cannot be paid, and an open Payment for it can no longer settle (§6.5).

**Cancellable states.** The customer can cancel only while `paymentStatus = pending`, there is no active incident, and the service hasn't passed the point of no return:

| Service | The customer can cancel until |
|---|---|
| Food, meat, store | `pickedUpAt` is set |
| Package (both timings) | `pickedUpAt` is set. This includes after the driver arrived at pickup and the order is still unpaid. |
| Rides, helpers | `tripStartedAt` is set |

An order whose payment is no longer `pending` (for example a package paid early at pickup) cannot be cancelled in the app. The customer contacts support, who use a refund (§6.13) and the refusal-style goods return if the driver already holds the package.

### 6.3 Create payment for an order: `POST /api/v1/payments/create-order`

Called when the customer taps "Pay ₹X". This endpoint is only for **order** payments.

- **Access:** authenticated customers only, ownership checked, rate limited (§6.19).
- **Input:** validated with Zod. **Only the app's order id.** No amount, no items, no purpose.
- **Checks:**
  - the order belongs to this user (the booking customer)
  - `paymentMethod = online`, and `PAYMENTS_ONLINE_ENABLED`
  - the order is **payable** (§6.2)
  - the amount is at least ₹1
- **Reuse, replace, or wait** (in this order):
  1. If an open Payment exists for this order and purpose (`created` or `processing`):
     - `processing`: return `PAYMENT_IN_PROGRESS` (409). The app shows "Confirming your payment" and polls (§6.12). No new Payment is created. If its lease has expired, an immediate `payment-reconcile` job is enqueued for it.
     - `created` whose `orderAmountVersion` differs from the Order's `amountVersion`: void it (`amount_changed`), then continue to create a new one.
     - `created`, past `expiresAt`: run the settle procedure for any captured attempts on it (§6.5). If that settles the order, return `ALREADY_PAID`. Otherwise mark it `expired` (conditional on `created`), then continue to create a new one.
     - `created`, not expired, versions match: return it. The customer retries attempts on the same Razorpay order.
  2. Otherwise create a new Payment (below).
- **Creating a Payment (order of operations):**
  1. Insert the Payment: `status = created`, `userId`, `orderId`, purpose `order`, service type, the **locked amount** in paise, `orderAmountVersion`, currency `INR`, `expiresAt` and no `razorpayOrderId` yet. The unique open-Payment index (§6.7.2) makes this the concurrency guard: if a concurrent request inserted first, this insert fails, and the request re-reads and returns that Payment.
  2. Create the Razorpay order for that amount. Set `receipt` to the internal Payment id, and put the user id, order id, purpose and amount version in `notes`.
  3. Save the returned `razorpay_order_id` on the Payment (unique index).
  4. If step 2 fails or times out, void the Payment (`razorpay_create_failed`) and return an error. A timeout may leave an unused Razorpay order. It cannot be settled because it is not linked to any Payment, and a webhook for an unknown order id is only alerted (§6.6).
- **Expiry:** `expiresAt` is set at creation (default 30 minutes, §15.2). It only closes the **checkout window**: after it, no new checkout is started from this Payment. It does not change what happens to money that is captured later (§6.7.2). The Razorpay checkout timeout is set a little shorter than `expiresAt`.
- **Response:** `order_id`, `key_id`, `amount`, `currency`, the display name "Flavour", and a prefill of the user's own name, email and phone. Nothing else.

### 6.4 Tips and cancellation fees

Tips and cancellation fees are separate payments. They never change the order amount or the Order's `paymentStatus`. They use their own create endpoints and share verify (§6.5), the webhook (§6.6), the state machines (§6.7) and refunds (§6.13) with order payments. The Payment's `purpose` (`order`, `tip` or `cancellation_fee`) decides what settles. Both are online-only and exist only while `PAYMENTS_ONLINE_ENABLED` and their own flag are on.

**Tip: `POST /api/v1/payments/tip/create-order`** (needs `TIPS_ENABLED`)

- **Access:** authenticated customers only, ownership checked, rate limited.
- **Input:** validated with Zod: `orderId` and `tipAmount` (paise, integer), plus the `Idempotency-Key` header. The tip is the only amount a customer chooses in a payment request, and the server bounds it.
- **Checks:**
  - the order belongs to this user
  - the order is completed (`deliveredAt` for goods and package, `tripEndedAt` for rides and helpers) and has an assigned driver, and `paymentStatus` is `paid` or `partially_refunded`
  - it's within the tip window (default 7 days after completion)
  - `Order.tip.status = none` (one tip per order, ever: a refunded tip still counts)
  - `tipAmount` is between the configured minimum and maximum. The maximum is the smaller of the absolute cap and the larger of the floor and a percentage of the order amount (defaults in §15.2).
- **Binding:** the recipient is `recipientDriverId`, **copied from the order on the server**, never accepted from the app. The Payment stores `userId`, `orderId`, `recipientDriverId`, purpose `tip` and the validated amount.
- **Idempotency:** the `Idempotency-Key` header is stored on the Payment. `(userId, idempotencyKey)` is unique. The same key with the same order and amount returns the same Payment. The same key with a different order or amount returns `IDEMPOTENCY_MISMATCH`. At most one open tip Payment exists per order (the unique open-Payment index).
- **Razorpay order and expiry:** as in §6.3, with the purpose and recipient in `notes`.
- **Settle:** the settle procedure (§6.5) uses `Order.tip` as the target: a conditional update sets `tip.status = paid`, `tip.paymentId`, `tip.attemptId`, `tip.amount`, `tip.paidAt` only if `tip.status = none`. Finalization credits the driver in the ledger with `tip:{paymentId}` (once only). A second tip capture is unapplied and refunded automatically (§6.13). Tips go to the driver in full.
- **Refunds:** a tip is refunded only for an unapplied duplicate or through a support decision (§6.13). A refund moves `tip.status` to `partially_refunded` or `refunded` and reverses the driver's ledger credit. It never changes `Order.paymentStatus`.

**Cancellation fee: `POST /api/v1/payments/cancellation-fee/create-order`** (needs `CANCELLATION_FEES_ENABLED`)

- **Eligibility.** A fee exists only for a **customer-initiated** cancellation (`cancelledBy = customer`) that matches the configured fee rules (D8, §15.2). There is **never** a fee when the vendor or the system cancels, when an item is unavailable, when no driver was found, or when the driver cancels (a driver cancellation re-dispatches the order and never cancels it, §6.10).
- **Calculated on the server, at cancellation.** When an eligible cancellation is confirmed, the same conditional update that closes the order (`Close as not payable`, §6.7.1) also sets `cancellationFee = {amount, status = pending, basis, calculatedAt}`. So the order can never be cancelled without its fee being stored.
- **The customer sees it first.** The cancel flow is two steps (`cancel/preview` and `cancel`, §6.17). The preview returns the fee and a signed preview token (valid 5 minutes). The customer confirms with the fee they saw. The server recomputes on confirm, and if the fee changed it returns `FEE_CHANGED` with the new fee instead of cancelling.
- **The fee is never merged into another order.** It's a separate unpaid item that blocks new bookings until it is paid or waived (§6.11).
- **Access:** authenticated customers only, ownership checked, rate limited.
- **Input:** **Only the cancelled order's id.** No amount.
- **Checks:** the order belongs to this user and `cancellationFee.status = pending`.
- **Binding:** the Payment stores `userId`, `orderId`, purpose `cancellation_fee`, and `amount = cancellationFee.amount`, read from the Order.
- **Idempotency:** one open fee Payment per order (the unique open-Payment index). Reuse, replace and expiry work as in §6.3. If support waives the fee, the open fee Payment is voided (`fee_waived`).
- **Settle:** the settle procedure uses `Order.cancellationFee` as the target: a conditional update sets `status = paid`, `paymentId`, `attemptId`, `paidAt` only if `status = pending` and the amount equals the Payment's. A second capture is unapplied and refunded.
- **Online only (D5).** No driver is present to collect it in cash. Support can waive it (`waived`) with a mandatory reason, an audit log and the approval rules in §6.13.
- **Fee split.** The fee is shared in the ledger per the defaults in §15.2 (§6.16). The split is applied by the server, never from an app.

### 6.5 Settlement procedure (verify, webhook and reconciliation all use it)

There is **one** settlement procedure `S`. `POST /payments/verify`, the payments webhook worker and the reconciliation job all call it. Only the entry differs.

#### 6.5.1 Entry points

**`POST /api/v1/payments/verify`** (booking customer). Run in order. If any check fails, stop.

1. **Authentication:** the user must be logged in.
2. **Schema validation:** `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` are non-empty strings in the expected format.
3. **Signature:** compute `HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)` and compare it to the signature in **constant time**. A failure returns `INVALID_SIGNATURE` and raises an alert.
4. **Ownership:** a Payment must exist for this `razorpay_order_id` **and** belong to the current user (otherwise `NOT_FOUND`).
5. **Fetch:** fetch the payment entity from Razorpay. Its `order_id` must equal the Payment's `razorpayOrderId`, otherwise return `INVALID_PAYMENT` and alert (this is an attack signature, and the Payment is not touched).
6. Run `S` (below) and return its result code.

**Webhook worker** (§6.6): find the Payment by the event's `order_id`, fetch the payment entity, run `S`. There is no user session. The Payment's `userId` and target are the ownership check.

**Reconciliation** (§6.14): for each Payment or attempt it selects, fetch, then run `S`.

#### 6.5.2 The procedure `S(payment, razorpayPaymentEntity)`

1. **Record the attempt.** Upsert a `PaymentAttempt` keyed by `razorpayPaymentId` (unique). Status only moves forward by rank: `created` < `authorized` < `failed` or `captured` (§6.7.3). If the fetched entity and the stored attempt disagree, the fetched entity wins and an alert is raised.
2. **By attempt status:**
   - `failed`: return `ATTEMPT_FAILED`. The Payment is **not changed**. It stays `created` and reusable.
   - `created` or `authorized`: return `CONFIRMING`. Nothing is settled or failed. The app polls. The webhook or reconciliation finishes it once Razorpay captures it (auto-capture is on). An attempt still `authorized` after the grace period raises an alert and is never settled (§6.14).
   - `captured`: continue.
3. **Mismatch check (rule M, §6.5.3).** If the attempt's `amount` differs from the Payment's `amount`, its `currency` is not `INR`, or its `order_id` differs from the Payment's, apply rule M and stop.
4. **Take the lease.** A conditional update sets `lockOwner` and `lockExpiresAt` (default 2 minutes) if there is no live lease.
   - If the Payment is `created`, the same update sets `status = processing`.
   - In every other status (`expired`, `void`, `flagged`, `captured`, `partially_refunded`, `refunded`), only the lease fields are set. The status does **not** change.
   - If another run holds a live lease, return `CONFIRMING` and enqueue a retry job for after the lease expires.
5. **Evaluate the target, linkage first.** Read the target (Order for purpose `order`, `Order.tip`, `Order.cancellationFee`). Evaluate in this order:
   1. **Own success.** The target's `settledAttemptId` (`paidAttemptId`, `tip.attemptId` or `cancellationFee.attemptId`) equals this attempt. This is an earlier success of this very attempt (a retry, a lease takeover or a crash recovery). Go to step 7 (finalization). **Never refund.**
   2. **Someone else settled it.** The target has a different `settledAttemptId`, or `paymentStatus` is `paid` by another means (cash, another Payment). This attempt is a **duplicate**. Go to step 6 with cause `duplicate_capture`.
   3. **Not settleable.** The Payment is `void` or `flagged`, or the target is not valid: for `order`, `paymentMethod ≠ online`, `paymentStatus ≠ pending`, `payableFromAt` empty, an active incident, or `amountVersion` / `payableAmount` differ from the Payment's `orderAmountVersion` / `amount`. For `tip`, `tip.status ≠ none`. For `cancellation_fee`, `status ≠ pending` or the amount differs. Go to step 6 with the matching cause.
   4. **Attempt the settle.** Run the atomic settle (below). If it matches, go to step 7. If it does not match, **re-read the target once and repeat step 5** (this makes a lost race resolve to 5.1, 5.2 or 5.3).
6. **Unapplied capture.**
   1. Mark the attempt `disposition = unapplied` with `unappliedCause`: `duplicate_capture`, `order_not_payable`, `amount_changed`, `method_changed`, `payment_void` or `payment_flagged`.
   2. Set the Payment `void` with that reason, if its status is `created`, `processing` or `expired` (a `captured`, `flagged` or already `void` Payment keeps its status).
   3. Find-or-create the **automatic Refund** with the deterministic identity `auto:{razorpayPaymentId}:{generation}` (§6.13). Enqueue its submission.
   4. Release the lease. Return the result code from the table in §6.5.4.
7. **Finalization (roll-forward, idempotent).** Every step here is safe to run any number of times, by any run:
   1. Payment: conditional update to `captured` with `appliedAttemptId` and `paidAt`, from `created`, `processing` or `expired`, only if `appliedAttemptId` is empty. If it is already `captured` with the same attempt, do nothing. If it is `captured` with a different attempt, raise a critical alert (an invariant violation) and change nothing.
   2. Attempt: `disposition = applied`.
   3. Void every **other** open Payment (`created` or `processing`) for the same target (`order_settled`). A voided `processing` one is handled by its lease holder (§6.7.2).
   4. Post-settlement effects, each keyed and idempotent: ledger entries (`order_earning`, `cash_liability` for cash only, `tip`, `fee_share`, §6.16), socket "Paid" events to the customer and driver apps, the customer push. Then clear the target's `effectsPending` flag.
   5. Release the lease. Return `SETTLED`.

**The atomic settle** (step 5.4) is one conditional update on the target document, which also records the linkage:

- **Order:** filter `paymentStatus = pending`, `paymentMethod = online`, `payableFromAt` set, `amountVersion` and `payableAmount` equal the Payment's, `activeIncidentId` empty, `paidPaymentId` empty. Set `paymentStatus = paid`, `paidVia = online`, `paidAt`, `paidPaymentId`, `paidAttemptId`, `paidRazorpayPaymentId`, `effectsPending = true`.
- **Tip:** filter `tip.status = none`. Set `tip.status = paid`, `tip.paymentId`, `tip.attemptId`, `tip.amount`, `tip.paidAt`, `tip.effectsPending = true`.
- **Fee:** filter `cancellationFee.status = pending` and `cancellationFee.amount` equals the Payment's amount. Set `status = paid`, `paymentId`, `attemptId`, `paidAt`, `effectsPending = true`.

**Crash and recovery.** If a run stops after the atomic settle and before finalization completes, the target already records its settling attempt and has `effectsPending = true`. Any later run of `S` for that attempt reaches step 5.1 and finalizes. The `effects-finalizer` job (§6.14) also finds every target with `effectsPending = true` older than 2 minutes and runs finalization for it, so a settled target is completed even if no webhook or verify ever arrives again. The legitimate first payment is never refunded because a run crashed.

#### 6.5.3 Rule M: amount, currency or order mismatch

A mismatch means the attempt's amount, currency or order id differs from the **Payment's** saved values. (A Payment whose amount or version differs from the **Order's** locked amount is a *stale* Payment, handled by step 5.3, not a mismatch.) What happens depends on the Payment's current status:

| Payment status | Payment status after | Attempt | Money | Alert | Customer sees |
|---|---|---|---|---|---|
| `created`, `processing`, `expired` | `flagged` (`amount_mismatch`, `currency_mismatch` or `order_mismatch`) | `disposition = unapplied` | If the attempt is `captured`, auto-refund it in full (cause `amount_mismatch` and so on) | High severity | `REFUNDED_INVALID_PAYMENT` if captured. Otherwise `PAYMENT_FLAGGED`, and the next Pay tap creates a new Payment. |
| `captured`, `partially_refunded`, `refunded` (a legitimate settled Payment) | **Unchanged** | `disposition = unapplied` | If the attempt is `captured`, auto-refund it in full | Medium severity | The settled result. Nothing changes for the customer. |
| `void`, `flagged` | Unchanged | `disposition = unapplied` | If `captured`, auto-refund | Medium | `REFUNDED_INVALID_PAYMENT` |

Rule M also applies the same way to the webhook and to reconciliation. A **captured legitimate payment never changes state** because a later duplicate or mismatching attempt arrives. The mismatch is recorded on the attempt and in `Payment.anomalyCount`. It is shown in the admin review list (§10) and audited. The webhook always returns 2xx.

#### 6.5.4 Result codes and cases

Result codes are stable and machine-readable. Apps translate them (§6.18).

| Situation in `S` | Code |
|---|---|
| Settled now, or own earlier success found | `SETTLED` |
| Attempt failed | `ATTEMPT_FAILED` |
| Attempt not yet captured, or lease held by another run | `CONFIRMING` |
| Another Payment or cash already settled the order (duplicate) | `REFUNDED_DUPLICATE` |
| Amount or version changed | `REFUNDED_AMOUNT_CHANGED` |
| Method switched to cash | `REFUNDED_METHOD_CHANGED` |
| Cancelled, written off, or an incident is active | `REFUNDED_NOT_PAYABLE` |
| Payment `void` or `flagged`, or rule M | `REFUNDED_INVALID_PAYMENT` |
| Unknown or invalid payment (verify only) | `INVALID_PAYMENT` |

**Behaviour in every ordering** (all are safe, and each reaches the same end state):

| Case | What happens |
|---|---|
| First verify | Steps 1 to 7. The target records `paidAttemptId`. `SETTLED`. |
| Retry of verify after success | Step 5.1 (own success). Finalization is a no-op. `SETTLED`. |
| Webhook arrives before verify | The worker runs `S` and settles. The later verify finds step 5.1 and returns `SETTLED`. |
| Verify arrives before webhook | Verify settles. The later webhook worker finds step 5.1. Finalization is a no-op. |
| Both at the same moment | One takes the lease. The other returns `CONFIRMING` and its retry job then finds step 5.1. If both raced past the lease (an expired lease), the atomic settle picks one winner. The loser re-reads and finds 5.1 (same attempt) or 5.2 (different attempt). |
| Lease expires while a run is working | A second run takes over. Whichever loses the atomic settle re-reads and lands on 5.1. Nothing is refunded, because the target's recorded attempt is the same attempt. |
| Crash after the atomic settle, before finalization | The next run (or the `effects-finalizer` job) lands on 5.1 and finalizes. |
| Crash before the atomic settle | The lease expires. The next run performs the settle. |
| A different attempt captures after the target is settled | 5.2. Unapplied, auto-refunded once (`auto:{razorpayPaymentId}:1`), Payment `void`. |

### 6.6 Webhooks

Both webhooks share the same discipline but are otherwise **completely separate** (route, secret, deduplication, queue, handlers).

#### 6.6.1 Razorpay customer payments: `POST /api/v1/payments/webhook`

Secret: `RAZORPAY_WEBHOOK_SECRET`. Accepts customer-payment events only.

- **Raw body.** Razorpay signs the exact raw bytes. This route receives the raw body and is registered **before** the global JSON body parser.
- **No JWT and no user auth.** The signature in `X-Razorpay-Signature` is the authentication, compared in constant time. A missing or wrong signature returns 401 and raises an alert.
- **Event id required.** `X-Razorpay-Event-Id` must be present (otherwise 400).
- **Deduplication.** Insert a `WebhookEvent` (`source = razorpay`, `eventId`, type, `status = received`). It is unique on (`source`, `eventId`). A duplicate returns 200 immediately. If the earlier insert is still `received` (a crash), the worker job retries it.
- **Fast response.** Return 2xx immediately after the insert and enqueue a BullMQ job (attempts with backoff). The worker sets `WebhookEvent.status = processed` on success, or `failed` after the last retry (with an alert).
- **Events:**

| Event | Effect | State machines touched |
|---|---|---|
| `payment.authorized` | Fetch the payment, upsert the attempt as `authorized`. Nothing is settled or failed. | PaymentAttempt |
| `payment.captured`, `order.paid` | Fetch the payment and run `S` (§6.5.2). Two events for one capture are harmless (step 5.1). | Payment, PaymentAttempt, Order (or tip, fee), Refund (if unapplied) |
| `payment.failed` | Fetch, upsert the attempt as `failed` with its reason. **The Payment is not changed.** | PaymentAttempt |
| `refund.created`, `refund.processed`, `refund.failed` | Correlate to a Refund (§6.13.6) and apply the refund transitions. | Refund, PaymentAttempt, Payment, Order/tip/fee refund fields, Ledger |

- **Out-of-order and late events.** Attempt status moves only forward by rank, so `payment.failed` after `payment.captured`, or `authorized` after `captured`, is ignored (and logged). A capture event for a Payment in any status is handled by `S`, so late captures follow §6.7.2. A `refund.processed` for a Refund already `processed` is a no-op.
- **Unknown Razorpay order id** (no saved Payment): log and alert. Change nothing. Return 2xx.
- **Refunds made outside the system.** A refund event that matches no internal Refund is recorded as a Refund with `source = external` (§6.13.6).
- **Network:** optionally allow only Razorpay's published webhook IP ranges at the firewall or proxy, in addition to the signature check.

#### 6.6.2 RazorpayX payouts: `POST /api/v1/payouts/webhook`

Secret: `RAZORPAYX_WEBHOOK_SECRET`. Accepts payout events only. Feature flag `PAYOUTS_ENABLED`.

- Same raw-body, signature and event-id rules, with a **separate** `WebhookEvent` source (`razorpayx`), a **separate** queue and separate handlers.
- **Event handling.** For any payout event, find the Payout by `razorpayPayoutId`, or by `reference_id` (which equals the internal payout id). Then **fetch the payout from RazorpayX** and apply the transition from the fetched status (§6.7.9). The payload is only a hint, so a missing event or an unknown event type never leaves a payout in the wrong state.
- **Out-of-order and replay.** Payout statuses have a rank (`queued` < `processing` < `processed`). Transitions only move forward, and `failed`, `rejected` and `reversed` follow §6.7.9. Replays are no-ops.
- **Unknown payout id:** log, alert, change nothing, return 2xx.
- It never touches Payments, Orders or customer Refunds. A payment event sent here, or a payout event sent to the payments webhook, is rejected (wrong secret or unknown type), and an alert is raised.

### 6.7 State machines (authoritative)

This section is the single source of truth for every state. **No other section may use a state that is not listed here, or a transition that is not listed here.** Endpoint tables (§6.17), the data model (§6.15), jobs (§6.14) and the tests (§12) all use these exact names.

Conventions for every machine: "Actor" is the person or system that performs the transition. Every transition is a conditional update on the current status, so it is idempotent (repeating it is a no-op) and only one of two racing transitions wins. All transitions are audited (§6.15).

#### 6.7.1 Order payment status (`Order.paymentStatus`)

States: `pending`, `paid`, `partially_refunded`, `refunded`, `not_payable`, `written_off`. Terminal: `not_payable`, `written_off`, `refunded`. (`paid` and `partially_refunded` only move toward `refunded`.) The status describes the **order payment only**. Tips and fees have their own fields (§6.7.2 last paragraph).

| Status | Meaning |
|---|---|
| `pending` | Money may still be owed for this order. Whether it **counts** as unpaid depends on §6.11. |
| `paid` | Settled online, in cash, or as a zero amount. `paidVia` says which. |
| `partially_refunded`, `refunded` | Paid, then refunded in part or in full (online or cash refund). |
| `not_payable` | **Terminal.** Cancelled or closed. No money is owed for it. |
| `written_off` | **Terminal.** Money was owed or expected, and the platform closed it without collecting it (a final or overturned refusal, or an approved admin write-off). |

**Writers.** These are the **only** operations that change `paymentStatus`. Each is a single conditional update on the Order document, so the database applies exactly one of any racing pair.

| # | Writer | Actor and trigger | Filter (all must match) | Effect |
|---|---|---|---|---|
| W1 | **Online settle** | System, from `S` (§6.5) | `paymentStatus = pending`, `paymentMethod = online`, `payableFromAt` set, `amountVersion` and `payableAmount` equal the Payment's, no `activeIncidentId`, `paidPaymentId` empty | `paid`, `paidVia = online`, `paidAt`, `paidPaymentId`, `paidAttemptId`, `paidRazorpayPaymentId`, `effectsPending = true` |
| W2 | **Cash collected** | Assigned driver, `cash-collected` | `paymentStatus = pending`, `paymentMethod = cash`, `methodVersion` and `amountVersion` equal the driver app's, `payableFromAt` set, no `activeIncidentId`, `driverId` = this driver, and for goods and package `arrivedStage` matches (§6.8) | `paid`, `paidVia = cash`, `cashCollectedAt`, `cashCollectedBy`, `cashCollectedAmount`, `cashCollectedFrom`, `effectsPending = true` |
| W3 | **Switch method** | Booking customer, `payment-method/switch` | `paymentStatus = pending`, `paymentMethod` = the current one, `methodVersion` equals the version switched from, no `activeIncidentId`. For online→cash, the Razorpay state check passed (§6.7.12). | `paymentMethod` flips, `methodVersion + 1`, append to `methodChangeLog` |
| W4 | **Amount change** | System, from vendor "item unavailable" or an approved fare reduction (§6.1, §6.10) | `paymentStatus = pending`, current `amountVersion`, no `activeIncidentId` | new `payableAmount` (lower), `amountVersion + 1`, append to `priceHistory` |
| W5 | **Close as not payable** | Customer `cancel`, vendor `cancel-by-vendor`, or the system (`system-cancel` job) | `paymentStatus = pending`, cancellable stage (§6.2), no `activeIncidentId` | `not_payable`, `closedReason`, `closedAt`, `cancelledBy` (`customer`, `vendor` or `system`), and for an eligible customer cancellation the `cancellationFee` (§6.4) |
| W6 | **Write off** | System (an incident becomes `upheld` or `overturned`, §6.9) or an approved admin write-off | `paymentStatus = pending` | `written_off`, `closedReason`, `closedAt` |
| W7 | **Refund progress** | System, when an order-purpose Refund becomes `processed` (§6.13) | `paymentStatus` in (`paid`, `partially_refunded`) | `orderRefundedAmount += amount`. `partially_refunded` if less than the amount paid, `refunded` if equal |
| W8 | **Zero amount** | System, at amount lock | (creation) | `paid`, `paidVia = zero_amount` |

W1 and W2 are the settle writers. When W1's filter fails after a valid capture, the capture is handled by §6.5 step 5 (own success, duplicate, or refund). Nothing is left unresolved.

**Races.** Because every writer filters on `paymentStatus = pending` and the exact method or version, only one can succeed for an order:

| Race | Outcome |
|---|---|
| Online settle vs cash collected | Different `paymentMethod` values, so both cannot match. A driver cannot collect cash for an order that is still `online` (rejected `METHOD_CHANGED`). |
| Customer switches cash→online vs driver marks cash collected | Both filter on `paymentMethod = cash` and `methodVersion`. Whoever runs first wins. If the switch wins, `cash-collected` fails with `METHOD_CHANGED`, and the driver app tells the driver to return any cash taken. If cash wins, the switch fails with `ALREADY_PAID`. |
| Online settle vs switch online→cash | The switch is rejected while money is in motion (§6.7.12). If the switch wins first, the later capture is unapplied (`REFUNDED_METHOD_CHANGED`) and refunded. |
| Online settle vs amount change, cancel, write-off, or an incident starting | Whichever runs first wins. If the other wins, the captured money is refunded (`REFUNDED_AMOUNT_CHANGED` or `REFUNDED_NOT_PAYABLE`). |
| Cash collected vs a second tap or a retry | The second no longer matches. It returns `ALREADY_PAID` and the same result. |
| Duplicate verify or webhook | The second finds its own recorded attempt (§6.5 step 5.1). |
| Concurrent amount reduction and cancellation | Both are `pending`-filtered. One wins. The loser returns `STATE_CONFLICT`. |

#### 6.7.2 Payment (`Payment.status`)

A **Payment** is one payable target (an order amount, a tip or a fee) tied to **one Razorpay order**. A Razorpay order can have several attempts (§6.7.3). Only the Payment carries the business state. A failed attempt never changes the Payment.

States: `created`, `processing`, `captured`, `expired`, `void`, `flagged`, `partially_refunded`, `refunded`. There is **no** `failed` status.

- **Open** means exactly `created` or `processing`.
- **Uniqueness:** a unique partial index on `(orderId, purpose)` **where `status` is `created` or `processing`**. So at most one open Payment exists per order and purpose. `captured`, `expired`, `void`, `flagged`, `partially_refunded` and `refunded` are outside the index. Because of this, no transition into a non-open state (including `expired → captured`) can cause a duplicate-key conflict. **`expired`, `void` and `flagged` Payments are never reactivated.** Nothing ever moves a Payment back into `created` or `processing` except `processing → created` (a lease released by the same Payment).
- The single-settlement rule for a target does not come from this index. It comes from the target's own linkage (`paidAttemptId`, `tip.attemptId`, `cancellationFee.attemptId`, §6.5).

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `created` | Customer `create-order`, tip or fee create | Payment inserted (the index is the concurrency guard). Razorpay order created and linked (§6.3). |
| `created` | `processing` | System, `S` step 4 takes the lease | Lease fields set |
| `processing` | `created` | System, the lease is released with no settle (an unfinished or failed run) | Lease fields cleared |
| `created`, `processing`, `expired` | `captured` | System, `S` finalization (§6.5 step 7) | `appliedAttemptId`, `paidAt`. Other open Payments for the target are voided. The lease is cleared. |
| `created` | `expired` | System (`create-order` or the expiry job), when `expiresAt` has passed, **after** the captured attempts on it were run through `S` | None. A later capture on it still runs `S`. |
| `created`, `processing`, `expired` | `void` | System, when: the amount changed (`amount_changed`), the method switched to cash (`method_switched`), the order was cancelled, written off or put under an incident (`order_not_payable`), the fee was waived (`fee_waived`), the order was settled another way (`order_settled`), a capture could not be applied (`unapplied_capture`), or Razorpay order creation failed (`razorpay_create_failed`) | For a `processing` Payment: see below |
| `created`, `processing`, `expired` | `flagged` | System, rule M (§6.5.3) | Alert. Shown in the admin list. |
| `captured` | `partially_refunded` | System, when a Refund of its applied attempt becomes `processed` and the total is less than the captured amount | `refundedAmount` updated |
| `captured`, `partially_refunded` | `refunded` | The same, when the total refunded equals the captured amount | |

Terminal: `void`, `flagged`, `refunded`. `captured` and `partially_refunded` are terminal except for refunds.

**Voiding a `processing` Payment.** `processing → void` is allowed. It is done by whichever writer (amount change, cancel, write-off, incident start, another settle) needs the Payment gone, and is safe for these reasons:

1. The writer first succeeds on the **Order** (for example the amount version has already increased). From that moment the old Payment's atomic settle can no longer match, so it cannot settle.
2. Then the writer voids the Payment.
3. The lease holder (or a later reconciliation run) that finds its Payment `void` does not settle. For every `captured` attempt on it, it follows §6.5 step 6: attempt `unapplied`, auto-refund, and never a settle.
4. If the lease holder is dead, the lease expires. The reconciliation job finds `void` Payments with `captured` attempts that have no automatic Refund, and refunds them (§6.14).

A method switch to cash is **rejected** while a Payment is `processing`, so a switch never voids a `processing` Payment (§6.7.12).

**Late capture (the one rule for expiry).** `expiresAt` only closes the checkout window. It never decides whether captured money is accepted. For any captured attempt, whatever the Payment's status:

- **`void` or `flagged`:** never settles. The attempt is unapplied and refunded.
- **`created`, `processing` or `expired`:** the attempt settles **if and only if** the target is still valid for that exact amount and version (§6.5 step 5) and nothing else has already settled it. Otherwise it is unapplied and refunded.

**Expired Payment plus a replacement.** After a Payment expires, `create-order` creates a replacement Payment `P2` (allowed, because `expired` is outside the index). If the old Payment `P1` later captures: `P1` runs `S`. If the target is still valid, the atomic settle succeeds, `P1` moves `expired → captured` (no index conflict, since `captured` is outside the index), and finalization voids `P2` (`order_settled`). If `P2` also captures afterwards, its attempt is a duplicate (step 5.2), unapplied and refunded. If the target is no longer valid, `P1`'s capture is unapplied and refunded, and `P2` proceeds normally. Exactly one settlement can ever happen.

**Tips and fees.** The same index applies to tips and fees (`purpose` is part of the key), so at most one open tip Payment and one open fee Payment exist per order. Their single-settlement guarantees are `Order.tip` and `Order.cancellationFee` (a conditional update only if `tip.status = none` or `cancellationFee.status = pending`). Refunds of a tip or fee update **only** the `tip` or `cancellationFee` sub-document and the Payment, never `Order.paymentStatus`.

#### 6.7.3 PaymentAttempt (`PaymentAttempt.status`)

An attempt is one Razorpay payment (`pay_…`) on a Payment's Razorpay order.

States and rank: `created` (0), `authorized` (1), `failed` (2), `captured` (2), `partially_refunded` (3), `refunded` (4). Status only moves to a higher rank, except that a fetched Razorpay entity is authoritative (a conflict raises an alert).

| From | To | Trigger |
|---|---|---|
| (new) | `created` | First seen, in verify, a webhook, or reconciliation |
| `created` | `authorized` | Razorpay reports it authorized. Nothing is settled. |
| `created`, `authorized` | `failed` | Razorpay reports it failed. Informational. The Payment is unchanged. |
| `created`, `authorized` | `captured` | Razorpay reports it captured. `S` runs. |
| `captured` | `partially_refunded`, `refunded` | Refunds on this attempt become `processed` (§6.13) |

A captured attempt also has a **disposition**: `pending_decision` (captured, `S` not finished), `applied` (it settled its target), or `unapplied` (it could not settle its target and is auto-refunded). Exactly one attempt per target can be `applied` (the one the target records). `refundReservedAmount`, `refundedAmount` and `capturedAmount` are kept on the attempt and are the refund cap (§6.13).

#### 6.7.4 Refund (`Refund.status`)

Two channels: `razorpay` (online payments) and `manual_cash` (cash-paid orders, never sent to Razorpay). States: `pending_approval`, `approval_rejected`, `reserved`, `submitting`, `submitted`, `unknown`, `processed`, `failed`, `cancelled`.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `pending_approval` | Admin or support creates a manual refund needing approval (§6.13.9) | An ApprovalRequest is created. Nothing is reserved. |
| (new) | `reserved` | Automatic, system-decided, or a manual refund that needs no approval | The reservation is made first (a conditional update: `refundReservedAmount + refundedAmount + amount ≤ capturedAmount`, or the cash equivalent on the Order). If the condition fails, the refund is **not created**: manual returns `REFUND_EXCEEDS_REFUNDABLE` (409). Automatic and system-decided create the Refund directly in `failed` with `failureCode = RESERVATION_CONFLICT` and raise an alert. |
| `pending_approval` | `reserved` | Approver approves. The reservation is made then. If it fails, the ApprovalRequest becomes `execution_failed`. | |
| `pending_approval` | `approval_rejected` | Approver rejects | Nothing was reserved |
| `pending_approval` | `cancelled` | The ApprovalRequest expires or the initiator cancels | Nothing was reserved |
| `reserved` | `submitting` | Refund job takes the lease (channel `razorpay`) | `submitStartedAt`, `retryNotBefore = now + quiet period` |
| `reserved` | `processed` | Channel `manual_cash`: finance records the payout reference (`mark-paid`) | Reservation converted to refunded |
| `reserved` | `cancelled` | Channel `manual_cash`: an admin cancels it before it is paid | Reservation released |
| `submitting` | `submitted` | Razorpay accepted the call and returned a refund id | `razorpayRefundId` stored. The API response's own status is ignored. |
| `submitting`, `unknown` | `submitted` | A lookup, a fetch or a `refund.created` event finds the refund at Razorpay, not yet final (§6.13.4, §6.13.6) | `razorpayRefundId` stored |
| `submitting` | `failed` | A **definitive** Razorpay rejection (HTTP 400 or 404 validation errors) | Reservation released. See §6.13.5 for the retry path. |
| `submitting` | `reserved` | A **not-processed** response (HTTP 401, 403, 429) | Backoff and an alert. Safe, because Razorpay did not process it. |
| `submitting` | `unknown` | A timeout, network error, HTTP 5xx or an unparseable response | **Reservation kept.** `retryNotBefore` set. |
| `submitting`, `unknown`, `submitted` | `processed` | `refund.processed` webhook or a fetch shows it processed | Reservation converted to refunded. Effects in §6.13.8. |
| `submitting`, `unknown`, `submitted` | `failed` | `refund.failed` webhook or a fetch shows it failed | Reservation released. See §6.13.5. |
| `unknown` | `submitting` | The unknown-resolution job proves nothing was issued, or an approved admin resolution `confirm_not_issued` (§6.13.4) | `retryCount + 1` |

Terminal: `processed`, `failed`, `approval_rejected`, `cancelled`. `failed` is terminal for that Refund. The retry path creates a **new generation** (§6.13.5), never a reuse. A Refund with `source = external` is created directly in `processed` or `failed` from an event (§6.13.6).

#### 6.7.5 GoodsReturn (`GoodsReturn.status`)

One GoodsReturn per incident (unique on `orderId`). It is created when an incident is created (§6.9). States: `required`, `driver_reported`, `overdue`, `support_review`, `completed`, `closed_loss`, `cancelled`.

**The single authoritative condition for "return completed" is `GoodsReturn.status = completed`.** The driver's responsibility ends only when the status is `completed`, `closed_loss` or `cancelled`.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `required` | System, on incident creation | `dueBy` set. Ledger holds `goods_return:{id}` placed on the order's earnings (§6.16). |
| `required`, `overdue` | `driver_reported` | Driver, `goods-return/driver-report` with a photo, in the vendor's or sender's geofence | `driverReportedAt`. Confirm window starts. |
| `required`, `overdue`, `driver_reported`, `support_review` | `completed` | **Vendor** (goods) or **sender** (package) confirms "received" | Outcome `returned`. Hold released. |
| `driver_reported` | `support_review` | Vendor or sender **declines** or **contests**; or the confirm window elapses with no response (system job) | Support queue |
| `required` | `overdue` | System job, `dueBy` passed | Alert. |
| `overdue` | `support_review` | System job, 24 hours after `dueBy` with no report | Alert. The driver is paused (§6.9). |
| `support_review` | `completed` | Support decision `returned` or `disposed` | Hold released. Vendor or sender recorded. |
| `support_review` | `closed_loss` | Support decision `driver_liable`, `platform_absorbs` or `vendor_absorbs` | Ledger effects by outcome (§6.16) |
| `required`, `overdue`, `driver_reported`, `support_review` | `cancelled` | System, the incident is `withdrawn` | Hold released |

Terminal: `completed`, `closed_loss`, `cancelled`. Only these events **close** a return. A driver report alone (`driver_reported`) never closes it.

**Which events do what.** *Release driver earnings hold:* `completed`, `cancelled`, and `closed_loss` (except for a liability debit). *Trigger support:* decline, contest, no response to a driver report, an overdue return. *Trigger recovery or a loss:* only `closed_loss`, whose `outcome` decides who bears it (§6.16). *Create a loss:* `closed_loss` with `platform_absorbs`, `vendor_absorbs` or `driver_liable`.

#### 6.7.6 DeliveryIncident (`DeliveryIncident.status`)

An incident is created when a driver reports a refusal, or when the customer says "I don't want this order" (§6.9). `origin` is `driver_report` or `customer_request`. States: `provisional`, `under_review`, `upheld`, `overturned`, `withdrawn`.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `provisional` | Driver `refusal`, and all evidence checks pass (§6.9) | Order `activeIncidentId` set. GoodsReturn `required`. Customer notified. Dispute window (24 hours) starts. |
| (new) | `under_review` | Driver `refusal`, and any check failed or is unavailable (attestation, calls, geofence, plausibility, degraded mode) | Same as above, no automatic decision. |
| (new) | `upheld` | Customer `refusal-request` with no driver report yet (`origin = customer_request`) | Finalization (below) |
| `provisional`, `under_review` | `upheld` | Customer `refusal-request` (the customer confirms) | `customerConfirmed = true`. Finalization. |
| `provisional` | `upheld` | System job, the dispute window ended with no dispute | Finalization |
| `provisional` | `under_review` | Customer `dispute`, a support or admin `escalate`, or a system pattern flag | Support queue |
| `under_review` | `upheld` | Support or admin decision (authority in §6.17) | Finalization |
| `under_review` | `overturned` | Support or admin decision | Finalization |
| `provisional`, `under_review` | `withdrawn` | Driver `withdraw` (the customer showed up, and the order is not delivered) | `activeIncidentId` cleared. GoodsReturn `cancelled`. The order continues. |

Terminal: `upheld`, `overturned`, `withdrawn`. A customer `dispute` while `under_review` adds a statement and keeps the status. A customer dispute after a terminal status is rejected.

**Finalization effects.** These run once, in an idempotent finalizer. The order and refund keys make repeats no-ops.

| | `upheld` (the refusal stands; the customer is at fault) | `overturned` (the refusal was invalid) |
|---|---|---|
| **Order payment, unpaid (`pending`)** | W6 write-off, reason `refusal_final` (D3). `Order.status = refused`. | W6 write-off, reason `refusal_overturned`. `Order.status = refusal_overturned`. The customer owes nothing. |
| **Order payment, paid online** | System Refund of the full remaining refundable order amount, identity `sys:{orderId}:order:refusal_upheld:1` (D3). `Order.status = refused`. | System Refund, identity `sys:{orderId}:order:refusal_overturned:1`. `Order.status = refusal_overturned`. |
| **Customer** | `refusedCount + 1` (§6.11). No fee. | No penalty. |
| **Driver** | No strike. The driver earns the delivery share once the goods return is closed (§6.16). | `strikes + 1`. **No earnings** for the order. Any earnings already credited for a paid order are reversed. |
| **Vendor** | Compensated per D3 and the goods-return outcome (§6.16) | Compensated per D3 |
| **Goods return** | Continues. The driver stays responsible until it is closed. | Continues |
| **Customer dispute** | Cannot be opened. It only exists for `provisional` and `under_review`. | n/a |

An incident is never created on an order whose `paidVia = cash`, because the cash was already collected and the goods must be delivered (§6.9). An order that is not payable for another reason (already `not_payable`, `written_off`) cannot have an incident.

#### 6.7.7 FareDispute (`FareDispute.status`)

States: `open`, `rejected`, `reduced`, `withdrawn`. Terminal: `rejected`, `reduced`, `withdrawn`.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `open` | Booking customer `fare-dispute`, within the window (§6.10) | `Order.fareDisputeStatus = open`. Earnings holds `fare_dispute:{id}` placed. |
| `open` | `rejected` | Support or admin decision | Holds released. `disputedRejectedCount + 1` for the customer. |
| `open` | `reduced` | Support or admin decision (needs approval per §6.13.9) | Order `pending`: W4 amount change. Order `paid`: partial refund of the difference (§6.10). Holds released. |
| `open` | `withdrawn` | Customer `withdraw` | Holds released |

#### 6.7.8 ApprovalRequest (`ApprovalRequest.status`)

States: `pending`, `approved`, `executed`, `execution_failed`, `rejected`, `expired`. Terminal: `executed`, `execution_failed`, `rejected`, `expired`.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `pending` | An admin or support user starts an action that needs approval (§6.13.9) | `expiresAt = now + 72h`. Admins are notified. |
| `pending` | `approved` | A **different** admin approves (the initiator can never approve) | Conditional on `pending`. Runs the deferred action once, with the identity `approval:{id}`. |
| `approved` | `executed` | System, the action succeeded | Result stored |
| `approved` | `execution_failed` | System, the action failed deterministically (for example `REFUND_EXCEEDS_REFUNDABLE`, or the target's state changed) | Alert. Admins can start a new request. |
| `pending` | `rejected` | A different admin rejects, with a reason | Nothing happens |
| `pending` | `expired` | System job, `expiresAt` passed | The deferred action is discarded. Any Refund in `pending_approval` becomes `cancelled`. |

#### 6.7.9 Payout (`Payout.status`)

Channels: `razorpayx` (needs `PAYOUTS_ENABLED`) and `manual` (recorded by admins). States: `created`, `submitting`, `unknown`, `queued`, `processing`, `processed`, `failed`, `rejected`, `reversed`. Terminal: `processed` (except a later `reversed`), `failed`, `rejected`, `reversed`.

A Payout is created together with its **reservation** (the ledger entry `payout_reserve:{payoutId}` and the balance move, in one transaction, §6.16). If the balance is short, no Payout is created.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `created` | Owner `POST /payouts/request` (channel `razorpayx`), or admin `POST /admin/payouts/manual` (channel `manual`) | Reservation made (`available -= amount`, `reserved += amount`). The idempotency key is unique per owner. |
| `created` | `submitting` | Payout job takes the lease (channel `razorpayx`) | `submitStartedAt`, `retryNotBefore = now + quiet period` |
| `submitting` | `queued` | RazorpayX accepted and reports queued or pending (for example a low balance) | `razorpayPayoutId` stored |
| `submitting`, `queued` | `processing` | RazorpayX reports initiated or processing | |
| `submitting`, `queued`, `processing` | `processed` | A fetch shows `processed` | Reservation finalized: `payout_settled` (`reserved -= amount`). `utr` stored. |
| `submitting`, `queued`, `processing` | `failed` | A fetch shows `failed` or `cancelled`, or a definitive HTTP 400 on submit | Reservation released (`payout_release`). `failureCode` stored. |
| `submitting`, `queued`, `processing` | `rejected` | A fetch shows `rejected` | Reservation released |
| `submitting` | `created` | A not-processed response (HTTP 401, 403, 429) | Backoff and an alert |
| `submitting` | `unknown` | A timeout, network error, 5xx or unparseable response | **Reservation kept** |
| `unknown` | `submitting` | The resolution job proves no payout exists for the `reference_id` (§11.6), or an approved admin resolution `confirm_not_issued` | `retryCount + 1`, same `reference_id`, same idempotency key |
| `unknown` | `queued`, `processing`, `processed`, `failed`, `rejected` | The resolution job finds the payout at RazorpayX and adopts its state | As above |
| `processed` | `reversed` | A fetch shows `reversed` | `payout_reversal` credit (`available += amount`). Critical alert. |
| `created` | `processed` | Manual channel: an admin records the bank reference (`mark-paid`) | `payout_settled` |
| `created` | `failed` | Manual channel: an admin cancels it (`mark-failed`) | `payout_release` |

Idempotency: `Payout.idempotencyKey` (`Idempotency-Key` header, unique per owner), `reference_id = payoutId` sent to RazorpayX, and the RazorpayX idempotency header carrying the payout id. Webhook replay is a no-op (§6.6.2). Timeout behaviour is in §11.6.

#### 6.7.10 LedgerEntry (`LedgerEntry.status`)

States: `held`, `available`, `voided`. An entry is append-only. It changes only from `held` to `available` (a hold release) or to `voided` (a `voided` entry is offset by a reversal entry, not deleted). Terminal: `available`, `voided`. Entry types and balance effects are in §6.16.

| From | To | Actor and trigger | Side effects |
|---|---|---|---|
| (new) | `held` | System creates an earning, tip, fee-share or driver-delivery-share entry with holds | `LedgerBalance.held += amount` |
| (new) | `available` | System creates any other entry (cash liability, remittance, reversal, liability, compensation, payout entries, adjustments) | The balance moves per type |
| `held` | `available` | System job: every hold on the entry is cleared and `releaseAt` has passed | `held -= amount`, `available += amount` |
| `held`, `available` | `voided` | System, when the source is reversed before use (rare) | An offsetting entry is written in the same transaction |

#### 6.7.11 Delivery OTP (`Order.deliveryOtp.state`)

States: `active`, `locked`, `expired`, `used`. The code is **derived, never stored** (§6.8).

| From | To | Actor and trigger |
|---|---|---|
| (none) | `active` | System, at `picked-up` (goods and package). Seed, version 1 and expiry set. |
| `active` | `locked` | Wrong attempts reach the limit for this version |
| `active` | `expired` | `expiresAt` passed (evaluated lazily on read and by the job) |
| `active`, `locked`, `expired` | `active` | Booking customer `handover-code/regenerate`: version + 1, attempts reset, new expiry, `regenCount + 1`, at most the regeneration limit |
| `active` | `used` | Driver `deliver` with the correct code, and the order is paid |

Terminal: `used`. A `locked` or `expired` code cannot be entered. It is replaced only by regeneration, or the order goes through "deliver without OTP" (§6.8).

#### 6.7.12 Payment method and switching (`Order.paymentMethod`, `Order.methodSwitchRequest`)

**What "payment started" means, and when switching is allowed.** Switching is decided by the state of the Order's Payments and their attempts at Razorpay:

| Situation | Switch online→cash | Switch cash→online |
|---|---|---|
| No Payment exists | Allowed | Allowed |
| A Payment is `created` and it has no attempt, or only `failed` attempts | Allowed. The open Payment is voided (`method_switched`). | n/a (method is cash) |
| A Payment is `created` and has an `authorized` attempt (money in motion) | **Rejected** `PAYMENT_IN_PROGRESS` | n/a |
| A Payment is `processing` (a run holds the lease) | **Rejected** `PAYMENT_IN_PROGRESS` | n/a |
| Any attempt is `captured` | The server runs `S` for it. The order settles online, and the switch returns `ALREADY_PAID`. | n/a |
| `paymentStatus` is not `pending` (paid, refunded, and so on) | **Rejected** `ALREADY_PAID` or `STATE_CONFLICT` | Rejected |
| `payableFromAt` is empty | Allowed (nothing is payable yet, no Payment exists) | Allowed |
| An incident is active | Rejected `ORDER_UNDER_INCIDENT` | Rejected |
| Cash was already collected (`paid`) | n/a | Rejected `ALREADY_PAID` |

Before switching online→cash, the server **fetches from Razorpay the payments of every open Payment's Razorpay order** (the real state, not the internal state) and applies the table. The check and the update are not one atomic step, so a capture landing between them is handled by W3's conditional update plus §6.5 step 5.3 (`REFUNDED_METHOD_CHANGED`, refunded).

**The switch request** (`Order.methodSwitchRequest`): the driver can *request* a switch to cash. It only records a request and notifies the customer. States: `pending`, `confirmed` (the customer's `switch` call carried this request id), `declined` (the customer declined), `expired` (10 minutes passed, D4), `cancelled` (the system, when the order leaves `pending` or an incident starts). Only the booking customer's `switch` call (with the request id) makes the change. The customer can also switch on their own without a driver request. Every switch is logged (who, when, from, to). Repeated switches are flagged (§6.11).

#### 6.7.13 Cross-machine invariants

1. A target has at most one `settledAttemptId`. It is set only by the atomic settle (W1, or the tip or fee settle). A cash settle (W2) records no attempt.
2. A Payment is `captured` only if its `appliedAttemptId` is the target's `settledAttemptId`.
3. Every `captured` attempt is either `applied` (recorded on its target) or `unapplied` with exactly one automatic Refund identity chain (`auto:{razorpayPaymentId}:n`). No captured attempt stays `pending_decision` for longer than the finalizer interval.
4. `Order.paymentStatus = paid` implies `paidVia` is set. If `paidVia = online`, then `paidPaymentId` and `paidAttemptId` are set.
5. An order with `activeIncidentId` set can never move to `paid`, `not_payable`, or a new amount. It moves to `written_off` (or, if paid, is refunded) only through incident finalization.
6. The sum of `refundReservedAmount + refundedAmount` on an attempt never exceeds its `capturedAmount`.
7. `LedgerBalance` always equals the sum of the owner's entries (§6.16).

#### 6.7.14 Supporting state machines

| Machine | States | Transitions |
|---|---|---|
| **HelperExtraHoursRequest** | `pending`, `approved`, `rejected`, `expired` | `pending → approved` or `rejected` by the booking customer. `pending → expired` by the system when `complete-trip` runs, or after 30 minutes. Terminal: all except `pending`. Only `approved` hours are priced into the final amount. |
| **Order.methodSwitchRequest** | `pending`, `confirmed`, `declined`, `expired`, `cancelled` | See §6.7.12. |
| **WebhookEvent** | `received`, `processed`, `failed` | `received → processed` on success. `received → failed` after the last job retry (alert). A duplicate event id is a no-op. |
| **IdempotencyRecord** | `in_progress`, `completed` | `in_progress → completed` when the response is stored. An `in_progress` record older than 2 minutes with no completion is treated as abandoned and may be retried with the same key and body. |
| **PayoutAccount.verificationStatus** | `unverified`, `pending`, `verified`, `failed` | `unverified → pending` on a penny-drop request. `pending → verified` or `failed` from RazorpayX. Any change of bank details sets `unverified` and starts the cooling-off. Payouts need `verified` and an expired cooling-off. |
| **Order.deliveryOtp.state** | See §6.7.11. | |
| **Order.tip.status** | `none`, `paid`, `partially_refunded`, `refunded` | `none → paid` by the tip's atomic settle (§6.5). `paid → partially_refunded → refunded` as Refunds of the tip become `processed` (§6.13.8). It never touches `Order.paymentStatus`. Terminal: `refunded`. |
| **Order.cancellationFee.status** | `none`, `pending`, `paid`, `waived`, `partially_refunded`, `refunded` | `none → pending` in the same update as W5, for an eligible customer cancellation. `pending → paid` by the fee's atomic settle. `pending → waived` by an approved admin waiver. `paid → partially_refunded → refunded` as Refunds become `processed`. Terminal: `waived`, `refunded`. |
| **Order.fareDisputeStatus** | `none`, `open`, `closed` | `none → open` when a FareDispute opens. `open → closed` when it becomes `rejected`, `reduced` or `withdrawn` (§6.7.7). |
| **User.trustLevel** | `new`, `established`, `limited`, `blocked` | `new → established` at 3 paid orders. `new` or `established → limited` at 2 upheld refusals in 90 days, and `limited → blocked` at 3 (§6.11). An admin can set any level (`PUT /admin/users/:id/payment-limits`). |
| **Driver.cashPaused** | `false`, `true` | Set by the `cash-exposure` job when cash exposure reaches the limit. Cleared when it falls below (§6.16). |
| **Driver.pausedForReturns** | `false`, `true` | Set when a return is `overdue` beyond 24 hours or the driver has 3 open returns. Cleared when none remain (§6.9). |

### 6.8 Handover, delivery OTP, cash and package payment

**Goods (food, meat, store) and packages: the "Delivered" rule.** `POST /orders/:id/deliver` succeeds only when **all** are true: `paymentStatus` is `paid` or `partially_refunded` (any `paidVia`), `arrivedAt` is set with `arrivedStage = drop`, `activeIncidentId` is empty, and the delivery OTP is correct (or the fallback below). The server enforces this. The driver app only mirrors it.

**Delivery OTP.**

- **This OTP only confirms that goods were handed over.** It is a handover code, not a login, not a payment authorisation, and it can't be used to pay, to view or create a payment, or to open any order or payment session. The receiver never logs in and never pays online.
- **Format and secure storage.** The code is **4 decimal digits, derived and never stored**: `HMAC_SHA256(OTP_SERVER_SECRET, orderId | otpSeed | version)` reduced to 4 digits. The Order stores only the random per-order `otpSeed`, `version`, `state`, `expiresAt`, `attempts`, `regenCount`, `smsSendCount` and `verifiedAt`. No code and no hash of the code is stored anywhere, so a database leak reveals no codes and allows no offline guessing (the server secret is not in the database). The code is never logged.
- **Lifecycle** (states in §6.7.11):
  - created at `picked-up` (`active`, version 1, expiry default 6 hours, D4)
  - **wrong attempts:** at most 5 per version (`attempts`, atomic counter). The 5th wrong attempt sets `locked`. Locking is per version.
  - **expiry:** `expired` when `expiresAt` passes
  - **regeneration:** `POST /orders/:id/handover-code/regenerate` by the booking customer creates a new version (new code, attempts reset, new expiry) and invalidates the old code. At most 3 regenerations per order. It works from `active`, `locked` or `expired`. Regeneration does not send an SMS by itself.
  - **used:** the correct code on a paid order sets `used` and `verifiedAt`
- **Who sees the code.** The booking customer, always, through `GET /orders/:id/handover-code` (only after `pickedUpAt`, never after `used`) and a push at `picked-up`. The code is shown in notifications only to the booking customer's own device.
- **Rate limits.** A driver can make 30 code verifications per hour, and an IP 60 per hour, on top of the per-order limit (D4).
- **Verification.** The driver enters the code. The server recomputes and compares it in constant time. A wrong code is never accepted, and it consumes an attempt.
- **Fallback: "Deliver without OTP".** It shares the evidence infrastructure of the refusal flow, so it exists only when `REFUSAL_FLOW_ENABLED` (before P3, a locked or expired code is resolved by the customer's regeneration or by the existing support process). Allowed only when the OTP is `locked` or `expired` (or the 3 regenerations are used), the customer cannot be reached, and: `arrivedStage = drop`, at least 5 minutes have passed since `arrivedAt`, a `drop` photo Evidence exists, and `ATTESTATION_MODE` allows it (`enforce` requires a passed attestation, otherwise `ATTESTATION_REQUIRED`). It does **not** skip payment. It sets `deliveredWithoutOtp = true`, raises an audit entry and an admin flag, and places a 48-hour ledger hold on the driver's earnings for the order (`no_otp_review`). A customer who did not receive the order reports it through the existing support tickets (category `delivery_not_received`, linked to the order), and support reviews it.

**SMS: exactly who receives what.** SMS is used in **two** places only:

1. The existing **login OTP**, to the account's own phone (unchanged by this plan).
2. The **package handover code**, to the receiver phone number given at booking (`Order.receiverPhone`), only when `SMS_ENABLED`. One message is sent automatically at `picked-up` (it counts as one of the 3 per order). The booking customer can trigger more with `POST /orders/:id/handover-code/send-sms`. SMS sends are capped at 3 per order and 5 per receiver phone per 24 hours, and go only to that stored number. The message language is the booking customer's saved language (English if none). It contains the code and an order reference only. It has no payment information and no link.

**Nothing else is sent by SMS.** Booking confirmations, payment notices, reminders, refund notices and dispute notices go **only to the booking customer** as push notifications and in-app messages. The receiver receives no other message of any kind. **If SMS is not available** (`SMS_ENABLED = false`, D7): the booking customer's app shows the code (and the customer passes it to the receiver), and the driver app shows "Ask the customer or the receiver for the code".

**Package delivery, complete flow (D1):**

| Question | Rule |
|---|---|
| Who is the payer of record? | Always the booking customer, for the order, tip and fee. |
| When is it payable? | `at_pickup`: after `arrive` at pickup. `at_drop`: after `picked-up`. (§6.2) |
| Booking customer chose **Online** | The booking customer pays from their own app once payable (`create-order`, §6.3). The receiver can pay nothing online. There is no receiver login, payment link, payment session or payment OTP. |
| Booking customer chose **Cash** | At the enforcement point the driver collects cash from whoever hands it over (the sender at pickup, the receiver at drop) and taps "Cash collected". The driver selects `cashCollectedFrom` (`customer` or `receiver`). The server records it as cash collected **on behalf of the booking customer's order**. |
| Who confirms the cash collection? | The driver (W2). The booking customer is notified at once ("₹X cash was collected by your driver") and can dispute through support within 48 hours. |
| The receiver refuses to pay cash at drop | The goods cannot be delivered unpaid. The driver reports a refusal with reason `payment_refused` (§6.9), and the package goes back to the sender. |
| Online was chosen, the customer is unreachable, the receiver offers cash | The driver taps "Request switch to cash". The customer must confirm in their app within 10 minutes (§6.7.12). If they do not, the request expires and the driver either keeps waiting or reports `unreachable` (§6.9). |
| The customer switches to cash | Allowed while no money is in motion (§6.7.12). The payer of record does not change. Whoever meets the driver at the enforcement point hands over the cash. |
| The customer switches to online after cash was offered | Allowed until cash is collected. If the driver already took cash physically but the collect was rejected (`METHOD_CHANGED`), the driver app tells the driver to return it. |

**Cash collection.**

- The driver taps "Cash collected". The request carries only the order id and the `methodVersion` and `amountVersion` the driver app was showing. The **amount is always the Order's `payableAmount`**. The driver never sends an amount.
- **Arrival rule for cash (part of W2).** For goods and packages, `arrivedStage` must be `drop`, except for a package with `paymentTiming = at_pickup`, where it must be `pickup`. Rides and helpers need only `payableFromAt` (trip end).
- W2 (§6.7.1) is the single conditional update. On success the ledger records the driver's `cash_liability` for `payableAmount` and the earnings entries (§6.16). The customer is notified.
- If the amount or method changed, the server returns `AMOUNT_CHANGED` or `METHOD_CHANGED` and the driver app refreshes.
- The driver's cash exposure is capped (§6.16). At the cap the driver receives no new cash orders.

### 6.9 Refused or unreachable deliveries, and the goods afterwards

A driver's claim alone is never enough to *decide* a refusal, and a refusal never ends the driver's responsibility for the goods. Everything below applies only when `REFUSAL_FLOW_ENABLED`.

**Two ways an incident starts** (state machine §6.7.6):

1. **Customer request (strongest evidence).** The booking customer taps "I don't want this order" while the order is out for delivery: `POST /orders/:id/refusal-request`. It creates an incident with `origin = customer_request` directly as `upheld` (or turns an existing `provisional` or `under_review` incident into `upheld`, with `customerConfirmed = true`). No driver evidence is needed, because the customer's own authenticated action is the evidence. The driver app is told and the goods-return task starts.
2. **Driver report.** `POST /orders/:id/refusal`, described next.

**Driver report: `POST /orders/:id/refusal`.** The endpoint **always creates an incident** when its hard preconditions hold, and never rejects because evidence is weak. Weak evidence produces an `under_review` incident that support decides. This removes any conflict between rejecting a report and needing to review it.

*Hard preconditions (the report is rejected and no incident exists):*

- the driver is assigned and the service is goods or package
- `pickedUpAt` is set, `deliveredAt` is empty, and `arrivedAt` is set with `arrivedStage = drop`
- at least the minimum wait (default 10 minutes) has passed since `arrivedAt` (`TOO_EARLY`)
- `paymentStatus` is `pending`, or `paid` or `partially_refunded` with `paidVia = online`. **Not** cash-paid or zero-amount orders: once cash is collected the goods must be delivered, and a dispute after that goes to support tickets.
- no active or terminal incident exists on the order
- the reason is one of `customer_refused`, `unreachable`, `wrong_address`, `payment_refused`, `other` (`other` needs a note)
- the delivery OTP has not been verified (`used`)

*Evidence checks (computed by the server, never trusted from the app). Every check is recorded on the incident with a pass, fail or unavailable result:*

| Check | What the server verifies |
|---|---|
| **Arrival** | `arrivalGeofence = inside` (the driver's server-side GPS record put them inside the drop geofence, default 100 m, when they tapped Arrived) |
| **Stayed** | The stored pings stayed inside the geofence for the wait period (default 10 minutes from `arrivedAt`) |
| **Customer notified** | The server sent the customer a push at arrival and another at the halfway point, and stored the results |
| **Calls** | At least 2 in-app call attempts, at least 3 minutes apart, logged by the server (`CallAttempt`). Result `not_available` when `CALL_LOGGING_ENABLED = false`. |
| **Photo** | At least one `drop` Evidence photo taken in the app, with server time and GPS position |
| **Attestation** | The arrival and evidence submissions carry a passed device attestation and no mock-location flag (see below) |
| **Plausibility** | No impossible speeds or jumps in the GPS trace, acceptable accuracy, no long gaps in pings, and evidence times that fit the server's own timeline |

**The result.** If **every** check passed (calls included, so `CALL_LOGGING_ENABLED` must be true and the driver must not be on the refusal-approval list), the incident is created `provisional`. **Otherwise it is created `under_review`**, with `failedChecks` listing what failed or was unavailable.

**Device attestation and arrival, exactly.** `arrive` **never rejects** because of attestation or geofence. It always records `arrivedAt`, the geofence result, and the attestation result (`passed`, `failed` or `unavailable`, where a mock-location flag counts as `failed`). What attestation changes depends on `ATTESTATION_MODE`:

| Mode | Attestation result | Effect |
|---|---|---|
| `enforce` | `passed` | The incident can be `provisional`. "Deliver without OTP" is allowed. |
| `enforce` | `failed` or `unavailable` | The incident is `under_review`. "Deliver without OTP" is rejected (`ATTESTATION_REQUIRED`). |
| `report_only` | `passed` | The incident can be `provisional`. |
| `report_only` | `failed` or `unavailable` | The incident is `under_review`. "Deliver without OTP" is allowed and flagged. |
| `off` | not requested | Every incident is `under_review`. "Deliver without OTP" is allowed and flagged. |

**What happens on creation.** The Order gets `activeIncidentId`. From this moment the order **cannot be paid** (online or cash), cancelled, switched or repriced (§6.7.1 filters). A `GoodsReturn` is created as `required` (below). Ledger holds are placed on the order's earnings (§6.16). The customer is notified and has the **24-hour dispute window** (`provisional` only). The driver app shows the return task with its deadline.

**Dispute handling.**

- A customer dispute (`POST /delivery-incidents/:id/dispute`) moves `provisional → under_review`. In `under_review` it only adds the customer's statement.
- Support sees the full evidence: GPS trace, call log, photos, notifications sent and delivered, OTP attempts, attestation results, and the customer's app activity. Reads of evidence are audited (§6.19).
- The decision is `upheld` or `overturned`, with a reason and the reviewer recorded.
- An incident that stays `provisional` to the end of the window becomes `upheld` (system job).
- Decision authority: `support` may decide when the order's `payableAmount` is under the approval threshold (§6.13.9) and no liability is set. Anything larger, or any decision that sets `driverLiability`, is decided by an admin. Support can `escalate` a case to the admin queue.

**Withdrawal.** If the customer shows up, the driver taps "Withdraw" (`POST /delivery-incidents/:id/withdraw`). The incident becomes `withdrawn`, `activeIncidentId` is cleared, the goods return is `cancelled`, and the driver continues with normal delivery.

**Terminal effects** are in the finalization table in §6.7.6. In short: an unpaid order is written off (both outcomes); a paid-online order is fully refunded (both outcomes, D3); the customer's `refusedCount` rises only on `upheld`; the driver gets a strike only on `overturned`.

**Goods after a refusal (D6).** The goods **remain in the driver's custody** and must be returned. This is enforced by the server, not left to trust.

- **Who returns what, and to whom:** food, meat and store go back to the **vendor** they were collected from. A package goes back to the **sender's pickup address**, confirmed by the booking customer (the sender) in their app.
- **Return deadline:** `dueBy` = incident creation + 120 minutes for food, meat and store, and + 24 hours for packages (D4).
- **The state machine** is §6.7.5. **Return completed = `GoodsReturn.status = completed`.** It is reached only by (a) the vendor or sender confirming, or (b) a support decision `returned` or `disposed`.
- **Driver report of the return:** with a photo, taken inside the vendor's or sender's geofence, with attestation. It moves the return to `driver_reported`. It does **not** close it. The vendor or sender has a confirm window (default 60 minutes for goods, 12 hours for packages). A vendor or sender can **confirm**, **decline** (perishable food they won't take back) or **contest** (says the goods weren't returned). Decline or contest, or no response, moves it to `support_review`.
- **Support outcomes** (`POST /admin/orders/:id/goods-return/decision`): `returned`, `disposed` (vendor disposed of perishables with support approval), `driver_liable`, `platform_absorbs`, `vendor_absorbs`. `support` may decide `returned` and `disposed`. The loss outcomes are money actions and are decided by an admin (§6.13.9).
- **The driver stays responsible until the return is `completed`, `closed_loss` or `cancelled`.** Until then:
  - the driver's earnings for that order are held, and no delivery share is paid out (§6.16)
  - if `dueBy` passes, the return becomes `overdue`, and an alert fires
  - if it stays `overdue` for 24 hours it moves to `support_review` and the driver is **paused** from new orders (`pausedForReturns`) until it is resolved. A driver with 3 or more open returns (`required` or `overdue`) is also paused.
  - `driver_liable` debits the driver's ledger by the items subtotal (capped there) (§6.16)
- **Vendor compensation and driver delivery share** are decided by the rules in §6.16 and §15.2 (D3, D6). They are created only when **both** the incident is terminal and the return is closed. Neither is paid out earlier.

**Controls against spoofed evidence.** GPS, photos and call starts come from the driver's device, so the plan does not treat them as certain:

- **Device attestation** (per the mode table above) and mock-location detection
- **Plausibility checks** on the GPS trace and timeline
- **Photo checks:** in-app camera only, server timestamp, stored hash, detection of the same photo reused across orders
- **Independent signals:** the customer's notification results, the customer's own "I don't want this order" action, and the vendor's or sender's return confirmation
- **Residual risk (accepted, not eliminated).** A determined driver with a compromised device could fake location or evidence. The plan limits the damage with `under_review` for anything weak, the return-confirmation requirement, earnings holds and liability, pattern flags, the customer's dispute window and support review. It does not claim to prevent it entirely.

**Suspicious patterns are flagged automatically** (a system job creates an alert and moves a `provisional` incident to `under_review`):

- a driver's refusal rate above a threshold, or well above the median of drivers in the same zone (the driver is then put on the refusal-approval list, so all their incidents are `under_review`)
- refusals that only barely met the wait time, or whose pings only just stayed in the geofence
- refusals with no customer notification delivered, or with a customer who was active in the app during the wait
- a high share of `overturned` incidents for a driver
- the same driver and vendor pair appearing repeatedly
- failed attestations, mock-location flags or reused photos
- goods returns that are repeatedly late, declined or driver-reported only
- a customer with many disputed or overturned incidents

**Audit.** Every incident stores all evidence and check results, the attestation results, server versus device timestamps, the driver and customer ids, status history, the goods-return history, the reviewer and the decision.

### 6.10 Rides, helpers, cancellations by others, and fare disputes

**Ride price supplement and helper offer (the only customer-chosen fare inputs).**

- **Rides ("add more").** While searching for a driver, the customer can add a **supplement** to the fare (`POST /orders/:id/increase-price`). Only the order owner, only upwards (a new value greater than the current supplement), only before a driver accepts, capped at 100% of the estimate (D4), and logged with old and new values. **The final ride fare = the metered fare + the supplement**, both computed and locked by the server at trip end.
- **Helpers.** The offer must be at least the server minimum (per hour and per task type). The customer can raise it, only upwards, before a helper accepts, capped at 2× the first offer. **Final helper amount = agreed offer + approved extra hours × the agreed hourly rate**, where the hourly rate is the agreed offer divided by the booked hours.

**Final amount.**

- `POST /orders/:id/complete-trip` (assigned driver) makes the server calculate the final amount from route, GPS and time data, lock it (`amountVersion = 1`), set `tripEndedAt` and `payableFromAt`, and mark pending extra-hours requests `expired`.
- Helper extra hours are added only after the customer approves them in the app (`helper-extra-hours` endpoints, §6.17).

**Driver cancellation is a re-dispatch, not an order cancellation.** `POST /orders/:id/driver-cancel` is allowed only before `pickedUpAt` (or `tripStartedAt` for rides and helpers), while `paymentStatus = pending`, and with no active incident. It clears the driver, `driverAssignedAt` and any recorded arrival, and clears `payableFromAt` if it was set by an `at_pickup` arrival (voiding any open Payment, `order_not_payable`, so a late capture is refunded). It puts the order back into dispatch, records a driver cancellation statistic, and **never** charges the customer a fee. After the point of no return, the driver must complete the job or use the refusal flow or support. If dispatch finds no driver within the timeout, the system cancels the order (below).

**System cancellation** (job `system-cancel`, §6.14) uses W5 with `cancelledBy = system` and never a fee: `no_driver_found` (no driver assigned within the timeout since placement or since the driver cancelled) and `vendor_no_response` (a vendor did not accept within the timeout), defaults in §15.2.

**Vendor cancellation** (`cancel-by-vendor`) uses W5 with `cancelledBy = vendor` and never a fee.

**Contested final fares (`FareDispute`, §6.7.7).**

- The customer can open a **fare dispute** from the trip receipt, for a ride or helper task, within 48 hours of `tripEndedAt`, whether or not they have paid. One dispute per order.
- The `FareDispute` records the order, the customer, a reason, and the amount they think is right (a note only, never used as an amount).
- **While a dispute is `open`:** the fare stays locked, and the customer can still pay it. If unpaid, it does not block new bookings for the review period (7 days), it still counts toward the unpaid-balance cap, and reminders are paused (§6.11). Earnings from the order are held (§6.16).
- **Support decides** using the stored trip evidence. Outcomes: `rejected` (the fare stands) or `reduced` with a new amount (lower than the current amount) and a mandatory reason. A reduction is a money action and follows the approval rules in §6.13.9.
- **If reduced and unpaid (`pending`):** W4 lowers the amount (`amountVersion` rises, open Payments are voided).
- **If reduced and paid:** the difference (`paid amount − new amount`) is refunded as a partial refund with the identity `sys:{orderId}:order:fare_reduction:{disputeId}:1`. Online payments are refunded through Razorpay. Cash payments use a manual cash refund (§6.13.10). The amount does not change on a paid order.
- The driver's earnings on the order are reduced in proportion (§6.16).
- Disputes decided `rejected` repeatedly are counted against the account (T29).

### 6.11 Pay-later risk controls

Because no money is taken up front, the platform needs protection against unpaid orders. These are the **exact counting rules**. The unpaid-order block, the unpaid-balance cap and the reminders all use this table and nothing else.

"Completed" means `deliveredAt` (goods and package) or `tripEndedAt` (rides and helpers) is set.

| Order or item state | `paymentStatus` | Blocks new bookings | Counts toward the unpaid-balance cap | Gets reminders |
|---|---|---|---|---|
| Completed, unpaid, no open fare dispute | `pending` | **Yes** | **Yes** | **Yes** |
| Completed, unpaid, with an **open** fare dispute | `pending` | No, during the review period (7 days). After it, the row above applies. | **Yes** | Paused |
| Not completed (in progress, including payable) | `pending` | No (the app shows "Pay ₹X") | No | No |
| Active incident (`provisional` or `under_review`) | `pending` | No | No | No |
| Cancelled | `not_payable` | No | No | No |
| Refusal final (`upheld`) or overturned, closed by the platform | `written_off` | No | No | No |
| Paid, or partially or fully refunded | `paid`, `partially_refunded`, `refunded` | No | No | No |
| Cancellation fee unpaid (only when `CANCELLATION_FEES_ENABLED`) | fee `pending` | **Yes** | **Yes** | **Yes** |
| Cancellation fee paid, waived, or refunded | fee `paid`, `waived`, `partially_refunded`, `refunded` | No | No | No |

Controls:

- **Unpaid orders and fees:** a customer with a counted unpaid order, or a counted unpaid cancellation fee, can't place a new booking until it is paid or written off. The app shows "Pay pending ₹X" for counted items, and the server sends push reminders.
- **Final refusals:** `User.refusedCount` counts `upheld` incidents in the last 90 days. At 2, the customer is limited to a lower order value (D4). At 3, the customer is blocked pending admin review (`trustLevel = limited` and `blocked`, changed through `PUT /admin/users/:id/payment-limits`).
- **New account limits:** `trustLevel = new` (fewer than 3 paid orders) has a lower maximum order value, maximum open orders and unpaid-balance cap. The values rise at `established` (D4).
- **Unpaid-balance cap:** the sum of counted unpaid amounts (from the table above). At the cap, new bookings are blocked.
- **Vendor and driver losses on refused orders:** decided by D3 and D6 and recorded in the ledger (§6.16).
- **Payment timing:** "Pay ₹X" appears from `payableFromAt`, so most goods customers pay before the driver arrives.
- **Repeated method switches:** flag an order with 3 or more switches, and a driver whose orders show 5 or more switches per day.

**Accepted risk: unpaid rides and helper tasks (D2).**

- A ride or helper task is already delivered when the customer pays. The platform can't hold the service back.
- The plan accepts this risk, limited by: the unpaid-balance block and cap, phone-number verification, reminders, and the "no new booking until paid" rule.
- **Residual exposure:** a person who uses a new phone number can take one ride or helper task, up to the new-account cap, without paying. The loss per fraud attempt is bounded by that cap and monitored (§6.19).
- **Stronger protection, not in this plan:** a card or UPI pre-authorisation or mandate before the trip.

### 6.12 Payment status, pending summary and public config

- **`GET /api/v1/payments/status/:orderId`** (booking customer): optional `purpose` (`order`, `tip` or `cancellation_fee`, default `order`). Returns the order `paymentStatus`, the open Payment's state mapped to a result code (`CONFIRMING` when `processing` or an attempt is `authorized`), whether the order is payable, and the amount currently due. No Razorpay ids or secrets. The app uses it when the customer has paid but verify failed (for example a network drop), and as the fallback for socket events.
- **`GET /api/v1/me/pending-payments`** (customer): the counted unpaid orders and fees (§6.11) with amounts, the unpaid balance and the cap, for the "Pay pending" banner.
- **`GET /api/v1/payments/tip/limits/:orderId`** (booking customer): the tip minimum, maximum and remaining window for that order, and whether a tip is allowed.
- **`GET /api/v1/config/payments`** (any authenticated user): the flags the apps need (`onlineEnabled`, `tipsEnabled`, `feesEnabled`, `smsEnabled`, `payoutsEnabled`, `refusalEnabled`). No secrets.

### 6.13 Refunds and approvals

#### 6.13.1 When refunds happen

- money that captured but can't be applied (an unapplied capture: duplicate, stale amount, voided or flagged Payment, order not payable) — automatic
- an incident finalized on a paid-online order (§6.7.6) — system-decided
- a fare reduction on a paid order (§6.10) — system-decided after approval
- missing or wrong items, and other support decisions — manual (admin)
- cash-paid orders that need a refund — manual cash refund (§6.13.10)

Refunds are created only by the backend, automatically or through admin and support endpoints gated by `authorizeRole` (§6.17). Customers, drivers and vendors cannot create them.

#### 6.13.2 Channels and deterministic identities

Refunds are per Razorpay payment (attempt) for online payments, and per order for cash. `Refund.idempotencyKey` is unique. There is **one deterministic identity per operation**, and the patterns never overlap:

| Kind | `source` | Refunds what | Identity (`idempotencyKey`) |
|---|---|---|---|
| **Unapplied capture** | `auto` | The full captured amount of an **unapplied** attempt | `auto:{razorpayPaymentId}:{generation}` — **one identity per captured attempt**, whatever the cause. The cause is stored (`cause`, and any later different causes are appended to `causeLog`). A second code path that reaches the same attempt finds the same Refund. |
| **System-decided** | `system` | An **applied** payment, after an incident finalization or an approved fare reduction | `sys:{orderId}:{purpose}:{cause}:{generation}` |
| **Manual** | `admin` | An **applied** attempt (Razorpay) | `adm:{Idempotency-Key}` (per confirmation dialog) |
| **Manual cash** | `admin` | A cash-paid order | `adm:{Idempotency-Key}` |
| **External** | `external` | Recorded, not requested (a refund made in the Razorpay dashboard) | `ext:{razorpayRefundId}` |

Because an automatic refund always targets an **unapplied** attempt and a manual or system refund always targets an **applied** one, an attempt never has an automatic and a manual refund at the same time. The reservation cap (below) protects the remaining cases.

#### 6.13.3 Reservation and caps

- **Razorpay refunds.** Each captured attempt stores `capturedAmount`, `refundReservedAmount` (Refunds in `reserved`, `submitting`, `submitted`, `unknown`) and `refundedAmount` (Refunds `processed`). **Reserve first, then call:** one conditional update on the attempt, `refundReservedAmount + refundedAmount + amount ≤ capturedAmount`, adds the amount to `refundReservedAmount`. If the condition fails, no Refund is created (manual: `REFUND_EXCEEDS_REFUNDABLE`; automatic and system: a `failed` Refund with `RESERVATION_CONFLICT` and an alert).
- **Cash refunds.** The Order stores `cashCollectedAmount`, `cashRefundReserved` and `cashRefundedAmount`, with the same conditional-update cap.
- The reservation is released **only** when the Refund becomes `failed`, `approval_rejected` or `cancelled`. A timeout, network error or unclear response never releases it.

#### 6.13.4 Submission (Razorpay channel) and unknown outcomes

Queue job `refund-submit` (one job per Refund):

1. Take a lease on the Refund (`reserved → submitting`, sets `submitStartedAt` and `retryNotBefore = now + 10 minutes`, D4). One call at a time per Refund.
2. Call Razorpay's refund API with the amount, `receipt = Refund id`, and `notes = { refundId, orderId, cause }`.
3. Classify the outcome:
   - **Accepted** (2xx with a refund id): store `razorpayRefundId`, move to `submitted`. **The API response's own status is ignored.** A `refund-poll` job fetches the refund after 1 minute as a safety net.
   - **Definitive rejection** (HTTP 400 or 404): move to `failed`, release the reservation, and follow §6.13.5.
   - **Not processed** (HTTP 401, 403, 429): back to `reserved` with backoff and an alert. Razorpay did not process it.
   - **Unknown** (timeout, network error, HTTP 5xx, unparseable response): move to `unknown`. **The reservation is kept.**

**Resolving an `unknown` Refund** (job `refund-resolve`, only after `retryNotBefore`, which is far longer than the HTTP timeout):

1. Fetch the payment and list its refunds from Razorpay. Let `A` be the payment's `amount_refunded` at Razorpay. Let `known` be the sum of this attempt's Refunds that have a `razorpayRefundId` and are `submitted` or `processed`, including external ones.
2. If the list contains a refund whose `receipt` or `notes.refundId` equals this Refund's id: **adopt it** (set `razorpayRefundId`, and the status from the fetched refund: `processed`, `failed` or `submitted`).
3. Else if `A == known` (Razorpay holds no refund we have not accounted for): nothing was issued. Move back to `submitting` (`retryCount + 1`) and call again with the same `receipt` and notes. The re-call is bounded by the reservation cap and by Razorpay's own refundable balance.
4. Else (`A > known`: an unaccounted refund exists, possibly ours without metadata, or external): **do not call again.** Keep `unknown`, raise a critical alert, and require an admin resolution through `POST /admin/refunds/:id/resolve` (approval always required, §6.13.9). The admin either adopts a specific Razorpay refund id, or confirms nothing was issued.
5. After 24 hours in `unknown`, a page alert fires. The reservation stays until resolved.

This guarantees that **a timeout never causes a second refund request while the first may still be in flight**: a re-call happens only after a quiet period and a lookup that proves Razorpay's refunded total equals what we know.

#### 6.13.5 Definitive failure: the retry path

A `failed` Refund is terminal and its reservation is released. The path forward depends on the kind:

- **Automatic (`auto:`) and system-decided (`sys:`)**, when Razorpay reports the refund `failed` (a `refund.failed` event or fetch): the job `refund-reissue` creates the **next generation** (`generation + 1`, so a new deterministic identity) for the same amount, up to 3 generations. After the third failure, the Refund is flagged `needsReview` and an admin is alerted.
- **Automatic or system-decided, when the failure is a definitive API rejection (HTTP 400, 404):** it is not retried automatically. It is flagged `needsReview` and an admin is alerted. An admin uses `POST /admin/refunds/:id/reissue` (audited, idempotent, no approval, because the customer is owed the money) to create the next generation once the cause is fixed.
- **Manual (`adm:`)**: no automatic retry. The admin starts a new manual refund from a new confirmation dialog (a new key). The failed Refund stays as history.

The captured money of an unapplied attempt is therefore never left unrefunded without an alert and a defined action.

#### 6.13.6 Webhook correlation, replay and external refunds

For `refund.created`, `refund.processed` and `refund.failed`, the worker correlates the event's refund to an internal Refund in this order:

1. `razorpayRefundId` equals the event's refund id.
2. `notes.refundId` or `receipt` equals a Refund id. Then store `razorpayRefundId` on that Refund.
3. No match: create a Refund with `source = external`, `razorpayRefundId`, the amount, the attempt (from the payment id) and the status from the event.

Then apply the transition (§6.7.4). Specific cases:

| Case | Behaviour |
|---|---|
| Refund succeeded but the API response was lost | The webhook or fetch correlates it (step 2) and moves `submitting` or `unknown` to `processed`. |
| Webhook arrives **before** the internal API response | Correlation by `notes.refundId` moves `submitting → processed`. The API response, arriving later, updates only a Refund still in `submitting`, so it is discarded. |
| Webhook arrives **after** an internal retry | The retry used the same `receipt` and notes. The event correlates to the same Refund. Because §6.13.4 step 3 re-calls only when Razorpay held no refund, two refunds cannot exist. If two ever do, the second is recorded as `external` and over-refund handling applies. |
| The same event is replayed | `WebhookEvent` dedupes it. A different event id for the same refund and the same final state is a no-op. |
| `refund.failed` after the Refund is `processed` | Ignored, with a critical alert (an invariant violation). |

**External refunds.** An external Refund adds its amount to the attempt's `refundedAmount` even if that exceeds the cap (the money has already moved). If `refundReservedAmount + refundedAmount > capturedAmount`, the attempt is marked `overRefunded` and a critical alert fires. Then the order-level effects follow (§6.13.8). External refunds appear in the admin list. The **daily comparison** (§6.14) lists Razorpay refunds for recent captured payments and records any the webhook missed.

#### 6.13.7 Manual refund idempotency

Manual refunds require the `Idempotency-Key` header, generated in the admin UI each time the confirmation dialog opens. A double click or a retry reuses the key. The same key with the same body returns the stored result (no second Refund, no second Razorpay call). The same key with a different body returns `IDEMPOTENCY_MISMATCH`. A new dialog produces a new key. `Refund.idempotencyKey` (`adm:{key}`) is unique as a second guard.

#### 6.13.8 Effects when a Refund becomes `processed`

| Refund concerns | Effects |
|---|---|
| Any Razorpay refund | Attempt: `refundReservedAmount −= x`, `refundedAmount += x`, status `partially_refunded` or `refunded`. |
| An **applied** order payment | Payment: `refundedAmount`, status `partially_refunded` or `refunded`. W7 on the Order (`orderRefundedAmount`, `paymentStatus`). Ledger reversal (§6.16). The customer is notified. |
| An applied **tip** | Payment as above. `Order.tip.refundedAmount` and `tip.status` (`partially_refunded`, `refunded`). Ledger reversal on the driver. **`Order.paymentStatus` is not touched.** |
| An applied **cancellation fee** | Payment as above. `Order.cancellationFee.refundedAmount` and `status` (`partially_refunded`, `refunded`). Ledger reversal of the fee shares. **`Order.paymentStatus` is not touched.** |
| An **unapplied** attempt (automatic) | Attempt `refunded`. No Payment, Order or ledger effect (nothing was ever applied). |
| A **cash** refund | `Order.cashRefundReserved −= x`, `cashRefundedAmount += x`. W7. Ledger reversal. Notification. |

A partial refund is a Refund for less than the remaining refundable amount, with a required reason. A full refund equals it. Several partial refunds are allowed up to the cap.

#### 6.13.9 Approvals and authorization (D9)

Money-moving admin actions and their **amount `A`**: manual refund (the refund amount), fee waiver (the fee), write-off (the order's payable amount), fare reduction (the difference), an incident decision that triggers a write-off or refund (the order's payable amount), a goods-return decision with a loss outcome (the items subtotal), manual ledger adjustment, manual payout, and unknown-refund or unknown-payout resolution.

**Rule (Implementation default — requires product-owner confirmation before production):**

- **`support` can only initiate.** Every money-moving action started by `support` creates an `ApprovalRequest`.
- **`admin`** executes immediately only if `A` is **below ₹500** *and* the admin's own executed total in the last 24 hours plus `A` is at most **₹5,000**. Otherwise it creates an `ApprovalRequest`.
- **Always approval, whatever the amount:** unknown-refund and unknown-payout resolution, manual payouts, and manual ledger adjustments.
- The **approver must be an `admin` and a different user** than the initiator. One approver is enough.
- Approving runs the deferred action once, under the identity `approval:{id}`, and moves the request to `executed` (or `execution_failed`, §6.7.8).
- **Automatic refunds** (unapplied captures) and **system-decided refunds** (after an already-approved decision) need no further approval. Each writes an audit entry, and unusual volumes raise an alert.
- Every initiation, approval, rejection and execution is audited with both users recorded.

#### 6.13.10 Cash refunds

A cash-paid order (`paidVia = cash`) can need a refund (a fare reduction, a missing item, a support decision). Razorpay is **never** called for a cash refund, and RazorpayX is never used for it.

- The admin creates it with `POST /admin/orders/:id/cash-refunds` (amount, reason, `Idempotency-Key`). It creates a Refund with `channel = manual_cash`, no `paymentId`, and identity `adm:{key}` (or `sys:…` when system-decided). It follows §6.13.9 approval rules.
- **Reservation:** `cashRefundReserved + cashRefundedAmount + amount ≤ cashCollectedAmount` (a conditional update on the Order). `reserved` means approved and awaiting payment.
- **Payment to the customer** is made by the platform outside Razorpay (bank or UPI transfer by finance). An admin then records it with `POST /admin/refunds/:id/mark-paid` (`payoutReference`, `paidAt`). That moves `reserved → processed`. An admin can cancel an unpaid one with `POST /admin/refunds/:id/cancel`.
- **Effects** are the "cash" row in §6.13.8. The driver's `cash_liability` (what the driver owes for the cash collected) is **not** reduced: the driver still holds the customer's cash. The platform bears the refund and reverses the earnings shares (§6.16).
- Every step is audited, and `mark-paid` records who paid and the reference.

### 6.14 Jobs and reconciliation

All jobs are idempotent and run on BullMQ. Payment jobs and payout jobs use **separate queues and credentials**.

| Job | Schedule | What it does |
|---|---|---|
| `payment-reconcile` | every 15 minutes | Finds Payments in `created` or `processing` beyond the threshold (and expired leases), and `void`, `flagged` or `expired` Payments within the lookback (7 days after `expiresAt`). Fetches their real state and attempts from Razorpay and runs `S` (§6.5) for captured attempts. Finds captured attempts with `disposition = pending_decision` or `unapplied` that have no automatic Refund and creates it. Alerts on attempts `authorized` past the grace period. |
| `payment-expiry` | every 5 minutes | Moves `created` Payments past `expiresAt` (plus a grace period) to `expired`, **after** running `S` for their captured attempts. |
| `effects-finalizer` | every 2 minutes | Finds targets with `effectsPending = true` older than 2 minutes and runs finalization (§6.5 step 7). Finds paid Orders without their earnings entries and creates them (idempotent keys). |
| `refund-submit`, `refund-poll`, `refund-resolve`, `refund-reissue` | event-driven, plus every 5 minutes for stuck ones | §6.13.4 and §6.13.5 |
| `webhook-retry` | event-driven | Retries `WebhookEvent`s in `received` |
| `incident-finalizer` | every 5 minutes | Moves `provisional` incidents whose dispute window ended to `upheld`. Runs finalization effects for terminal incidents that have not finished them. Applies pattern flags (§6.9). |
| `goods-return-monitor` | every 10 minutes | `required → overdue` at `dueBy`. `overdue → support_review` after 24 hours. `driver_reported → support_review` when the confirm window ends. Pauses drivers (§6.9). |
| `system-cancel` | every minute | Applies W5 for `no_driver_found` and `vendor_no_response` (§6.10). |
| `approval-expiry` | every 15 minutes | `pending → expired` (§6.7.8). Alerts on stale requests. |
| `unpaid-reminder` | daily | Sends push reminders for counted unpaid items (§6.11). |
| `ledger-hold-release` | every 5 minutes | Releases holds and moves `held` entries to `available` (§6.16). |
| `ledger-verify` | daily | Recomputes each `LedgerBalance` from entries. A mismatch alerts and freezes payouts for that owner (§6.16). |
| `cash-exposure` | every 10 minutes | Sets or clears `Driver.cashPaused` (§6.16). |
| `daily-comparison` | daily | Compares Razorpay captured payments against paid orders, tips and fees. Compares Razorpay refunds against Refund records (records **external** refunds). Compares cash collected against cash remittances. |
| `otp-expiry` | every 10 minutes | Sets `expired` on stale codes. |
| `request-expiry` | every minute | Sets `expired` on method-switch requests (10 minutes) and helper extra-hours requests (30 minutes). Sets method-switch requests `cancelled` when their order leaves `pending`. Alerts on fare disputes open beyond the review period. |
| `retention-cleanup` | daily | Deletes data past its retention limit (§6.19): GPS pings, `CallAttempt`, `Evidence` (and its stored media), `IdempotencyRecord`, `WebhookEvent`. Never deletes `AuditLog`, payments, refunds, ledger or payouts before their limit. |
| `payout-submit`, `payout-resolve`, `payout-reconcile` | see §11 | Payout jobs (separate queue). |

### 6.15 Data model

All amounts are integers in paise. All collections have `createdAt` and `updatedAt`. New collections are listed once, and used consistently by every flow above.

**`Payment`**

| Field | Notes |
|---|---|
| `userId` | Indexed. Always the booking customer. |
| `orderId` | Indexed. For a fee, the cancelled order. |
| `purpose` | `order`, `tip` or `cancellation_fee` |
| `serviceType` | food, meat, store149, delivery, bike, auto, cab, cab_prime, helper |
| `status` | `created`, `processing`, `captured`, `expired`, `void`, `flagged`, `partially_refunded`, `refunded` (§6.7.2) |
| `amount`, `currency` | The amount this Payment was created for |
| `orderAmountVersion` | Purpose `order`: the Order's `amountVersion` at creation |
| `recipientDriverId` | Purpose `tip`: copied from the order |
| `idempotencyKey` | Purpose `tip`: the `Idempotency-Key`. Unique with `userId` (sparse). |
| `razorpayOrderId` | Unique (sparse until created). One Razorpay order per Payment. |
| `appliedAttemptId` | The attempt that settled it. Set once (§6.5 step 7). |
| `paidAt`, `method` | From the applied attempt |
| `lockOwner`, `lockExpiresAt` | The lease (works in any status, §6.5 step 4) |
| `voidReason`, `flagReason`, `anomalyCount` | §6.7.2, §6.5.3 |
| `refundedAmount` | Total refunded on the applied attempt |
| `failedAttemptCount`, `lastFailureReason` | Informational |
| `expiresAt` | Closes the checkout window only |

Indexes: unique partial `(orderId, purpose)` **where `status` in (`created`, `processing`)**; unique `razorpayOrderId`; unique sparse `(userId, idempotencyKey)`.

**`PaymentAttempt`:** `paymentId`, `razorpayPaymentId` (unique), `razorpayOrderId`, `status` (§6.7.3), `disposition` (`pending_decision`, `applied`, `unapplied`), `unappliedCause`, `method`, `amount`, `currency`, `errorCode`, `errorReason`, `capturedAt`, `capturedAmount`, `refundReservedAmount`, `refundedAmount`, `overRefunded`.

**`Refund`:** `channel` (`razorpay`, `manual_cash`), `source` (`auto`, `system`, `admin`, `external`), `purpose` (`order`, `tip`, `cancellation_fee`, or `unapplied`), `paymentId`, `attemptId`, `razorpayPaymentId`, `orderId`, `amount`, `reason`, `cause`, `causeLog[]`, `generation`, `idempotencyKey` (unique), `requestHash`, `requestedBy`, `approvalId`, `status` (§6.7.4), `razorpayRefundId` (unique sparse), `submitStartedAt`, `retryNotBefore`, `retryCount`, `lockOwner`, `lockExpiresAt`, `failureCode`, `needsReview`, `payoutReference`, `paidBy`, `paidAt` (cash), `supersedes` (the failed Refund a reissue replaces).

**`ApprovalRequest`:** `type` (`refund`, `cash_refund`, `fee_waiver`, `write_off`, `fare_reduction`, `incident_decision`, `goods_return_decision`, `manual_adjustment`, `manual_payout`, `refund_resolution`), `payload` (the deferred action's parameters), `amount`, `reason`, `requestedBy`, `requestedByRole`, `decidedBy`, `decisionReason`, `status` (§6.7.8), `expiresAt`, `executedAt`, `executionResult`, `idempotencyKey`.

**`DeliveryIncident`:** `orderId` (unique among non-withdrawn), `driverId`, `customerId`, `origin` (`driver_report`, `customer_request`), `reason`, `note`, `status` (§6.7.6), `checks[]` (`name`, `result`: `pass`, `fail`, `unavailable`), `failedChecks[]`, `attestation` (`passed`, `failed`, `unavailable`), `flags[]`, `customerConfirmed`, `customerStatement`, `disputeWindowEndsAt`, `decidedBy`, `decisionReason`, `driverLiability` (`none`, `goods_value`), `evidenceIds[]`, `callAttemptIds[]`, `statusHistory[]`.

**`GoodsReturn`:** `orderId` (unique), `incidentId`, `returnTo` (`vendor`, `sender`), `returnToId`, `status` (§6.7.5), `dueBy`, `driverReportedAt`, `confirmWindowEndsAt`, `confirmedBy`, `outcome` (`returned`, `disposed`, `driver_liable`, `platform_absorbs`, `vendor_absorbs`), `decisionReason`, `evidenceIds[]`, `statusHistory[]`.

**`FareDispute`:** `orderId` (unique), `customerId`, `reason`, `claimedAmountNote`, `status` (§6.7.7), `newAmount`, `decidedBy`, `decisionReason`.

**`Evidence`:** `orderId`, `uploaderType`, `uploaderId`, `purpose` (`drop`, `return`), `mediaRef` (private Cloudinary id), `sha256`, `capturedAt` (server), `deviceCapturedAt`, `lat`, `lng`, `accuracy`, `attestation`, `mockLocation`, `retentionUntil`.

**`CallAttempt`:** `orderId`, `driverId`, `target`, `startedAt` (server), `endedAt`, `durationSec`, `provider`, `providerCallId`.

**`HelperExtraHoursRequest`:** `orderId`, `helperId`, `hours`, `note`, `status` (§6.7.14), `decidedAt`.

**`AuditLog`** (append-only; no update or delete API): `actorType` (`customer`, `driver`, `vendor`, `admin`, `support`, `system`), `actorId`, `action`, `entityType`, `entityId`, `orderId`, `before` and `after` (status and amounts only), `reason`, `requestId`, `idempotencyKey`, `ip`, `at`. Indexed by (`entityType`, `entityId`) and (`actorId`, `at`). Retention in §6.19.

**`IdempotencyRecord`:** `scope` (actor id and endpoint), `key`, `requestHash`, `status` (§6.7.14), `responseStatus`, `responseBody`, `expiresAt` (30 days). Unique on (`scope`, `key`).

**`WebhookEvent`:** `source` (`razorpay`, `razorpayx`), `eventId`, `eventType`, `status` (§6.7.14), `attempts`, `receivedAt`, `processedAt`. Unique on (`source`, `eventId`).

**`LedgerEntry`, `LedgerBalance`:** §6.16. **`Payout`, `PayoutAccount`:** §11.

**`PaymentSettings`** (singleton, versioned): every configurable number in §15.2, `version`, `updatedBy`, `updatedAt`. Each change is audited.

**`Order`: added fields**

| Group | Fields |
|---|---|
| Payment method and status | `paymentMethod` (`online`, `cash`), `methodVersion`, `paymentStatus` (§6.7.1), `paymentTiming` (package: `at_pickup`, `at_drop`) |
| Amount | `estimateAmount` (rides and helpers, shown at booking, never charged), `payableAmount`, `amountVersion`, `amountLockedAt`, `priceSnapshot`, `priceHistory[]`, `supplement` (rides) |
| Payable window | `payableFromAt` |
| **Settlement linkage** | `paidVia` (`online`, `cash`, `zero_amount`), `paidAt`, `paidPaymentId`, `paidAttemptId`, `paidRazorpayPaymentId`, `effectsPending`, `orderRefundedAmount` |
| Cash | `cashCollectedAmount`, `cashCollectedAt`, `cashCollectedBy`, `cashCollectedFrom` (`customer`, `receiver`), `cashRefundReserved`, `cashRefundedAmount` |
| Closing | `closedReason` (`cancelled_by_customer`, `cancelled_by_vendor`, `no_driver_found`, `vendor_no_response`, `refusal_final`, `refusal_overturned`, `admin_write_off`), `closedAt`, `cancelledBy` (`customer`, `vendor`, `system`) |
| Method switching | `methodChangeLog[]`, `methodSwitchRequest` (`id`, `requestedBy`, `requestedAt`, `expiresAt`, `status`) |
| Tip | `tip` = `{ status (`none`, `paid`, `partially_refunded`, `refunded`), paymentId, attemptId, amount, paidAt, refundedAmount, effectsPending }` |
| Cancellation fee | `cancellationFee` = `{ status (`none`, `pending`, `paid`, `waived`, `partially_refunded`, `refunded`), amount, basis, calculatedAt, paymentId, attemptId, paidAt, waivedBy, waiveReason, refundedAmount, effectsPending }` |
| Milestones | `driverAssignedAt`, `preparingAt`, `pickedUpAt`, `arrivedAt`, `arrivedStage`, `arrivalGeofence` (`inside`, `outside`), `arrivalAttestation` (`passed`, `failed`, `unavailable`), `tripStartedAt`, `tripEndedAt`, `deliveredAt`, `deliveredWithoutOtp` |
| Delivery OTP | `deliveryOtp` (stored as `handoverOtp`, because the existing schema already has a plain `deliveryOtp` field, §5.4 C2) = `{ seed, version, state, expiresAt, attempts, regenCount, smsSendCount, verifiedAt }`. **No code and no code hash.** |
| Package | `receiverName`, `receiverPhone` (used only for the handover SMS) |
| Incident, disputes | `activeIncidentId`, `goodsReturnId`, `fareDisputeStatus` (`none`, `open`, `closed`), `helperExtraHours` (`approvedHours`) |
| Service status | The existing `status` gains two terminal values: `refused` and `refusal_overturned` (§6.7.6) |

The existing service `status` values map onto the milestones above. Milestones are what this plan's rules read.

**`User`** (customers): `unpaidBalance` (derived and cached, §6.11), `unpaidCap`, `refusedCount`, `disputedRejectedCount`, `trustLevel` (`new`, `established`, `limited`, `blocked`), `paidOrderCount`, `preferredLanguage` (`en`, `te`, `hi`).

**`Driver`:** `cashPaused`, `pausedForReturns`, `refusalApprovalRequired`, `unreturnedGoodsCount`, `strikes`, `refusalStats`, `driverCancelCount`, `preferredLanguage`. (Cash exposure is derived from the ledger, not stored.)

**`Vendor`:** `preferredLanguage`. Admin and support users keep their language only in the admin app (`admin_language`), because the server never sends them localized messages.

**Card data:** never store full card numbers, CVV or UPI PINs. Razorpay handles all card data, which keeps the backend outside PCI-DSS card-data scope. Store only the Razorpay ids and the method type.

### 6.16 Earnings ledger

The ledger is the only record of what the platform owes drivers and vendors, and what drivers owe the platform. Every entry is append-only, and balances are updated in the **same MongoDB transaction** as the entry (this is why a replica set is required, §5.2). No other code changes a balance.

**`LedgerEntry`:** `ownerType` (`driver`, `vendor`), `ownerId`, `type`, `direction` (`credit`, `debit`), `amount` (positive), `status` (§6.7.10), `idempotencyKey` (unique), `orderId`, `paymentId`, `refundId`, `incidentId`, `goodsReturnId`, `fareDisputeId`, `payoutId`, `holds[]` (each `{ reason, refId }`), `releaseAt`, `reverses` (the entry reversed), `meta` (gross amount, commission amount and rate, share basis), `createdBy` (`system` or an admin id), `createdAt`.

**`LedgerBalance`:** `ownerType`, `ownerId`, `available` (may be negative for drivers: cash owed), `held`, `reserved`, `frozen`, `version`. Unique on (`ownerType`, `ownerId`).

**Entry types and their balance effect:**

| Type | Direction | Balance effect | Created when | Idempotency key |
|---|---|---|---|---|
| `order_earning` | credit | `held +=` | An order settles (online W1, cash W2, zero) using the `priceSnapshot` shares: vendor share for food, meat and store, driver share for every service. The commission is stored in `meta`. | `order_earning:{orderId}:{ownerType}:{ownerId}` |
| `tip` | credit | `held +=` | A tip settles (driver, in full) | `tip:{paymentId}` |
| `fee_share` | credit | `held +=` | A cancellation fee settles. Split per §15.2. | `fee_share:{orderId}:{ownerType}` |
| `cash_liability` | debit | `available -=` (may go negative) | Cash collected (W2): the driver owes the platform `cashCollectedAmount` | `cash_liability:{orderId}` |
| `cash_remittance` | credit | `available +=` | An admin records cash the driver handed to the platform (§6.17) | `cash_remittance:{remittanceId}` |
| `refund_reversal` | debit | The original entry's bucket `-=` (`held`, else `available`) | A Refund becomes `processed` (§6.13.8) | `refund_reversal:{refundId}:{originalEntryId}` |
| `vendor_compensation` | credit | `available +=` | Refused-order compensation (below) | `vendor_comp:{orderId}` |
| `driver_delivery_share` | credit | `held +=` | The driver's share for an `upheld` refusal on an order with no earnings entry yet (below). Created with a `post_delivery` hold (`releaseAt` = creation + 24 hours). | `driver_share:{orderId}` |
| `liability_debit` | debit | `available -=` | A goods return closes as `driver_liable` | `liability:{goodsReturnId}` |
| `payout_reserve` | debit | `available -=`, `reserved +=` | A payout is created (§6.7.9) | `payout_reserve:{payoutId}` |
| `payout_settled` | debit | `reserved -=` | A payout is `processed` | `payout_settled:{payoutId}` |
| `payout_release` | credit | `reserved -=`, `available +=` | A payout is `failed`, `rejected`, or a manual payout is cancelled | `payout_release:{payoutId}` |
| `payout_reversal` | credit | `available +=` | A `processed` payout becomes `reversed` | `payout_reversal:{payoutId}` |
| `manual_adjustment` | credit or debit | `available ±=` | An admin adjustment (always approval, §6.13.9) | `adjust:{approvalId}` |

**Holds and release.** Earning, tip and fee-share entries are created `held` with `holds`:

- `post_delivery`: `releaseAt` = `deliveredAt` or `tripEndedAt` + 24 hours (D4). This covers the refund and complaint window.
- `incident:{incidentId}` and `goods_return:{goodsReturnId}`: placed when an incident starts, released when the incident is terminal and the return is `completed`, `closed_loss` or `cancelled`.
- `fare_dispute:{disputeId}`: placed when a dispute opens, released when it is terminal.
- `no_otp_review`: placed for 48 hours after "deliver without OTP" (§6.8).

The `ledger-hold-release` job moves an entry to `available` when **every** hold has been cleared and `releaseAt` has passed. Only `available` money can be paid out.

**Refund reversal amounts.** For a refund of `x` on an order paid `P`, each earning entry of that order is reversed by `floor(entryAmount × x / P)`. Two causes change the scope: an `upheld` refusal refund reverses the **vendor** earning fully and keeps the driver's earning (a refusal does not cost the driver their delivery share once the return closes, D6), and an `overturned` refusal refund reverses **both** in full (the driver earns nothing, §6.7.6). A tip refund reverses the driver's `tip` entry. A fee refund reverses the fee shares.

**Refused orders (D3, D6).** Compensation and shares are created only when the incident is `upheld` or `overturned` **and** the goods return is `completed` or `closed_loss`. A `withdrawn` incident (its return is `cancelled`) creates no compensation, because delivery continues normally.

| Incident | Vendor | Driver |
|---|---|---|
| `upheld` | Food and meat: `vendor_compensation` = the order's vendor share (perishables cannot be resold), unless the return outcome is `vendor_absorbs`. Store items and packages: compensated only if the return is `closed_loss` with `platform_absorbs` or `driver_liable`. | If the order had no earnings entry (it was unpaid): `driver_delivery_share` = the driver share. If it was paid, the existing earning is kept and released. |
| `overturned` | Same compensation rule as above | No earnings. Strike recorded. |
| return `closed_loss` with `driver_liable` | | `liability_debit` = the order's items subtotal, at most |

**Cancellation fee split (D8).** Per §15.2: goods orders are split between vendor and driver by percentage, and every other service pays the driver. Credited as `fee_share`.

**Cash exposure and the cash limit (fraud control).** A driver's cash exposure is `max(0, −available)`. The `cash-exposure` job sets `Driver.cashPaused` when exposure reaches the limit (default ₹2,000, D4). A paused driver receives no new cash orders and sees why. It is cleared when exposure falls below the limit (held earnings releasing into `available` reduces it automatically). Admins record cash the driver handed over with `POST /admin/drivers/:id/cash-remittance`.

**Integrity.** `LedgerBalance` must equal the sum of the owner's entries. The `ledger-verify` job recomputes it daily. A mismatch raises a critical alert and sets `frozen = true`, which blocks payouts for that owner until an admin resolves it.

**Payout eligibility.** A payout can reserve only from `available` (never `held`, never negative), and only for owners whose balance is not `frozen`.

### 6.17 Endpoint reference

Every endpoint the plan depends on is defined here. All paths are under `/api/v1`. **No other section may reference an endpoint that is not in this section.**

**Conventions that apply to every endpoint:**

- **Authentication.** Every endpoint requires a valid JWT (`authenticateToken`), except the two webhooks (signature only). The token role is `customer`, `driver`, `vendor`, `support` or `admin`.
- **Authorization and ownership.** `authorizeRole` checks the role. Then an ownership predicate applies: a customer must equal `order.userId`, a driver `order.driverId`, a vendor `order.vendorId` (the vendor token, with the role mapping in §5.4 C3). A failed ownership check returns **404 `NOT_FOUND`**, never 403, so records cannot be enumerated. A wrong role returns 403 `FORBIDDEN`.
- **Response envelope.** `{ code, data, params }`. `code` is a stable machine-readable string that apps translate (§6.18). The server never relies on a client to display English text.
- **Idempotency.** **N** = natural: the state preconditions and conditional updates make a repeat a no-op that returns the current result. **K** = the `Idempotency-Key` header (a UUID) is required. The result is stored in `IdempotencyRecord` scoped to the actor and the endpoint. The same key and body replays the stored response. The same key with a different body returns 409 `IDEMPOTENCY_MISMATCH`. A request still in progress returns 409 `REQUEST_IN_PROGRESS`. A missing key returns 400 `IDEMPOTENCY_KEY_REQUIRED`.
- **Audit.** Every non-GET endpoint writes an `AuditLog` entry (actor, action, entity, status before and after, request id, idempotency key, IP). Admin and support **reads** of evidence, incidents and ledgers also write an audit entry. The audit column is therefore not repeated per row.
- **Common errors** (not repeated): 400 `VALIDATION_ERROR`, 401 `UNAUTHENTICATED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `STATE_CONFLICT` (with the current state in `params`), 429 `RATE_LIMITED` (limits in §6.19), 503 `FEATURE_DISABLED` when the feature flag is off.
- **State preconditions** use only states from §6.7. Where a row says "W1" to "W8" it means the Order writer of that number in §6.7.1.

#### A. Customer payments, configuration and preferences

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `POST /payments/create-order` | Booking customer | `{ orderId }` | Order payable (§6.2), `paymentMethod = online`, amount ≥ ₹1 | §6.3: reuse, replace or wait. Insert guarded by the unique open-Payment index, then create and link the Razorpay order. | N (returns the same open Payment) | `{ order_id, key_id, amount, currency, name, prefill }`. `PAYMENT_IN_PROGRESS` (409), `ALREADY_PAID`, `ORDER_NOT_PAYABLE`, `ORDER_UNDER_INCIDENT`, `ONLINE_NOT_AVAILABLE`, `AMOUNT_TOO_LOW` |
| `POST /payments/tip/create-order` | Booking customer | `{ orderId, tipAmount }` | §6.4: order completed, has a driver, `paymentStatus` in (`paid`, `partially_refunded`), within the window, `tip.status = none`, amount in range. `TIPS_ENABLED`. | Insert a Payment (purpose `tip`, recipient copied from the order). Unique open index and unique `(userId, key)`. | **K** | Same shape as above. `TIP_NOT_ALLOWED`, `TIP_OUT_OF_RANGE`, `TIP_WINDOW_CLOSED`, `IDEMPOTENCY_MISMATCH` |
| `POST /payments/cancellation-fee/create-order` | Booking customer | `{ orderId }` | `cancellationFee.status = pending`. `CANCELLATION_FEES_ENABLED`. | Insert a Payment (purpose `cancellation_fee`, amount from the Order). Unique open index. | N | Same shape. `FEE_NOT_PENDING` |
| `POST /payments/verify` | Booking customer | `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` | A Payment for that Razorpay order owned by the caller | §6.5: signature, ownership, fetch, then `S` | N (own success returns `SETTLED`) | `{ code }` from §6.5.4. `INVALID_SIGNATURE` (400), `INVALID_PAYMENT` (400) |
| `GET /payments/status/:orderId` | Booking customer | query `purpose?` | none | Read only | N | §6.12 |
| `GET /me/pending-payments` | Customer | none | none | Read only | N | Counted unpaid items, balance and cap |
| `GET /payments/tip/limits/:orderId` | Booking customer | none | none | Read only | N | Min, max, window end, allowed |
| `GET /config/payments` | Any authenticated user | none | none | Read only | N | Public feature flags (§6.12) |
| `PUT /users/me/language`, `PUT /drivers/me/language`, `PUT /vendors/me/language` | The account itself | `{ language: en \| te \| hi }` | none | Sets `preferredLanguage`. Last write wins. | N | `{ language }`. Admin and support have no server preference (§6.18). |
| `POST /payments/webhook` | Razorpay (signature only) | Raw body, `X-Razorpay-Signature`, `X-Razorpay-Event-Id` | Valid signature, event id present | §6.6.1: insert `WebhookEvent`, enqueue, 2xx | Deduplicated by (`source`, `eventId`) | 2xx. 401 (bad signature), 400 (no event id) |

#### B. Customer order actions

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `POST /orders` (existing) | Customer | Items, weights, stops, tier, hours, `paymentMethod`, `paymentTiming` (package), receiver name and phone (package). **No totals.** | Pay-later checks (§6.2, §6.11). Online only if `PAYMENTS_ONLINE_ENABLED`. | Server prices, locks the amount and stores the snapshot (§6.1). W8 for a zero amount. | **K** | The Order. `ONLINE_NOT_AVAILABLE`, `UNPAID_BALANCE_LIMIT`, `ACCOUNT_LIMITED`, `ORDER_VALUE_LIMIT`, `OPEN_ORDERS_LIMIT` |
| `POST /orders/:id/increase-price` (existing) | Order owner | Rides: `{ supplement }`. Helpers: `{ newOffer }`. | `driverAssignedAt` empty. New value higher, within the cap (§6.10), and for helpers at least the server minimum. | Conditional on no driver assigned. Appends to `priceHistory`. | N (same value is a no-op) | New value. `TOO_LATE`, `NOT_HIGHER`, `EXCEEDS_CAP` |
| `POST /orders/:id/helper-extra-hours/:requestId/decision` | Booking customer | `{ approve: boolean }` | Request `pending` | `pending → approved` or `rejected` (§6.7.14) | N | Updated estimate. `REQUEST_CLOSED` |
| `GET /orders/:id/handover-code` | Booking customer | none | `pickedUpAt` set, OTP not `used` | Read only. Derives the code (§6.8). For `locked` or `expired` it returns the state and no code. | N | `{ code?, state, expiresAt }` |
| `POST /orders/:id/handover-code/regenerate` | Booking customer | none | `pickedUpAt` set, `deliveredAt` empty, `regenCount < 3` | Conditional: version + 1, attempts reset, new expiry, `regenCount + 1`, state `active` | **K** | `{ code, expiresAt }`. `REGEN_LIMIT` |
| `POST /orders/:id/handover-code/send-sms` | Booking customer | none | Package. `SMS_ENABLED`. OTP `active`. `smsSendCount < 3`. Receiver phone under its 24-hour cap. | Atomically increments `smsSendCount`, enqueues the SMS to `receiverPhone` only | **K** | `{ remaining }`. `SMS_NOT_AVAILABLE`, `SMS_LIMIT` |
| `POST /orders/:id/payment-method/switch` | Booking customer | `{ toMethod, methodVersion, requestId? }` | The §6.7.12 table. `toMethod = online` needs `PAYMENTS_ONLINE_ENABLED`. | Fetches Razorpay state (online→cash), then W3. Voids `created` Payments when going to cash. Confirms a matching `requestId`. | N (the version guard) | `{ paymentMethod, methodVersion }`. `PAYMENT_IN_PROGRESS`, `ALREADY_PAID`, `ORDER_UNDER_INCIDENT`, `STALE_VERSION`, `ONLINE_NOT_AVAILABLE` |
| `POST /orders/:id/payment-method/requests/:requestId/decline` | Booking customer | none | Request `pending` | `pending → declined` | N | Status |
| `POST /orders/:id/cancel/preview` | Booking customer | none | Cancellable (§6.2) | **No state change.** Computes the fee. Returns a signed token bound to the order and fee (valid 5 minutes). | N | `{ feeApplicable, fee, previewToken }`. `NOT_CANCELLABLE` |
| `POST /orders/:id/cancel` | Booking customer | `{ previewToken, expectedFee }` | Cancellable. Token valid. Recomputed fee equals `expectedFee`. | W5 (`cancelledBy = customer`), with `cancellationFee` set in the same update when eligible. Then voids open Payments. | N (already `not_payable` returns the same result) | `{ status, fee }`. `FEE_CHANGED` (returns the new fee), `NOT_CANCELLABLE`, `PREVIEW_EXPIRED` |
| `POST /orders/:id/refusal-request` | Booking customer | none | `REFUSAL_FLOW_ENABLED`. Goods or package. `pickedUpAt` set, `deliveredAt` empty. `paymentStatus` is `pending`, or `paid` or `partially_refunded` with `paidVia = online`. No terminal incident. | Creates the incident as `upheld` (`origin = customer_request`), or moves an existing `provisional` or `under_review` one to `upheld`. Runs finalization (§6.7.6). | N | `{ incidentId, status }`. `NOT_OUT_FOR_DELIVERY`, `ORDER_ALREADY_PAID_CASH` |
| `POST /delivery-incidents/:id/dispute` | Booking customer | `{ statement }` | Incident `provisional` (before `disputeWindowEndsAt`) or `under_review` | `provisional → under_review`, or adds the statement | N | Status. `WINDOW_CLOSED` |
| `POST /orders/:id/fare-dispute` | Booking customer | `{ reason, claimedAmountNote? }` | Ride or helper. `tripEndedAt` set, within 48 hours. No dispute exists. | Inserts a `FareDispute` (unique on `orderId`). Places earnings holds. | N (unique) | `{ disputeId }`. `WINDOW_CLOSED`, `DISPUTE_EXISTS` |
| `POST /fare-disputes/:id/withdraw` | Booking customer | none | `open` | `open → withdrawn`. Holds released. | N | Status |
| `POST /orders/:id/goods-return/sender-confirm` | Booking customer (package sender) | `{ received: true, evidenceId? }` | Package. GoodsReturn in `required`, `overdue`, `driver_reported` or `support_review` | → `completed` (outcome `returned`) | N | Status |

#### C. Driver actions

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `POST /orders/:id/picked-up` | Assigned driver | none (GPS is known by the server) | Goods or package. `driverAssignedAt` set, `pickedUpAt` empty, vendor marked ready (goods). Package `at_pickup`: `paymentStatus = paid`. | Conditional on `pickedUpAt` empty: sets `pickedUpAt`. Sets `payableFromAt` for goods and `at_drop` packages. Creates the OTP (`active`), pushes the code to the customer, and sends the package SMS if enabled. | N | `{ status, payableFromAt }`. `NOT_READY`, `PAYMENT_REQUIRED` |
| `POST /orders/:id/arrive` | Assigned driver | `{ stage: pickup \| drop, attestationToken? }` | Goods, package, ride or helper. `drop` exists only for goods and packages and needs `pickedUpAt`. Rides and helpers accept only `pickup`, which never affects payment. Stage moves only forward. | **Never rejects for geofence or attestation.** Records `arrivedAt`, `arrivedStage`, `arrivalGeofence`, `arrivalAttestation`. For a package `at_pickup` with `stage = pickup`, sets `payableFromAt` (once). | N (per stage) | `{ arrivedAt, geofence, attestation, payableFromAt? }`. `WRONG_STAGE` |
| `POST /orders/:id/cash-collected` | Assigned driver | `{ methodVersion, amountVersion, cashCollectedFrom? }` (`cashCollectedFrom` for packages) | W2 filter (§6.7.1): payable, method `cash`, versions equal, no incident, and for goods and package the arrival stage matches | W2, then finalization (ledger, customer notification). **The amount is never sent by the driver.** | N (a repeat returns `ALREADY_PAID`) | `{ code: PAID }`. `ALREADY_PAID`, `METHOD_CHANGED`, `AMOUNT_CHANGED`, `ORDER_NOT_PAYABLE`, `ORDER_UNDER_INCIDENT` |
| `POST /orders/:id/payment-method/request-cash` | Assigned driver | `{ methodVersion }` | `pending`, method `online`, payable, no incident, no pending request | Creates `methodSwitchRequest` (`pending`, expires in 10 minutes). **Changes no payment state.** Notifies the customer. | N (returns the pending one) | `{ requestId, expiresAt }`. `REQUEST_PENDING` |
| `POST /orders/:id/deliver` | Assigned driver | `{ otp }` or `{ withoutOtp: true, evidenceIds, attestationToken? }` | §6.8: `paymentStatus` in (`paid`, `partially_refunded`), `arrivedStage = drop`, no incident. OTP `active` and correct, or the fallback conditions (which need `REFUSAL_FLOW_ENABLED`). | Conditional: `deliveredAt` empty → set. OTP `used`. Attempts are an atomic counter with the limit. Ledger hold `post_delivery` (and `no_otp_review` for the fallback). | N | `{ code: DELIVERED }`. `NOT_PAID`, `OTP_INVALID` (with attempts left), `OTP_LOCKED`, `OTP_EXPIRED`, `ORDER_UNDER_INCIDENT`, `WRONG_STAGE`, `ATTESTATION_REQUIRED`, `WITHOUT_OTP_NOT_ALLOWED` |
| `POST /orders/:id/call-attempts` | Assigned driver | `{ target: customer }` | `CALL_LOGGING_ENABLED`. Goods or package. `arrivedStage = drop`, not delivered. | Creates a `CallAttempt` with the server time. Returns the call session. | N (each call is an event) | `{ callAttemptId, session }` |
| `POST /orders/:id/evidence` | Assigned driver | Multipart photo, `purpose`, `attestationToken?` | Goods or package. `pickedUpAt` set. `REFUSAL_FLOW_ENABLED` for `drop` and `return`. In-app capture, size and type limits. | Creates an `Evidence` (server time, GPS from the stored ping, hash) | N (same hash for the same order and purpose returns the existing) | `{ evidenceId }`. `FILE_INVALID` |
| `POST /orders/:id/refusal` | Assigned driver | `{ reason, note?, evidenceIds[] }` | §6.9 hard preconditions | Conditional on no incident and `deliveredAt` empty: creates the incident (`provisional` or `under_review`), the GoodsReturn (`required`), sets `activeIncidentId`, places holds | N (one incident per order: a repeat returns it) | `{ incidentId, status, failedChecks[] }`. `TOO_EARLY`, `NOT_ARRIVED`, `ORDER_ALREADY_PAID_CASH`, `OTP_ALREADY_USED` |
| `POST /delivery-incidents/:id/withdraw` | The incident's driver | `{ reason }` | Incident `provisional` or `under_review`, order not delivered | → `withdrawn`. Clears `activeIncidentId`. GoodsReturn `cancelled`. Holds released. | N | Status |
| `POST /orders/:id/goods-return/driver-report` | Assigned driver | `{ evidenceIds, note? }` | GoodsReturn `required` or `overdue`. A `return` Evidence exists. | → `driver_reported`. Sets `driverReportedAt` and `confirmWindowEndsAt`. | N | Status. `EVIDENCE_REQUIRED` |
| `POST /orders/:id/complete-trip` | Assigned driver (ride or helper) | none | `tripStartedAt` set, `tripEndedAt` empty | Server computes and locks the final amount (`amountVersion = 1`), sets `tripEndedAt` and `payableFromAt`, expires pending extra-hours requests. W8 if the amount is zero. | N | `{ payableAmount }` |
| `POST /orders/:id/helper-extra-hours` | Assigned helper | `{ hours, note? }` | Helper task in progress. Within limits. No pending request. | Creates a `HelperExtraHoursRequest` (`pending`, 30 minutes). Notifies the customer. | N (one pending) | `{ requestId }`. `REQUEST_PENDING`, `HOURS_EXCEEDED` |
| `POST /orders/:id/driver-cancel` | Assigned driver | `{ reason }` | §6.10: before `pickedUpAt` or `tripStartedAt`, `paymentStatus = pending`, no active incident | Clears the driver, `driverAssignedAt`, the recorded arrival and (for an `at_pickup` package) `payableFromAt`. Voids open Payments. Re-dispatches. Records a statistic. No fee. | N | `{ status }`. `TOO_LATE` |
| `GET /drivers/me/ledger` | Driver | filters | none | Read only | N | Balances (`available`, `held`, `reserved`), cash exposure, entries with their holds |
| `GET /drivers/me/incidents` | Driver | none | none | Read only | N | The driver's incidents with status and decision |

#### D. Vendor actions (vendor role in the admin SPA)

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `POST /orders/:id/items/:itemId/unavailable` | Owning vendor | `{ reason }` | Goods. `pickedUpAt` empty. `paymentStatus = pending`. Item exists and is available. | W4 (recompute from the snapshot, downwards only, §6.1). Voids open Payments. If it was the last item, W5 (`cancelledBy = vendor`, no fee). | N (per item) | `{ payableAmount, amountVersion }` or the cancelled status |
| `POST /orders/:id/cancel-by-vendor` | Owning vendor | `{ reason }` | Goods. `pickedUpAt` empty. | W5 (`cancelledBy = vendor`, no fee) | N | Status |
| `POST /orders/:id/goods-return/vendor-decision` | Owning vendor | `{ decision: confirm \| decline \| contest, note?, evidenceId? }` | `confirm`: GoodsReturn `required`, `overdue`, `driver_reported` or `support_review`. `decline`: `required`, `overdue` or `driver_reported`. `contest`: `driver_reported`. | `confirm → completed`. `decline` or `contest → support_review`. | N | Status |
| `GET /vendors/me/ledger` | Vendor | filters | none | Read only | N | Balances and entries |

#### E. Admin and support actions

Roles: `support` may read and **initiate**. `admin` may read, initiate, execute below the threshold, and approve (§6.13.9).

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `GET /admin/payments`, `GET /admin/payments/:id` | Admin, support | Filters | none | Read only. Shows attempts, refunds, flags. | N | Lists |
| `POST /admin/payments/:paymentId/refunds` | Admin, support | `{ attemptId, amount, reason }` | Payment `captured` or `partially_refunded`. `attemptId` is the **applied** attempt. Amount within the refundable balance. Reason required. | §6.13.9 rule: an `ApprovalRequest` and a `pending_approval` Refund, or reserve (conditional cap) and enqueue submission | **K** | `{ refundId, status, approvalId? }`. `REFUND_EXCEEDS_REFUNDABLE`, `ATTEMPT_NOT_APPLIED` |
| `POST /admin/orders/:id/cash-refunds` | Admin, support | `{ amount, reason }` | `paidVia = cash`, `paymentStatus` in (`paid`, `partially_refunded`). Within the cash cap. | Cash Refund (§6.13.10), approval per §6.13.9 | **K** | `{ refundId, status, approvalId? }` |
| `POST /admin/refunds/:id/mark-paid` | Admin | `{ payoutReference, paidAt }` | Cash Refund `reserved` | `reserved → processed` (§6.13.8) | **K** | Refund. `REFUND_NOT_PAYABLE` |
| `POST /admin/refunds/:id/cancel` | Admin | `{ reason }` | Cash Refund `reserved` | `reserved → cancelled`. Reservation released. | N | Refund |
| `POST /admin/refunds/:id/reissue` | Admin | `{ reason }` | Razorpay Refund `failed`, `source` `auto` or `system`, no newer generation | Creates generation + 1 (§6.13.5). No approval. | **K** | New Refund |
| `POST /admin/refunds/:id/resolve` | Admin, support | `{ action: adopt \| confirm_not_issued, razorpayRefundId? }` | Refund `unknown` and unresolved by the job | Always an `ApprovalRequest`. On approval: adopt the id, or move to `submitting` for a re-call. | **K** | `{ approvalId }` |
| `GET /admin/refunds`, `GET /admin/external-refunds`, `GET /admin/reconciliation` | Admin, support | Filters | none | Read only | N | Lists (stuck, unknown, external, mismatches) |
| `GET /admin/approvals` | Admin, support | Filters | none | Read only | N | The queue |
| `POST /admin/approvals/:id/approve`, `POST /admin/approvals/:id/reject` | **A different admin** than the initiator | `{ decisionReason }` | Request `pending` | Conditional on `pending`. Approve runs the deferred action once under `approval:{id}` (§6.7.8). Reject closes it. | **K** | Status. `SELF_APPROVAL_FORBIDDEN`, `APPROVAL_EXPIRED` |
| `POST /admin/orders/:id/cancellation-fee/waive` | Admin, support | `{ reason }` | `cancellationFee.status = pending` | Rule §6.13.9. Conditional `pending → waived`. Voids the open fee Payment. | **K** | Fee status |
| `POST /admin/orders/:id/write-off` | Admin, support | `{ reason }` | `paymentStatus = pending`, no active incident | Rule §6.13.9. W6 (`admin_write_off`). Voids open Payments. | **K** | `written_off` |
| `GET /admin/delivery-incidents`, `GET /admin/delivery-incidents/:id` | Admin, support | Filters | none | Read only. The detail returns evidence (audited read). | N | List, evidence |
| `POST /admin/delivery-incidents/:id/escalate` | Support, admin | `{ note }` | Incident `provisional` or `under_review` | `provisional → under_review`, and sets the admin queue | N | Status |
| `POST /admin/delivery-incidents/:id/decision` | Admin, support (support only under the threshold and with no liability, §6.9) | `{ decision: upheld \| overturned, reason, driverLiability? }` | Incident `under_review` | Conditional status change, then finalization (§6.7.6). The approval rule applies to the money effect. | **K** | Status. `DECISION_NOT_ALLOWED` |
| `GET /admin/goods-returns` | Admin, support | Filters | none | Read only | N | List |
| `POST /admin/orders/:id/goods-return/decision` | Admin, support (support only for `returned` and `disposed`. Loss outcomes are admin-only.) | `{ outcome: returned \| disposed \| driver_liable \| platform_absorbs \| vendor_absorbs, reason }` | GoodsReturn `support_review` | `returned` or `disposed → completed`. Others `→ closed_loss`. Ledger effects (§6.16). Approval rule for loss outcomes. | **K** | Status. `DECISION_NOT_ALLOWED` |
| `GET /admin/fare-disputes` | Admin, support | Filters | none | Read only | N | List |
| `POST /admin/fare-disputes/:id/decision` | Admin, support | `{ outcome: rejected \| reduced, newAmount?, reason }` | Dispute `open`. For `reduced`, `newAmount` is lower than the current amount. | `rejected`, or `reduced` per §6.10 (W4, or a partial refund). Approval rule for `reduced`. | **K** | Dispute status |
| `GET /admin/users/:id/payment-risk` | Admin, support | none | none | Read only | N | Counts, trust level, unpaid balance |
| `PUT /admin/users/:id/payment-limits` | Admin | `{ trustLevel, note }` | none | Sets `trustLevel` | **K** | Status |
| `POST /admin/drivers/:id/cash-remittance` | Admin | `{ amount, method, reference }` | Driver exists | Creates `cash_remittance` (credit). Clears `cashPaused` if below the limit. | **K** | Balance |
| `GET /admin/drivers/cash-balances` | Admin, support | none | none | Read only | N | Exposure per driver |
| `POST /admin/ledger/adjustments` | Admin | `{ ownerType, ownerId, direction, amount, reason }` | Owner exists | Always an `ApprovalRequest`. Approval creates `manual_adjustment`. | **K** | `{ approvalId }` |
| `GET /admin/ledger/:ownerType/:ownerId` | Admin, support | Filters | none | Read only (audited) | N | Entries and balance |
| `GET /admin/settings/payments`, `PUT /admin/settings/payments` | Admin | Settings (§15.2) | none | Ranges validated. A new version is written. Audited. | **K** for PUT | Settings |
| `GET /admin/audit-logs` | Admin | Filters | none | Read only | N | Entries |
| `GET /admin/evidence/:id` | Admin, support | none | Evidence exists and is within retention | Returns a short-lived signed URL (5 minutes). Audited read. | N | `{ url }` |

#### F. Payouts

| Endpoint | Actor and authorization | Request | State preconditions | Effect and atomicity | Idempotency | Response and specific errors |
|---|---|---|---|---|---|---|
| `PUT /payouts/account` | Driver or vendor (own account) | `{ holderName, accountNumber, ifsc, password }` | Password re-confirmed | Stores the account (last 4 digits shown afterwards), sets `verificationStatus = unverified`, `changedAt`, and starts the 24-hour cooling-off. Creates the RazorpayX contact and fund account once (§11) when `PAYOUTS_ENABLED`. | **K** | `{ verificationStatus, payoutsBlockedUntil }` |
| `POST /payouts/account/verify` | Driver or vendor | none | `PAYOUTS_ENABLED`. Status `unverified` or `failed`. | Starts a penny-drop verification: `unverified → pending` | N | Status |
| `POST /payouts/request` | Driver or vendor | `{ amount, password }` | `PAYOUTS_ENABLED`. Account `verified` and cooling-off over. Amount within min, max and the daily limit. `LedgerBalance.available ≥ amount`, not `frozen`. | One transaction: create the Payout (`created`) and the reservation (§6.7.9). Enqueue `payout-submit`. | **K** (this is the payout `idempotencyKey`) | Payout. `FEATURE_DISABLED`, `ACCOUNT_NOT_VERIFIED`, `COOLING_OFF`, `INSUFFICIENT_BALANCE`, `LIMIT_EXCEEDED`, `BALANCE_FROZEN` |
| `GET /payouts`, `GET /payouts/:id` | Owner | none | none | Read only | N | Payouts and states |
| `POST /payouts/webhook` | RazorpayX (signature only) | Raw body | Valid signature, event id present | §6.6.2 | Deduplicated by (`source`, `eventId`) | 2xx |
| `POST /admin/payouts/manual` | Admin, support | `{ ownerType, ownerId, amount, reason }` | Balance available, not frozen | Always an `ApprovalRequest`. Approval creates a `manual` Payout with its reservation. | **K** | `{ approvalId }` |
| `POST /admin/payouts/:id/mark-paid` | Admin | `{ bankReference }` | Manual Payout `created` | `created → processed`, `payout_settled` | **K** | Payout |
| `POST /admin/payouts/:id/mark-failed` | Admin | `{ reason }` | Manual Payout `created` | `created → failed`, `payout_release` | N | Payout |
| `POST /admin/payouts/:id/resolve` | Admin | `{ action: adopt \| confirm_not_issued, razorpayPayoutId? }` | RazorpayX Payout `unknown` and unresolved by the job | Always an `ApprovalRequest`. On approval: adopt, or move to `submitting`. | **K** | `{ approvalId }` |
| `GET /admin/payouts` | Admin, support | Filters | none | Read only | N | List, including stuck, unknown and unreconciled |

### 6.18 Localisation of messages and result codes

Every user-facing string is available in **English (`en`), Telugu (`te`) and Hindi (`hi`)**, including text the server generates.

**Verified status and scope.**

- **Admin SPA (admin, support and the vendor portal):** the i18next setup exists in `admin/src/i18n.ts` (resources `en`, `te`, `hi`, language stored as `admin_language`) **on the branch `feature/admin-i18n-foundation`. It is not yet merged into `main`, so it is not yet available on `main`** (§5.4 A10). The admin and vendor screens of this plan depend on that merge (§5.4 C9) and must follow that setup.
- **Customer app (`app/`) and driver app (`driver/`):** the plan does **not** assume their i18n exists. A P0 task verifies it. If either app has no i18n, P0 delivers the i18next setup for it with `en`, `te` and `hi`, following the admin convention (a resource file per language, a language switcher, a persisted choice). No payment string ships in an app before its i18n infrastructure exists.
- **Partner website (`frontend/`):** **out of scope** (no payment UI, §1).

**Rules:**

- **Stable codes, not sentences.** API responses return a machine-readable `code` and `params` (for example `AMOUNT_CHANGED` with the new amount, `OTP_LOCKED`, `PAYMENT_IN_PROGRESS`, every `REFUNDED_*` code). The customer app, driver app, vendor portal and admin SPA each translate the code with their own i18next resources. The server never sends English text that an app shows as-is.
- **Text the server itself sends** (push notifications, SMS, emails) is rendered on the server from templates in `en`, `te` and `hi`, using the recipient's saved `preferredLanguage` (English as the fallback). This covers, for example, the handover code SMS, "Your driver is waiting", "Pay pending ₹X", refund and dispute notices, the cash-collected notice and payout notices. The package handover SMS uses the booking customer's language (§6.8) and satisfies any template-registration rule (§5.3).
- **Language preference.** `preferredLanguage` is stored on `User` (customers), `Driver` and `Vendor` (§6.15). Each app sends the change with the `PUT …/me/language` endpoint (§6.17 A) whenever the user changes language (best effort, retried later if offline), and on login adopts the server value if no local choice exists. Admin and support users keep their choice only in the admin app, because the server sends them no localized messages.
- **Numbers, currency and dates** are formatted for the selected language.
- **Every new string** is added to all three locale files of the project that shows it, and to the server templates, in the same change. Files are kept in sync (no missing, extra or empty keys). Enum values (Payment, attempt, refund, incident, goods-return, approval, payout, dispute and order payment statuses, and refusal reasons) are shown through lookup maps to translated labels, never raw.

### 6.19 Security controls, rate limits, retention and monitoring

**Role capabilities (least privilege).**

| Role | Can | Cannot |
|---|---|---|
| Customer | Their own orders, payments, tips, fees, disputes, refusal requests, handover code | Anything on another customer's order. Any amount other than tip, supplement or helper offer. Refunds. |
| Driver | Their assigned orders' state actions, cash collection, refusal reports, evidence, returns. Their own ledger. | Set or send an amount. Mark an order paid online. Switch a method without the customer. Settle refunds or payouts. |
| Vendor | Their own orders: item unavailable, cancel before pickup, goods-return decisions. Their own ledger. | See customers' payment details. Mark orders paid. Anything on another vendor's orders. |
| Support | Read payments, incidents, disputes, ledgers. **Initiate** money actions and escalate. Decide non-money outcomes (§6.9, §6.17). | Approve or execute any money action. Every support-initiated money action needs an admin approver. |
| Admin | Everything support can, execute below the threshold, approve others' requests, record remittances, manage settings. | Approve their own request. |

**Cash fraud controls.** Server-side cash amount (never from the driver). Customer push on every cash collection with a 48-hour dispute route. A driver liability for the cash in the ledger, capped at the cash limit. Paused cash orders beyond the limit. Remittance recorded by an admin. Flags on repeated method switches and on drivers with unusual cash-collected patterns. A daily comparison of cash collected against remittances.

**Rate limits** (Implementation default, D4; enforced per authenticated user and per IP):

| Group | Limit |
|---|---|
| `create-order`, tip or fee create | 10 per minute per user (tip create 5 per minute) |
| `verify` | 20 per minute per user |
| `status` polling | 60 per minute per user |
| OTP verification (`deliver`) | 5 wrong attempts per order and version, 30 per hour per driver, 60 per hour per IP |
| OTP regeneration | 3 per order |
| Handover SMS | 3 per order, 5 per receiver phone per 24 hours |
| Method switch requests | 5 per order |
| Refusal reports | 5 per hour per driver |
| Evidence uploads | 30 per hour per driver |
| Call attempts | 10 per order |
| Payout requests | 3 per day per owner |
| Admin money endpoints | 30 per minute per admin |
| Webhooks | 600 per minute per IP (the signature is the authentication) |

**Retention** (Implementation default — requires product-owner confirmation and legal review before production):

| Data | Kept for |
|---|---|
| Driver GPS pings | 90 days. Pings that are part of an open incident are kept until 180 days after it is terminal. |
| `CallAttempt` logs | 180 days |
| `Evidence` photos | 180 days after the incident is terminal (private storage, signed URLs only) |
| OTP attempt counters | With the order. No OTP or hash is ever stored. |
| `AuditLog`, payments, refunds, ledger, payouts | 8 years |
| `IdempotencyRecord` | 30 days |
| `WebhookEvent` | 90 days |

**Sensitive data.** No card data is stored. No OTP or OTP hash is stored. Phone numbers are masked in logs. Evidence and location data are readable only by admin and support, through audited reads and short-lived signed URLs. Razorpay `notes` and RazorpayX `reference_id` carry internal ids only, never personal data.

**Logging.**

- **Log:** Razorpay ids, amounts, attempt and Payment status changes, method switches, voided Payments, refund and payout state changes, ledger writes, and approval steps.
- **Never log:** secrets, full request headers, signatures, delivery OTPs, or card and bank details.

**Alerts (with severity).**

- **Critical:** ledger mismatch, `refund.failed` after `processed`, over-refunded attempt, a refund in `unknown` for 24 hours, an unaccounted refund at Razorpay, a `captured` Payment with a different attempt (an invariant violation), a `reversed` payout, an unknown payout that stays unresolved.
- **High:** signature-verification failures on either webhook, Payment `flagged`, external refunds, automatic refund failed or `needsReview`, `WebhookEvent` failures, stuck payments, expired leases, stuck payouts, RazorpayX low balance.
- **Medium:** duplicate captures, mismatching second attempts on a settled Payment, lost settle races (cash versus online), late captures refunded, attempts `authorized` past the grace period, overdue or unreturned goods, suspicious refusal patterns, unusual cash-switch patterns, unpaid-balance exposure, stale or unusually large approval requests, payout reconciliation mismatches, `deliveredWithoutOtp` spikes.

---

## 7. Customer app plan

- **SDK:** use the official `react-native-razorpay` native SDK, which opens Razorpay's hosted checkout. The app never collects card or UPI details itself. It needs an Expo **development build or EAS build** (Expo Go can't run it).
- **One wrapper.** All payment screens go through a single helper (`app/utils/razorpay.ts`). Replace the mock inside that helper, not in each screen.
- **Config.** On start and after login, read `GET /config/payments` (§6.12). Show **Online** only if `onlineEnabled`, tips only if `tipsEnabled`, and fees only if `feesEnabled`.
- **Placing an order:**
  - the food, meat and store checkout, and package booking, currently start Razorpay at "Place order". Change them to **place the order without paying**, with a **Cash / Online** choice (Online only if enabled)
  - send items, weights and stops, never totals, with an `Idempotency-Key`
  - for a package: ask when payment is due (at pickup or at drop), and ask for the receiver's name and phone. Explain that online payment is done from the booking customer's own app, that a receiver can hand cash to the driver, and that the receiver gets a handover code only if an SMS is sent.
- **Rides and helper booking:** replace "Paying via cash" with the **Cash / Online** choice. Show the server's minimum when a helper offer is set. Rides can add a fare supplement while searching. The customer approves or rejects extra helper hours.
- **Paying an order:**
  - the tracking screen shows **"Pay ₹X"** when the status endpoint says the order is payable (`payableFromAt` is set, §6.2). It never shows Pay earlier.
  - the app sends only the order id, and opens checkout with what the server returns
  - if the checkout has a failed attempt (for example a declined card), the customer can try another method **in the same checkout**. The Payment stays usable until it settles or its window ends.
  - `PAYMENT_IN_PROGRESS` and `CONFIRMING`: show "Confirming your payment…" and poll the status endpoint. Never show "failed".
  - if the server says the amount changed, show "Amount changed to ₹Y" and reload the payment
  - the customer can switch Cash ↔ Online while no money is in motion (§6.7.12). When a driver requests a switch to cash, show a confirm or decline prompt (10 minutes).
- **Handover code.** Show the code on the tracking screen from pickup, with its state. If it is `locked` or `expired`, offer **Get a new code** (`regenerate`, at most 3). For a package, also offer **Send code to receiver by SMS** if `smsEnabled`, and otherwise show a note "Give this code to the receiver yourself". It is a handover code only.
- **Cash collected notice.** When the driver marks cash collected, show a notification with the amount and a "Report a problem" link to support (48 hours).
- **Tips:** after completion (if `tipsEnabled`), a "Tip your driver" screen shows the allowed range from `GET /payments/tip/limits/:orderId`, then sends the order id and a bounded amount with an `Idempotency-Key`, and opens checkout.
- **Cancelling:** the cancel flow calls the preview, shows the fee (if any), asks the customer to confirm, then calls cancel with the preview token. If the fee changed, it shows the new fee. If a fee is due, it shows **Pay fee**.
- **Refusal and disputes:** while the order is out for delivery the customer can tap **I don't want this order** (`refusal-request`), which cancels delivery immediately. A customer can dispute a refusal incident within 24 hours. The trip receipt has **Dispute fare** for rides and helpers (48 hours), and a way to withdraw it. For a package, the sender can confirm **Package returned**.
- **Pending payments:** a "Pay pending ₹X" banner at the top of home and before any new booking, from `GET /me/pending-payments` (counted items only, §6.11).
- **After paying:** the app shows "Paid" when the server confirms, and the driver's app updates at the same time.

**Result handling** (by result code, translated in all three languages, §6.18):

- **User cancels checkout:** "Payment cancelled". The order stays pending, and they can pay again or switch to cash.
- **A payment attempt fails** (`ATTEMPT_FAILED`): show the reason and allow another attempt.
- **Refunded automatically** (`REFUNDED_AMOUNT_CHANGED`, `REFUNDED_METHOD_CHANGED`, `REFUNDED_NOT_PAYABLE`, `REFUNDED_DUPLICATE`, `REFUNDED_INVALID_PAYMENT`): show "Your payment was refunded" with the reason, and "Please pay ₹Y" where a payment is still due.
- **Double taps:** disable the Pay button while a request is in flight.

**Other rules:**

- **Mock mode:** allowed only in development builds, behind an explicit flag. It must be off in the EAS `production` profile. The backend also rejects mock signatures in production.
- **Transport:** always use HTTPS. Don't log payment responses or OTPs in release builds.
- **Localisation:** every new string goes through the app's i18n in English, Telugu and Hindi (§6.18). If the app has no i18n yet, P0 delivers it (§13).

---

## 8. Driver app plan

- The driver app **never talks to Razorpay or RazorpayX** and holds no keys for either.
- Show the payment method (cash or online), the locked amount and whether the order is payable, on every order, trip and task.
- **At handover or trip end:**
  - **Online:** the driver waits until the status shows "Paid" (socket, with polling as a fallback).
  - **Cash:** the driver collects the cash and taps "Cash collected". The app sends only the versions it was showing, never an amount. If the amount or method changed (`AMOUNT_CHANGED`, `METHOD_CHANGED`), the app refreshes, and for `METHOD_CHANGED` tells the driver to return any cash taken.
- **Goods and packages:** the "Delivered" button stays disabled until the order is paid **and** the customer's delivery OTP is entered. The server enforces both. The app shows OTP errors (`OTP_INVALID` with attempts left, `OTP_LOCKED`, `OTP_EXPIRED`) from the result codes. **Deliver without OTP** is offered only when the refusal flow is enabled and the OTP is locked or expired, with the required photo, and is flagged for review (§6.8).
- **Package:** the driver collects cash from the sender at pickup (`at_pickup`) or the receiver at drop, chosen with `cashCollectedFrom`, only when the order's method is `cash`. Online payment is only from the booking customer, and the driver sees "Paid" when it arrives.
- **Switch to cash:** the driver can only *request* it (`request-cash`). The customer must confirm in their app within 10 minutes.
- Drivers can't edit any amount. Helper extra hours are only *requested* by the helper (`helper-extra-hours`) and approved by the customer.
- **"Arrived":** the driver taps it at the pickup or drop. The server always records the arrival with its geofence and attestation results. It never blocks the driver.
- **Refusal:** **Customer refused / unreachable** unlocks after the wait period (default 10 minutes). The app collects the reason, an in-app photo, and the calls made through the in-app call button (when `CALL_LOGGING_ENABLED`). The server then creates the incident and shows the driver its status (`provisional` or `under_review`) and any failed checks. The driver can **withdraw** it if the customer shows up. If the customer taps "I don't want this order", the driver is told at once.
- **Return flow after a refusal:** the app shows "Return goods to {vendor or sender}" with the deadline (`dueBy`). The driver takes the goods back, then submits a return photo inside the vendor's or sender's geofence. The vendor or sender confirms receipt. The driver stays responsible until the return is `completed`, `closed_loss` or `cancelled`. Earnings for the order are held meanwhile. A driver with an `overdue` return beyond 24 hours, or 3 open returns, is paused from new orders, and the app says why.
- **Cancelling:** the driver can cancel an assignment only before pickup (or trip start). The order goes back to dispatch, and the customer is not charged (§6.10).
- **Earnings screens** (`GET /drivers/me/ledger`) show available, held (with the reason for each hold), reserved, cash owed, tips, and any liability, clearly separated. The driver can see whether a refusal was disputed or overturned (`GET /drivers/me/incidents`).
- **Cash limit:** when `cashPaused`, the app tells the driver they can't take cash orders until the balance owed is remitted.
- **Cash-out** goes through RazorpayX (§11) with the password confirmation the app already has, and is hidden when `payoutsEnabled` is false.
- **Localisation:** every new string goes through the app's i18n in English, Telugu and Hindi (§6.18). If the app has no i18n yet, P0 delivers it (§13).

---

## 9. Vendor side (restaurants and meat centers)

The vendor portal is the vendor role inside the admin SPA, so its screens use the admin app's i18n (§10).

- Vendors see whether each order is cash or online and whether it's paid. They never see customers' payment details.
- Vendors can mark an item unavailable (`items/:itemId/unavailable`), which lowers the locked amount through the server (§6.1). They can't raise it. A reduction voids any open payment, so the customer pays the new amount. Marking the last item unavailable cancels the order.
- Vendors can cancel an order before pickup (`cancel-by-vendor`). This closes it as not payable and **never charges the customer a fee**.
- **Goods returns.** After a refusal the vendor sees "Returned goods expected" with the deadline, and chooses **Received** (confirm), **Decline return** (for example perishable food), or **Goods were not returned** (contest) with a note. Decline and contest go to support (§6.9). A driver report that the vendor doesn't answer within the confirm window also goes to support.
- **Compensation.** Refused orders the vendor prepared are compensated per §6.16 and D3, only after the incident is terminal and the return is closed. The vendor sees the ledger (`GET /vendors/me/ledger`) with held and available amounts.
- Vendors can't change payment methods or mark orders paid.
- **Localisation:** every new vendor-portal string uses the admin app's existing i18n in English, Telugu and Hindi (§6.18).

---

## 10. Admin panel plan

Admin and support use the admin SPA. All screens use the admin app's **existing i18next system** and the three locale files (`en`, `te`, `hi`), with the rules at the end of this section.

- **Payments:** a list per order (purpose, service, method, status), the **attempts** with statuses and failure reasons, Razorpay ids, cash collection, and refund history (`GET /admin/payments`).
- **Refunds:** manual Razorpay refunds and cash refunds, each with a mandatory reason and a confirmation step. The UI generates a fresh `Idempotency-Key` each time a confirmation dialog opens, and re-submits reuse it (§6.13.7). Cash refunds have **Mark paid** (with the payout reference) and **Cancel**. Failed automatic refunds have **Reissue**. Refunds in `unknown` have **Resolve**.
- **Approval queue:** every request waiting for a second person, with the initiator, amount and reason. Admins approve or reject. An admin cannot approve their own request.
- **Lists and views:**
  - unpaid orders and fees (only those that count under §6.11), and orders closed as `not_payable` or `written_off`, with the reason
  - **flagged and voided Payments**, mismatches and automatic refunds
  - **external refunds**, with an alert state
  - **stuck or unknown refunds** and expired payment leases
  - **incidents:** a review queue with the full evidence (GPS trace, call log, photos, notifications, OTP attempts, attestation results), decision buttons (uphold or overturn, with the driver-liability option), escalation, and the flagged patterns (§6.9). Evidence is opened through short-lived signed links, and every read is audited.
  - **goods returns:** pending, driver-reported, declined, contested and overdue cases, with the decision buttons (§6.9)
  - **fare disputes:** the trip evidence, and reject or reduce with a reason (§6.10)
  - **deliveries without OTP** (flagged), and cash-collected anomalies
  - blocked or limited customers, and unpaid-balance exposure, with `PUT /admin/users/:id/payment-limits`
  - **driver cash balances** and **Record remittance**
  - **ledger** views per driver and vendor (available, held with reasons, reserved), manual adjustments (always approval), and frozen balances
  - **payouts:** automated and manual, stuck, unknown and unreconciled, and **manual payout** creation, **Mark paid** and **Mark failed**
  - stuck and mismatched payments from the reconciliation job, and **payout reconciliation** results (§11)
  - **audit log** search
- **Settings** (`PUT /admin/settings/payments`): every value in §15.2, versioned and audited. Admin only.
- Never display or store secrets in the admin SPA.

**Localisation (i18n).** All of these screens, and the vendor-portal screens in §9:

- every label, button, table header, dialog, toast, validation message, empty state and loading state comes from `t()` keys, with no hardcoded English
- values such as Payment status, attempt status, purpose, refund status, approval status, incident status, goods-return status, dispute status, payout status, ledger entry type, order payment status and refusal reason are shown through lookup maps to translated labels. The raw enum values are never shown or translated in place.
- server result codes are translated the same way (§6.18)
- amounts and dates are formatted for the selected language
- new keys are added to all three locale files in the same change, and the locale files are kept in sync (no missing, extra or empty keys)
- the screens are checked in English, Telugu and Hindi before release (§12, §13)

---

## 11. Driver and vendor payouts

Payouts are a **separate module** from customer payments. They have their own config, client, webhook route, secret, deduplication store and queue. Nothing here can create, settle or refund a customer Payment, and nothing in the customer payment flow can start a payout. A payout is only ever made **from a ledger balance** (§6.16), to a driver or vendor.

### 11.1 Channels and flags

- **`razorpayx`** channel: automated payouts, active only when `PAYOUTS_ENABLED=true`. Needs the RazorpayX account, keys, account number and webhook (§5.2).
- **`manual`** channel: always available (from P2). An admin requests it, another admin approves, finance transfers the money by bank, and an admin records the bank reference (§6.7.9, §11.8). This is how drivers and vendors are paid **before P6**, and it remains the fallback. Cash-out buttons in the apps are hidden while `PAYOUTS_ENABLED` is false, and the apps still show balances.

### 11.2 What can be paid

Only `LedgerBalance.available` (§6.16). Earnings sit in `held` until their holds clear (post-delivery window, incidents, goods returns, fare disputes). Refunds and liabilities are already reversed or debited in the ledger, so nothing that can still be refunded or contested is paid out.

### 11.3 Payout accounts and verification

**`PayoutAccount`:** `ownerType`, `ownerId`, `holderName`, `accountLast4`, `ifsc`, `contactId`, `fundAccountId`, `verificationStatus` (§6.7.14), `verifiedAt`, `verificationRef`, `changedAt`, `payoutsBlockedUntil`. Unique on (`ownerType`, `ownerId`).

- The full account number is sent to RazorpayX **once** when creating the fund account. The `PayoutAccount` keeps only the last 4 digits, the IFSC, the holder name and the RazorpayX ids. If the existing driver or vendor bank-detail models already store the full number, they must be encrypted at rest (a P0 task).
- **Reuse:** the RazorpayX contact and fund account are created once per owner and stored (`contactId`, `fundAccountId`). They are never recreated per payout.
- **Verification:** a penny-drop through RazorpayX (`POST /payouts/account/verify`). Payouts need `verificationStatus = verified`.
- **Bank changes:** `PUT /payouts/account` needs password re-confirmation, sets the status to `unverified`, sets `changedAt`, and starts a **24-hour cooling-off** (`payoutsBlockedUntil`). Payout requests are refused until the account is `verified` again **and** the cooling-off is over.

### 11.4 Payout requests

`POST /payouts/request` (§6.17 F) requires password re-confirmation and an `Idempotency-Key`, and enforces minimum and maximum amounts and a daily limit (§15.2). In one MongoDB transaction it checks `available ≥ amount` and not `frozen`, creates the Payout (`created`, idempotency key unique per owner), and writes the `payout_reserve` ledger entry. If the balance is short, nothing is created.

### 11.5 Submission (`razorpayx` channel)

The `payout-submit` job (own queue) does the following. It uses the RazorpayX client only, which is a direct HTTP client for the RazorpayX API (§5.4 C5).

1. Take the lease: `created → submitting`, set `submitStartedAt` and `retryNotBefore = now + 10 minutes`.
2. Call RazorpayX to create the payout with the fund account, the amount, `currency = INR`, `mode = IMPS`, `purpose = payout`, `queue_if_low_balance = true`, **`reference_id = payout id`**, and `notes = { payoutId }`. Send the payout id as the RazorpayX idempotency header.
3. Classify the outcome, exactly as for refunds:
   - **Accepted** (2xx with a payout id): store `razorpayPayoutId`. Map the reported status to `queued` (queued, pending, scheduled) or `processing` (initiated, processing). The final result always comes from a fetch or the webhook.
   - **Definitive rejection** (HTTP 400): `failed`, reservation released (`payout_release`), `failureCode` stored.
   - **Not processed** (401, 403, 429): back to `created` with backoff and an alert.
   - **Unknown** (timeout, network error, 5xx, unparseable): `unknown`, **reservation kept**.

### 11.6 Unknown outcomes

The `payout-resolve` job runs only after `retryNotBefore` (far longer than the HTTP timeout):

1. Look up RazorpayX by `reference_id` (or fetch by `razorpayPayoutId` if known).
2. If a payout exists: **adopt its state** (`queued`, `processing`, `processed`, `failed`, `rejected`) and apply that transition.
3. If none exists and the lookup itself succeeded: move to `submitting` (`retryCount + 1`) and call again with the **same** `reference_id` and idempotency key. RazorpayX will not create a second payout for a repeated idempotency key.
4. If the lookup fails or is ambiguous: stay `unknown` and retry the lookup. After 24 hours, a critical alert fires, and an admin uses `POST /admin/payouts/:id/resolve` (approval always required).

A timeout therefore never causes a second payout, and the reservation is never released while the outcome is unknown.

### 11.7 Webhook and reconciliation

- **Webhook** (`POST /payouts/webhook`, §6.6.2): dedupes on `WebhookEvent`, fetches the payout, and applies the transition (`processed` finalizes the reservation, `failed` and `rejected` release it, `reversed` credits it back). It is idempotent, and replays are no-ops.
- **`payout-reconcile`** (own queue, every 15 minutes, plus a full daily comparison):
  - payouts stuck in `created`, `submitting`, `queued`, `processing` or `unknown` beyond a threshold: fetch their real state and apply it
  - RazorpayX payouts (recent days) compared with internal Payout records and ledger reservations: a payout with **no internal record** (made outside the system), an internal `processed` payout that RazorpayX doesn't show, or an amount mismatch raises a critical alert
  - payouts reconciled are marked `reconciledAt`
  - RazorpayX balance is compared with queued payouts, and a low balance raises a high alert (payouts sit `queued` when the balance is low)

### 11.8 Manual payouts

An admin or support user requests `POST /admin/payouts/manual`. It always creates an `ApprovalRequest`. On approval, a `manual` Payout (`created`) and its reservation are created. Finance transfers the money by bank. An admin then records the bank reference with `POST /admin/payouts/:id/mark-paid` (`created → processed`, `payout_settled`), or `mark-failed` (`created → failed`, `payout_release`). Each step is audited and idempotent.

### 11.9 Data model

**`Payout`:** `ownerType`, `ownerId`, `channel` (`razorpayx`, `manual`), `amount`, `status` (§6.7.9), `idempotencyKey` (unique per owner), `referenceId` (= the payout id), `payoutAccountId`, `contactId`, `fundAccountId` (snapshot), `razorpayPayoutId` (unique sparse), `mode`, `utr`, `bankReference` (manual), `failureCode`, `failureReason`, `reserveEntryId`, `submitStartedAt`, `retryNotBefore`, `retryCount`, `lockOwner`, `lockExpiresAt`, `reconciledAt`, `statusHistory[]`, `requestedBy`, `approvalId` (manual).

### 11.10 Other rules

- **Mock mode:** the payout mock is for development only. With `PAYOUTS_ENABLED=true` in production, the server refuses to start if the RazorpayX keys or account number are missing or are a placeholder (§5.2).
- **Audit:** log every payout with the requester, amount, destination (last 4 digits only) and status.
- **Limits:** minimum, maximum per request, and daily total per owner (§15.2).

---

## 12. Testing plan

**Test-mode credentials** (from Razorpay's docs):

| Method | Value | Result |
|---|---|---|
| Card | `4111 1111 1111 1111`, any future expiry, any CVV | Success |
| UPI | `success@razorpay` | Success |
| UPI | `failure@razorpay` | Failure |

**Local webhooks:** expose the local backend through a tunnel (ngrok or cloudflared) and point the **test-mode** webhooks at it (both the payments webhook and, when testing payouts, the payouts webhook). Tests that need failures (timeouts, lost responses, definitive rejections) use a **fault-injecting stub** in front of the Razorpay and RazorpayX clients.

Every test below has one deterministic expected outcome. All must pass before the phase that introduces the feature goes to production (§13).

### 12.1 Required safety scenarios (S1 to S50)

**Settlement, attempts, expiry (phase P4)**

1. **Duplicate verify.** Call verify twice for one captured payment. Both return `SETTLED`. The Order has one `paidAttemptId`, one set of ledger entries, and no Refund exists.
2. **Verify and webhook race.** Fire verify and the `payment.captured` webhook together. Exactly one performs the atomic settle. The other returns `SETTLED` (or `CONFIRMING`, then `SETTLED` on retry). No Refund exists.
3. **Webhook, then verify.** The webhook settles first. A later verify finds its own attempt on the target and returns `SETTLED` with no duplicate effects.
4. **Crash after Order settlement.** Kill the worker after the atomic settle and before finalization. On restart, the `effects-finalizer` or the next run finds `paidAttemptId` and completes: Payment `captured`, ledger written, "Paid" event sent. **No Refund is created.**
5. **Crash before Payment settlement linkage.** Kill the worker while it holds the lease and before the atomic settle. After the lease expires, the next run performs the settle. The Order is settled exactly once.
6. **Processing lease expiry.** Let a lease expire mid-run so a second run takes over. Whichever loses the atomic settle re-reads and lands on its own recorded attempt. Settled once, **the attempt is not refunded**.
7. **Late capture.** A capture arrives after `expiresAt` while the Payment is `created` or `expired`, and the target is still valid. It settles (`expired → captured` where applicable).
8. **Expired Payment plus replacement.** P1 expires, P2 is created, P1 then captures with a valid target. P1 becomes `captured` with **no duplicate-key error**, P2 is voided (`order_settled`). If P2 also captures, its attempt is unapplied and auto-refunded once (`auto:{P2 attempt}:1`).
9. **Duplicate capture.** Two attempts on one Payment both capture. The first is applied. The second is `unapplied`, refunded once, and the Payment stays `captured`. The customer gets `REFUNDED_DUPLICATE`.
10. **Amount mismatch.** A capture whose amount differs from a `created` Payment: the Payment becomes `flagged`, the attempt is `unapplied`, the captured money is refunded, an alert fires, and the response is 2xx. The same mismatching capture on an already `captured` Payment leaves the Payment `captured` and refunds only the extra attempt.
11. **Version mismatch.** Payment at version 1, Order at version 2, captured: `REFUNDED_AMOUNT_CHANGED`, the Payment is `void`, one refund, and the Order is unchanged.

**Cash and online (P4)**

12. **Cash and online race.** Fire an online capture and a switch-to-cash together. Exactly one wins. If the switch wins, the capture is `REFUNDED_METHOD_CHANGED`. If the capture wins, the switch returns `ALREADY_PAID`.
13. **Online selected, driver collects cash.** `cash-collected` on an order with `paymentMethod = online` returns `METHOD_CHANGED` (409). The order stays `pending`.
14. **Cash selected, online captured.** A capture from a Razorpay order created before a switch to cash is unapplied and refunded (`REFUNDED_METHOD_CHANGED`). The order stays cash and `pending`.

**Refunds (P4)**

15. **Refund timeout.** The stub times out the refund call. The Refund is `unknown`. `refundReservedAmount` is unchanged. **No second call is made before `retryNotBefore`.**
16. **Refund response lost.** The stub processes the refund but drops the response. The resolve job finds it by `receipt` and adopts it. Exactly one refund exists at Razorpay, and the Refund is `processed`.
17. **Refund webhook before response.** `refund.processed` arrives while the Refund is `submitting`. It becomes `processed`. The late API response is discarded. One refund.
18. **Refund webhook replay.** The same event id twice is processed once. A different event id for the same refund and state is a no-op. Balances are unchanged.
19. **Definitive refund failure.** HTTP 400 on an automatic refund: `failed`, reservation released, `needsReview`, an alert. An admin `reissue` creates generation 2. A `refund.failed` event instead triggers automatic generation 2, and a third failure sets `needsReview`.
20. **Partial refund.** ₹200 of a ₹500 attempt: attempt, Payment and Order become `partially_refunded` (`orderRefundedAmount = 200`). A second refund of ₹300 makes them `refunded`.
21. **Duplicate partial refund.** The same `Idempotency-Key` twice creates one Refund. Two concurrent refunds of ₹300 against ₹500 remaining: one succeeds, the other gets `REFUND_EXCEEDS_REFUNDABLE`.
22. **Tip refund (P5).** A settled tip is refunded: `tip.status = refunded`, the driver's tip credit is reversed, and **`Order.paymentStatus` is unchanged**.
23. **Cancellation-fee refund (P5).** A settled fee is refunded: `cancellationFee.status = refunded`, the fee shares are reversed, and `Order.paymentStatus` is unchanged.
24. **Cash refund (P2).** A cash-paid order with a manual cash refund: after approval the Refund is `reserved`. **The Razorpay stub records zero calls.** After `mark-paid` it is `processed`, `cashRefundedAmount` is updated, and W7 sets the order status. A refund above the cap is `REFUND_EXCEEDS_REFUNDABLE`.

**Payouts (P6, plus manual in P2)**

25. **Payout timeout.** The stub times out the submit. The Payout is `unknown` and the reservation is kept. The resolve job finds none for the `reference_id` and resubmits with the same key. Exactly one payout exists at RazorpayX.
26. **Payout webhook replay.** A duplicate event id is a no-op. A replayed `processed` does not write `payout_settled` twice.
27. **Payout reversal.** `processed → reversed` writes `payout_reversal`, restores the balance, and raises a critical alert.
28. **Payout failure.** `failed` or `rejected` releases the reservation and restores `available`.

**Refusal, returns, disputes (P3, except where marked)**

29. **Driver refusal, all checks pass.** Incident `provisional`, GoodsReturn `required`, `activeIncidentId` set, the order cannot be paid or cancelled. When the 24-hour window ends with no dispute, the incident becomes `upheld` and an unpaid order becomes `written_off`.
30. **Failed attestation.** `arrive` still records the arrival (never rejected). The refusal creates an `under_review` incident with attestation in `failedChecks`, never `provisional`.
31. **Unavailable attestation.** With `ATTESTATION_MODE = off`, or a device that cannot attest: `under_review`. "Deliver without OTP" is `ATTESTATION_REQUIRED` in `enforce`, and allowed and flagged in `off`.
32. **Customer dispute.** A dispute on a `provisional` incident moves it to `under_review`, and it is **not** auto-upheld. A support decision `overturned` writes off the order, and the driver gets a strike.
33. **Goods return.** The driver reports → `driver_reported`. The vendor confirms → `completed`. Holds are released. For an upheld unpaid order, the driver share is created.
34. **Vendor contest.** `driver_reported` → vendor contests → `support_review` → support `driver_liable` → `closed_loss`. A `liability_debit` equal to the items subtotal is written.
35. **Fare dispute (P2 for unpaid and cash-paid fares, P4 for paid-online fares).** Reduce an unpaid fare: W4 (version + 1, open Payments voided). Reduce a paid-online fare: a partial refund `sys:…`. Reduce a paid-cash fare: a cash refund. Reject: holds released.
36. **Overturned refusal on a paid order.** Full refund `sys:{orderId}:order:refusal_overturned:1`, the order becomes `refunded`, and both earnings are reversed.

**OTP (P2)**

37. **OTP expiry.** After expiry, `deliver` returns `OTP_EXPIRED`, `GET handover-code` returns no code, and `regenerate` gives a new code. The old code is rejected.
38. **OTP resend.** The 4th `send-sms` for an order is `SMS_LIMIT`. A 6th SMS to one receiver phone within 24 hours across orders is `SMS_LIMIT`. SMS goes only to `receiverPhone`.

**Security and isolation (all phases)**

39. **Unauthorized access.** Every protected endpoint without a token returns 401. With a wrong role it returns 403.
40. **Cross-user access.** Customer B calling `create-order`, `verify`, `cancel`, `handover-code`, `status` and `refusal-request` on customer A's order gets 404, and nothing changes.
41. **Cross-vendor access.** Vendor B calling `items/:itemId/unavailable`, `cancel-by-vendor` and `goods-return/vendor-decision` on vendor A's order gets 404.
42. **Idempotency replay.** The same `Idempotency-Key` and body on an admin refund returns the stored response with one Refund. A different body returns `IDEMPOTENCY_MISMATCH`. A missing key returns `IDEMPOTENCY_KEY_REQUIRED`. Two concurrent identical requests: one runs, the other gets `REQUEST_IN_PROGRESS`.
43. **Webhook signature failure.** A wrong or missing signature (either webhook) returns 401, changes nothing, and raises an alert.
44. **Webhook duplicate.** The same event id twice returns 200 both times and is processed once.
45. **Stale version.** `cash-collected` with an old `amountVersion` returns `AMOUNT_CHANGED`. A switch with an old `methodVersion` returns `STALE_VERSION`. `increase-price` after acceptance returns `TOO_LATE`.

**Concurrency and recovery (all phases)**

46. **Concurrent amount reduction.** Two vendors' item-unavailable requests on different items at once: the second retries once on the new version. The final amount equals the price of the remaining items and never exceeds the previous amount.
47. **Concurrent cancellation.** Customer and vendor cancel together: exactly one W5 wins, and the other gets `STATE_CONFLICT`. A fee exists only if the customer's cancel won and it was eligible. A customer cancel racing an online capture follows test 12.
48. **Concurrent refund.** Two admins refund the same attempt at once for more than the remaining balance: at most one reserves, and there is no over-refund.
49. **Server restart during processing.** Kill the server with a `processing` Payment, a `submitting` Refund and a `submitting` Payout. After restart, leases expire and jobs resume. The final state equals an uninterrupted run, with no duplicate money movement.
50. **Queue and job retry.** A webhook job that fails twice then succeeds has a single effect. After the last retry, `WebhookEvent` is `failed` with an alert. A redelivered `refund-submit` job makes only one Razorpay call (the lease).

### 12.2 Additional test groups

**Pricing, amounts and the payable rule (P1, P2)**

- [ ] Changing prices, totals, meat weights, fees, the ride fare or the helper offer in any request leaves the server-calculated price
- [ ] A vendor raising a menu price after the order is placed does not change the locked amount (the snapshot is used)
- [ ] The final ride or helper fare can't be changed from the customer or driver app. The ride fare equals metered fare plus supplement. The helper amount equals offer plus approved extra hours at the agreed rate.
- [ ] Raising another user's price, lowering a price, or raising after acceptance is rejected
- [ ] An item removed so the recomputed amount would be higher: the amount stays at the previous value. Every item removed: the order is cancelled by the vendor, `not_payable`, no fee.
- [ ] Changing the amount of a paid order is rejected. A zero-amount order is `paid` with `paidVia = zero_amount` and has no Payment.
- [ ] `create-order` and `cash-collected` are rejected until `payableFromAt` is set, for each service and timing (goods: `picked-up`; package `at_drop`: `picked-up`; package `at_pickup`: `arrive(pickup)`; rides and helpers: `complete-trip`)
- [ ] `arrive` never sets `payableFromAt` except for a package `at_pickup` at the pickup stage
- [ ] A package paid early (after `arrive(pickup)`) can't be cancelled in the app
- [ ] An **unpaid** `at_pickup` package can be cancelled by the customer, or re-dispatched by the driver, after the driver arrived at pickup. The driver's cancel clears `payableFromAt` and the arrival and voids open Payments. A capture that lands afterwards is refunded (`REFUNDED_NOT_PAYABLE`).
- [ ] After a vendor item removal or an approved fare reduction, the `priceSnapshot` commission and shares match the new amount, and the earnings created at settlement use them

**Payments, attempts and states (P4)**

- [ ] A card attempt fails and a UPI attempt then succeeds on the same checkout: one Payment, two attempts, settled once. The Payment was never `failed` (there is no such status).
- [ ] `payment.failed` after `payment.captured` on the same Razorpay order: the order stays settled and the failure is only on its attempt
- [ ] An attempt that is only `authorized`: nothing settles or fails, and the app shows "confirming". Past the grace period an alert fires and it is never settled.
- [ ] `create-order` while a Payment is `processing` returns `PAYMENT_IN_PROGRESS` and creates nothing
- [ ] Two rapid `create-order` calls: one Payment only (the unique open index)
- [ ] `create-order` with an expired open Payment: runs `S` for captured attempts first, then expires it and creates a new one
- [ ] A late capture on a `void` or `flagged` Payment is refunded and never settles
- [ ] A `processing` Payment is voided by an amount change: the lease holder refunds its captured attempt and does not settle. If the holder is dead, `payment-reconcile` refunds it.
- [ ] Create a payment for another user's order, an order set to cash, or an order not payable yet: rejected
- [ ] A fake or altered signature, or a mock `sig_…` signature on a production-configured server, is rejected
- [ ] Replaying an old valid payment against a new order is rejected
- [ ] A payment on an order that gets an active incident (or is cancelled or written off) is refunded (`REFUNDED_NOT_PAYABLE`)
- [ ] `payment.authorized` then `payment.captured` out of order (captured first): the attempt ends `captured` and the late `authorized` is ignored
- [ ] A verify whose Razorpay payment has a different `order_id` than the one sent: `INVALID_PAYMENT`, the Payment untouched, an alert

**Webhooks (P4, P6)**

- [ ] A payout event sent to the payments webhook, and a payment event sent to the payouts webhook, are rejected
- [ ] The RazorpayX secret can't validate a payments webhook, and the Razorpay secret can't validate a payouts webhook
- [ ] An unknown Razorpay order id is logged and alerted, and nothing changes
- [ ] A refund made in the Razorpay dashboard is recorded as an `external` refund, alerted and shown to admins. The daily comparison finds one whose webhook was dropped. An external refund above the cap sets `overRefunded` and a critical alert.

**Method switching (P4)**

- [ ] Switching to cash with a `created` Payment that has no attempts, or only failed ones: allowed, the Payment is `void`
- [ ] Switching to cash while an attempt is `authorized`, or a Payment is `processing`: `PAYMENT_IN_PROGRESS`
- [ ] Switching to cash while an attempt is `captured` at Razorpay: the order settles online and the switch returns `ALREADY_PAID`
- [ ] A driver `request-cash` changes no state. It expires after 10 minutes. Only the customer's `switch` changes the method.
- [ ] Cash → online is rejected once cash is collected (`ALREADY_PAID`). Cash collection versus a cash→online switch: exactly one wins.

**Delivery OTP (handover only, P2)**

- [ ] `deliver` on an unpaid order is `NOT_PAID`. A wrong, missing or `locked` code is rejected. Five wrong attempts lock the code, with per-driver and per-IP limits.
- [ ] The database holds no OTP and no OTP hash (a dump can't reveal or brute-force codes)
- [ ] The OTP can't be used to create, view or pay any payment, log in, or open any order or payment session
- [ ] "Deliver without OTP" without the required geofence result, wait time and photo is rejected. When allowed it is flagged, sets `deliveredWithoutOtp` and holds earnings 48 hours.
- [ ] The receiver's handover SMS is sent only when `SMS_ENABLED`, only to `receiverPhone`, and contains no payment information. With SMS off, the customer's app shows the code and the driver app shows the "ask" message.
- [ ] No other SMS is ever sent (booking, payment, reminder, refund, dispute)

**Package receiver and D1 (P2, P4)**

- [ ] There is no receiver payment path, link, session or OTP. Only the booking customer can create an online payment for a package order.
- [ ] Cash handed over by the receiver at drop is recorded with `cashCollectedFrom = receiver`, the booking customer is the payer of record, and the customer is notified
- [ ] A receiver who refuses cash leads to a refusal (`payment_refused`) and a goods return to the sender
- [ ] Online selected, receiver offers cash: the driver's request expires unless the customer confirms

**Order states and unpaid counting (P2)**

- [ ] A completed unpaid order blocks new bookings, counts toward the cap, and gets reminders. A cancelled order is `not_payable` and does none of these.
- [ ] An active incident (`provisional` or `under_review`) does not block or count. After `upheld` or `overturned` the unpaid order is `written_off` and does not block or count.
- [ ] An in-progress order shows "Pay ₹X" but doesn't block or count. An order with an open fare dispute doesn't block during the review period, counts toward the cap, and has reminders paused.
- [ ] An unpaid cancellation fee blocks, counts and reminds. A paid, waived or refunded one doesn't (P5).
- [ ] The unpaid-balance cap, the refused-order thresholds (2 and 3 upheld incidents in 90 days), and the new-account limits are enforced at order placement
- [ ] A driver `driver-cancel` re-dispatches and never charges a fee. `system-cancel` closes `no_driver_found` and `vendor_no_response` with no fee.

**Tips and cancellation fees (P5)**

- [ ] A tip above the maximum or below the minimum is rejected. A tip for another customer's order, an order not completed, or after the window is rejected.
- [ ] A tip request can't choose the recipient (the server copies it from the order)
- [ ] The same tip `Idempotency-Key` returns the same Payment. The same key with a different amount is `IDEMPOTENCY_MISMATCH`.
- [ ] A second tip on the same order (even after a refund of the first) is rejected. A duplicate tip capture is refunded.
- [ ] A tip settles once and credits the driver once
- [ ] A cancellation fee is calculated by the server and can't be set from the app. Vendor, system and driver cancellations, an item-unavailable cancellation, and "no driver found" have no fee.
- [ ] Preview then confirm with a changed fee: no cancellation, `FEE_CHANGED` with the new fee. An expired preview token is `PREVIEW_EXPIRED`.
- [ ] The order can never be cancelled with an eligible fee unstored (the fee is set in the same update as W5)
- [ ] The fee payment uses the stored amount only. A waiver voids an open fee Payment and stops any capture from settling it.
- [ ] Starting the server with `TIPS_ENABLED` or `CANCELLATION_FEES_ENABLED` and `PAYMENTS_ONLINE_ENABLED=false` fails

**Refusal abuse and goods return (P3)**

- [ ] A refusal report before the minimum wait is `TOO_EARLY`. Without arrival it is `NOT_ARRIVED`. After the OTP is used, or on a cash-paid order, it is rejected. On any other precondition failure no incident exists.
- [ ] With `CALL_LOGGING_ENABLED = false` every incident is `under_review`
- [ ] A driver on the refusal-approval list, a reused photo, or a mock-location flag produces `under_review`
- [ ] The customer's `refusal-request` creates or upgrades to `upheld` and starts the goods return immediately
- [ ] A driver `withdraw` clears the incident, cancels the goods return, and lets delivery proceed
- [ ] An overdue return escalates to `support_review` after 24 hours and pauses the driver. A driver with 3 open returns is paused.
- [ ] Vendor compensation and the driver delivery share are created only when the incident is terminal **and** the return is closed
- [ ] An incident is never created for a cash-paid order

**Ledger and cash (P2)**

- [ ] Cash collection writes `cash_liability` for `payableAmount` and the earnings entries. `LedgerBalance` equals the sum of entries.
- [ ] A driver whose exposure reaches the cash limit is `cashPaused`. A remittance or released earnings clears it.
- [ ] Holds: an entry moves to `available` only after every hold is cleared and `releaseAt` passes
- [ ] Refund reversals are proportional (`floor`) and follow the scope rules (upheld: vendor only; overturned: both)
- [ ] A `ledger-verify` mismatch freezes payouts for that owner
- [ ] A manual adjustment always needs a different approving admin

**Approvals and admin (P2)**

- [ ] Every money action started by `support` creates an `ApprovalRequest`. An admin action at or above ₹500, or beyond the ₹5,000 daily total, creates one. Below both, it executes at once.
- [ ] The initiator cannot approve (`SELF_APPROVAL_FORBIDDEN`). An expired request executes nothing, and its `pending_approval` Refund becomes `cancelled`.
- [ ] Manual payouts, ledger adjustments and unknown-refund resolutions always need approval
- [ ] An approved action that fails deterministically ends `execution_failed` with an alert
- [ ] Refund, approval, write-off and settings endpoints are rejected for customers, drivers and vendors

**Payouts (P2 manual, P6 RazorpayX)**

- [ ] A payout retried with the same `Idempotency-Key` creates one Payout. A request above `available`, below the minimum, above the maximum or over the daily limit is rejected. A `frozen` balance is `BALANCE_FROZEN`.
- [ ] A request right after a bank-detail change is `COOLING_OFF`. An unverified account is `ACCOUNT_NOT_VERIFIED`.
- [ ] The reconciliation job alerts on a payout with no internal record, an internal `processed` payout RazorpayX doesn't show, and a stuck payout
- [ ] Payouts and customer payments never share a webhook, secret, client or queue
- [ ] With `PAYOUTS_ENABLED=false`: the server starts with no RazorpayX secret, RazorpayX endpoints return `FEATURE_DISABLED`, cash-out is hidden, and manual payouts still work
- [ ] A manual payout follows `created → processed` or `failed`, with the reservation finalized or released

**Startup and configuration (P0)**

- [ ] `PAYMENTS_ONLINE_ENABLED=true` with a missing Razorpay key or webhook secret fails to start. `PAYOUTS_ENABLED=true` with a missing RazorpayX secret or a placeholder account number fails.
- [ ] A mock or bypass flag on in production fails to start, in every mode. A MongoDB without transactions fails to start.
- [ ] `PaymentSettings` ranges are validated, and every change is versioned and audited

**Localisation (each phase, for the strings it adds)**

- [ ] The new admin and vendor-portal screens show no hardcoded English, and every key exists in `en`, `te` and `hi` with no missing, extra or empty keys
- [ ] The same key checks pass for the customer-app and driver-app strings
- [ ] Every status in §6.7 and every result code has a translated label in all three languages in each app that can show it
- [ ] Push, SMS and email templates exist in all three languages and use the recipient's saved language, falling back to English
- [ ] Changing language calls the `PUT …/me/language` endpoint and updates the screens without a reload, and the choice persists

**Secrets and data**

- [ ] The app bundles, logs and git history contain no secrets or OTPs
- [ ] Evidence is reachable only through short-lived signed URLs by admin and support, and each read is audited. Retention jobs remove data past its limit.

---

## 13. Rollout phases

Phases run **in order, and no phase depends on a later phase**. Each phase is shippable on its own. Every feature is behind a flag (§5.2), so the platform works with online payments, refusal handling and RazorpayX all disabled.

**Dependency graph:** P0 → P1 → P2 → P3 → P4 → P5, and P2 → P6. P7 is the go-live verification run once for each feature that is switched on.

| Phase | Depends on | Implementation | Flags | Required infrastructure and decisions | Required tests | Exit criteria | Production traffic |
|---|---|---|---|---|---|---|---|
| **P0. Foundation** | none | The **existing-repository security and compatibility fixes** (§5.4 C1 to C8, C9 and C10 as described there) and the inventory tasks (§5.4 B), then all collections and indexes (§6.15), the enums of every state machine (§6.7), `PaymentSettings` and flags, startup checks, `AuditLog`, `IdempotencyRecord` middleware, the result-code catalogue, the Razorpay and RazorpayX **client split** (and removing the import-time key throw), **verification tasks**: MongoDB replica set and transactions, push tokens in all three apps, GPS history storage, private Cloudinary delivery, attestation SDK feasibility, bank-detail encryption at rest, **provider API checks in test mode** (Razorpay: `receipt` and `notes` accepted on refunds and returned when listing a payment's refunds, and `amount_refunded` on the payment. RazorpayX: `reference_id` lookup and the payout idempotency header. If any behaves differently, only the lookup step in §6.13.4 or §11.6 changes, and re-calls stay blocked until a lookup succeeds), **i18n infrastructure in the customer app and driver app** (built if missing) | none | MongoDB replica set (RBI). D7 and the retention sign-off are started. | Startup and configuration group, idempotency, audit | The server boots with every flag off. Transactions verified. The infrastructure report (§5.3) is filled in. i18n exists in all three apps. The §5.4 fixes C1 to C4 are deployed and tested, the test infrastructure (C6) runs, and the §5.4 B inventory is written. | **No new payment behaviour.** Deployable with everything off. The §5.4 security fixes (C1 to C4) go to production as soon as they pass their tests, independently of every flag. |
| **P1. Server pricing** | P0 | §6.1: server calculation for all services, `priceSnapshot`, amount locking and versioning, coupon rules, client totals ignored, W8 (zero amount) | none | none | Pricing group | Pricing and amount tests pass for every service | **Yes** (fixes today's client-trusted prices) |
| **P2. Cash-only pay-later** | P1, and the §5.4 fixes C1 to C4 and C6 (done in P0), with C8 and the balance part of C10 resolved before P2 starts | Cash/Online choice (Online is rejected while off), milestones and the payable rule (§6.2), cash collection W2, customer, vendor and system cancellation (W5, never a fee), the vendor "item unavailable" amount change (W4), driver cancellation, the delivery OTP lifecycle (`deliver`, `handover-code`, regenerate, SMS if enabled), the counting rules, limits and reminders (§6.11), the **earnings ledger** (§6.16), `AuditLog` viewer, the **approval engine** and its admin screens, admin write-off, **cash refunds**, fare disputes and the ride supplement and helper extra-hours rules (§6.10), **manual payouts** (§11.8), settings and payment-risk admin, driver and vendor ledger screens, all i18n for these | none (cash-only is the default) | Push (RBI). SMS optional (D7). D1, D2, D4, D9 defaults active. | S24, S35 (unpaid and cash parts), S37, S38, S39 to S42, S45 to S47, S49, S50 (the parts that apply), pricing, OTP, counting, ledger, approvals, payouts (manual), package-receiver groups | Exit tests pass in staging. Ledger balances verified. | **Yes: the cash-only launch.** No tips, fees, online payment, refusal flow or RazorpayX. |
| **P3. Refusal and goods return** | P2 | §6.9: arrival verification, evidence and call attempts, incidents and goods returns with their admin queues, customer `refusal-request`, holds, pause rules, pattern jobs, the incident finalization for **unpaid** orders | `REFUSAL_FLOW_ENABLED`, `CALL_LOGGING_ENABLED`, `ATTESTATION_MODE`, `SMS_ENABLED` | GPS history, geofence, push, private photo storage (RBI). Attestation SDK (RBT). Retention sign-off (RBP). D6 and D7 defaults. | S29 to S34, the refusal-abuse group, ledger holds | All refusal tests pass. Retention signed off. | **Yes**, with `REFUSAL_FLOW_ENABLED` |
| **P4. Online payments and refunds** | P3 | Razorpay `Payment` and `PaymentAttempt` (§6.7.2, §6.7.3), `create-order`, `verify`, `status`, the settlement procedure `S` (§6.5), the payments webhook (§6.6.1), `payment-reconcile`, `payment-expiry` and `effects-finalizer` jobs, online→cash switching with the Razorpay state check, the **whole refund engine** (§6.13: automatic, system-decided, manual, external, unknown resolution, reissue), the incident and fare-dispute refunds on paid-online orders, ledger reversals, the SDK in the customer app, the "Paid" socket event, admin payments UI | `PAYMENTS_ONLINE_ENABLED` | Razorpay test account (RBT). Live account and public HTTPS webhook (RBP). | S1 to S21, S35 (paid-online part), S36, S43 to S50, and the payments, webhooks, method-switching and refund groups | All pass in Razorpay test mode on Android and iOS. A small real-money payment and refund succeed in live mode. **No RazorpayX secret is required.** | **Yes**, with `PAYMENTS_ONLINE_ENABLED` |
| **P5. Tips and cancellation fees** | P4 | §6.4: tip and fee endpoints, the fee calculator and the fee-aware cancel (§6.4, §6.17 B), fee counting in §6.11, waiver, refunds of tips and fees, ledger shares, customer and admin screens | `TIPS_ENABLED`, `CANCELLATION_FEES_ENABLED` | D5 and D8 defaults. **Fees ship disabled** until the fee rules are confirmed. | S22, S23, and the tips and fees group | All pass | **Yes**, per flag |
| **P6. RazorpayX payouts** | P2 (ledger, manual payouts). Not P4 or P5. | The RazorpayX **HTTP** client (direct API calls, §5.4 C5), `PayoutAccount` and verification, the payout state machine (§6.7.9), `payout-submit`, `payout-resolve`, `payout-reconcile`, the payouts webhook (§6.6.2), payout admin views, cash-out in the apps | `PAYOUTS_ENABLED` | RazorpayX account and public webhook (RBP) | S25 to S28, the payouts group | All pass in test mode | **Yes**, with `PAYOUTS_ENABLED` |
| **P7. Go-live verification** | Each feature being enabled | The checklist in §14 for that feature, live keys and webhooks, monitoring and alerts, EN/TE/HI review of the screens it added | n/a | n/a | All the tests of the phases enabled | The §14 items for that feature are ticked | n/a (run once per feature) |

**Separation of capabilities.** *Cash-only* is P2. *Refusal and goods return* is P3 (works with or without online payments). *Online customer payments and refunds* is P4. *Tips and fees* is P5. *Admin approvals* are in P2 and are used by every later phase. *RazorpayX payouts* are P6 and are independent of P3, P4 and P5.

---

## 14. Go-live checklist

Run the items that match the features being enabled (§13, P7).

**Always**

- [ ] All mock and bypass flags off in production. The startup checks pass for every enabled feature.
- [ ] MongoDB is a replica set with transactions. Redis and BullMQ are running. Alerts are wired to a pager (§6.19).
- [ ] No Razorpay or RazorpayX secret in any `EXPO_PUBLIC_*` or `VITE_*` variable, in git history or in logs. The unused driver key variable is removed.
- [ ] `OTP_SERVER_SECRET` is set. `ALLOWED_ORIGINS`, HTTPS/HSTS and the rate limits (§6.19) are active.
- [ ] Server-side pricing, the price snapshot and amount versioning are active for every service (P1)
- [ ] The ledger, approvals, audit log and settings are active. The settings in §15.2 are reviewed. Owner decisions D1 to D9 (§15.1) are **confirmed or their defaults are explicitly accepted in writing**.
- [ ] Production app builds are made with EAS with mock mode off. The apps, the admin SPA and the server templates are reviewed in English, Telugu and Hindi, with locale files in sync.
- [ ] An incident plan is written: how to rotate keys, switch every feature flag off (falling back to cash-only), and bulk-refund if something goes wrong.

**Online payments (P4)**

- [ ] Razorpay KYC approved and live mode active. 2FA on all dashboard accounts, least-privilege roles, and dashboard refund permission limited to a few people.
- [ ] Live key id, key secret and webhook secret are set **only** in the production backend env or secret manager
- [ ] Live-mode webhook points to `https://x-api.triozen.tech/api/v1/payments/webhook` with the payment and refund events enabled. Auto-capture is on.
- [ ] Checkout shows the brand name "Flavour" and the real user's prefill
- [ ] Idempotent refunds and the unknown-outcome handling are confirmed in test mode
- [ ] A small real-money payment and refund succeed in live mode, for one goods order and one ride
- [ ] `payment-reconcile`, `effects-finalizer`, and the daily comparison run with alerts

**Refusal and goods return (P3)**

- [ ] GPS history, private photo storage, push and the attestation mode are confirmed in production. The retention limits are signed off.
- [ ] The evidence rules, dispute window, return deadlines and pattern flags are configured and tested

**Tips and fees (P5)**

- [ ] Tip bounds and window are configured. The fee rules are **confirmed by the product owner** before `CANCELLATION_FEES_ENABLED` is switched on.

**Payouts (P6)**

- [ ] The RazorpayX keys, account number and funding balance are set. A **separate** payouts webhook (`/api/v1/payouts/webhook`) with its **own** secret is configured. `PAYOUTS_ENABLED=true`.
- [ ] Payout reconciliation runs with alerts. A small real payout succeeds.

---

## 15. Product decisions and configuration defaults

### 15.1 Decisions D1 to D9

These are product and business choices. **Every one has an explicit implementation default below, which is what the plan implements.** Each is labelled **"Implementation default — requires product-owner confirmation before production."** Changing a default changes only the setting or rule named here. The state machines, endpoints and data model do not change.

| # | Decision | Implementation default (exact rule) | What depends on it |
|---|---|---|---|
| **D1** | Can a package receiver pay online at drop? | **No.** Receivers pay **cash only**, which is recorded as cash collected on behalf of the booking customer's order. The booking customer is always the payer of record and the only person who can pay online. There is no receiver login, payment link, session or OTP. The 4-digit handover code is never a payment or login code (§6.8). | §1, §6.8, §7, §8, package tests |
| **D2** | Protection against unpaid rides and helper tasks | **Accepted risk**, limited by the unpaid-balance cap, the block on new bookings until paid, phone verification, reminders, and the new-account limits (§6.11, §15.2). No pre-authorisation. | §6.11 |
| **D3** | Who bears the loss on a refused order, and what happens to a paid one | The **platform bears the loss.** An unpaid refused order is written off, and the customer owes nothing. A paid-online refused order is **refunded in full** (no deduction). The vendor is compensated per §6.16: food and meat always (the vendor share), and other goods only when the return is a loss. The driver keeps their delivery share on an upheld refusal once the return is closed, and earns nothing on an overturned one. | §6.7.6, §6.16, §11 |
| **D4** | Numeric limits and small rules | The values in §15.2, including the coupon rule on item removal (**keep the original discount amount, floored so the result is never below the delivery fee, and never higher than the previous amount**). | Every section that names a number |
| **D5** | Is a cancellation fee payable online only? | **Yes.** Online only. Support can waive it. The fee feature is **disabled at launch** (`CANCELLATION_FEES_ENABLED=false`) and cannot be enabled unless online payments are enabled. | §6.4, §6.11, P5 |
| **D6** | Goods after a refusal | **Mechanism and values:** the goods stay with the driver and are returned to the vendor (food, meat, store) or the sender (package). Due 120 minutes (goods) or 24 hours (package) after the incident. The vendor or sender confirms, or support decides. The driver's earnings for the order are held until the return is closed. If the return is `closed_loss` with `driver_liable`, the driver is debited the items subtotal (at most). The platform bears return costs. Perishables a vendor won't take back go to support, whose default outcome is `disposed` (no driver liability) unless evidence shows the driver kept them. | §6.9, §6.16, §6.7.5 |
| **D7** | SMS and in-app call logging | **Neither is assumed.** Defaults: `SMS_ENABLED=false` and `CALL_LOGGING_ENABLED=false` until a provider is contracted and registered. With SMS off, the booking customer's app shows the handover code and passes it on. With call logging off, every incident is created `under_review` (never `provisional`), so support always decides. Enabling either is a flag change and needs no other change. | §5.3, §6.8, §6.9 |
| **D8** | Cancellation-fee applicability | Only **customer-initiated** cancellations can carry a fee, and only while `CANCELLATION_FEES_ENABLED`. The rules (values in §15.2): **food, meat, store**: a fee only after the vendor started preparing (`preparingAt`) and before pickup; **package**: a fee after the driver arrived at pickup, before pickup; **rides**: a fee after a driver was assigned for more than 2 minutes, and a higher fee after the driver arrived at pickup; **helpers**: a fee after the helper was assigned for more than 5 minutes. **No fee** for vendor, system or driver cancellations, an unavailable item, or "no driver found". | §6.4, §6.16, P5 |
| **D9** | Approval threshold | **₹500 per action**, and **₹5,000 per admin per rolling 24 hours**. `support` can only initiate. A different admin approves anything at or above the threshold, above the daily total, or started by `support`. Manual payouts, ledger adjustments and unknown-refund resolutions always need approval (§6.13.9). | §6.13.9, §6.17 E, §10 |

### 15.2 Configuration defaults (stored in `PaymentSettings`, versioned)

**Implementation default — requires product-owner confirmation before production.** Amounts are in rupees here and stored in paise.

| Area | Setting | Default |
|---|---|---|
| Payment | Checkout window (`expiresAt`) | 30 minutes |
| Payment | Lease duration | 2 minutes |
| Payment | Reconciliation lookback after expiry | 7 days |
| Payment | Method-switch request expiry | 10 minutes |
| Tips | Minimum / absolute cap / floor / percentage of order / window | ₹10 / ₹2,000 / ₹100 / 50% / 7 days |
| Ride and helper | Supplement cap / helper offer cap | 100% of the estimate / 2× the first offer |
| Ride and helper | Extra-hours request expiry / fare dispute window / dispute review period | 30 minutes / 48 hours / 7 days |
| OTP | Length / expiry / wrong attempts per version / regenerations per order | 4 digits / 6 hours / 5 / 3 |
| OTP | Verifications per driver per hour / per IP per hour | 30 / 60 |
| SMS | Per order / per receiver phone per 24 hours | 3 / 5 |
| Refusal | Minimum wait / geofence radius / notifications | 10 minutes / 100 m / at arrival and at the halfway point |
| Refusal | Call attempts required and spacing (when logging is on) | 2, at least 3 minutes apart |
| Refusal | Customer dispute window | 24 hours |
| Refusal | Delivery without OTP: wait / earnings hold | 5 minutes / 48 hours |
| Goods return | Due: goods / package | 120 minutes / 24 hours |
| Goods return | Vendor or sender confirm window: goods / package | 60 minutes / 12 hours |
| Goods return | Overdue → support review / driver pause at open returns | 24 hours / 3 |
| Cancellation | System timeouts: no driver / vendor no-accept | 15 minutes / 10 minutes |
| Cancellation (D8) | Food, meat, store fee | 20% of the items subtotal, minimum ₹20, maximum ₹100 |
| Cancellation (D8) | Package fee | ₹30 |
| Cancellation (D8) | Ride fee (after 2 minutes assigned / after the driver arrived) | ₹20 / ₹40 |
| Cancellation (D8) | Helper fee (after 5 minutes assigned) | ₹50 |
| Cancellation (D8) | Fee split: goods / other services | 70% vendor and 30% driver / 100% driver |
| Customer limits | New account (fewer than 3 paid orders): order value / open orders / unpaid cap | ₹1,500 / 2 / ₹500 |
| Customer limits | Established: order value / open orders / unpaid cap | ₹5,000 / 5 / ₹2,000 |
| Customer limits | Refusals (upheld, 90 days): limited at 2 (order value) / blocked at 3 | ₹500 / blocked pending review |
| Cash | Driver cash exposure limit | ₹2,000 |
| Ledger | Post-delivery earnings hold | 24 hours |
| Refunds | Quiet period before an unknown refund is re-checked or re-called / automatic generations / page alert | 10 minutes / 3 / 24 hours |
| Approvals | Threshold / admin daily total / request expiry | ₹500 / ₹5,000 / 72 hours |
| Payouts | Minimum / maximum per request / daily per owner | ₹100 / ₹20,000 / ₹50,000 |
| Payouts | Bank-change cooling-off / quiet period before an unknown payout is re-checked | 24 hours / 10 minutes |
| Rate limits, retention | §6.19 | As listed there |
