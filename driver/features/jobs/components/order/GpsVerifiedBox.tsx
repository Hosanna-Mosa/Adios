import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Green confirmation that the driver's GPS puts them at the stop. */
export function GpsVerifiedBox({ title, description }: { title: string; description: string }) {
  return (
    <Box style={styles.gpsVerifiedBox}>
      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
      <Box style={{ marginLeft: 10 }}>
        <AppText style={styles.gpsVerifiedTitle}>{title}</AppText>
        <AppText style={styles.gpsVerifiedDesc}>{description}</AppText>
      </Box>
    </Box>
  );
}
