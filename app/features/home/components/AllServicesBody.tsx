import { ScrollView, Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { AllServicesTierGrid, type ServiceCardItem } from "./AllServicesTierGrid";

interface Props {
  services: ServiceCardItem[];
  styles: any;
  tabBarHeight: number;
}

export function AllServicesBody({ services, styles, tabBarHeight }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)}>
        <Text style={styles.headline}>{t("app.home.goingSomewhere")}</Text>
        <Text style={styles.subhead}>{t("app.home.pickAServiceToGetStarted", "Pick a service to get started.")}</Text>
      </Animated.View>

      <AllServicesTierGrid services={services} styles={styles} />
    </ScrollView>
  );
}
