import { useMemo } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokens } from "@/contexts/themeStore";
import { useOrderHistory, useVendorOrders } from "@/queries/orders.queries";
import { env } from "@/utils/env";
import { mergeOrders } from "@/utils/orderWindow";
import { createStyles } from "./support.styles";
import { useSupportTickets } from "./useSupportTickets";

const FAQ_KEYS = ["markReady", "soldOut", "scheduled", "pickupCode", "payouts", "password"] as const;

/** Help & support: the latest order, contact options and FAQs. */
export function useSupportHub() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { data: orders } = useVendorOrders();
  // Before today's first order, the latest one is in history.
  const { data: history } = useOrderHistory();
  const { data: tickets } = useSupportTickets();

  return {
    insets,
    tokens,
    styles,
    recentOrder: mergeOrders(orders, history?.pages[0])[0],
    openCases: (tickets ?? []).filter((ticket) => ticket.status !== "RESOLVED").length,
    faqs: FAQ_KEYS.map((key) => ({ title: t(`support.faqs.${key}.q`), body: t(`support.faqs.${key}.a`) })),
    // Contact rows only show when the number / address is configured in .env.
    phone: env.supportPhone,
    email: env.supportEmail,
    call: () => Linking.openURL(`tel:${env.supportPhone.replace(/\s/g, "")}`).catch(() => {}),
    sendEmail: () => Linking.openURL(`mailto:${env.supportEmail}`).catch(() => {}),
  };
}
