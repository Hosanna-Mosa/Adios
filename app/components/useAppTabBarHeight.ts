import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartStore } from "@/contexts/cartStore";
import { useActiveOrder } from "@/contexts/deliveryStore";
import { CART_CARD_HEIGHT, TAB_PILL_HEIGHT } from "./AppTabBar.styles";
import { BOTTOM_GAP, STACK_GAP, TOP_CLEARANCE } from "./AppTabBar";
import { ORDER_STRIPE_HEIGHT } from "./ActiveOrderStripe";

// The tab bar's height, needed by screens for bottom padding. Its own file
// so AppTabBar.tsx stays under 150 lines; AppTabBar re-exports it, so the
// existing `from "@/components/AppTabBar"` imports keep working.

export function useAppTabBarHeight() {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isActive: hasActiveOrder } = useActiveOrder();
  return (
    insets.bottom +
    BOTTOM_GAP +
    TAB_PILL_HEIGHT +
    TOP_CLEARANCE +
    (itemCount > 0 ? CART_CARD_HEIGHT + STACK_GAP : 0) +
    (hasActiveOrder ? ORDER_STRIPE_HEIGHT + STACK_GAP : 0)
  );
}
