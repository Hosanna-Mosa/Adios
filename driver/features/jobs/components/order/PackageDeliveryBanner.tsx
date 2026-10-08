import React from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { paymentFields } from "@/store/orderMapper";
import type { Order } from "@/store/types";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { callPhone } from "../../utils/callPhone";
import { RoundCommButton } from "./RoundCommButton";

/**
 * On a package delivery job (a bike/auto ride carrying a package): who to meet at this end of
 * the trip, and where the cash fare is collected. Renders nothing on any other job.
 * `leg` is the end the driver is heading to or standing at.
 */
export function PackageDeliveryBanner({ order, leg }: { order: Order; leg: "pickup" | "drop" }) {
  const { t } = useTranslation();
  const packageDelivery = order.packageDelivery;
  if (!packageDelivery) return null;

  const contact = leg === "pickup" ? packageDelivery.pickupContact : packageDelivery.dropContact;
  const payment = paymentFields(order);
  const cashNote = payment.paymentMethod === "online"
    ? t("jobs.packageDeliveryPaidOnline")
    : packageDelivery.payAt === "drop"
      ? t("jobs.packageDeliveryCashAtDrop", { amount: payment.payableAmount })
      : t("jobs.packageDeliveryCashAtPickup", { amount: payment.payableAmount });
  const collectHere = payment.paymentMethod !== "online" && packageDelivery.payAt === leg && !payment.cashCollected;

  return (
    <Box style={styles.box}>
      <Box style={styles.row}>
        <Ionicons name="cube" size={20} color={Colors.warning} />
        <Box style={styles.text}>
          <AppText style={styles.title}>{leg === "pickup" ? t("jobs.packageDeliveryCollectFrom") : t("jobs.packageDeliveryDeliverTo")}</AppText>
          <AppText style={styles.name} numberOfLines={1}>
            {contact?.name || t("jobs.customer")}{contact?.phone ? ` · ${contact.phone}` : ""}
          </AppText>
        </Box>
        {!!contact?.phone && <RoundCommButton icon="call" onPress={() => callPhone(contact.phone, "customer")} />}
      </Box>
      <AppText style={[styles.cash, collectHere && styles.cashHere]}>{cashNote}</AppText>
    </Box>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 12, borderWidth: 1, borderColor: Colors.warning, backgroundColor: Colors.warningLight, padding: 12, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { flex: 1, minWidth: 0 },
  title: { fontSize: typography.sizes.small, fontWeight: "700", color: Colors.warning, textTransform: "uppercase", letterSpacing: 0.5 },
  name: { fontSize: typography.sizes.medium, fontWeight: "600", color: Colors.text, marginTop: 2 },
  cash: { fontSize: typography.sizes.small, color: Colors.textSecondary, marginTop: 8 },
  cashHere: { color: Colors.text, fontWeight: "700" },
});
