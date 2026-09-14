import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";

// Shown when the screen was opened for a meat center, for which there is no
// public by-id endpoint — see the fetch guard in app/restaurant-details.tsx.
// The screen decides when this applies, because the condition is about how the
// screen was navigated to, not about any data this component holds.

interface Props {
  styles: RestaurantDetailsStyles;
}

export function MeatDetailsNotice({ styles }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.hygieneText}>
        {t("app.food.fullDetailsForMeatCentersArenapost")}
      </Text>
    </View>
  );
}
