import React, { useMemo, useState } from "react";
import { Linking, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import { Header } from "@/components/ui/Header";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { SupportBody } from "@/features/support/components/SupportBody";
import { createStyles } from "@/features/support/support.styles";
import { getOrders } from "@/services/orders.service";

// SERVICE_META and FAQS moved inside SupportScreen() as useMemo values — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11.

// Same resolution rule used on the Orders screen: the list endpoint never
// populates `vendor`, so meat can't be told apart from food here — food is
// the more common case, not a guess dressed up as certainty.
function resolveServiceKey(order: any): string {
  if (order.serviceType === "delivery" && order.vendor) return "food";
  return order.serviceType || "delivery";
}

const ACTIVE_STATUSES = ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "ON_THE_WAY", "EN_ROUTE_PICKUP", "ARRIVED_PICKUP", "PICKING_ITEMS", "EN_ROUTE_DELIVERY", "ARRIVED_DELIVERY", "IN_TRANSIT", "driver_assigned", "confirmed", "pending"];

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [theme, tokens]);
  const { t } = useTranslation();

  const SERVICE_META: Record<string, { label: string; accent: keyof ThemeTokens["services"] }> = useMemo(() => ({
    food: { label: t("app.serviceMeta.food"), accent: "food" },
    meat: { label: t("app.serviceMeta.meat"), accent: "meat" },
    bike: { label: t("app.serviceMeta.ride"), accent: "ride" },
    auto: { label: t("app.serviceMeta.ride"), accent: "ride" },
    cab: { label: t("app.serviceMeta.ride"), accent: "ride" },
    cab_prime: { label: t("app.serviceMeta.ride"), accent: "ride" },
    helper: { label: t("app.serviceMeta.task"), accent: "task" },
    delivery: { label: t("app.serviceMeta.delivery"), accent: "delivery" },
  }), [t]);

  const FAQS: FAQItem[] = useMemo(() => [
    { question: t("app.support.faqs.lateOrder.question"), answer: t("app.support.faqs.lateOrder.answer") },
    { question: t("app.support.faqs.refunds.question"), answer: t("app.support.faqs.refunds.answer") },
    { question: t("app.support.faqs.cancelOrder.question"), answer: t("app.support.faqs.cancelOrder.answer") },
    { question: t("app.support.faqs.pinSafety.question"), answer: t("app.support.faqs.pinSafety.answer") },
  ], [t]);

  const [recentOrder, setRecentOrder] = useState<any | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      getOrders()
        .then((data) => setRecentOrder(data && data.length > 0 ? data[0] : null))
        .catch(() => {});
    }, [])
  );

  const serviceKey = recentOrder ? resolveServiceKey(recentOrder) : null;
  const meta = serviceKey ? SERVICE_META[serviceKey] : null;
  const accent = tokens.services[meta?.accent || "food"];
  const isActive = recentOrder ? ACTIVE_STATUSES.includes(recentOrder.status) : false;
  const recentTitle = recentOrder
    ? typeof recentOrder.vendor === "object" && recentOrder.vendor?.name
      ? recentOrder.vendor.name
      : recentOrder.stops?.[0]?.address || "Order"
    : "";

  const toggleFAQ = (index: number) => setExpandedFAQ(expandedFAQ === index ? null : index);

  return (
    <ScreenShell style={{ paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }}>
      <Header title="Help & support" onBack={() => router.back()} />

      <SupportBody
        FAQS={FAQS}
        Linking={Linking}
        formatRelativeDate={formatRelativeDate}
        accent={accent}
        expandedFAQ={expandedFAQ}
        insets={insets}
        isActive={isActive}
        meta={meta}
        recentOrder={recentOrder}
        recentTitle={recentTitle}
        styles={styles}
        toggleFAQ={toggleFAQ}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
