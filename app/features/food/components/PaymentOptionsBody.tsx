import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { usePaymentMethodStore } from "@/contexts/paymentMethodStore";
import { formatINR } from "@/utils/pricing";
import { type OnlineMethod } from "@/utils/razorpay";

// "Proceed to pay" lands here: the bill total on top and every way to pay, grouped. A row
// pays straight away. Online rows open Razorpay on that kind of method; "Pay on delivery"
// places the order to be paid in cash (or by QR) to the rider.

interface Props {
  total: number;
  processing: boolean;
  insets: EdgeInsets;
  tokens: ThemeTokens;
  /** Starts the payment; `online` is the family to open Razorpay on, omitted for cash. */
  onPay: (online?: OnlineMethod) => void;
  /** Back arrow; defaults to leaving the screen. */
  onBack?: () => void;
}

type Row = { key: string; icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string; online?: OnlineMethod; cash?: boolean; action: "go" | "add" };

const ms = moderateScale;

export function PaymentOptionsBody({ total, processing, insets, tokens, onPay, onBack }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const setMethod = usePaymentMethodStore((st) => st.setMethod);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: t("app.payment.recommended", "Recommended"),
      rows: [
        { key: "gpay", icon: "logo-google", title: t("app.payment.googlePay", "Google Pay UPI"), online: "upi", action: "go" },
        { key: "phonepe", icon: "phone-portrait-outline", title: t("app.payment.phonePe", "PhonePe UPI"), online: "upi", action: "go" },
      ],
    },
    {
      title: t("app.payment.cards", "Cards"),
      rows: [
        { key: "card", icon: "card-outline", title: t("app.payment.addCard", "Add credit or debit cards"), online: "card", action: "add" },
        { key: "pluxee", icon: "restaurant-outline", title: t("app.payment.addPluxee", "Add Pluxee"), online: "card", action: "add" },
      ],
    },
    {
      title: t("app.payment.wallets", "Wallets"),
      rows: [
        { key: "amazon", icon: "wallet-outline", title: t("app.payment.amazonPayBalance", "Amazon Pay Balance"), online: "wallet", action: "add" },
        { key: "mobikwik", icon: "wallet-outline", title: t("app.payment.mobikwik", "Mobikwik"), online: "wallet", action: "add" },
      ],
    },
    {
      title: t("app.payment.payLater", "Pay later"),
      rows: [
        { key: "amazonlater", icon: "time-outline", title: t("app.payment.amazonPayLater", "Amazon Pay Later"), online: "paylater", action: "add" },
        { key: "lazypay", icon: "flash-outline", title: t("app.payment.lazyPay", "LazyPay"), online: "paylater", action: "add" },
      ],
    },
    {
      title: t("app.payment.netbanking", "Netbanking"),
      rows: [{ key: "netbanking", icon: "business-outline", title: t("app.payment.netbankingRow", "Netbanking"), online: "netbanking", action: "add" }],
    },
    {
      title: t("app.payment.payOnDelivery", "Pay on delivery"),
      rows: [{ key: "cash", icon: "cash-outline", title: t("app.payment.payOnDeliveryRow", "Pay on delivery"), sub: t("app.payment.useCashOrQr", "Use cash or ask for QR"), cash: true, action: "go" }],
    },
  ];

  const choose = (row: Row) => {
    if (processing) return;
    setMethod("food", row.cash ? "cash" : "online");
    onPay(row.cash ? undefined : row.online);
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + ms(10) }]}>
        <Pressable onPress={() => (onBack ? onBack() : router.back())} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
          <Ionicons name="arrow-back" size={ms(24)} color={tokens.text} />
        </Pressable>
        <Text style={s.headerTitle} accessibilityRole="header">{t("app.payment.billTotal", "Bill total")}: ₹{formatINR(total)}</Text>
        {processing && <ActivityIndicator size="small" color={tokens.brand} />}
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + ms(24) }]} showsVerticalScrollIndicator={false} pointerEvents={processing ? "none" : "auto"}>
        {sections.map((section) => (
          <View key={section.title}>
            <Text style={s.sectionLabel}>{section.title}</Text>
            <View style={s.card}>
              {section.rows.map((row, i) => (
                <View key={row.key}>
                  {i > 0 && <View style={s.rule} />}
                  <Pressable style={s.row} onPress={() => choose(row)} disabled={processing} accessibilityRole="button" accessibilityLabel={row.title}>
                    <View style={s.iconBox}>
                      <Ionicons name={row.icon} size={ms(22)} color={tokens.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>{row.title}</Text>
                      {!!row.sub && <Text style={s.rowSub}>{row.sub}</Text>}
                    </View>
                    <Ionicons name={row.action === "go" ? "chevron-forward" : "add"} size={ms(row.action === "go" ? 18 : 22)} color={row.action === "go" ? tokens.sec : tokens.brand} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", gap: ms(16), paddingHorizontal: ms(16), paddingBottom: ms(14), backgroundColor: tokens.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tokens.border },
    headerTitle: { flex: 1, fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    scroll: { paddingHorizontal: ms(16), paddingTop: ms(8) },
    sectionLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, letterSpacing: 1.2, textTransform: "uppercase", color: tokens.muted, marginTop: ms(22), marginBottom: ms(10) },
    card: { backgroundColor: tokens.surface, borderRadius: ms(16), paddingHorizontal: ms(14), borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border },
    row: { flexDirection: "row", alignItems: "center", gap: ms(14), minHeight: ms(64), paddingVertical: ms(10) },
    rule: { height: StyleSheet.hairlineWidth, backgroundColor: tokens.border },
    iconBox: { width: ms(44), height: ms(36), borderRadius: ms(6), borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border, alignItems: "center", justifyContent: "center", backgroundColor: tokens.surface },
    rowTitle: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    rowSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },
  });
