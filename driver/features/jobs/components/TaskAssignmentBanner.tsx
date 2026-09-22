import React from "react";
import { useTranslation } from "react-i18next";

import { taskBannerStyles as styles } from "./TaskAssignmentBanner.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Helper-service banner in the customer chat: tells the driver whether the
 * customer has assigned the task yet, and starts it once they have. */
export function TaskAssignmentBanner({
  canStartTask,
  onStartTask,
}: {
  canStartTask: boolean;
  onStartTask: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.banner}>
      <Box style={styles.copy}>
        <AppText style={styles.title}>{t("jobs.discussTaskDetails")}</AppText>
        <AppText style={styles.subtitle}>
          {canStartTask
            ? t("jobs.customerHasAssignedTheTask")
            : t("jobs.waitForCustomerToAssignTask")}
        </AppText>
      </Box>
      <Touchable
        style={[styles.button, canStartTask ? styles.buttonEnabled : styles.buttonDisabled]}
        disabled={!canStartTask}
        onPress={onStartTask}
      >
        <AppText style={styles.buttonText}>{t("jobs.startTask")}</AppText>
      </Touchable>
    </Box>
  );
}
