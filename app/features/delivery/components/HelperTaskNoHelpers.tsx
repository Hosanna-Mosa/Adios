import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.noHelpersWrap} entering={fadeInUp(0)}>
      <View style={[styles.noHelpersIcon, { backgroundColor: accent.skin }]}>
        <Ionicons name="people-outline" size={moderateScale(26)} color={accent.accent} />
      </View>
      <Text style={styles.noHelpersTitle}>{t("app.delivery.noHelpersTookThisTask")}</Text>
      <Text style={styles.noHelpersSubtitle}>
        {totalContacted > 0
          ? rejectedCount > 0
            ? t("app.delivery.offeredToHelpersSomePassed", { count: totalContacted, passed: rejectedCount })
            : t("app.delivery.offeredToHelpers", { count: totalContacted })
          : t("app.delivery.nobodyOnShiftNearYou")}
      </Text>

      <Text style={styles.noHelpersPrice}>{t("app.delivery.currentOffer")} · ₹{currentTaskPrice ?? 0}</Text>

      <View style={styles.noHelpersRaiseRow}>
        {[20, 50, 100].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.noHelpersRaiseBtn, { borderColor: accent.accent }]}
            onPress={() => handleIncreasePrice(amount)}
            disabled={isIncreasingPrice === amount}
          >
            <Text style={[styles.noHelpersRaiseText, { color: accent.accent }]}>
              {isIncreasingPrice === amount ? t("app.delivery.raising") : `+₹${amount}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.noHelpersCancel} onPress={handleCancel}>
        <Text style={[styles.noHelpersCancelText, { color: tokens.error }]}>{t("app.delivery.cancelTask")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
