import { PaymentOptionsBody } from "@/features/food/components/PaymentOptionsBody";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { usePayment } from "@/features/food/usePayment";

// Where "Proceed to pay" lands: the bill total and every way to pay. Choosing a row pays.
export default function PaymentScreen() {
  const { insets, tokens, processing, total, handlePayment } = usePayment();

  return (
    <ScreenShell>
      <PaymentOptionsBody total={total} processing={!!processing} insets={insets} tokens={tokens} onPay={handlePayment} />
    </ScreenShell>
  );
}
