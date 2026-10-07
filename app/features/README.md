# features/

One folder per domain. A **feature** is a group of screens that do the same
job — it is not the same thing as a screen. This app has 35 screens and 9
features:

| Feature    | Screens |
|------------|---------|
| `auth`     | login, otp, signup, personal-details |
| `home`     | (tabs)/index, all-services, index |
| `food`     | restaurant-details, restaurant-menu, 149-store, favorites, cart, checkout, payment, payment-result |
| `ride`     | ride-searching, ride-confirmation, finding-driver, pickup-confirmation, drop-location, tracking |
| `delivery` | delivery/*, helper-task, map-picker |
| `support`  | support, support-chat, chat |
| `profile`  | (tabs)/profile, notifications |
| `meat`     | meat-centers |
| `orders`   | (tabs)/orders |
| `offers`   | offers |

## Where does a component go?

Two questions, in order.

**1. Does it know anything about the business** — orders, drivers, restaurants,
fares, addresses?

- **No** → `components/ui/`. Stop here. A tab bar, a button, a text field: these
  would still make sense in a completely different app.
- **Yes** → question 2.

**2. How many _features_ use it?** Count features, not screens.

- **One** → `features/<that one>/components/`. This is true whether one screen
  uses it or all six screens in that feature do.
- **Two or more** → `components/shared/`.

Different props do not make it a different component. A component used by three
screens with three different sets of props is still one component — props are
what let it serve all three.

## Rules the linter enforces

- `components/ui/` may not import a domain store, the API layer, `features/`, or
  the router. Props in, events out.
- `components/shared/` may not import from any single feature.
- A feature may not import another feature. Within a feature, use relative
  imports; anything two features need moves up to `components/shared/`.
- Files under `app/` are route shells: 300 lines maximum.

Start a component inside the feature that needs it. Promote it to
`components/shared/` only when a *second* feature actually asks for it — moving
a file later costs a minute, and guessing wrong is how `components/` ended up
with eight components that nothing imports.
