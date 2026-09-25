import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Shown when support has asked the driver to confirm the case is solved. */
export function ResolveRequestPrompt({
  paddingBottom,
  onApprove,
  onDecline,
}: {
  paddingBottom: number;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box
      style={[
        styles.resolveRequestContainer,
        { backgroundColor: Colors.surface, paddingBottom, borderTopColor: Colors.border },
      ]}
    >
      <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
      <AppText style={[styles.resolveRequestTitle, { color: Colors.text }]}>{t("support.resolveThisTicket")}</AppText>
      <AppText style={[styles.resolveRequestDesc, { color: Colors.textSecondary }]}>
        {t("support.supportHasRequestedToMarkResolved")}
      </AppText>
      <Box style={styles.resolveRequestButtons}>
        <Touchable
          style={[styles.resolveBtnConfirm, { backgroundColor: Colors.brandPressed }]}
          onPress={onApprove}
        >
          <AppText style={styles.resolveBtnTextConfirm}>{t("support.yesResolveCase")}</AppText>
        </Touchable>
        <Touchable
          style={[styles.resolveBtnDecline, { borderColor: Colors.primary }]}
          onPress={onDecline}
        >
          <AppText style={[styles.resolveBtnTextDecline, { color: Colors.primary }]}>{t("support.noKeepOpen")}</AppText>
        </Touchable>
      </Box>
    </Box>
  );
}
