import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";

// FSSAI licence and packaging assurances. Only shown for vendors that have a
// licence number on record. Unanimated in the original, and still is.

interface Props {
  fssaiNumber?: string;
  tokens: ThemeTokens;
  styles: RestaurantDetailsStyles;
}

export function VendorHygieneSection({ fssaiNumber, tokens, styles }: Props) {
  const { t } = useTranslation();
  if (!fssaiNumber) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.hygieneAmpSafety")}</Text>
      <View style={styles.hygieneCard}>
        <View style={styles.hygieneRow}>
          <Ionicons name="checkmark" size={14} color={tokens.success} />
          <Text style={styles.hygieneText}>{t("app.food.kitchenAuditedByFssaiLicence")} {fssaiNumber}</Text>
        </View>
        <View style={styles.hygieneRow}>
          <Ionicons name="checkmark" size={14} color={tokens.success} />
          <Text style={styles.hygieneText}>{t("app.food.tamperproofPackagingOnEveryOrder")}</Text>
        </View>
      </View>
    </View>
  );
}
