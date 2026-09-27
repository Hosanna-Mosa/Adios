import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDriverStore } from "@/store/driverStore";
import { paymentFields } from "@/store/orderMapper";
import { Button } from "@/components/ui/Button";
import { styles } from "./IncomingOrderModal.styles";
import { DeclineReasonList } from "./DeclineReasonList";
import { OfferCountdown, OfferHeader } from "./OfferHeader";
import {
  OfferItems,
  OfferMetrics,
  OfferPaymentMode,
  OfferRoute,
} from "./OfferSections";
import { useIncomingOffer } from "../hooks/useIncomingOffer";
import {
  formatReservedAt,
  getFoodItems,
  isHelperJob,
  isRideJob,
  offerTitle,
} from "../utils/offer";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { ModalBox } from "@/components/ui/ModalBox";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export default function IncomingOrderModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { incomingOrder, acceptOrder, rejectOrder } = useDriverStore();
  const {
    secondsLeft,
    showDeclineReasons,
    setShowDeclineReasons,
    sheetAnimatedStyle,
    timerBarAnimatedStyle,
  } = useIncomingOffer();
  if (!incomingOrder) return null;

  const isHelper = isHelperJob(incomingOrder.serviceType);
  const isRide = isRideJob(incomingOrder.serviceType);
  const foodItems = getFoodItems(incomingOrder);
  const modalTitle = offerTitle({ isReserved: incomingOrder.isReserved, isRide, isHelper });
  const formattedDate = formatReservedAt(incomingOrder.reservedAt);
  const offerPayment = paymentFields(incomingOrder);

  return (
    <ModalBox visible transparent animationType="none" onRequestClose={() => rejectOrder()}>
      <Box style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        <AnimatedBox
          style={[
            styles.sheet,
            {
              paddingTop: Math.max(insets.top, 16) + 20,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
            sheetAnimatedStyle,
          ]}
        >

          <OfferHeader
            title={modalTitle}
            earnings={incomingOrder.earnings || "0"}
            isReserved={incomingOrder.isReserved}
            scheduledFor={formattedDate}
            isHelper={isHelper}
          />

          <OfferCountdown secondsLeft={secondsLeft} barStyle={timerBarAnimatedStyle} />

          {showDeclineReasons ? (
            <DeclineReasonList
              onDecline={(reason) => {
                setShowDeclineReasons(false);
                rejectOrder(reason);
              }}
              onBack={() => setShowDeclineReasons(false)}
            />
          ) : (
            <>
              <ScrollBox
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
              >
            <OfferMetrics
              distance={incomingOrder.distance}
              radius={incomingOrder.radius}
              duration={incomingOrder.duration}
            />

            <OfferRoute stops={incomingOrder.stops} />

            {!isHelper && !isRide && (
              <OfferItems vendorName={incomingOrder.vendorName} items={foodItems} />
            )}

            <OfferPaymentMode
              isCash={offerPayment.paymentMethod !== "online"}
              label={
                offerPayment.paymentMethod === "online"
                  ? t("jobs.paidOnline")
                  : t("jobs.cashToCollect", { amount: offerPayment.payableAmount })
              }
            />
          </ScrollBox>

          <Box style={styles.actionButtons}>
              <Button
                title={t("jobs.decline")}
                variant="secondary"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowDeclineReasons(true);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title={t("jobs.acceptOrder")}
                variant="primary"
                style={{ flex: 1 }}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  const isReserved = incomingOrder.isReserved;
                  await acceptOrder();
                  if (!isReserved) {
                    if (isHelper) {
                      router.push({ pathname: "/chat", params: { orderId: incomingOrder.id } });
                    } else {
                      router.push("/active-order");
                    }
                  }
                }}
              />
            </Box>
          </>
          )}
        </AnimatedBox>
      </Box>
    </ModalBox>
  );
}
