import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import type { PartnerOffer } from "@/types/insights";
import { formatCurrency } from "@/utils/format";
import { isExpired, offerSummary } from "../offerRules";
import type { OffersStyles } from "../offers.styles";

interface Props {
  offer: PartnerOffer;
  toggling: boolean;
  onToggle: (isActive: boolean) => void;
  onDelete: () => void;
  styles: OffersStyles;
  tokens: ThemeTokens;
}

/** One offer: its code and terms, how often it was used, and the on / off switch. */
export function OfferCard({ offer, toggling, onToggle, onDelete, styles, tokens }: Props) {
  const { t } = useTranslation();
  const expired = isExpired(offer);
  const on = offer.isActive && !expired;
  return (
    <Card bordered dashed={!on} elevationLevel="none" padding={14} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.texts}>
          <Text style={styles.code}>{offer.code}</Text>
          <Text style={styles.title}>{offerSummary(offer, formatCurrency)}</Text>
        </View>
        <ToggleSwitch value={on} onValueChange={onToggle} disabled={toggling || expired} accessibilityLabel={t("offers.switchFor", { code: offer.code })} />
        <IconButton icon="trash-outline" size={34} color={tokens.error} background={tokens.sunken} accessibilityLabel={t("offers.deleteFor", { code: offer.code })} onPress={onDelete} />
      </View>
      <Text style={styles.meta}>
        {Number(offer.minOrderValue) > 0 ? t("offers.minOrder", { amount: formatCurrency(offer.minOrderValue) }) : t("offers.noMinimum")}
        {offer.expiryDate ? ` · ${t("offers.until", { date: new Date(offer.expiryDate).toLocaleDateString() })}` : ""}
      </Text>
      <View style={styles.badges}>
        <Badge label={expired ? t("offers.expired") : on ? t("offers.live") : t("offers.paused")} tone={expired ? "error" : on ? "success" : "neutral"} />
        <Badge label={t("offers.used", { count: offer.usageCount ?? 0 })} tone="info" />
      </View>
    </Card>
  );
}
