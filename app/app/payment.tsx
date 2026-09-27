import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { fadeInUp } from "@/motion/presets";
import { PaymentFooter } from "@/features/food/components/PaymentFooter";
import { PaymentTrustNote } from "@/features/food/components/PaymentTrustNote";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { PaymentAddressCard } from "@/features/food/components/PaymentAddressCard";
import { PaymentBillCard } from "@/features/food/components/PaymentBillCard";
import { PaymentAmountHeader } from "@/features/food/components/PaymentAmountHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { usePayment } from "@/features/food/usePayment";

export default function PaymentScreen() {
  const {
  insets, tokens, accent, styles, items, getItemCount, selectedAddress, processing, subtotal,
  deliveryFee, tip, discount, couponCode, total, vendorName, receiverContact, handlePayment
  } = usePayment();
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <Header
        title={t("app.payment.payment")}
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
        <PaymentAmountHeader
          getItemCount={getItemCount}
          items={items}
          styles={styles}
          total={total}
          vendorName={vendorName}
        />

        <Animated.View entering={fadeInUp(60)} style={styles.section}>
          <PaymentBillCard
            couponCode={couponCode}
            deliveryFee={deliveryFee}
            discount={discount}
            styles={styles}
            subtotal={subtotal}
            tip={tip}
            tokens={tokens}
            total={total}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(120)} style={styles.section}>
          <PaymentAddressCard
            receiverContact={receiverContact}
            selectedAddress={selectedAddress}
            styles={styles}
          />
        </Animated.View>

        <Animated.View entering={fadeInUp(180)} style={styles.section}>
          <PaymentMethodSelector flow="food" accent={accent} disabled={processing} />
        </Animated.View>

        <Animated.View entering={fadeInUp(240)} style={styles.section}>
          <PaymentTrustNote
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </ScrollView>

      <PaymentFooter
        accent={accent}
        handlePayment={handlePayment}
        insets={insets}
        processing={processing}
        styles={styles}
        total={total}
      />
    </ScreenShell>
  );
}
