import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Page title with a close action. */
export function ProfilePageHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.headerRow}>
      <AppText style={styles.pageTitle}>{title}</AppText>
      <Touchable accessibilityLabel={t("a11y.close")} hitSlop={8} style={styles.backBtn} onPress={onClose}>
        <Feather name="x" size={20} color={Colors.text} />
      </Touchable>
    </Box>
  );
}
