import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ProfileStyles } from "@/features/profile/profile.styles";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  memberSinceYear: any;
  styles: ProfileStyles;
}

export function ProfileStatsRow({
  memberSinceYear,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.statsRow} entering={fadeInUp(70)}>
      <View style={styles.statTile}>
        <Text style={styles.statValue}>{memberSinceYear || "—"}</Text>
        <Text style={styles.statLabel}>{t("app.profile.memberSince")}</Text>
      </View>
    </Animated.View>
  );
}
