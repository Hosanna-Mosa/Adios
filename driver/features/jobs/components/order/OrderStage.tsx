import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={styles.stepContainer}>
      {showPulse === undefined ? (
        <AppText style={styles.stepTitle}>{title}</AppText>
      ) : (
        <Box style={styles.stepHeaderRow}>
          <AppText style={styles.stepTitle}>{title}</AppText>
          {showPulse && <Box style={styles.pulseDot} />}
        </Box>
      )}
      {children}
    </Box>
  );
}
