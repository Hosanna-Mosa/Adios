import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../saved-addresses.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** One saved address with edit and delete actions. */
export function SavedAddressCard({
  address,
  index,
  onEdit,
  onDelete,
}: {
  address: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <AnimatedBox entering={staggerListItem(index)} style={styles.addressCard}>
      <Box style={styles.addressIconBox}>
        <Feather
          name={
            address.label === "Home"
              ? "home"
              : address.label === "Work" || address.label === "Office"
              ? "briefcase"
              : "map-pin"
          }
          size={20}
          color={Colors.textSecondary}
        />
      </Box>
      <Box style={styles.addressInfo}>
        <AppText style={styles.addressLabel}>{address.label}</AppText>
        <AppText style={styles.addressLine} numberOfLines={2}>
          {address.addressLine}
        </AppText>
        {address.phone && <AppText style={styles.addressPhone}>{address.phone}</AppText>}
      </Box>
      <Box style={styles.addressActions}>
        <Touchable style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={18} color={Colors.primary} />
        </Touchable>
        <Touchable style={styles.actionBtn} onPress={onDelete}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </Touchable>
      </Box>
    </AnimatedBox>
  );
}
