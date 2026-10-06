import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";
import { usePushStore } from "@/contexts/pushStore";
import { fadeInUp } from "@/motion/presets";
import type { DashboardStyles } from "../dashboard.styles";

/**
 * Shown only when the partner has refused notifications: with the app closed,
 * new orders would then arrive in silence. A tap opens the app's system settings.
 */
export function NotificationsOffCard({ styles, tokens }: { styles: DashboardStyles; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  const denied = usePushStore((s) => s.permission === "denied");
  if (!denied) return null;
  return (
    <Animated.View entering={fadeInUp(20)} style={styles.banner}>
      <ListRow
        card
        icon="notifications-off-outline"
        iconColor={tokens.warning}
        iconBackground={tokens.warningSkin}
        label={t("notifications.offTitle")}
        description={t("notifications.offHint")}
        onPress={() => Linking.openSettings().catch(() => {})}
      />
    </Animated.View>
  );
}
