import React from "react";
import { useTranslation } from "react-i18next";

import { taskBannerStyles as styles } from "./TaskAssignmentBanner.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Helper-service banner in the customer chat, until the task starts: whether the
 * customer has confirmed the task (info only), and a way to the task screen, where
 * it starts with the customer's start OTP. */
export function TaskAssignmentBanner({
  customerConfirmed,
  onStartTask,
}: {
  customerConfirmed: boolean;
  onStartTask: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.banner}>
      <Box style={styles.copy}>
        <AppText style={styles.title}>{t("jobs.discussTaskDetails")}</AppText>
        <AppText style={styles.subtitle}>
          {customerConfirmed
            ? t("jobs.customerConfirmedAskStartOtp")
            : t("jobs.agreeTaskThenAskStartOtp")}
        </AppText>
      </Box>
      <Touchable style={[styles.button, styles.buttonEnabled]} onPress={onStartTask}>
        <AppText style={styles.buttonText}>{t("jobs.startTask")}</AppText>
      </Touchable>
    </Box>
  );
}
