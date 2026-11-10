import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// The floating "Menu" button at the bottom right of an outlet's menu. It opens a card listing
// every category with its dish count, one per line; tapping one scrolls the menu to it.

interface Props {
  /** Categories in menu order. */
  categories: string[];
  /** Dish count per category. */
  counts: Record<string, number>;
  activeCategory: string | null;
  onPick: (category: string) => void;
  /** Distance from the screen bottom, so the button clears the cart bar. */
  bottom: number;
  tokens: ThemeTokens;
  accent: ServiceTokens;
}

const ms = moderateScale;

export function MenuFab({ categories, counts, activeCategory, onPick, bottom, tokens, accent }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const s = useMemo(() => makeStyles(tokens, accent), [tokens, accent]);
  if (categories.length === 0) return null;

  const pick = (c: string) => {
    setOpen(false);
    onPick(c);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[s.fab, { bottom }]}
        accessibilityRole="button"
        accessibilityLabel={t("app.food.menuButton", "Menu")}
      >
        <Ionicons name="restaurant" size={ms(16)} color={tokens.surface} />
        <Text style={s.fabText}>{t("app.food.menuButton", "Menu")}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel={t("app.support.closeModal")} />
          <View style={s.card}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
              {categories.map((c) => {
                const on = c === activeCategory;
                return (
                  <Pressable key={c} style={s.row} onPress={() => pick(c)} accessibilityRole="button" accessibilityState={{ selected: on }}>
                    <Text style={[s.rowName, on && s.rowOn]} numberOfLines={2}>{c}</Text>
                    <Text style={[s.rowCount, on && s.rowOn]}>{counts[c] ?? 0}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable onPress={() => setOpen(false)} style={s.close} accessibilityRole="button">
            <Ionicons name="close" size={ms(18)} color={tokens.surface} />
            <Text style={s.closeText}>{t("app.food.closeMenu", "Close")}</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const makeStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    fab: { position: "absolute", right: ms(16), flexDirection: "row", alignItems: "center", gap: ms(8), height: ms(44), paddingHorizontal: ms(16), borderRadius: ms(22), backgroundColor: tokens.text, shadowColor: "#171717", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
    fabText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.surface },
    overlay: { flex: 1, backgroundColor: "rgba(23,23,23,0.6)", justifyContent: "center", paddingHorizontal: ms(24) },
    card: { maxHeight: "68%", backgroundColor: tokens.surface, borderRadius: ms(20), paddingVertical: ms(8) },
    list: { paddingHorizontal: ms(20) },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: ms(12), minHeight: ms(48), paddingVertical: ms(10) },
    rowName: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    rowCount: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec },
    rowOn: { color: accent.accent, fontFamily: fontFamilies.body.bold },
    close: { alignSelf: "flex-end", marginTop: ms(16), flexDirection: "row", alignItems: "center", gap: ms(8), height: ms(44), paddingHorizontal: ms(18), borderRadius: ms(14), backgroundColor: tokens.text },
    closeText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.surface },
  });
