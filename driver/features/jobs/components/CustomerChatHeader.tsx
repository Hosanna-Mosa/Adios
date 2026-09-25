import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Chat header: back, customer identity with online dot, and the call button. */
export function CustomerChatHeader({
  customerName,
  paddingTop,
  onBack,
  onCall,
}: {
  customerName: string;
  paddingTop: number;
  onBack: () => void;
  onCall: () => void;
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
      <Touchable style={styles.callBtn} onPress={onCall}>
        <Feather name="phone" size={20} color={Colors.brand} />
      </Touchable>
    </Box>
  );
}
