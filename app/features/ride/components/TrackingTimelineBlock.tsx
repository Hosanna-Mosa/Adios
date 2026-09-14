import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatClock: any;
  accent: any;
  eta: any;
  helperStatus: any;
  isHelper: any;
  orderCreatedAt: any;
  styles: any;
  timeline: any[];
  tokens: any;
}

export function TrackingTimelineBlock({
  formatClock,
  accent,
  eta,
  helperStatus,
  isHelper,
  orderCreatedAt,
  styles,
  timeline,
  tokens,
}: Props) {
  return (
    <View style={styles.timelineBlock}>
      {timeline.map((step, i) => (
        <View key={step.label} style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ alignItems: "center" }}>
            {step.done ? (
              <View style={[styles.stepDotDone, { backgroundColor: accent.accent }]}>
                <Ionicons name="checkmark" size={11} color={accent.on} />
              </View>
            ) : step.current ? (
              <View style={styles.stepDotCurrentWrap}>
                <View style={[styles.stepDotCurrentPulse, { backgroundColor: accent.accent }]} />
                <View style={[styles.stepDotCurrent, { backgroundColor: accent.accent }]} />
              </View>
            ) : (
              <View style={styles.stepDotFuture} />
            )}
            {i < timeline.length - 1 && <View style={[styles.stepLine, { backgroundColor: step.done ? accent.accent : tokens.borderStrong }]} />}
          </View>
          <View style={{ paddingBottom: 14 }}>
            <Text style={[styles.stepLabel, { color: step.current ? accent.accent : step.done ? tokens.text : tokens.muted }]}>{step.label}</Text>
            {i === 0 && orderCreatedAt && <Text style={styles.stepSub}>{formatClock(orderCreatedAt)}</Text>}
            {step.current && !isHelper && i < timeline.length - 1 && <Text style={styles.stepSub}>{eta} min away</Text>}
            {step.current && isHelper && helperStatus ? <Text style={styles.stepSub}>{helperStatus}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
