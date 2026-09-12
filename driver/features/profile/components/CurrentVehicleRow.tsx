import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Tappable summary of the vehicle currently attached to the driver. */
export function CurrentVehicleRow({
  label,
  detail,
  onPress,
}: {
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <PressBox style={styles.currentVehicleCard} onPress={onPress}>
      <Box style={styles.vehicleIconBg}>
        <Feather name="truck" size={18} color={Colors.text} />
      </Box>
      <Box style={styles.vehicleCopy}>
        <AppText style={styles.vehicleTitleSmall}>{label}</AppText>
        <AppText style={styles.vehicleValue}>{detail}</AppText>
      </Box>
      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </PressBox>
  );
}
