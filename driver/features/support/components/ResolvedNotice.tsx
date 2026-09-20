import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Footer for a closed ticket: reopen it, or begin a fresh case. */
export function ResolvedNotice({
  paddingBottom,
  onReopen,
  onStartNew,
}: {
  paddingBottom: number;
  onReopen: () => void;
  onStartNew: () => void;
}) {
  return (
    <Box style={[styles.resolvedNotice, { backgroundColor: Colors.surface, paddingBottom }]}>
      <Feather name="check-circle" size={16} color={Colors.brand} />
      <AppText style={[styles.resolvedText, { color: Colors.textSecondary }]}>
        This ticket has been marked as resolved.
      </AppText>
      <Box style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <Touchable style={[styles.reopenBtn, { borderColor: Colors.primary }]} onPress={onReopen}>
          <AppText style={[styles.reopenBtnText, { color: Colors.primary }]}>Reopen Case</AppText>
        </Touchable>
        <Touchable
          style={[styles.reopenBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
          onPress={onStartNew}
        >
          <AppText style={[styles.reopenBtnText, { color: Colors.white }]}>Start New Chat</AppText>
        </Touchable>
      </Box>
    </Box>
  );
}
