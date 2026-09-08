import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

/** Frame around one stage of a job: the container, its title, and the pulse
 * dot that shows while the GPS simulator is running. */
export function OrderStage({
  title,
  showPulse,
  children,
}: {
  title: string;
  showPulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepContainer}>
      {showPulse === undefined ? (
        <Text style={styles.stepTitle}>{title}</Text>
      ) : (
        <View style={styles.stepHeaderRow}>
          <Text style={styles.stepTitle}>{title}</Text>
          {showPulse && <View style={styles.pulseDot} />}
        </View>
      )}
      {children}
    </View>
  );
}
