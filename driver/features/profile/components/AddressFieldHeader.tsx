import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** "Full Address *" label paired with the Use Current Location action. */
export function AddressFieldHeader({
  label,
  fetching,
  onUseCurrentLocation,
}: {
  label: string;
  fetching: boolean;
  onUseCurrentLocation: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.fieldHeaderRow}>
      <AppText style={styles.inputLabel}>{label}</AppText>
      <Touchable
        onPress={onUseCurrentLocation}
        disabled={fetching}
        style={styles.locateButton}
      >
        {fetching ? (
          <Loader size="small" color={Colors.primary} />
        ) : (
          <Feather name="target" size={16} color={Colors.primary} />
        )}
        <AppText style={styles.locateText}>
          {fetching ? t("profile.locating") : t("profile.useCurrentLocation")}
        </AppText>
      </Touchable>
    </Box>
  );
}
