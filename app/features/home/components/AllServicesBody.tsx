import { ScrollView, Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { AllServicesCrossPromoList } from "./AllServicesCrossPromoList";
import { AllServicesTierGrid } from "./AllServicesTierGrid";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";

// Moved out of app/all-services.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  RIDE_TIERS: any;
  accent: ServiceTokens;
  selectTier: any;
  styles: any;
  tabBarHeight: number;
  tokens: ThemeTokens;
}

export function AllServicesBody({
  RIDE_TIERS,
  accent,
  selectTier,
  styles,
  tabBarHeight,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)}>
        <Text style={styles.headline}>{t("app.home.goingSomewhere")}</Text>
        <Text style={styles.subhead}>{t("app.home.pickARideToSeeLive")}</Text>
      </Animated.View>

      <AllServicesTierGrid
        RIDE_TIERS={RIDE_TIERS}
        accent={accent}
        selectTier={selectTier}
        styles={styles}
      />

      <Text style={styles.sectionLabel}>{t("app.home.alsoOnFlavour")}</Text>
      <AllServicesCrossPromoList
        styles={styles}
        tokens={tokens}
      />
    </ScrollView>
    </>
  );
}
