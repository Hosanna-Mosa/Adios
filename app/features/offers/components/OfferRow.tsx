import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import type { Offer } from "@/types/models";
import { formatOfferDiscount, formatOfferEndDate } from "../offerFormat";
import { type OffersStyles } from "../offers.styles";

// One offer inside a restaurant's card: title, discount line, coupon code,
// description and the last day it runs.

interface Props {
  offer: Offer;
  styles: OffersStyles;
  accent: ServiceTokens;
}

export function OfferRow({ offer, styles, accent }: Props) {
  const { t } = useTranslation();
  const endDate = formatOfferEndDate(offer.endDate);
  return (
    <View style={styles.offerRow}>
      <View style={styles.offerHead}>
        <View style={styles.offerIcon}>
          <Ionicons name="pricetag" size={moderateScale(14)} color={accent.accent} />
        </View>
        <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
      </View>
      <Text style={styles.offerDiscount}>{formatOfferDiscount(offer, t)}</Text>
      {!!offer.description && <Text style={styles.offerDescription}>{offer.description}</Text>}
      {(!!offer.couponCode || !!endDate) && (
        <View style={styles.offerFooter}>
          {offer.couponCode ? (
            <View style={styles.codeChip} accessibilityLabel={t("app.offers.useCode", { code: offer.couponCode })}>
              <Ionicons name="ticket-outline" size={moderateScale(12)} color={accent.accent} />
              <Text style={styles.codeText}>{offer.couponCode.toUpperCase()}</Text>
            </View>
          ) : <View />}
          {!!endDate && <Text style={styles.validity}>{t("app.offers.validTill", { date: endDate })}</Text>}
        </View>
      )}
    </View>
  );
}
