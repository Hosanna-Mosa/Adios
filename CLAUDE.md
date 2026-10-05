# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This is **not** a single app — it's 6 independently-managed projects living side by side in one repo, each with its own `package.json`/lockfile and no shared workspace tooling (no turborepo/nx/lerna, no root `package.json`). Always `cd` into the relevant folder before running any command.

| Folder | What it is | Stack |
|---|---|---|
| `backend/` | REST + Socket.IO API used by all five clients below | Express 5 + TypeScript (commonjs), MongoDB/Mongoose, Redis + BullMQ, Socket.IO |
| `app/` | Customer mobile app — branded "Flavour" (rides, package delivery, food/meat ordering, chat, support) | Expo Router 6, React Native 0.81, React 19, Zustand, TanStack Query |
| `driver/` | Driver mobile app — branded "Flavour Driver" (KYC onboarding, live jobs, earnings, chat) | Same Expo/RN stack as `app/` |
| `Food-Partner/` | Restaurant / meat-centre owner app — branded "Flavour Partner". The mobile version of the admin SPA's **vendor** role (orders + mark ready, scheduled requests, menu / meat inventory, change password) plus payouts and the customer app's support screens | Same Expo/RN stack as `app/` |
| `admin/` | One SPA serving **three roles** (admin / support / vendor) gated by separate `localStorage` tokens (`admin_token`, `support_token`, `vendor_token`) — see `RootRedirect` in `admin/src/App.tsx` | React 18 + Vite + shadcn/ui (Radix) + Tailwind 3, TanStack Query |
| `frontend/` | Public partner website — vendor sign-up/onboarding + restaurant menu preview | React 19 + Vite + Tailwind 4, react-router-dom v7 |

The production API is `https://x-api.triozen.tech` (see `app/eas.json` / `driver/eas.json` build profiles).

## Commands

### backend
```
cd backend
npm run dev     # nodemon + ts-node, watches src/, entry: src/index.ts
npm run build    # rimraf dist && tsc
npm start        # node dist/index.js (run build first)
```
`npm run lint` runs eslint (`eslint.config.js`, plain Node/TS config — no test suite yet, `npm test` just exits with an error). Needs MongoDB + Redis running locally, and a `.env` populated from `.env.example` (PORT, DATABASE_URL, JWT_SECRET, Google Maps, Razorpay, Cloudinary, Surepass, SMTP, DigiLocker, Gemini keys — note the code reads `DATABASE_URL`, not `MONGODB_URI`, despite older docs). On boot the server calls `seedDatabase()` before mounting routes.

### admin (port 8080)
```
cd admin
npm run dev          # vite dev server
npm run build        # vite build
npm run lint         # eslint .
npm test             # vitest run
npm run test:watch   # vitest watch
npx playwright test  # e2e (playwright.config.ts uses createLovableConfig — this app was scaffolded via Lovable.dev)
```
Only one placeholder unit test exists (`src/test/example.test.ts`) — there is no real coverage yet.

### frontend (partner website)
```
cd frontend
npm run dev      # vite dev server
npm run build    # tsc && vite build
npm run lint      # eslint .
npm run format    # prettier --write .
```
No test setup.

### app / driver (Expo)
```
cd app   # or driver
npx expo start --tunnel   # app: `npm start`; driver: `npm run dev`
npm run typecheck          # tsc --noEmit
npm run lint                # expo lint (both app and driver)
npm run android / ios       # native builds via `expo run:*`
```
Both are built/distributed via **EAS** (`eas.json` has `development`/`preview`/`production` profiles). No automated test setup in either.

### Food-Partner (Expo)
```
cd Food-Partner
npm run dev            # expo start (npm start = --tunnel)
npm run typecheck      # tsc --noEmit
npm run lint           # expo lint — same layer/typography rules as app/
npm run i18n:check     # every t("…") key exists in en/te/hi, and the three locales match
npm test               # jest (jest-expo) — unit tests live in __tests__/
```
Signs in with the same credentials as the admin SPA's vendor role (`/vendors/login`, falling back to `/meat/login`); vendor tokens carry the Vendor/MeatCenter `_id`, not a User `_id`. All config comes from `EXPO_PUBLIC_*` vars (see `Food-Partner/.env.example`); its `eas.json` holds no keys — set them as EAS environment variables. Data hooks shared across features live in `queries/` (TanStack Query); live order/scheduled/ticket events are handled once in `components/GlobalSocketHandler.tsx`.

