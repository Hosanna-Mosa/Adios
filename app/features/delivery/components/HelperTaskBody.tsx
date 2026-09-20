import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { HelperTaskCheckRow } from "./HelperTaskCheckRow";
import { HelperTaskFooter } from "./HelperTaskFooter";
import { HelperTaskTitleRow } from "./HelperTaskTitleRow";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  currentTaskPrice: number | null;
  handleCancel: () => void;
  handleIncreasePrice: any;
  insets: EdgeInsets;
  isIncreasingPrice: any;
  offer: any;
  rejectedCount: number;
  styles: HelperTaskStyles;
  totalContacted: number;
}

export function HelperTaskBody({
  accent,
  calculatedFare,
  currentTaskPrice,
  handleCancel,
  handleIncreasePrice,
  insets,
  isIncreasingPrice,
  offer,
  rejectedCount,
  styles,
  totalContacted,
}: Props) {
  return (
    <>
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 8 }}>
        <Animated.View entering={fadeInUp(0)}>
          <HelperTaskTitleRow
            styles={styles}
          />
          <Text style={styles.subtitle}>Matching you with helpers nearby.</Text>
        </Animated.View>

        <View style={{ gap: 12, marginTop: 18 }}>
          <HelperTaskCheckRow
            state="done"
            label={`Task published · ₹${currentTaskPrice ?? offer ?? calculatedFare}`}
            delay={60}
            accent={accent}
            styles={styles}
          />
          {totalContacted > 0 && (
            <HelperTaskCheckRow
              state="done"
              label={`${totalContacted} helpers notified`}
              delay={0}
              accent={accent}
              styles={styles}
            />
          )}
          <HelperTaskCheckRow
            state="pending"
            label="Waiting for the first acceptance"
            delay={100}
            accent={accent}
            styles={styles}
          />
        </View>

        {totalContacted > 0 && rejectedCount > 0 && (
          <Animated.View style={styles.declineNote} entering={fadeInUp(0)}>
            <Text style={styles.declineNoteText}>{rejectedCount} of {totalContacted} contacted helpers have passed so far — consider raising your offer.</Text>
          </Animated.View>
        )}

        <Animated.View style={{ marginTop: 22 }} entering={fadeInUp(160)}>
          <Text style={styles.sectionLabel}>Attract helpers faster</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {[10, 20, 30, 40, 50].map((amount, i) => (
              <Animated.View key={amount} entering={staggerListItem(i, 30)}>
                <TouchableOpacity
                  style={styles.raiseChip}
                  onPress={() => handleIncreasePrice(amount)}
                  disabled={isIncreasingPrice === amount}
                >
                  <Text style={styles.raiseChipText}>+₹{amount}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>

      <HelperTaskFooter
        handleCancel={handleCancel}
        insets={insets}
        styles={styles}
      />
    </View>
    </>
  );
}
