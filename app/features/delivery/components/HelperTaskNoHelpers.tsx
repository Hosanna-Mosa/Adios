import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { fadeInUp } from "@/motion/presets";

// What the searching step shows once the dispatcher has offered the task to every
// nearby helper and run out. Before this the screen just kept spinning, with no
// way to tell that nothing further was coming.

interface Props {
  accent: any;
  currentTaskPrice: any;
  handleCancel: any;
  handleIncreasePrice: any;
  isIncreasingPrice: any;
  rejectedCount: any;
  styles: any;
  tokens: any;
  totalContacted: any;
}

export function HelperTaskNoHelpers({
  accent,
  currentTaskPrice,
  handleCancel,
  handleIncreasePrice,
  isIncreasingPrice,
  rejectedCount,
  styles,
  tokens,
  totalContacted,
}: Props) {
  return (
    <Animated.View style={styles.noHelpersWrap} entering={fadeInUp(0)}>
      <View style={[styles.noHelpersIcon, { backgroundColor: accent.skin }]}>
        <Ionicons name="people-outline" size={moderateScale(26)} color={accent.accent} />
      </View>
      <Text style={styles.noHelpersTitle}>No helpers took this task</Text>
      <Text style={styles.noHelpersSubtitle}>
        {totalContacted > 0
          ? `We offered it to ${totalContacted} ${totalContacted === 1 ? "helper" : "helpers"} nearby${rejectedCount > 0 ? `, and ${rejectedCount} passed` : ""}. Raising your offer usually gets one within a few minutes.`
          : "Nobody is on shift near you right now. Raising your offer, or trying again shortly, usually helps."}
      </Text>

      <Text style={styles.noHelpersPrice}>Current offer · ₹{currentTaskPrice ?? 0}</Text>

      <View style={styles.noHelpersRaiseRow}>
        {[20, 50, 100].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.noHelpersRaiseBtn, { borderColor: accent.accent }]}
            onPress={() => handleIncreasePrice(amount)}
            disabled={isIncreasingPrice === amount}
          >
            <Text style={[styles.noHelpersRaiseText, { color: accent.accent }]}>
              {isIncreasingPrice === amount ? "Raising…" : `+₹${amount}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.noHelpersCancel} onPress={handleCancel}>
        <Text style={[styles.noHelpersCancelText, { color: tokens.error }]}>Cancel task</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
