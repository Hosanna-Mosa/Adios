import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import type { Offer } from "@/types/models";
import { type OfferGroup } from "../offerFormat";
import { type OffersStyles } from "../offers.styles";
import { OfferRow } from "./OfferRow";

// A restaurant with all of its active offers. Tapping anywhere opens its menu.

interface Props {
  group: OfferGroup;
  styles: OffersStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  onPress: (vendor: Offer["vendor"]) => void;
}

export function OfferRestaurantCard({ group, styles, tokens, accent, onPress }: Props) {
  const { t } = useTranslation();
  const { vendor, offers } = group;
  const rating = Number(vendor.rating) || 0;
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      onPress={() => onPress(vendor)}
      accessibilityRole="button"
      accessibilityLabel={vendor.name}
    >
      <View style={styles.vendorRow}>
        <Image source={vendor.image ? { uri: vendor.image } : undefined} style={styles.vendorImage} contentFit="cover" transition={200} />
        <View style={styles.vendorInfo}>
          <View style={styles.vendorNameRow}>
            <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.muted} />
          </View>
          <View style={styles.vendorMetaRow}>
            {rating > 0 && (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={moderateScale(10)} color={tokens.success} />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {!!vendor.isPureVeg && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
                <Text style={styles.vegText}>{t("app.offers.pureVeg")}</Text>
              </View>
            )}
            {vendor.isOpen != null && (
              <Text style={vendor.isOpen ? styles.openText : styles.closedText}>
                {vendor.isOpen ? t("app.offers.open") : t("app.offers.closed")}
              </Text>
            )}
          </View>
          {!!vendor.address && <Text style={styles.address} numberOfLines={1}>{vendor.address}</Text>}
        </View>
      </View>
      {offers.map((offer) => (
        <OfferRow key={String(offer._id)} offer={offer} styles={styles} accent={accent} />
      ))}
    </Pressable>
  );
}
