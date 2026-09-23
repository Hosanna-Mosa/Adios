import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../notifications.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Back, title, and the "Mark all read" action shown only when something is unread. */
export function NotificationsHeader({
  unreadCount,
  onBack,
  onMarkAllRead,
}: {
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.header}>
      <Touchable style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={20} color={Colors.text} />
      </Touchable>
      <AppText style={styles.headerTitle}>{t("profile.notifications")}</AppText>
      {unreadCount > 0 && (
        <Touchable onPress={onMarkAllRead}>
          <AppText style={styles.markAllText}>{t("profile.markAllRead")}</AppText>
        </Touchable>
      )}
    </Box>
  );
}
