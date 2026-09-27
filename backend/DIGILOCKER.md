# DigiLocker Integration

Driver KYC via DigiLocker: the driver consents once in DigiLocker, and we read their
government-issued Aadhaar and PAN straight from the issuer instead of trusting a
self-typed number.

Runs in one of two modes, selected by `DIGILOCKER_MODE`:

| Mode | Talks to | Credentials | Data |
|---|---|---|---|
| `sandbox` *(default today)* | A simulator built into this backend | None needed | Simulated test personas |
| `live` | DigiLocker Partner API (MeriPehchaan) | Required | Real government documents |

The sandbox is a real OAuth authorization server in miniature — it issues single-use
codes, verifies the PKCE S256 challenge, expires codes and tokens, honours refresh
tokens, and serves DigiLocker-shaped XML through the same parsers the live provider
uses. **The only thing that changes when you flip to `live` is the network hop.**

---

## Quick start (sandbox)

Nothing to configure — a stock `.env` already runs in sandbox mode.

```bash
cd backend
npm run dev
# [DIGILOCKER] Running in SANDBOX mode — simulated documents only.
```

Verify the whole flow end to end (109 assertions, uses a throwaway database):

```bash
npm run test:digilocker
```

Walk it manually:

```bash
TOKEN="<a driver JWT>"

# 1. Start consent — returns an authUrl you open in a browser/WebView
curl -sX POST localhost:5000/api/v1/digilocker/session \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"purpose":"kyc"}'

# 2. Open the returned authUrl, pick a persona, press "Allow access".
#    You land back on /api/v1/digilocker/callback and the account is linked.

# 3. Read the verified identity
curl -s localhost:5000/api/v1/digilocker/aadhaar -H "Authorization: Bearer $TOKEN"
curl -s localhost:5000/api/v1/digilocker/pan     -H "Authorization: Bearer $TOKEN"

# 4. Write it onto the Driver record
curl -sX POST localhost:5000/api/v1/digilocker/sync -H "Authorization: Bearer $TOKEN"
```

### Test personas

`GET /api/v1/digilocker/sandbox/personas` lists them. Each models a different real
account state so the unhappy paths are reachable:

| id | Who | Why it exists |
|---|---|---|
| `complete` | Aadhaar + PAN + driving licence | The happy path — all three sync |
| `no-pan` | Aadhaar only | PAN fetch must 404 cleanly, sync must still partially succeed |
| `no-eaadhaar` | PAN only, no eAadhaar linked | Aadhaar fetch must fail cleanly |

All identifiers are deliberately invalid for real systems.

---

## Endpoints

All under `/api/v1/digilocker`. Every one requires a driver JWT except the browser
callback, which is reached by a redirect that carries no headers.

| Method | Path | What it does |
|---|---|---|
| `POST` | `/session` | Start consent. Returns `authUrl`, `state`, `expiresAt`. |
| `GET` | `/callback` | Browser redirect target. Completes consent, renders an HTML page. |
| `POST` | `/callback` | App-driven exchange. Body: `{ code, state }`. |
| `GET` | `/status` | Is this driver linked, to which account, until when. |
| `GET` | `/sessions` | This driver's consent attempt history. |
| `GET` | `/documents` | List issued documents. |
| `GET` | `/documents/:uri` | Download one. `?format=pdf\|xml`, `?download=1`. |
| `GET` | `/aadhaar` | Normalised Aadhaar KYC (masked number only). |
| `GET` | `/pan` | Normalised PAN details. |
| `GET` | `/licence` | Normalised driving licence (`/license` also works). |
| `POST` | `/sync` | Write the verified identity onto the `Driver` record. |
| `POST` | `/refresh` | Force an access-token refresh. |
| `DELETE` | `/session` | Revoke at DigiLocker and unlink locally. |
| `GET` | `/health` | Which mode is active. |

Sandbox-only (not mounted in live mode): `GET|POST /sandbox/authorize`,
`GET /sandbox/personas`.

---

## Middleware

Every route runs through a guard stack, so no controller ever has to think about
grants or token freshness. By the time a handler runs, `req.digilocker.accessToken`
is guaranteed usable.

| Guard | Applied to | Does |
|---|---|---|
| `verifyDigilockerEnabled` | **every** route | 503 if unconfigured; stamps `X-DigiLocker-Mode` on the response |
| `digilockerRateLimit` | every route | 30 req/min **per user** (not per IP) |
| `digilockerSessionRateLimit` | `POST /session` | 5 consent starts / 5 min |
| `verifyDigilockerState` | both callbacks | Validates `state`: CSRF defence + single-use replay defence |
| `verifyDigilockerSession` | every data route | Loads the grant, checks consent validity, **auto-refreshes an expiring access token**, attaches `req.digilocker` |
| `verifySandboxMode` | sandbox routes | 404 in live mode |
| `validateRequest` (Zod) | all input-bearing routes | Rejects bad input before any outbound call |

