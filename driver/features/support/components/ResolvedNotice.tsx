import React from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Box style={[styles.resolvedNotice, { backgroundColor: Colors.surface, paddingBottom }]}>
      <Feather name="check-circle" size={16} color={Colors.brand} />
      <AppText style={[styles.resolvedText, { color: Colors.textSecondary }]}>
        {t("support.thisTicketHasBeenMarkedResolved")}
      </AppText>
      <Box style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <Touchable style={[styles.reopenBtn, { borderColor: Colors.primary }]} onPress={onReopen}>
          <AppText style={[styles.reopenBtnText, { color: Colors.primary }]}>{t("support.reopenCase")}</AppText>
        </Touchable>
        <Touchable
          style={[styles.reopenBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
          onPress={onStartNew}
        >
          <AppText style={[styles.reopenBtnText, { color: Colors.white }]}>{t("support.startNewChat")}</AppText>
        </Touchable>
      </Box>
    </Box>
  );
}
