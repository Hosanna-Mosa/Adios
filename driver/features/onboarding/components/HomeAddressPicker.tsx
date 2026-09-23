import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { homeAddressStyles as styles } from "./HomeAddressPicker.styles";
import { Touchable } from "@/components/ui/Touchable";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export interface HomeAddressSuggestion {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/** Place suggestions under the home-address field during onboarding. */
export function HomeAddressSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: HomeAddressSuggestion[];
  onSelect: (item: HomeAddressSuggestion) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <Box style={styles.dropdown}>
      <ScrollBox nestedScrollEnabled={true} style={styles.scroll}>
        {suggestions.map((item) => (
          <Touchable key={item.id} onPress={() => onSelect(item)} style={styles.row}>
            <AppText style={styles.name}>{item.name}</AppText>
            <AppText style={styles.address}>{item.address}</AppText>
          </Touchable>
        ))}
      </ScrollBox>
    </Box>
  );
}

/** Confirmation that the typed home address resolved to coordinates. */
export function LocationVerifiedBox({ lat, lng }: { lat: number | null; lng: number | null }) {
  const { t } = useTranslation();
  if (lat === null || lng === null) return null;

  return (
    <Box style={styles.verifiedBox}>
      <Feather name="check-circle" size={18} color={Colors.successBright} />
      <Box style={styles.verifiedCopy}>
        <AppText style={styles.verifiedTitle}>{t("onboarding.locationVerifiedGeometrically")}</AppText>
        <AppText style={styles.verifiedCoords}>
          {t("onboarding.coords")}: [${lng.toFixed(4)}, ${lat.toFixed(4)}]
        </AppText>
      </Box>
    </Box>
  );
}
