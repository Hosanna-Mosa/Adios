import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../notifications.styles";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Spinner while notifications load. */
export function NotificationsLoading() {
  return (
    <Box style={styles.center}>
      <Loader size="large" color={Colors.primary} />
    </Box>
  );
}

/** Shown when there is nothing in the list. */
export function NotificationsEmpty({ message }: { message: string }) {
  return (
    <Box style={styles.center}>
      <Feather name="bell-off" size={32} color={Colors.textMuted} />
      <AppText style={styles.emptyText}>{message}</AppText>
    </Box>
  );
}
