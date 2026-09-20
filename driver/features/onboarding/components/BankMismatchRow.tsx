import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { bankStyles } from "../onboarding.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Warning shown while the two account numbers disagree. */
export function BankMismatchRow({ message }: { message: string }) {
  return (
    <Box style={bankStyles.errorRow}>
      <Feather name="alert-circle" size={15} color={Colors.error} />
      <AppText style={bankStyles.errorText}>{message}</AppText>
    </Box>
  );
}
