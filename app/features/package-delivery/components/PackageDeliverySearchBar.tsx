import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import type { PackageDeliverySearchStyles } from "../packageDeliverySearch.styles";

// Back, the step's title, and the address search field.

interface Props {
  kind: PackageDeliveryPointKind;
  query: string;
  searching: boolean;
  styles: PackageDeliverySearchStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  onChange: (text: string) => void;
  onBack: () => void;
}

export function PackageDeliverySearchBar({ kind, query, searching, styles, tokens, accent, onChange, onBack }: Props) {
  const { t } = useTranslation();
  const isPickup = kind === "pickup";
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.back")}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isPickup ? t("app.packageDelivery.pickupLocation") : t("app.packageDelivery.dropLocation")}</Text>
      </View>
      <View style={styles.inputWrap}>
        <View style={[styles.kindDot, { backgroundColor: isPickup ? tokens.success : tokens.error }]} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onChange}
          placeholder={isPickup ? t("app.packageDelivery.searchPickup") : t("app.packageDelivery.searchDrop")}
          placeholderTextColor={tokens.muted}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {searching ? (
          <ActivityIndicator size="small" color={accent.accent} />
        ) : query ? (
          <TouchableOpacity onPress={() => onChange("")} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.clear")}>
            <Ionicons name="close-circle" size={moderateScale(18)} color={tokens.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
