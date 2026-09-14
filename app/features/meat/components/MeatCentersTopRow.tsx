import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  searchOpen: any;
  selectedAddress: any;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  styles: any;
  tokens: any;
}

export function MeatCentersTopRow({
  insets,
  searchOpen,
  selectedAddress,
  setSearchOpen,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.topRow, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addressBlock} activeOpacity={0.7} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.addressEyebrow}>{t("app.home.deliveryTo")}</Text>
        <View style={styles.addressLabelRow}>
          <Text style={styles.addressLabel} numberOfLines={1}>
            {selectedAddress?.label ? `${selectedAddress.label} · Nallagandla` : t("app.meat.selectLocation")}
          </Text>
          <Ionicons name="chevron-down" size={moderateScale(12)} color={tokens.sec} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => setSearchOpen((s) => !s)}>
        <Ionicons name={searchOpen ? "close" : "search"} size={moderateScale(17)} color={tokens.sec} />
      </TouchableOpacity>
    </View>
  );
}
