import React from "react";
import { useTranslation } from "react-i18next";

import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Back, the job's title for its service type, and the SOS button. */
export function ActiveOrderHeader({
  title,
  onBack,
  onSOS,
}: {
  title: string;
  onBack: () => void;
  onSOS: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.header}>
      <Touchable accessibilityLabel={t("a11y.back")} hitSlop={8} style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </Touchable>
      <AppText style={styles.headerTitle}>{title}</AppText>
      {/* original was [styles.backBtn, {…overrides}] — keep both layers */}
      <Touchable accessibilityLabel={t("a11y.sos")} hitSlop={8} style={[styles.backBtn, styles.sosBtn]} onPress={onSOS}>
        <Ionicons name="alert-circle" size={18} color={Colors.white} />
      </Touchable>
    </Box>
  );
}
