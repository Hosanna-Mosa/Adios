import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Unread-message count on the chat button. */
export function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Box style={styles.commBadge}>
      <AppText style={styles.commBadgeText}>{count}</AppText>
    </Box>
  );
}
