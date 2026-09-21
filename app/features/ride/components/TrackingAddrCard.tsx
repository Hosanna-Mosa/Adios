import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";
import type { OrderStop } from "@/types/models";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  deliveryStop: any;
  isRide: boolean;
  pickupLabel: string;
  stops: OrderStop[];
  styles: TrackingStyles;
  tokens: ThemeTokens;
}

export function TrackingAddrCard({
  accent,
  deliveryStop,
  isRide,
  pickupLabel,
  stops,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.addrCard}>
      <View style={styles.addrRail}>
        <View style={[styles.addrDot, { borderColor: accent.accent }]} />
        <View style={styles.addrLine} />
        <View style={[styles.addrDot, { backgroundColor: tokens.text, borderWidth: 0 }]} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 12 }}>
        <View>
          <Text style={styles.addrLabel}>{isRide ? t("app.ride.pickup") : t("app.ride.pickedUpFrom")}</Text>
          <Text style={styles.addrText} numberOfLines={1}>{pickupLabel}</Text>
        </View>
        <View>
          <Text style={styles.addrLabel}>{isRide ? t("app.ride.dropoff") : t("app.ride.deliveringTo")}</Text>
          <Text style={styles.addrText} numberOfLines={1}>{deliveryStop?.address || stops?.[stops.length - 1]?.address || "—"}</Text>
        </View>
      </View>
    </View>
  );
}
