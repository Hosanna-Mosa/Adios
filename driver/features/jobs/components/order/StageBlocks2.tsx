import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** The two stops on a job, split by a hairline. */
export function StopsPanel({ children }: { children: React.ReactNode }) {
  return <Box style={styles.infoBox}>{children}</Box>;
}

/** Hairline between the two stops. */
export function StopsDivider() {
  return <Box style={styles.divider} />;
}

/** Row of contact buttons beside a stop. */
export function ContactActions({ children }: { children: React.ReactNode }) {
  return <Box style={styles.rideContactActions}>{children}</Box>;
}

/** Notice while waiting at the restaurant. */
export function WaitNotification({ message }: { message: React.ReactNode }) {
  return (
    <Box style={styles.waitNotification}>
      <AppText style={styles.waitNotifyText}>{message}</AppText>
    </Box>
  );
}

/** Titled group inside the pickup checklist. */
export function ChecklistGroup({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <AppText style={styles.checklistHeader}>{title}</AppText>
      {children}
    </>
  );
}

/** Scrollable body of a completed job. */
export function CompletedScroll({ children }: { children: React.ReactNode }) {
  return <Box style={styles.deliveredScroll}>{children}</Box>;
}

/** Rating and comments block after a job. */
export function FeedbackSection({ children }: { children: React.ReactNode }) {
  return <Box style={styles.feedbackSection}>{children}</Box>;
}
