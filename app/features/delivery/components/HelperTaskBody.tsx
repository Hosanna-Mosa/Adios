import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { HelperTaskCheckRow } from "./HelperTaskCheckRow";
import { HelperTaskFooter } from "./HelperTaskFooter";
import { HelperTaskTitleRow } from "./HelperTaskTitleRow";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "../helper-task.styles";
import { HelperTaskNoHelpers } from "./HelperTaskNoHelpers";

// The searching step: progress, and raising the offer to reach more helpers.

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  currentTaskPrice: number | null;
  handleCancel: () => void;
  handleIncreasePrice: (amount: number) => void;
  insets: EdgeInsets;
  isIncreasingPrice: number | null;
  /** The highest offer the server accepts; raises past it are not offered. */
  maxOffer: number | null;
  offer: number | null;
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
  maxOffer,
  offer,
  rejectedCount,
  searchExhausted,
  searchStartedAt,
  styles,
  tokens,
  totalContacted,
}: Props) {
  const { t } = useTranslation();
  const price = currentTaskPrice ?? offer ?? calculatedFare;
  const canRaise = (amount: number) => maxOffer == null || price + amount <= maxOffer;
  if (searchExhausted) {
    return (
      <HelperTaskNoHelpers
        accent={accent}
        currentTaskPrice={currentTaskPrice}
        handleCancel={handleCancel}
        handleIncreasePrice={handleIncreasePrice}
        isIncreasingPrice={isIncreasingPrice}
        canRaise={canRaise}
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
            label={`${t("app.delivery.taskPublished")}${price}`}
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
                  style={[styles.raiseChip, !canRaise(amount) && { opacity: 0.4 }]}
                  onPress={() => handleIncreasePrice(amount)}
                  disabled={isIncreasingPrice != null || !canRaise(amount)}
                >
                  <Text style={styles.raiseChipText}>{isIncreasingPrice === amount ? t("app.delivery.raising") : `+₹${amount}`}</Text>
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
