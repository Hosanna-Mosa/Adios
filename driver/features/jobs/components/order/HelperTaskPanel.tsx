import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { helperTaskStyles as styles } from "./HelperTaskPanel.styles";

/** Elapsed time on a helper booking, red once it runs over. */
export function TaskTimerDisplay({
  time,
  isOvertime,
}: {
  time: string;
  isOvertime: boolean;
}) {
  return (
    <View style={styles.timerRow}>
      <Ionicons name="time" size={28} color={isOvertime ? Colors.error : Colors.success} />
      <Text style={[styles.timerText, { color: isOvertime ? Colors.error : Colors.text }]}>
        {time}
      </Text>
    </View>
  );
}

/** Progress against the hours booked, with elapsed/overtime labels. */
export function TaskProgressBar({
  progress,
  isOvertime,
  hoursBooked,
}: {
  progress: number;
  isOvertime: boolean;
  hoursBooked: string | number;
}) {
  return (
    <>
      <View style={styles.progressTrack}>
        <View
          style={{
            flex: Math.round(progress),
            backgroundColor: isOvertime ? Colors.error : Colors.success,
          }}
        />
        <View style={[{ flex: Math.max(0, 100 - Math.round(progress)) }, styles.progressRest]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>{isOvertime ? "Overtime" : "Elapsed"}</Text>
        <Text style={styles.progressLabel}>{hoursBooked} Hours Booked</Text>
      </View>
    </>
  );
}

/** Canned status messages the driver can send mid-task. */
export function QuickUpdateChips({
  heading,
  updates,
  onSend,
}: {
  heading: string;
  updates: string[];
  onSend: (text: string) => void;
}) {
  return (
    <>
      <Text style={styles.updatesHeading}>{heading}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.updatesScroll}>
        {updates.map((text, idx) => (
          <TouchableOpacity key={idx} style={styles.updateChip} onPress={() => onSend(text)}>
            <Text style={styles.updateChipText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
