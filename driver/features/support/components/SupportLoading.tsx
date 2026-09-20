import React from "react";

import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Full-screen spinner while a support session loads. */
export function SupportLoading({ message }: { message: string }) {
  return (
    <Box style={[styles.center, { backgroundColor: Colors.background }]}>
      <Loader size="large" color={Colors.primary} />
      <AppText style={{ marginTop: 12, color: Colors.textSecondary }}>{message}</AppText>
    </Box>
  );
}
