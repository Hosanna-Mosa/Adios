import { ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";

// What app/restaurant-menu/[id].tsx shows while a shared link is being resolved,
// and when the outlet behind it has gone.

interface Props {
  failed: boolean;
  goHome: () => void;
  accentColor: string;
}

export function RestaurantMenuLinkBody({ failed, goHome, accentColor }: Props) {
  const { t } = useTranslation();
  if (failed) {
    return (
      <EmptyState
        title={t("app.food.thisLinkIsntAvailable")}
        subtitle={t("app.food.theOutletItPointsToMayHaveClosed")}
        icon="link-outline"
        actionLabel={t("app.food.goToHome")}
        onAction={goHome}
      />
    );
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={accentColor} />
    </View>
  );
}
