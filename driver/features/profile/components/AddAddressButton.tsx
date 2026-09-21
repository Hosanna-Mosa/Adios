import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../saved-addresses.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Dashed "Add New Address" affordance at the top of the list. */
export function AddAddressButton({ onPress }: { onPress: () => void }) {
  return (
    <Touchable style={styles.addBtn} onPress={onPress}>
      <Box style={styles.addIcon}>
        <Feather name="plus" size={20} color={Colors.primary} />
      </Box>
      <AppText style={styles.addText}>Add New Address</AppText>
    </Touchable>
  );
}
