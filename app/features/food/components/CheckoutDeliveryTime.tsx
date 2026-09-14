import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";

// Section of CheckoutBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  formatSlot: any;
  accent: any;
  getItemCount: any;
  items: any[];
  scheduledFor: any;
  setScheduledFor: React.Dispatch<React.SetStateAction<any>>;
  setShowScheduleSheet: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
}

export function CheckoutDeliveryTime({
  formatSlot,
  accent,
  getItemCount,
  items,
  scheduledFor,
  setScheduledFor,
  setShowScheduleSheet,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <Animated.View entering={fadeInUp(60)} style={styles.section}>
      <View style={styles.orderCard}>
        <View style={styles.orderCardHead}>
          <Text style={styles.orderCardTitle}>{t("app.food.yourOrder")} {t("app.food.itemCount", { count: getItemCount() })}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.changeLink}>{t("app.delivery.edit")}</Text>
          </TouchableOpacity>
        </View>
        {items.map((item) => (
          <View key={item._id} style={styles.orderLine}>
            <Text style={styles.orderLineLabel} numberOfLines={1}>{item.quantity} × {item.name}</Text>
            <Text style={styles.orderLineValue}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
      </View>
    </Animated.View>

    <Animated.View entering={fadeInUp(90)} style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.deliveryTime")}</Text>
      <View style={{ gap: 8 }}>
        <TouchableOpacity
          style={[styles.couponOptionRow, !scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
          activeOpacity={0.85}
          onPress={() => setScheduledFor(null)}
        >
          <View style={styles.radioSelected}>{!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponCode}>{t("app.food.deliverNow")}</Text>
            <Text style={styles.couponDesc}>{t("app.food.weStartPreparingAsSoonAs")}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.couponOptionRow, !!scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
          activeOpacity={0.85}
          onPress={() => setShowScheduleSheet(true)}
        >
          <View style={styles.radioSelected}>{!!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponCode}>{t("app.food.scheduleForLater")}</Text>
            <Text style={styles.couponDesc}>
              {scheduledFor ? formatSlot(scheduledFor) : t("app.food.pickAFutureDateAndTime")}
            </Text>
          </View>
          <Text style={styles.changeLink}>{scheduledFor ? t("app.delivery.edit") : t("app.food.pick")}</Text>
        </TouchableOpacity>
      </View>
      {!!scheduledFor && (
        <Text style={styles.scheduleNote}>
          {t("app.food.theRestaurantConfirmsScheduledSlotsYouaposll")}
        </Text>
      )}
    </Animated.View>
    </>
  );
}
