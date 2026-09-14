import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { HelperTaskCheckRow3 } from "./HelperTaskCheckRow3";
import { HelperTaskCheckRow } from "./HelperTaskCheckRow";
import { HelperTaskFooter } from "./HelperTaskFooter";
import { HelperTaskCheckRow2 } from "./HelperTaskCheckRow2";
import { HelperTaskTitleRow } from "./HelperTaskTitleRow";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  calculatedFare: any;
  currentTaskPrice: any;
  handleCancel: any;
  handleIncreasePrice: any;
  insets: any;
  isIncreasingPrice: any;
  offer: any;
  rejectedCount: any;
  styles: any;
  totalContacted: any;
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
  const { t } = useTranslation();
  return (
    <>
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 8 }}>
        <Animated.View entering={fadeInUp(0)}>
          <HelperTaskTitleRow
            styles={styles}
          />
          <Text style={styles.subtitle}>{t("app.delivery.matchingYouWithHelpersNearby")}</Text>
        </Animated.View>

        <View style={{ gap: 12, marginTop: 18 }}>
          <HelperTaskCheckRow
            accent={accent}
            calculatedFare={calculatedFare}
            currentTaskPrice={currentTaskPrice}
            offer={offer}
            styles={styles}
          />
          {totalContacted > 0 && (
            <HelperTaskCheckRow2
              accent={accent}
              styles={styles}
              totalContacted={totalContacted}
            />
          )}
          <HelperTaskCheckRow3
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
