import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  setTripModalVisible: any;
  styles: any;
}

export function TrackingFooterBtnOutline3({
  setTripModalVisible,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.footerBtnOutline} onPress={() => setTripModalVisible(true)}>
      <Text style={styles.footerBtnOutlineText}>{t("app.ride.orderDetails")}</Text>
    </TouchableOpacity>
  );
}
