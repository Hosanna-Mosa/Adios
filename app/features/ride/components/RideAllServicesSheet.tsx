import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// "All services": every ride vehicle on offer, opened from Explore > View All on the ride home.
// Parcel and Travel are not repeated here. Only vehicles the app can actually dispatch are listed.

export interface RideVehicle {
  id: "bike" | "auto";
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  vehicles: RideVehicle[];
  onPick: (vehicle: RideVehicle) => void;
  insets: EdgeInsets;
  tokens: ThemeTokens;
}

const ms = moderateScale;

export function RideAllServicesSheet({ visible, onClose, vehicles, onPick, insets, tokens }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("app.support.closeModal")} />
        <View style={s.closeWrap} pointerEvents="box-none">
          <Pressable onPress={onClose} hitSlop={8} style={s.close} accessibilityRole="button" accessibilityLabel={t("app.support.closeModal")}>
            <Ionicons name="close" size={ms(22)} color={tokens.surface} />
          </Pressable>
        </View>
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <View style={s.handle} />
          <Text style={s.title} accessibilityRole="header">{t("app.ride.allServices", "All services")}</Text>
          <View style={s.grid}>
            {vehicles.map((v) => (
              <Pressable key={v.id} style={s.cell} onPress={() => onPick(v)} accessibilityRole="button" accessibilityLabel={v.name}>
                <View style={s.iconBox}>
                  <MaterialCommunityIcons name={v.icon} size={ms(34)} color={tokens.brand} />
                </View>
                <Text style={s.cellText} numberOfLines={2}>{v.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.55)" },
    closeWrap: { alignItems: "flex-end", paddingRight: ms(20), marginBottom: ms(14) },
    close: { width: ms(40), height: ms(40), borderRadius: ms(20), alignItems: "center", justifyContent: "center", backgroundColor: tokens.surface },
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingHorizontal: ms(18), paddingTop: ms(10) },
    handle: { alignSelf: "center", width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginBottom: ms(16) },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: ms(18), gap: ms(10) },
    cell: { width: "23%", alignItems: "center", gap: ms(8) },
    iconBox: { width: ms(68), height: ms(68), borderRadius: ms(16), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center" },
    cellText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.text, textAlign: "center" },
  });
