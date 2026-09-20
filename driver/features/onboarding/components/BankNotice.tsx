import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { bankStyles } from "../onboarding.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Reassurance panel above the bank fields during onboarding.
 *
 * Deliberately NOT the payout screen's SecureNotice — that one uses a
 * different green and sets its weight via fontFamily rather than fontWeight,
 * so sharing them would change how one of the two screens looks. */
export function BankNotice({ title, text }: { title: string; text: string }) {
  return (
    <Box style={bankStyles.notice}>
      <Box style={bankStyles.noticeIcon}>
        <Feather name="shield" size={17} color={Colors.success} />
      </Box>
      <Box style={bankStyles.noticeCopy}>
        <AppText style={bankStyles.noticeTitle}>{title}</AppText>
        <AppText style={bankStyles.noticeText}>{text}</AppText>
      </Box>
    </Box>
  );
}
