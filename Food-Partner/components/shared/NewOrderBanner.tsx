import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBanner } from "@/components/ui/GradientBanner";
import { useOrderAlertStore } from "@/contexts/orderAlertStore";
import { fadeInDown, fadeOut } from "@/motion/presets";
import { formatCurrency, formatOrderId } from "@/utils/format";
import { startOrderRing, stopOrderRing } from "@/utils/orderRing";

const VISIBLE_MS = 12_000;

/**
 * The "new order" alert. A banner instead of a toast: it stays up long enough
 * to be noticed across a busy kitchen, it rings for as long as it shows, and a
 * tap opens the order.
 */
export function NewOrderBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const alert = useOrderAlertStore((s) => s.newOrder);
  const dismiss = useOrderAlertStore((s) => s.dismissNewOrder);

  useEffect(() => {
    if (!alert) return;
    startOrderRing({ loop: true });
    const timer = setTimeout(dismiss, VISIBLE_MS);
    return () => {
      clearTimeout(timer);
      stopOrderRing();
    };
  }, [alert, dismiss]);

  if (!alert) return null;

  return (
    <Animated.View key={alert.receivedAt} entering={fadeInDown(0)} exiting={fadeOut} style={[styles.wrap, { top: insets.top + 8 }]}>
      <GradientBanner
        icon="notifications"
        title={t("alerts.newOrderTitle")}
        subtitle={[formatOrderId(alert.orderId), alert.customerName, alert.totalPrice ? formatCurrency(alert.totalPrice) : null]
          .filter(Boolean)
          .join(" · ")}
        actionLabel={t("actions.view")}
        onPress={() => {
          dismiss();
          router.push({ pathname: "/order/[id]", params: { id: alert.orderId } });
        }}
        onClose={dismiss}
        closeLabel={t("actions.dismiss")}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, zIndex: 50 },
});
