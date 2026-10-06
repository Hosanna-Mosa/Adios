import i18n from "@/i18n";
import { showAlert } from "@/components/ui/AppAlert";
import type { OutletOrderingState } from "@/services/catalog.service";

// Wording for a restaurant / meat centre that isn't taking orders. Shared
// because both the menu (features/food) and dish search (features/home) can
// try to add from a closed outlet.

type ClosedState = Partial<Pick<OutletOrderingState, "name" | "manuallyClosed" | "opensAt">> | null;

/** One-line status for the menu banner, e.g. "Closed now · Opens at 9:00 AM". */
export function outletClosedLabel(state: ClosedState): string {
  if (state?.manuallyClosed) return i18n.t("app.food.notAcceptingOrdersNow");
  if (state?.opensAt) return i18n.t("app.food.closedOpensAt", { time: state.opensAt });
  return i18n.t("app.food.closedNow");
}

/** Shown when the customer tries to add to the cart, or check out, while the outlet is closed. */
export function showOutletClosedAlert(state: ClosedState, fallbackName?: string) {
  const name = state?.name || fallbackName || "This restaurant";
  const message =
    !state?.manuallyClosed && state?.opensAt
      ? i18n.t("app.food.outletClosedOpensAtMessage", { name, time: state.opensAt })
      : i18n.t("app.food.outletClosedMessage", { name });
  showAlert(i18n.t("app.food.notAcceptingOrders"), message, undefined, "warning");
}
