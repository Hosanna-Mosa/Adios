import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPoint, PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import type { PackageDeliveryHomeStyles } from "../packageDeliveryHome.styles";
import { contactLine, fullAddress } from "../packageDelivery.utils";

// One end of the package's trip. Empty, it's a search field; chosen, it shows the address
// (pencil to change it) and the contact person (tap to edit).

interface Props {
  kind: PackageDeliveryPointKind;
  point: PackageDeliveryPoint | null;
  loading?: boolean;
  styles: PackageDeliveryHomeStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  onSearch: () => void;
  onEditDetails: () => void;
}

export function PackageDeliveryPointCard({ kind, point, loading, styles, tokens, accent, onSearch, onEditDetails }: Props) {
  const { t } = useTranslation();
  const isPickup = kind === "pickup";
  const icon = isPickup
    ? <Ionicons name="location" size={moderateScale(22)} color={tokens.success} />
    : <View style={styles.dropDot} />;

  if (!point) {
    return (
      <View style={styles.card}>
        <View style={styles.pointRow}>
          <View style={styles.pointIconWrap}>{icon}</View>
          <Text style={[styles.pointTitle, styles.pointBody]}>{isPickup ? t("app.packageDelivery.pickupFrom") : t("app.packageDelivery.dropTo")}</Text>
        </View>
        <TouchableOpacity style={styles.searchField} onPress={onSearch} activeOpacity={0.85} accessibilityRole="search">
          {loading ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="search" size={moderateScale(20)} color={tokens.text} />}
          <Text style={styles.searchFieldText} numberOfLines={1}>
            {loading ? t("app.packageDelivery.locating") : isPickup ? t("app.packageDelivery.searchPickup") : t("app.packageDelivery.searchDrop")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = isPickup
    ? point.fromCurrentLocation ? t("app.packageDelivery.pickupFromCurrent") : t("app.packageDelivery.pickupFrom")
    : t("app.packageDelivery.dropTo");
  const hasContact = !!point.contactName && !!point.contactPhone;

  return (
    <View style={styles.card}>
      <View style={styles.pointRow}>
        <View style={styles.pointIconWrap}>{icon}</View>
        <View style={styles.pointBody}>
          <Text style={styles.pointTitle}>{title}</Text>
          <Text style={styles.pointAddress} numberOfLines={2}>{fullAddress(point)}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onSearch} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.changeAddress")}>
          <Feather name="edit-2" size={moderateScale(18)} color={tokens.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.dashed} />
      <TouchableOpacity style={styles.contactRow} onPress={onEditDetails} activeOpacity={0.7} accessibilityRole="button">
        <Text style={hasContact ? styles.contactText : styles.contactMissing} numberOfLines={1}>
          {hasContact ? contactLine(point) : t("app.packageDelivery.addContact")}
        </Text>
        <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.muted} />
      </TouchableOpacity>
    </View>
  );
}
