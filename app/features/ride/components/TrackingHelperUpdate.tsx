import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  helperStatus: any;
  styles: any;
}

export function TrackingHelperUpdate({
  accent,
  helperStatus,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.helperUpdate, { backgroundColor: accent.skin }]}>
      <Text style={[styles.helperUpdateLabel, { color: accent.accent }]}>{t("app.ride.helperUpdate")}</Text>
      <Text style={styles.helperUpdateText}>{helperStatus}</Text>
    </View>
  );
}
