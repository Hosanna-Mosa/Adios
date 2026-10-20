import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { PaymentOptionsBody } from "@/features/food/components/PaymentOptionsBody";
import { usePaymentOptions } from "@/features/food/usePaymentOptions";

// Food "Payment options": opened from checkout's "Proceed to pay". The customer picks cash
// on delivery or online (Razorpay) and pays from the selected option.
export default function PaymentScreen() {
  const { insets, tokens, accent, styles, pending, method, setMethod, processing, pay } = usePaymentOptions();
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <Header
        title={t("app.payment.paymentOptions")}
        onBack={() => router.back()}
        backDisabled={processing}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />

      {pending && (
        <PaymentOptionsBody
          pending={pending}
          method={method}
          setMethod={setMethod}
          processing={processing}
          pay={pay}
          insets={insets}
          styles={styles}
          tokens={tokens}
          accent={accent}
        />
      )}
    </ScreenShell>
  );
}
