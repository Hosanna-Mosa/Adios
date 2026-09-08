import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { taskBannerStyles as styles } from "./TaskAssignmentBanner.styles";

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
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>Discuss Task Details</Text>
        <Text style={styles.subtitle}>
          {canStartTask
            ? "Customer has assigned the task! You can start now."
            : "Wait for the customer to assign the task."}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, canStartTask ? styles.buttonEnabled : styles.buttonDisabled]}
        disabled={!canStartTask}
        onPress={onStartTask}
      >
        <Text style={styles.buttonText}>Start Task</Text>
      </TouchableOpacity>
    </View>
  );
}
