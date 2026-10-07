import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import type { ThemeTokens } from "@/constants/colors";
import type { OutletLocation } from "@/types/models";
import type { EditProfileStyles } from "../editProfile.styles";

interface Props {
  location: OutletLocation | null;
  locating: boolean;
  onCapture: () => void;
  onRemove: () => void;
  styles: EditProfileStyles;
  tokens: ThemeTokens;
}

/** Optional "Current location": captured from the phone's GPS, shown as a small card with Remove. */
export function LocationField({ location, locating, onCapture, onRemove, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{t("editProfile.currentLocation")}</Text>
      {location ? (
        <View style={styles.location}>
          <Ionicons name="navigate-circle" size={22} color={tokens.brand} />
          <View style={styles.locationTexts}>
            <Text style={styles.locationAddress}>{location.address || t("editProfile.locationNoAddress")}</Text>
            <Text style={styles.locationCoords}>
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </Text>
          </View>
          <Button title={t("editProfile.removeLocation")} variant="link" size="sm" onPress={onRemove} />
        </View>
      ) : (
        <Text style={styles.hint}>{t("editProfile.locationHint")}</Text>
      )}
      <Button
        title={location ? t("editProfile.updateLocation") : t("editProfile.useCurrentLocation")}
        variant="secondary"
        onPress={onCapture}
        loading={locating}
        icon={<Ionicons name="locate-outline" size={18} color={tokens.text} />}
        fullWidth
      />
    </View>
  );
}
