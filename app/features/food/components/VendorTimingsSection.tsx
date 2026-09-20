import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";
import { type VendorDetails } from "../vendor-details.types";

// The week's opening hours, with today's row highlighted. `openState` is the
// server's evaluation; `todayName` only decides which row is emphasised.

interface Props {
  openState: VendorDetails["openState"];
  isOpenNow: boolean;
  todayName: string;
  styles: RestaurantDetailsStyles;
}

export function VendorTimingsSection({ openState, isOpenNow, todayName, styles }: Props) {
  if (!openState?.week?.length) return null;

  return (
    <Animated.View entering={fadeInUp(45)} style={styles.section}>
      <Text style={styles.sectionLabel}>Timings</Text>
      <View style={styles.card}>
        <View style={styles.timingTodayRow}>
          <Text style={styles.timingTodayLabel}>Today</Text>
          <Text style={styles.timingTodayValue}>{openState.today || (isOpenNow ? "Open now" : "Closed today")}</Text>
        </View>
        {openState.week.map((entry) => {
          const isToday = entry.day === todayName;
          return (
            <View key={entry.day} style={styles.timingRow}>
              <Text style={[styles.timingDay, isToday && styles.timingRowToday]}>{entry.day}</Text>
              <Text style={[styles.timingHours, isToday && styles.timingRowToday]}>{entry.hours}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
