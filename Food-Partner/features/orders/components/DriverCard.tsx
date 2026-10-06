import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { InfoNote } from "@/components/ui/InfoNote";
import { ListRow } from "@/components/ui/ListRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";

interface Props {
  hasDriver: boolean;
  /** A food order the kitchen hasn't accepted yet: no rider is being looked for. */
  awaitingAcceptance?: boolean;
  name?: string;
  phone?: string;
  vehicleType?: string;
  onCall: (phone?: string) => void;
  tokens: ThemeTokens;
}

/** The delivery partner collecting this order, or a note that one is still being found. */
export function DriverCard({ hasDriver, awaitingAcceptance, name, phone, vehicleType, onCall, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(120)}>
      <Card bordered elevationLevel="none">
        <SectionHeader title={t("orderDetail.deliveryPartner")} />
        {hasDriver ? (
          <ListRow
            style={{ paddingHorizontal: 0, paddingVertical: 0 }}
            leading={<Avatar name={name} size={44} style={{ backgroundColor: tokens.sunken }} />}
            label={name || t("orderDetail.driverAssigned")}
            description={vehicleType ? t(`vehicle.${vehicleType}`, { defaultValue: vehicleType }) : t("orderDetail.deliveryPartner")}
            right={
              phone ? (
                <IconButton icon="call" color={tokens.brand} background={tokens.brandSkin} accessibilityLabel={t("orderDetail.callDriver")} onPress={() => onCall(phone)} />
              ) : null
            }
          />
        ) : (
          <InfoNote tone="warning" text={t(awaitingAcceptance ? "orderDetail.acceptToFindDriver" : "orderDetail.awaitingDriver")} />
        )}
      </Card>
    </Animated.View>
  );
}
