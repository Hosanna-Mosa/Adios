import { ScreenShell } from "@/components/ui/ScreenShell";
import { RestaurantMenuLinkBody } from "@/features/food/components/RestaurantMenuLinkBody";
import { useRestaurantMenuLink } from "@/features/food/useRestaurantMenuLink";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// The path a shared link uses — https://<host>/restaurant-menu/<vendorId>?item=<id>
// and flavour://restaurant-menu/<vendorId>. It resolves the outlet and hands off
// to app/restaurant-menu.tsx, which is driven by query params.
export default function RestaurantMenuLink() {
  const { failed, goHome } = useRestaurantMenuLink();
  const { theme } = useThemeStore();

  return (
    <ScreenShell>
      <RestaurantMenuLinkBody
        failed={failed}
        goHome={goHome}
        accentColor={designTokens[theme].services.food.accent}
      />
    </ScreenShell>
  );
}
