import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Box } from "@/components/ui/Box";
import { styles } from "../orders.styles";
import type { ServiceVisual } from "../utils/orderView";

/** The rounded, service-coloured square with the job's icon. */
export function ServiceChip({ visual }: { visual: ServiceVisual }) {
  return (
    <Box style={[styles.chip, { backgroundColor: visual.skin }]}>
      <Ionicons name={visual.icon} size={moderateScale(22)} color={visual.accent} />
    </Box>
  );
}
