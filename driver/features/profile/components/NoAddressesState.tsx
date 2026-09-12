import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../saved-addresses.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Shown when the driver has not saved any address yet. */
export function NoAddressesState() {
  return (
    <Box style={styles.emptyState}>
      <Feather name="map" size={48} color={Colors.border} />
      <AppText style={styles.emptyText}>No saved addresses yet</AppText>
    </Box>
  );
}
