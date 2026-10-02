import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { HelperTaskCheckRow } from "./HelperTaskCheckRow";
import { HelperTaskFooter } from "./HelperTaskFooter";
import { HelperTaskTitleRow } from "./HelperTaskTitleRow";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";
import { HelperTaskNoHelpers } from "./HelperTaskNoHelpers";

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
  searchExhausted: boolean;
  searchStartedAt: number | null;
  styles: HelperTaskStyles;
  tokens: ThemeTokens;
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
  searchExhausted,
  searchStartedAt,
  styles,
  tokens,
  totalContacted,
}: Props) {
  const { t } = useTranslation();
  if (searchExhausted) {
    return (
      <HelperTaskNoHelpers
        accent={accent}
        currentTaskPrice={currentTaskPrice}
        handleCancel={handleCancel}
        handleIncreasePrice={handleIncreasePrice}
        isIncreasingPrice={isIncreasingPrice}
        rejectedCount={rejectedCount}
        styles={styles}
        tokens={tokens}
        totalContacted={totalContacted}
      />
    );
  }

  return (
    <>
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 8 }}>
        <Animated.View entering={fadeInUp(0)}>
          <HelperTaskTitleRow
            styles={styles}
          />
          <Text style={styles.subtitle}>
            {t("app.delivery.matchingYouWithHelpersNearby")}
            {searchStartedAt ? ` ${t("app.delivery.offersGoOutOneAtATime")}` : ""}
          </Text>
        </Animated.View>

        <View style={{ gap: 12, marginTop: 18 }}>
          <HelperTaskCheckRow
            state="done"
            label={`${t("app.delivery.taskPublished")}${currentTaskPrice ?? offer ?? calculatedFare}`}
            delay={60}
            accent={accent}
            styles={styles}
          />
          {totalContacted > 0 && (
            <HelperTaskCheckRow
              state="done"
              label={`${totalContacted} ${t("app.delivery.helpersNotified")}`}
              delay={0}
              accent={accent}
              styles={styles}
            />
          )}
          <HelperTaskCheckRow
            state="pending"
            label={t("app.delivery.waitingForTheFirstAcceptance")}
            delay={100}
            accent={accent}
            styles={styles}
          />
        </View>

        {totalContacted > 0 && rejectedCount > 0 && (
          <Animated.View style={styles.declineNote} entering={fadeInUp(0)}>
            <Text style={styles.declineNoteText}>{rejectedCount} {t("app.delivery.of")} {totalContacted} {t("app.delivery.contactedHelpersHavePassedSoFar")}</Text>
          </Animated.View>
        )}

        <Animated.View style={{ marginTop: 22 }} entering={fadeInUp(160)}>
          <Text style={styles.sectionLabel}>{t("app.delivery.attractHelpersFaster")}</Text>
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
