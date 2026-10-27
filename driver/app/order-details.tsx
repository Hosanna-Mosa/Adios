import React from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Colors } from "@/constants/colors";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { Header } from "@/components/ui/Header";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Touchable } from "@/components/ui/Touchable";
import { formatCurrency } from "@/utils/format";
import { OrderRoute, ServiceChip, StatusBadge } from "@/features/orders/components";
import { useDriverOrder } from "@/features/orders/hooks/useDriverOrder";
import { styles } from "@/features/orders/orders.styles";
import {
  driverShare,
  formatOrderDate,
  initials,
  isCancelled,
  isOrderLive,
  outletName,
  serviceVisual,
  stopAddress,
} from "@/features/orders/utils/orderView";

function Tile({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <Box style={styles.tile}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} />
      <AppText style={styles.tileLabel}>{label}</AppText>
      <AppText style={styles.tileValue} numberOfLines={1}>{value}</AppText>
    </Box>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <Box style={styles.row}>
      <AppText style={styles.rowLabel}>{label}</AppText>
      <AppText style={styles.rowValue}>{value}</AppText>
    </Box>
  );
}

export default function OrderDetailsScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, isLoading, error, reload } = useDriverOrder(id);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/orders"));
  const title = t("orders.orderDetails", { defaultValue: "Order details" });

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Header title={title} onBack={back} />
        <Box style={styles.centered}>
          {isLoading ? (
            <ActivityIndicator color={Colors.brand} />
          ) : (
            <>
              <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
              <AppText style={styles.errorText}>{error || t("orders.notFound", { defaultValue: "Order not found" })}</AppText>
              <Touchable style={[styles.cta, { paddingHorizontal: 24 }]} onPress={reload}>
                <AppText style={styles.ctaText}>{t("orders.retry", { defaultValue: "Try again" })}</AppText>
              </Touchable>
            </>
          )}
        </Box>
      </SafeAreaView>
    );
  }

  const visual = serviceVisual(order);
  const kind = t(visual.labelKey, { defaultValue: visual.fallback });
  const name = outletName(order) || kind;
  const live = isOrderLive(order.status);
  const cancelled = isCancelled(order.status);
  const share = driverShare(order);
  const distance = Number(order.totalDistance) || 0;
  const minutes = Number(order.duration) || 0;
  const items = order.items || [];
  const customer = order.user?.name;
  const paidOnline = order.paymentMethod === "online";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header title={title} onBack={back} />
      <ScrollBox contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <Box style={styles.hero}>
          <Box style={styles.heroTop}>
            <ServiceChip visual={visual} />
            <Box style={styles.headText}>
              <AppText style={styles.title} numberOfLines={1}>{name}</AppText>
              <AppText style={styles.sub} numberOfLines={1}>
                {name === kind ? formatOrderDate(order.createdAt, i18n.language) : `${kind} · ${formatOrderDate(order.createdAt, i18n.language)}`}
              </AppText>
            </Box>
            <StatusBadge status={order.status} />
          </Box>

          <Box>
            <AppText style={styles.heroEarnLabel}>
              {cancelled ? t("orders.noEarnings", { defaultValue: "No earnings" }) : t("orders.yourEarnings", { defaultValue: "Your earnings" })}
            </AppText>
            <AppText style={[styles.heroEarn, share === 0 && styles.heroEarnZero]}>
              {formatCurrency(share, { decimals: false })}
            </AppText>
          </Box>

          <Box style={styles.tiles}>
            <Tile icon="navigate-outline" label={t("orders.distance", { defaultValue: "Distance" })} value={distance > 0 ? `${distance} km` : "—"} />
            <Tile icon="time-outline" label={t("orders.duration", { defaultValue: "Duration" })} value={minutes > 0 ? `${minutes} min` : "—"} />
            <Tile
              icon={paidOnline ? "card-outline" : "cash-outline"}
              label={t("orders.payment", { defaultValue: "Payment" })}
              value={paidOnline ? t("orders.paidOnline", { defaultValue: "Paid online" }) : t("orders.cash", { defaultValue: "Cash" })}
            />
          </Box>
        </Box>

        {cancelled && order.cancelReason ? (
          <Box style={styles.cancelNote}>
            <Ionicons name="close-circle" size={18} color={Colors.error} />
            <AppText style={styles.cancelText}>{order.cancelReason}</AppText>
          </Box>
        ) : null}

        <Box style={styles.section}>
          <AppText style={styles.sectionTitle}>{t("orders.route", { defaultValue: "Route" })}</AppText>
          <OrderRoute pickup={stopAddress(order, "pickup")} drop={stopAddress(order, "drop")} lines={3} />
        </Box>

        {customer ? (
          <Box style={styles.section}>
            <AppText style={styles.sectionTitle}>{t("orders.customer", { defaultValue: "Customer" })}</AppText>
            <Box style={styles.person}>
              <Box style={styles.avatar}>
                <AppText style={styles.avatarText}>{initials(customer)}</AppText>
              </Box>
              <AppText style={styles.title}>{customer}</AppText>
            </Box>
          </Box>
        ) : null}

        {items.length > 0 ? (
          <Box style={styles.section}>
            <AppText style={styles.sectionTitle}>{t("orders.items", { defaultValue: "Items" })}</AppText>
            {items.map((item, i) => (
              <Row key={`${item.name}-${i}`} label={item.name || ""} value={`× ${item.quantity ?? 1}`} />
            ))}
          </Box>
        ) : null}

        <Box style={styles.section}>
          <AppText style={styles.sectionTitle}>{t("orders.paymentSummary", { defaultValue: "Payment summary" })}</AppText>
          <Row label={t("orders.paymentMethod", { defaultValue: "Customer paid by" })} value={paidOnline ? t("orders.paidOnline", { defaultValue: "Paid online" }) : t("orders.cash", { defaultValue: "Cash" })} />
          <Row label={t("orders.orderTotal", { defaultValue: "Order total" })} value={formatCurrency(order.totalPrice, { decimals: false })} />
          <Box style={styles.divider} />
          <Box style={styles.row}>
            <AppText style={styles.totalLabel}>{t("orders.yourEarnings", { defaultValue: "Your earnings" })}</AppText>
            <AppText style={[styles.totalValue, share === 0 && styles.heroEarnZero]}>{formatCurrency(share, { decimals: false })}</AppText>
          </Box>
        </Box>

        <AppText style={styles.orderId}>
          {t("orders.orderId", { defaultValue: "Order" })} #{order._id.slice(-6).toUpperCase()}
        </AppText>
      </ScrollBox>

      {live ? (
        <Box style={styles.ctaBar}>
          <Touchable style={styles.cta} onPress={() => router.push("/active-order")} accessibilityRole="button">
            <Ionicons name="navigate" size={18} color={Colors.onBrand} />
            <AppText style={styles.ctaText}>{t("orders.openLiveOrder", { defaultValue: "Open live order" })}</AppText>
          </Touchable>
        </Box>
      ) : null}
    </SafeAreaView>
  );
}
