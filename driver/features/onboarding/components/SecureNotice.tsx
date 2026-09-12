import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Reassurance panel at the top of the payout form. */
export function SecureNotice({ title, text }: { title: string; text: string }) {
  return (
    <Box style={styles.notice}>
      <Box style={styles.noticeIcon}>
        <Feather name="shield" size={17} color={Colors.success} />
      </Box>
      <Box style={styles.noticeCopy}>
        <AppText style={styles.noticeTitle}>{title}</AppText>
        <AppText style={styles.noticeText}>{text}</AppText>
      </Box>
    </Box>
  );
}
