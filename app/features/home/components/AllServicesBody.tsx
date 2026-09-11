import { ScrollView, Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { AllServicesCrossPromoList } from "./AllServicesCrossPromoList";
import { AllServicesTierGrid } from "./AllServicesTierGrid";

// Moved out of app/all-services.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  RIDE_TIERS: any;
  accent: any;
  selectTier: any;
  styles: any;
  tabBarHeight: any;
  tokens: any;
}

export function AllServicesBody({
  RIDE_TIERS,
  accent,
  selectTier,
  styles,
  tabBarHeight,
  tokens,
}: Props) {
  return (
    <>
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)}>
        <Text style={styles.headline}>Going somewhere?</Text>
        <Text style={styles.subhead}>Pick a ride to see live fares for your trip.</Text>
      </Animated.View>

      <AllServicesTierGrid
        RIDE_TIERS={RIDE_TIERS}
        accent={accent}
        selectTier={selectTier}
        styles={styles}
      />

      <Text style={styles.sectionLabel}>Also on Flavour</Text>
      <AllServicesCrossPromoList
        styles={styles}
        tokens={tokens}
      />
    </ScrollView>
    </>
  );
}
