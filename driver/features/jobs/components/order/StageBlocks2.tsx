import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

/** The two stops on a job, split by a hairline. */
export function StopsPanel({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoBox}>{children}</View>;
}

/** Hairline between the two stops. */
export function StopsDivider() {
  return <View style={styles.divider} />;
}

/** Row of contact buttons beside a stop. */
export function ContactActions({ children }: { children: React.ReactNode }) {
  return <View style={styles.rideContactActions}>{children}</View>;
}

/** Notice while waiting at the restaurant. */
export function WaitNotification({ message }: { message: React.ReactNode }) {
  return (
    <View style={styles.waitNotification}>
      <Text style={styles.waitNotifyText}>{message}</Text>
    </View>
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
      <Text style={styles.checklistHeader}>{title}</Text>
      {children}
    </>
  );
}

/** Scrollable body of a completed job. */
export function CompletedScroll({ children }: { children: React.ReactNode }) {
  return <View style={styles.deliveredScroll}>{children}</View>;
}

/** Rating and comments block after a job. */
export function FeedbackSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.feedbackSection}>{children}</View>;
}
