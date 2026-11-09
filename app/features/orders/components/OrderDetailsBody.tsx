import { useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { getInvoiceLink, getOrder } from "@/services/orders.service";
import { orderLines, orderTotals, paidOn, rupees, vendorOf } from "../orderDetailsData";
import { reorderToCart } from "../reorderOrder";

// The receipt for one finished restaurant / meat order: how it ended, what was ordered, the
// bill, who and how it was paid, and where it was delivered. Reorder and Invoice sit at the bottom.

const ms = moderateScale;

export function OrderDetailsBody() {
  const { t } = useTranslation();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const tokens = designTokens[useThemeStore((st) => st.theme)];
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const user = useAuthStore((st) => st.user);
  const [busy, setBusy] = useState<"reorder" | "invoice" | null>(null);

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: !!orderId,
  });

  const status = String(order?.status ?? "").toUpperCase();
  const cancelled = status === "CANCELLED" || String(order?.scheduleStatus ?? "") === "rejected";
  const delivered = status === "DELIVERED" || status === "COMPLETED";
  const vendor = vendorOf(order);
  const lines = orderLines(order);
  const totals = orderTotals(order);
  const dropAddress = [...(order?.stops ?? [])].reverse().find((st: any) => st?.address)?.address ?? "";
  const online = order?.paymentMethod === "online";

  const openInvoice = async () => {
    setBusy("invoice");
    try {
      const { url } = await getInvoiceLink(orderId as string);
      await WebBrowser.openBrowserAsync(url);
    } catch (e: any) {
      showAlert(t("app.orders.invoiceUnavailable"), e?.message || t("app.ride.pleaseTryAgain"), undefined, "error");
    } finally {
      setBusy(null);
    }
  };
  const doReorder = async () => {
    setBusy("reorder");
    try {
      await reorderToCart(order);
    } finally {
      setBusy(null);
    }
  };

  const bill: [string, number][] = [
    [t("app.orders.itemTotal", "Item total"), totals.subtotal || lines.reduce((a, l) => a + l.amount, 0)],
    [t("app.orders.taxes", "GST (govt. taxes)"), totals.taxes],
    [t("app.orders.deliveryFee", "Delivery partner fee"), totals.deliveryFee],
    [t("app.orders.platformFee", "Platform fee"), totals.serviceFee],
    [t("app.orders.tip", "Delivery tip"), totals.tip],
  ];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/orders"))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("app.a11y.goBack")}
        >
          <Ionicons name="arrow-back" size={ms(24)} color={tokens.text} />
        </Pressable>
        <Text style={s.title} accessibilityRole="header">{t("app.orders.orderDetails", "Order Details")}</Text>
        <Pressable onPress={() => router.push("/support")} hitSlop={10} style={s.support} accessibilityRole="button">
          <Ionicons name="chatbox-ellipses-outline" size={ms(15)} color={tokens.brand} />
          <Text style={s.supportText}>{t("app.orders.support", "Support")}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={tokens.brand} />
      ) : isError || !order ? (
        <View style={s.center}>
          <Text style={s.muted}>{t("app.orders.detailsUnavailable", "We couldn't load this order.")}</Text>
          <Pressable onPress={() => refetch()} style={s.retry} accessibilityRole="button">
            <Text style={s.retryText}>{t("app.ride.pleaseTryAgain", "Try again")}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <View style={[s.card, s.statusCard]}>
              <View style={s.iconCircle}>
                <Ionicons name={cancelled ? "close-circle-outline" : "bag-check-outline"} size={ms(20)} color={cancelled ? tokens.error : tokens.brand} />
              </View>
              <Text style={[s.statusText, cancelled && { color: tokens.error }]}>
                {cancelled
                  ? t("app.orders.orderCancelled", "Order cancelled")
                  : delivered
                    ? t("app.orders.orderWasDelivered", "Order was delivered")
                    : t("app.orders.orderStatus", { status: order.status, defaultValue: "Order {{status}}" })}
              </Text>
            </View>

            <View style={s.card}>
              <View style={s.vendorRow}>
                <View style={s.thumb}>
                  {vendor.image ? <Image source={{ uri: vendor.image }} style={s.thumbImg} contentFit="cover" /> : <Ionicons name="storefront-outline" size={ms(22)} color={tokens.brand} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.vendorName} numberOfLines={1}>{vendor.name}</Text>
                  {!!vendor.address && <Text style={s.muted} numberOfLines={1}>{vendor.address}</Text>}
                </View>
                {!!vendor.phone && (
                  <Pressable onPress={() => Linking.openURL(`tel:${vendor.phone}`)} style={s.call} accessibilityRole="button" accessibilityLabel={t("app.orders.callRestaurant", "Call restaurant")}>
                    <Ionicons name="call-outline" size={ms(18)} color={tokens.brand} />
                  </Pressable>
                )}
              </View>
              <View style={s.rule} />
              <Text style={s.orderId}>{t("app.orders.orderId", "Order ID")}: #{String(order._id).slice(-10).toUpperCase()}</Text>
              {lines.map((l, i) => (
                <View key={`${l.name}-${i}`} style={s.lineRow}>
                  <View style={[s.diet, { borderColor: l.isVeg ? tokens.veg : tokens.nonveg }]}>
                    <View style={[s.dietDot, { backgroundColor: l.isVeg ? tokens.veg : tokens.nonveg }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.lineName}>{l.quantity} x {l.name}</Text>
                    {!!l.sub && <Text style={s.muted}>{l.sub}</Text>}
                    {!!l.note && <Text style={s.muted}>“{l.note}”</Text>}
                  </View>
                  {l.amount > 0 && <Text style={s.lineName}>₹{Math.round(l.amount)}</Text>}
                </View>
              ))}
            </View>

            <View style={s.card}>
              <View style={s.sectionHead}>
                <View style={s.iconCircle}><Ionicons name="receipt-outline" size={ms(20)} color={tokens.sec} /></View>
                <Text style={s.sectionTitle}>{t("app.orders.billSummary", "Bill Summary")}</Text>
                <Pressable onPress={openInvoice} style={s.call} accessibilityRole="button" accessibilityLabel={t("app.orders.invoice", "Invoice")}>
                  <Ionicons name="download-outline" size={ms(18)} color={tokens.brand} />
                </Pressable>
              </View>
              <View style={s.rule} />
              {bill.filter(([, v], i) => i === 0 || v > 0).map(([label, v]) => (
                <View key={label} style={s.billRow}>
                  <Text style={s.billLabel}>{label}</Text>
                  <Text style={s.billValue}>{rupees(v)}</Text>
                </View>
              ))}
              {totals.discount > 0 && (
                <View style={s.billRow}>
                  <Text style={s.billLabel}>{t("app.orders.discount", "Discount")}</Text>
                  <Text style={[s.billValue, { color: tokens.success }]}>-{rupees(totals.discount)}</Text>
                </View>
              )}
              <View style={s.rule} />
              <View style={s.billRow}>
                <Text style={s.paid}>{online ? t("app.orders.paid", "Paid") : t("app.orders.total", "Total")}</Text>
                <Text style={s.paid}>{rupees(totals.total)}</Text>
              </View>
            </View>

            <View style={s.card}>
              <View style={s.vendorRow}>
                <View style={s.iconCircle}><Ionicons name="person" size={ms(18)} color={tokens.sec} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.vendorName}>{user?.name ?? ""}</Text>
                  {!!user?.phone && <Text style={s.muted}>{user.phone}</Text>}
                </View>
              </View>
              <View style={s.rule} />
              <InfoRow icon="wallet-outline" title={t("app.orders.paymentMethod", "Payment method")} text={online ? t("app.orders.paidOnline", "Paid online") : t("app.orders.cashOnDelivery", "Cash on delivery")} s={s} tokens={tokens} />
              <InfoRow icon="calendar-outline" title={t("app.orders.orderDate", "Order date")} text={paidOn(order.createdAt)} s={s} tokens={tokens} />
              {!!dropAddress && <InfoRow icon="location-outline" title={t("app.orders.deliveryAddress", "Delivery address")} text={dropAddress} s={s} tokens={tokens} />}
            </View>

            {!!vendor.fssai && <Text style={s.fssai}>FSSAI {t("app.orders.licNo", "Lic. No.")} {vendor.fssai}</Text>}
          </ScrollView>

          <View style={[s.bottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable style={[s.btn, s.btnFill]} onPress={doReorder} disabled={busy !== null} accessibilityRole="button">
              {busy === "reorder" ? (
                <ActivityIndicator color={tokens.onBrand} />
              ) : (
                <>
                  <Ionicons name="refresh" size={ms(18)} color={tokens.onBrand} />
                  <Text style={s.btnFillText}>{t("app.orders.reorder", "Reorder")}</Text>
                </>
              )}
            </Pressable>
            <Pressable style={[s.btn, s.btnLine]} onPress={openInvoice} disabled={busy !== null} accessibilityRole="button">
              {busy === "invoice" ? (
                <ActivityIndicator color={tokens.brand} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={ms(18)} color={tokens.brand} />
                  <Text style={s.btnLineText}>{t("app.orders.invoice", "Invoice")}</Text>
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function InfoRow({ icon, title, text, s, tokens }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; s: ReturnType<typeof makeStyles>; tokens: ThemeTokens }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={ms(22)} color={tokens.sec} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoTitle}>{title}</Text>
        <Text style={s.muted}>{text}</Text>
      </View>
    </View>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: ms(16), paddingVertical: ms(14), backgroundColor: tokens.surface },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    support: { flexDirection: "row", alignItems: "center", gap: ms(4) },
    supportText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.brand },
    scroll: { padding: ms(14), gap: ms(12), paddingBottom: ms(24) },
    center: { alignItems: "center", marginTop: ms(60), gap: ms(12) },
    retry: { paddingHorizontal: ms(18), paddingVertical: ms(10), borderRadius: ms(10), borderWidth: 1, borderColor: tokens.brand },
    retryText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.brand },
    card: { backgroundColor: tokens.surface, borderRadius: ms(16), padding: ms(14), borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border },
    statusCard: { flexDirection: "row", alignItems: "center", gap: ms(12) },
    statusText: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    iconCircle: { width: ms(40), height: ms(40), borderRadius: ms(20), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center" },
    vendorRow: { flexDirection: "row", alignItems: "center", gap: ms(12) },
    thumb: { width: ms(48), height: ms(48), borderRadius: ms(24), overflow: "hidden", backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center" },
    thumbImg: { width: "100%", height: "100%" },
    vendorName: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    muted: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },
    call: { width: ms(40), height: ms(40), borderRadius: ms(20), borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    rule: { height: StyleSheet.hairlineWidth, backgroundColor: tokens.border, marginVertical: ms(12) },
    orderId: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginBottom: ms(10) },
    lineRow: { flexDirection: "row", alignItems: "flex-start", gap: ms(10), marginBottom: ms(10) },
    diet: { width: ms(16), height: ms(16), borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center", marginTop: 2 },
    dietDot: { width: ms(8), height: ms(8), borderRadius: ms(4) },
    lineName: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    sectionHead: { flexDirection: "row", alignItems: "center", gap: ms(12) },
    sectionTitle: { flex: 1, fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    billRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: ms(5) },
    billLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.sec },
    billValue: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    paid: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    infoRow: { flexDirection: "row", gap: ms(14), paddingVertical: ms(10) },
    infoTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    fssai: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: ms(4) },
    bottom: { flexDirection: "row", gap: ms(12), paddingHorizontal: ms(14), paddingTop: ms(12), backgroundColor: tokens.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tokens.border },
    btn: { flex: 1, minHeight: ms(50), borderRadius: ms(10), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: ms(8) },
    btnFill: { backgroundColor: tokens.brand },
    btnFillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.onBrand },
    btnLine: { borderWidth: 1.5, borderColor: tokens.brand, backgroundColor: tokens.surface },
    btnLineText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.brand },
  });
