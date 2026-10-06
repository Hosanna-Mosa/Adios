# features/

One folder per domain, same rules as `app/features/README.md` (the customer
app). A **feature** is a group of screens that do the same job.

| Feature     | Screens |
|-------------|---------|
| `auth`      | index, login, forgot-password |
| `language`  | select-language, language-settings |
| `dashboard` | (tabs)/index |
| `orders`    | (tabs)/orders, order/[id] |
| `scheduled` | scheduled-orders |
| `menu`      | (tabs)/menu (restaurants), (tabs)/inventory (meat centres), dish-form |
| `account`   | (tabs)/account, change-password |
| `support`   | support, support-chat |

## How a screen is built (same as the customer app)

1. The route file in `app/` calls the feature hook, e.g. `useOrders()`.
2. The hook returns `insets`, `tokens`, `styles` (from `<feature>.styles.ts`)
   and the screen's state and handlers.
3. The route file only **composes**: `ScreenShell` + `Header`/`ScreenTitle` +
   feature components, passing `styles`/`tokens` down as props.
4. Feature components are built from `components/ui/`.

## One control, everywhere

Every interactive piece comes from `components/ui/` — never hand-built:

| Need | Use |
|------|-----|
| Any button or text link | `Button` (`primary` · `secondary` · `ghost` · `danger` · `link`) |
| Icon-only button | `IconButton` |
| Choice / filter | `Chip`, `ChipRow`, `SegmentedControl` |
| Tappable row / setting | `ListRow` (inside `ListGroup`) |
| Tappable card | `Card` with `onPress` |
| Shortcut tile, "add photo" | `ActionTile` |
| Call-to-action banner | `GradientBanner` |
| Text input | `TextField`, `PasswordField`, `ChatComposer` |
| Switch | `ToggleSwitch` |
| Overlay / confirm | `BottomSheet`, `showAlert` (`AppAlert`) |
| Spinner / empty / list | `FullScreenLoader`, `EmptyState`, `RefreshList` |
| Page frame | `ScreenShell` (`header`, `footer`, `scroll`, pull-to-refresh) |

## Where does code go?

- **Knows nothing about the business** → `components/ui/`. Props in, events
  out; no stores, no API, no router.
- **Business component used by one feature** → `features/<that one>/components/`.
- **Business component used by two or more features** → `components/shared/`
  (e.g. `OrderCard`: dashboard, orders tab and Help & support).
- **Data hook used by two or more features** → `queries/` (TanStack Query).
- **API calls** → `services/`. Paths and bodies mirror what the web vendor
  panel (`admin/src/features/vendors/hooks`) sends.

## Rules `npm run lint` enforces

- Route files (`app/`) contain no raw `View`/`Text`/`TouchableOpacity`/… — composition only.
- `features/` and `components/shared/` never use `TouchableOpacity`, `Pressable`,
  `TextInput`, `Modal`, `Switch`, `ActivityIndicator` or `RefreshControl` — only `components/ui/` may.
- No file over 200 lines — split it (as `useDishForm` / `useDishPhotos`).
- `components/ui/` may not import `contexts/authStore`, `services/`, `queries/`,
  the API layer, `features/` or the router.
- A feature never imports another feature.
- Every `fontSize`/`lineHeight` is one of the four `typography` tokens.

Note: `npm run lint` passes every source folder to `expo lint` explicitly —
on its own `expo lint` skips `features/`.

Run `npm run i18n:check` after adding text: every key used in code must exist
in `locales/en`, `te` and `hi`, and the three files must match.