### Error codes

Clients should branch on `code`, not on the message text.

| HTTP | `code` | Client should |
|---|---|---|
| 503 | `DIGILOCKER_DISABLED` | Hide the DigiLocker option |
| 428 | `DIGILOCKER_NOT_LINKED` | Start the consent flow |
| 428 | `DIGILOCKER_CONSENT_EXPIRED` | Re-run the consent flow |
| 428 | `DIGILOCKER_TOKEN_REFRESH_FAILED` | Re-run the consent flow |
| 400 | `DIGILOCKER_INVALID_STATE` | Start over — link unknown, expired or already used |
| 403 | `DIGILOCKER_SCOPE_MISSING` | Re-consent with the needed scope |
| 404 | `document_not_issued` | Tell the driver to add the document in DigiLocker |
| 429 | `DIGILOCKER_RATE_LIMITED` | Back off |

`428 Precondition Required` always means *"consent first"*, deliberately distinct from
the `401` that means the app's own JWT is bad. Responses carry an
`action: "START_DIGILOCKER_CONSENT"` hint where re-consent is the fix.

---

## Client flow

```
POST /session ──► { authUrl, state }
                        │
      open authUrl in a WebView / browser
                        │
      driver consents at DigiLocker
                        │
      redirect to DIGILOCKER_REDIRECT_URI?code=…&state=…
                        │
        ┌───────────────┴───────────────┐
   let it land on              intercept in the WebView
   GET /callback               and POST /callback { code, state }
   (renders a page,            (JSON response, JWT-authenticated)
    deep-links back)
                        │
              account is linked
                        │
        POST /sync  ──► Driver.aadhaarVerified = true
```

Mobile clients usually take the right-hand branch: intercept the redirect, post the
code, keep everything in-app. Set `DIGILOCKER_CLIENT_REDIRECT_URL` to a deep link and
the left-hand branch will bounce the WebView back into the app on its own.

---

## What gets stored

On `POST /sync`, the `Driver` record gets:

| Field | Value |
|---|---|
| `aadhaarNumber` | **Masked only** (`XXXXXXXX4321`) — the full 12 digits are never stored |
| `aadhaarVerified` | `true` |
| `panNumber`, `panVerified` | From the PAN certificate |
| `dlNumber`, `dlVerified`, `dlExpiry`, `dlVehicleClass` | From the transport department's licence |
| `gender` | Inferred from KYC if not already set |
| `kycSource` | `"digilocker"` — distinguishes this from a self-typed number |
| `digilockerVerified`, `digilockerVerifiedAt`, `digilockerId` | Provenance |

Sync is partial-success by design: a driver with Aadhaar but no PAN or licence still
gets `aadhaarVerified`, and the response lists what was `skipped`
(`aadhaar` / `pan` / `drivingLicence`).

Aadhaar, PAN and the driving licence are fetched independently, so one missing document
never fails the others.

### Security

- Access tokens, refresh tokens and PKCE verifiers are **encrypted at rest** (AES-256-GCM)
  via `DIGILOCKER_ENCRYPTION_KEY`. They are stripped from every JSON response.
- The PKCE verifier is deleted the moment it is used.
- Abandoned consent attempts are swept by a TTL index after 15 minutes; a successful
  link clears the TTL field so live grants are never swept.
- Only one linked grant per driver — linking again retires the previous one.
- Document responses are sent `Cache-Control: no-store, private`.
- Document URIs are restricted by regex, so they cannot be bent into a path traversal.

---

## Driver app

The driver app screens are built and wired to these endpoints.

| File | What it is |
|---|---|
| `driver/app/digilocker-verify.tsx` | The verification screen — intro, consent, results, unlink |
| `driver/components/DigiLockerPrompt.tsx` | "Verify with DigiLocker" CTA shown above manual Aadhaar/PAN entry |
| `driver/utils/digilocker.ts` | Typed API client; surfaces backend error codes as `DigiLockerError` |

It is offered from both `app/onboarding.tsx` and `app/identity-verify.tsx`, above the
manual fields, with an "or enter manually" divider beneath — so DigiLocker is the
default path and typing remains the fallback.

### How the app completes the flow

```
app → POST /session (with clientRedirectUrl)
    → WebBrowser.openAuthSessionAsync(authUrl, returnUrl)
        → driver consents at DigiLocker
        → DigiLocker redirects to GET /callback  ← backend links the account here
        → callback page bounces to clientRedirectUrl, closing the browser
    → app calls /aadhaar, /pan, then /sync
```

The app never handles the authorization code — the backend's `GET /callback` completes
the link, so there is nothing sensitive in the client. If the deep link doesn't fire
(driver closed the browser by hand), the app re-checks `/status` instead of assuming
failure.

