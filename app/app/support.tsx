import React, { useMemo, useState } from "react";
import { Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import { Header } from "@/components/ui/Header";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { SupportBody } from "@/features/support/components/SupportBody";
import { createStyles } from "@/features/support/support.styles";
import { getOrders } from "@/services/orders.service";

const SERVICE_META: Record<string, { label: string; accent: keyof ThemeTokens["services"] }> = {
  food: { label: "Food", accent: "food" },
  meat: { label: "Meat", accent: "meat" },
  bike: { label: "Ride", accent: "ride" },
  auto: { label: "Ride", accent: "ride" },
  cab: { label: "Ride", accent: "ride" },
  cab_prime: { label: "Ride", accent: "ride" },
  helper: { label: "Task", accent: "task" },
  delivery: { label: "Delivery", accent: "delivery" },
};

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

const FAQS: FAQItem[] = [
  {
    question: "My order is late. What now?",
    answer: "Check the live map on the Track screen first — most delays are traffic on the partner's leg. If it's running well past the estimate, open Live chat with the order in mind and we'll look into it.",
  },
  {
    question: "How do refunds work?",
    answer: "If a payment needs to be refunded, our support team reviews it and processes the refund back to your original payment method through Razorpay. Raise it via Live chat or a ticket and we'll confirm once it's done.",
  },
  {
    question: "Can I cancel my order?",
    answer: "Yes — cancel anytime from the Orders or Track screen before it's completed. If a partner has already started on it, a quick message in chat helps them stop before making an unnecessary trip.",
  },
  {
    question: "Is my PIN safe to share?",
    answer: "Only hand it over once your items are physically in hand, or once your captain has arrived for a ride. Nobody from Flavour will ever ask for it over a call.",
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [theme, tokens]);

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
