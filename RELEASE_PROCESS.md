# Release, rollback, and incident response

This repo has no CI/CD (confirmed: no `.github/workflows`, no root build
pipeline) — every deploy and build described below is a manual step someone
runs themselves. This document describes the process as it actually exists,
not an aspirational one.

## Releasing

**Backend, admin, frontend** (web-deployed): merge the feature branch's PR
into `dev`, then deploy `dev` to production manually via whatever hosts
`https://x-api.triozen.tech` and the admin/frontend sites. There's no staged
rollout — a deploy goes live immediately for all traffic.

**Mobile apps (User, Driver, Food-Partner)**: built via EAS (`eas build`,
see each app's `eas.json` for the `development`/`preview`/`production`
profiles), then submitted to the Play Store / App Store manually. Unlike the
backend, a mobile release doesn't take effect instantly — it rolls out to
users over the store's own timeline, and some users may stay on an old
version for a long time (see `backend/DB_MIGRATIONS.md` for why that matters
for backend changes).

## Rolling back

**Backend/admin/frontend**: since there's no automated deploy pipeline,
rollback means manually redeploying the previous known-good commit the same
way the bad one was deployed. Know which commit was live *before* deploying
a new one — e.g. `git rev-parse HEAD` on the production host, noted
somewhere, before pulling the new code.

**Mobile apps**: you cannot "roll back" a store release the way you can a
web deploy — once a version is live, some users have it. The real mitigation
is a kill-switch on the backend side (reject a broken app version's requests
with a clear "please update" response) rather than trying to un-ship a
mobile build.

## Incident response

When something is actually broken in production:

1. **Confirm it's real** — reproduce against `https://x-api.triozen.tech`
   directly (`curl`, Postman) before assuming code is at fault; it may be a
   third-party outage (Razorpay, Google Maps, Cloudinary, MongoDB/Redis
   hosting).
2. **Decide: rollback or forward-fix.** If the previous commit is known-good
   and the fix isn't obvious, rollback first, investigate after — don't debug
   in production while it's actively broken for users.
3. **Check whether it's backend-only or needs a mobile release.** A backend
   rollback is immediate. A bug that's only fixable in app code needs a new
   build + store review time (can be days) — if it's serious, consider a
   backend-side mitigation (e.g. disabling the broken feature server-side)
   while the app fix goes through review.
4. **Write down what happened** once it's resolved — this repo has no
   existing incident log; start one (e.g. a dated entry in a shared doc)
   covering what broke, how it was caught, and what fixed it, so the next
   similar incident is faster to diagnose.

## Open gap

There's currently no single source of truth for "what commit is live in
production right now" for the backend/admin/frontend. Before this process is
fully usable under real pressure, that needs an answer — even something as
simple as tagging the deployed commit each time, or recording it in a
shared doc.
