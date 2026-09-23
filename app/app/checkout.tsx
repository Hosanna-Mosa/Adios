import { CheckoutBody } from "@/features/food/components/CheckoutBody";
import { CheckoutFooter } from "@/features/food/components/CheckoutFooter";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScheduleDateTimeSheet } from "@/components/ScheduleDateTimeSheet";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useFoodCheckout } from "@/features/food/useFoodCheckout";

export default function FoodCheckoutScreen() {
  const {
  insets, tokens, accent, styles, getItemCount, items, selectedAddress, isPlacingOrder,
  showPromoInput, setShowPromoInput, promoCodeText, setPromoCodeText, appliedPromo,
  isApplyingPromo, applyingCode, promoError, offers, tipAmount, setTipAmount, isOtherTip,
  setIsOtherTip, otherTipText, setOtherTipText, scheduledFor, setScheduledFor, showScheduleSheet,
  setShowScheduleSheet, subtotal, deliveryFee, activeTip, total, receiverName, receiverPhone,
  addressIssue, applyCode, removeCode, placeOrder
  } = useFoodCheckout();
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <Header
        title={t("app.checkout.checkout")}
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />

      <CheckoutBody
        TIP_OPTIONS={TIP_OPTIONS}
        formatSlot={formatSlot}
        accent={accent}
        activeTip={activeTip}
        addressIssue={addressIssue}
        appliedPromo={appliedPromo}
        applyCode={applyCode}
        applyingCode={applyingCode}
        deliveryFee={deliveryFee}
        getItemCount={getItemCount}
        insets={insets}
        isApplyingPromo={isApplyingPromo}
        isOtherTip={isOtherTip}
        items={items}
        offers={offers}
        otherTipText={otherTipText}
        promoCodeText={promoCodeText}
        promoError={promoError}
        receiverName={receiverName}
        receiverPhone={receiverPhone}
        removeCode={removeCode}
        scheduledFor={scheduledFor}
        selectedAddress={selectedAddress}
        setIsOtherTip={setIsOtherTip}
        setOtherTipText={setOtherTipText}
        setPromoCodeText={setPromoCodeText}
        setScheduledFor={setScheduledFor}
        setShowPromoInput={setShowPromoInput}
        setShowScheduleSheet={setShowScheduleSheet}
        setTipAmount={setTipAmount}
        showPromoInput={showPromoInput}
        styles={styles}
        subtotal={subtotal}
        tipAmount={tipAmount}
        tokens={tokens}
        total={total}
      />

      <CheckoutFooter
        accent={accent}
        addressIssue={addressIssue}
        insets={insets}
        isPlacingOrder={isPlacingOrder}
        placeOrder={placeOrder}
        scheduledFor={scheduledFor}
        styles={styles}
        tokens={tokens}
        total={total}
      />

      <ScheduleDateTimeSheet
        visible={showScheduleSheet}
        onClose={() => setShowScheduleSheet(false)}
        onConfirm={(date) => {
          setScheduledFor(date);
          setShowScheduleSheet(false);
        }}
        title={t("app.checkout.scheduleDelivery")}
        subtitle={t("app.checkout.pickWhenYouWantYourFood")}
        confirmLabel={t("app.checkout.confirmSlot")}
        initialDate={scheduledFor ?? undefined}
        accent={accent.accent}
      />
    </ScreenShell>
  );
}

const TIP_OPTIONS = [0, 20, 30, 50];

const formatSlot = (date: Date) =>
  date.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
