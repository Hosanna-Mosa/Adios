import { ActivityIndicator, View } from "react-native";
import { EmptyState } from "@/components/ui/EmptyState";

// What app/restaurant-menu/[id].tsx shows while a shared link is being resolved,
// and when the outlet behind it has gone.

interface Props {
  failed: boolean;
  goHome: () => void;
  accentColor: string;
}

export function RestaurantMenuLinkBody({ failed, goHome, accentColor }: Props) {
  if (failed) {
    return (
      <EmptyState
        title="This link isn't available"
        subtitle="The outlet it points to may have closed or moved."
        icon="link-outline"
        actionLabel="Go to home"
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
