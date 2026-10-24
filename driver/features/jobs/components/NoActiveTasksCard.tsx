import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";
import { AppImage } from "@/components/ui/AppImage";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Shown when the driver has no job in progress. */
export function NoActiveTasksCard({ isOnline }: { isOnline: boolean }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.emptyTasksCard}>
      <AppImage
        source={require("../../../assets/images/clipboard_empty_state.png")}
        style={styles.emptyTasksImg}
        resizeMode="contain"
      />
      <Box style={styles.emptyTasksCopy}>
        <AppText style={styles.emptyTasksTitle}>{t("jobs.noActiveTasks")}</AppText>
        <AppText style={styles.emptyTasksDesc}>
          {isOnline
            ? t("jobs.onlineReadyToReceiveBookings")
            : t("jobs.goOnlineToReceiveBookings")}
        </AppText>
      </Box>
      {/* Decorative: it has no action, so it is not a button. */}
      <Box style={styles.calendarBtn} accessible={false} importantForAccessibility="no-hide-descendants">
        <Feather name="calendar" size={18} color={Colors.primary} />
      </Box>
    </Box>
  );
}
