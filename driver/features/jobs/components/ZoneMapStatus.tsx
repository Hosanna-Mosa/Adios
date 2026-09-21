import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../zone-map.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Full-screen state shown while the geofence loads. */
export function ZoneMapLoading({ message }: { message: string }) {
  return (
    <Box style={styles.centerContainer}>
      <Loader size="large" color={Colors.brand} />
      <AppText style={styles.loadingText}>{message}</AppText>
    </Box>
  );
}

/** Full-screen state when the zone could not be fetched. */
export function ZoneMapError({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Box style={styles.centerContainer}>
      <Feather name="alert-triangle" size={48} color={Colors.error} />
      <AppText style={styles.errorText}>{message}</AppText>
      <Touchable style={styles.backButton} onPress={onAction}>
        <AppText style={styles.backButtonText}>{actionLabel}</AppText>
      </Touchable>
    </Box>
  );
}
