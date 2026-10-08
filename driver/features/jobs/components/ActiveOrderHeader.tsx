import React from "react";

import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { RefreshButton } from "@/components/shared/RefreshButton";

/** Back, the job's title for its service type, refresh and the SOS button. */
export function ActiveOrderHeader({
  title,
  onBack,
  onSOS,
  onRefresh,
  refreshing = false,
}: {
  title: string;
  onBack: () => void;
  onSOS: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <Box style={styles.header}>
      <Touchable style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </Touchable>
      <AppText style={styles.headerTitle}>{title}</AppText>
      <Box style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {onRefresh && <RefreshButton onPress={onRefresh} refreshing={refreshing} />}
        {/* original was [styles.backBtn, {…overrides}] — keep both layers */}
        <Touchable style={[styles.backBtn, styles.sosBtn]} onPress={onSOS}>
          <Ionicons name="alert-circle" size={18} color={Colors.white} />
        </Touchable>
      </Box>
    </Box>
  );
}
