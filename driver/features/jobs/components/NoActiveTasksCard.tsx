import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";
import { Touchable } from "@/components/ui/Touchable";
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
      <Touchable style={styles.calendarBtn}>
        <Feather name="calendar" size={18} color={Colors.primary} />
      </Touchable>
    </Box>
  );
}
