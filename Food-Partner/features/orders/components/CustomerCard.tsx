import { View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Card } from "@/components/ui/Card";
import { InfoRow } from "@/components/ui/InfoRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { fadeInUp } from "@/motion/presets";
import type { OrderDetailStyles } from "../orderDetail.styles";

interface Props {
  name?: string;
  phone?: string;
  address: string;
  onCall: (phone?: string) => void;
  styles: OrderDetailStyles;
}

/** Who ordered and where it's going. */
export function CustomerCard({ name, phone, address, onCall, styles }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(40)}>
      <Card bordered elevationLevel="none">
        <SectionHeader title={t("orderDetail.customer")} />
        <View style={styles.infoList}>
          <InfoRow icon="person-outline" text={name || t("common.customer")} strong />
          <InfoRow icon="call-outline" text={phone || t("common.notAvailable")} onPress={phone ? () => onCall(phone) : undefined} />
          <InfoRow icon="location-outline" text={address || t("orderDetail.noAddress")} />
        </View>
      </Card>
    </Animated.View>
  );
}
