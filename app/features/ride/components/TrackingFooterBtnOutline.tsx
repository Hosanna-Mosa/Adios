import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleShareTrip: any;
  styles: any;
}

export function TrackingFooterBtnOutline({
  handleShareTrip,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.footerBtnOutline} onPress={handleShareTrip}>
      <Text style={styles.footerBtnOutlineText}>{t("app.ride.shareTrip")}</Text>
    </TouchableOpacity>
  );
}
