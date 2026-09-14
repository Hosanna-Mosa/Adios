import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";

/**
 * Global "Start a new cart?" prompt. One cart can only hold one outlet, and the
 * store now defers a cross-outlet add instead of wiping what's there — this is
 * where the customer makes that call. Mounted once at the app root, so every
 * add-to-cart entry point is covered without per-screen wiring.
 */
export default function CartConflictDialog() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const pending = useCartStore((s) => s.pendingConflict);
  const currentVendorName = useCartStore((s) => s.vendorName);
  const resolveConflict = useCartStore((s) => s.resolveConflict);

  if (!pending) return null;

  const fromOutlet = currentVendorName || t("app.CartConflictDialog.anotherOutlet");
  const toOutlet = pending.vendorName || t("app.CartConflictDialog.thisOutlet");

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      hardwareAccelerated
      // Android back is the non-destructive choice.
      onRequestClose={() => resolveConflict("keep")}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="swap-horizontal" size={22} color={tokens.error} />
          </View>
          <Text style={styles.title}>{t("app.CartConflictDialog.startANewCart")}</Text>
          <Text style={styles.subtitle}>
            {t("app.CartConflictDialog.yourCartHasItemsFrom")} {fromOutlet}{t("app.CartConflictDialog.adding")} {pending.item.name} from {toOutlet} {t("app.CartConflictDialog.willEmptyIt")}
          </Text>

          <TouchableOpacity style={styles.clearButton} onPress={() => resolveConflict("clear")} activeOpacity={0.85}>
            <Text style={styles.clearText}>{t("app.CartConflictDialog.clearCart")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepButton} onPress={() => resolveConflict("keep")} activeOpacity={0.8}>
            <Text style={styles.keepText}>{t("app.CartConflictDialog.keepMyCart")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
    card: { width: "100%", maxWidth: 340, backgroundColor: tokens.surface, borderRadius: 20, padding: 22, alignItems: "center" },
    iconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: tokens.errorSkin, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    title: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text, textAlign: "center" },
    subtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center", marginTop: 8, marginBottom: 18 },
    clearButton: { width: "100%", minHeight: moderateScale(48), borderRadius: 14, backgroundColor: accent.accent, alignItems: "center", justifyContent: "center" },
    clearText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
    keepButton: { width: "100%", minHeight: moderateScale(44), alignItems: "center", justifyContent: "center", marginTop: 4 },
    keepText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
  });
