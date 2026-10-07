import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { ListRow } from "@/components/ui/ListRow";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { PartnerProfile } from "@/types/models";
import type { DashboardStyles } from "../dashboard.styles";
import { useOutletSwitch } from "../useOutletSwitch";

interface Props {
  profile: PartnerProfile | null;
  /** The profile came from the server, not the sign-in snapshot. */
  loaded: boolean;
  styles: DashboardStyles;
  tokens: ThemeTokens;
}

/** "Accepting orders" — pause the outlet for a rush, a break or a closed kitchen, and resume it. */
export function OutletStatusCard({ profile, loaded, styles, tokens }: Props) {
  const { t } = useTranslation();
  const { accepting, description, disabled, toggle, outsideHours } = useOutletSwitch(profile, loaded);
  return (
    <Animated.View entering={fadeInUp(30)} style={styles.banner}>
      <ListRow
        card
        icon={accepting ? "storefront" : "storefront-outline"}
        iconColor={accepting ? tokens.success : tokens.sec}
        iconBackground={accepting ? tokens.successSkin : tokens.sunken}
        label={t("outlet.acceptingOrders")}
        description={description}
        right={<ToggleSwitch value={accepting} onValueChange={toggle} disabled={disabled} accessibilityLabel={t("outlet.acceptingOrders")} />}
      />
      {outsideHours ? <Button title={t("outlet.editHours")} variant="link" size="sm" onPress={() => router.push("/opening-hours")} /> : null}
    </Animated.View>
  );
}
