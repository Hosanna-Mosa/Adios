import React from "react";

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
  return (
    <Box style={styles.banner}>
      <Box style={styles.copy}>
        <AppText style={styles.title}>Discuss Task Details</AppText>
        <AppText style={styles.subtitle}>
          {canStartTask
            ? "Customer has assigned the task! You can start now."
            : "Wait for the customer to assign the task."}
        </AppText>
      </Box>
      <Touchable
        style={[styles.button, canStartTask ? styles.buttonEnabled : styles.buttonDisabled]}
        disabled={!canStartTask}
        onPress={onStartTask}
      >
        <AppText style={styles.buttonText}>Start Task</AppText>
      </Touchable>
    </Box>
  );
}
