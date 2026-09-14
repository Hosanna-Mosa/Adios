import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  isResolvingAddress: any;
  styles: any;
  tokens: any;
}

export function AddAddressCenterMarker({
  isResolvingAddress,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.centerMarker} pointerEvents="none">
      <View style={styles.dragHint}>
        {isResolvingAddress ? (
          <ActivityIndicator size="small" color={tokens.bg} />
        ) : (
          <Text style={styles.dragHintText}>{t("app.delivery.moveThePinToAdjust")}</Text>
        )}
      </View>
      <View style={styles.dragHintStem} />
      <View style={styles.pinHead}><View style={styles.pinDot} /></View>
      <View style={styles.pinStem} />
      <View style={styles.pinShadow} />
    </View>
  );
}
