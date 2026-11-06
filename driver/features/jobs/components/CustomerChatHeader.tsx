import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { RefreshButton } from "@/components/shared/RefreshButton";

/** Chat header: back, customer identity with online dot, refresh and the call button. */
export function CustomerChatHeader({
  customerName,
  paddingTop,
  onBack,
  onCall,
  onRefresh,
  refreshing = false,
}: {
  customerName: string;
  paddingTop: number;
  onBack: () => void;
  onCall: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Box style={[styles.header, { paddingTop }]}>
      <Touchable style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={22} color={Colors.text} />
      </Touchable>
      <Box style={styles.headerCenter}>
        <Box style={styles.headerAvatar}>
          <Feather name="user" size={20} color={Colors.textSecondary} />
          <Box style={styles.onlineDot} />
        </Box>
        <Box>
          <AppText style={styles.headerName}>{customerName}</AppText>
          <AppText style={styles.headerStatus}>{t("jobs.customerOnline")}</AppText>
        </Box>
      </Box>
      {onRefresh && <RefreshButton onPress={onRefresh} refreshing={refreshing} />}
      <Touchable style={styles.callBtn} onPress={onCall}>
        <Feather name="phone" size={20} color={Colors.brand} />
      </Touchable>
    </Box>
  );
}