Order alerts also reach a closed app by Expo push: `components/PushNotificationHandler.tsx` registers the device with `POST /vendors/me/push-token` (stored in `expoPushTokens` on the Vendor/MeatCenter), and the backend's `NotificationService` sends order pushes to the app's `orders` Android channel with the bundled `assets/sounds/new_order.wav`. Pushes need `EAS_PROJECT_ID` set. The "Accepting orders" switch is `PUT /vendors/me/open` (sets `isManuallyClosed`). The Payouts screen reads `GET /vendors/me/payouts` (balance from the same `getVendorPayoutBalance` that `POST /vendors/payout` checks, bank account masked to its last 4 digits) and requests with `POST /vendors/payout`; legacy MeatCenter accounts get `payoutsEnabled: false`. Orders load as a live set (`?since=` start of today, plus anything in progress) and history pages (`?before=&limit=`); `GET /orders/vendor/:id` without a query still returns everything, which is what the admin panel uses.

There are no Dockerfiles and no CI workflows (no `.github/workflows`) anywhere in the repo — running/building/deploying is done manually via the commands above.

A `commit-msg` hook lives at `.githooks/commit-msg` (rejects one-word/sub-10-character commit subjects — this repo's history has a lot of those, e.g. "Wasp", "sdhf"). It's opt-in per clone since there's no root `package.json` to auto-install it via `prepare`:
```
git config core.hooksPath .githooks
```

## Backend architecture

Routes are versioned under `/api/v1/*` and mounted in `backend/src/index.ts`. Each domain lives under `backend/src/modules/<name>/` and consistently follows:
```
<name>.routes.ts       # express Router, wires middleware + controller
<name>.controller.ts   # req/res handling
<name>.service.ts       # business logic, DB access
<name>.validation.ts    # Zod schemas
```
Modules: `auth, users, drivers, orders, admin, places, routing, payments, vendors, food, meat, onboarding, zones, notifications, support, reviews, banners, delivery, pricing, analytics`.

`analytics` is our own live copy of the app/driver behaviour events (they also go to Firebase Analytics, which uploads up to an hour late): the apps batch events to `POST /api/v1/analytics/events` every 10 s (`utils/analytics.ts` in each app, configured in `app/_layout.tsx`), they land in the `AnalyticsEvent` collection (90-day TTL), and admin reads them on the Live Activity page (`/live-activity`). New event names must be added to `ALLOWED_EVENTS` in `analytics.service.ts` or the server drops them.

Cross-cutting pieces:
- `backend/src/database/models/` — Mongoose models (User, Driver, Order, Vendor, FoodItem, MeatItem/MeatCenter, Zone, Coupon, Review, SupportTicket, Notification, etc.)
- `backend/src/services/dispatch.manager.ts` + `queue.service.ts` (BullMQ) — driver matching/dispatch logic; this is the most stateful, complex part of the backend
- `backend/src/sockets/socket.manager.ts` — Socket.IO setup for live order/driver tracking and chat
- `backend/src/middleware/auth.middleware.ts` — JWT auth (`authenticateToken`) and role gating (`authorizeRole([...])`); tokens carry `{ userId, role }` (also accepts `id` as an alias for `userId`)
- `backend/src/services/invoice.service.ts` + `puppeteer-core` — server-side PDF invoice generation from the `compiled_*_invoice.html` templates at the backend root
- External integrations: Cloudinary (media), Razorpay (payments), Google Maps (geo/routing), DigiLocker + Surepass (driver Aadhaar/PAN KYC), Gemini API (OCR), Nodemailer (email)

The ad-hoc one-off debug scripts (`check_*.ts`, `fix_*.ts`, `scratch-*.ts`) and committed debug logs that used to litter the `backend/` root have been pruned — legitimate one-off scripts still live under `backend/src/scripts/`.

## Client conventions

- All five clients read the backend URL from an env var: `EXPO_PUBLIC_API_URL` (app/driver/Food-Partner) or `VITE_API_URL` (admin/frontend), documented per-app in each `.env.example`.
- `admin/src/lib/api-client.ts` and `frontend/src/lib/api-client.ts` centralize HTTP calls to the backend; `admin/src/lib/socketService.ts` centralizes Socket.IO client setup.
- `admin` and `frontend` share the same shadcn/ui component style (`components.json`, `src/components/ui/`) but are on different major versions of React/Tailwind — don't assume code ports directly between them.
- `app` and `driver` share near-identical Expo project structure/config (Expo Router file-based routing under `app/`, same native module set) since they were scaffolded from the same template.
