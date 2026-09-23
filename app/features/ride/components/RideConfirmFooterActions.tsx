import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { type RideConfirmationStyles } from "@/features/ride/ride-confirmation.styles";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: RideConfirmationStyles;
}

export function RideConfirmFooterActions({
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.footerPrimaryBtn} onPress={() => router.replace("/(tabs)/orders")}>
      <Text style={styles.footerPrimaryBtnText}>{t("app.ride.viewMyOrders")}</Text>
    </TouchableOpacity>
  );
}
