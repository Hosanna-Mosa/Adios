import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../saved-addresses.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Dashed "Add New Address" affordance at the top of the list. */
export function AddAddressButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Touchable style={styles.addBtn} onPress={onPress}>
      <Box style={styles.addIcon}>
        <Feather name="plus" size={20} color={Colors.primary} />
      </Box>
      <AppText style={styles.addText}>{t("profile.addNewAddress")}</AppText>
    </Touchable>
  );
}
