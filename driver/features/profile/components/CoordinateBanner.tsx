import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { coordinateStyles as styles } from "./CoordinateBanner.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Confirmation that an address resolved to map coordinates.
 * Renders nothing until both values are known. */
export function CoordinateBanner({ lat, lng }: { lat: number | null; lng: number | null }) {
  const { t } = useTranslation();
  if (lat === null || lng === null) return null;

  return (
    <Box style={styles.banner}>
      <Feather name="check-circle" size={18} color={Colors.success} />
      <Box style={styles.copy}>
        <AppText style={styles.title}>{t("profile.locationCoordinatesResolved")}</AppText>
        <AppText style={styles.coords}>
          {t("onboarding.coords")}: [{lng.toFixed(4)}, {lat.toFixed(4)}]
        </AppText>
      </Box>
    </Box>
  );
}