**`clientRedirectUrl`** is sent per session because a dev build's scheme (`exp://…`)
differs from a release build's (`flavour-driver://…`). The backend accepts only custom
app schemes and refuses `http(s)`/`javascript:` values — otherwise the callback would be
an open redirect. An unsafe value is ignored, not rejected: consent still completes, the
browser just won't auto-close.

The app holds **no DigiLocker credentials**. `driver/.env` needs only `EXPO_PUBLIC_API_URL`.

---

## Going live

1. Register as a DigiLocker partner and get a client id/secret
   (<https://partners.digitallocker.gov.in/>).
2. Register your redirect URI with DigiLocker — it must match `DIGILOCKER_REDIRECT_URI`
   **exactly**.
3. Set in `backend/.env`:

```bash
DIGILOCKER_MODE=live
DIGILOCKER_CLIENT_ID=<real id>
DIGILOCKER_CLIENT_SECRET=<real secret>
DIGILOCKER_REDIRECT_URI=https://x-api.triozen.tech/api/v1/digilocker/callback
PUBLIC_BASE_URL=https://x-api.triozen.tech
DIGILOCKER_ENCRYPTION_KEY=<32-byte hex>   # generate below
DIGILOCKER_CLIENT_REDIRECT_URL=flavour-driver://digilocker-callback
```

Generate the encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Two guard rails:

- `DIGILOCKER_MODE=live` with placeholder credentials **refuses to boot**, rather than
  silently serving simulated KYC as if it were real.
- Grants issued in one mode are rejected in the other, so sandbox links cannot leak
  into production.

Existing sandbox-linked drivers will be asked to re-consent on their next call — expected.

### Config reference

| Variable | Default | Purpose |
|---|---|---|
| `DIGILOCKER_MODE` | auto-detect | `sandbox` or `live` |
| `DIGILOCKER_CLIENT_ID` / `_SECRET` | — | Partner credentials (live only) |
| `DIGILOCKER_BASE_URL` | `https://digilocker.meripehchaan.gov.in/public/oauth2/1` | Partner OAuth base |
| `DIGILOCKER_REDIRECT_URI` | `{PUBLIC_BASE_URL}/api/v1/digilocker/callback` | Must match DigiLocker's registration |
| `PUBLIC_BASE_URL` | `http://localhost:{PORT}` | Used to build the sandbox consent URL |
| `DIGILOCKER_ENCRYPTION_KEY` | derived from `JWT_SECRET` | Encrypts stored tokens |
| `DIGILOCKER_CLIENT_REDIRECT_URL` | — | Deep link the callback bounces to |
| `DIGILOCKER_SESSION_TTL_MINUTES` | `15` | Consent window |
| `DIGILOCKER_TOKEN_REFRESH_LEEWAY_SECONDS` | `120` | Refresh this far before expiry |
| `DIGILOCKER_REQUEST_TIMEOUT_MS` | `20000` | Outbound timeout |
| `DIGILOCKER_RATE_LIMIT_MAX` | `30` | Requests per minute per user |
| `DIGILOCKER_SESSION_RATE_LIMIT_MAX` | `5` | Consent starts per 5 min per user |

---

## Code layout

```
src/services/digilocker/
  digilocker.config.ts            mode resolution + settings
  digilocker.types.ts             IDigiLockerProvider — the contract both providers meet
  digilocker.live.provider.ts     real Partner API client (OAuth2 + PKCE)
  digilocker.sandbox.provider.ts  the simulator
  digilocker.personas.ts          test identities + their XML documents
  digilocker.parsers.ts           eAadhaar / PAN XML -> normalised objects
  digilocker.pages.ts             HTML result pages for the browser callback
  digilocker.errors.ts            typed errors
  index.ts                        provider factory

src/middleware/digilocker.middleware.ts   the guard stack
src/modules/digilocker/                   routes, controllers, session service
src/database/models/DigiLockerSession.ts  consent lifecycle + encrypted tokens
digilocker.e2e.ts                         end-to-end verification
```

Adding a different backend (an aggregator, say) means implementing
`IDigiLockerProvider` and registering it in the factory — nothing in the routes,
controllers or middleware needs to change.

## Backward compatibility

The two pre-existing onboarding endpoints still work and now run on this
implementation:

- `GET /api/v1/onboarding/digilocker/auth-url`
- `POST /api/v1/onboarding/verify-digilocker`

One behaviour change: `auth-url` now returns a **server-generated** `state` and ignores
a client-supplied one, because `state` is the CSRF binding for the callback and must be
unguessable by anyone but us. Pass that `state` back to `verify-digilocker` alongside
`code`; omitting it falls back to your most recent pending session.

New work should prefer `/api/v1/digilocker/*`.
