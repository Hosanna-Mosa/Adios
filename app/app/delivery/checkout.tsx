import { ScrollView } from "react-native";
import { DeliveryCheckoutFooter } from "@/features/delivery/components/DeliveryCheckoutFooter";
import { RouteSummaryCard } from "@/features/delivery/components/RouteSummaryCard";
import { StorePaymentEstimate } from "@/features/delivery/components/StorePaymentEstimate";
import { DeliveryChargesCard } from "@/features/delivery/components/DeliveryChargesCard";
import { PaymentMethodCard } from "@/features/delivery/components/PaymentMethodCard";
import { DeliveryCheckoutHeader } from "@/features/delivery/components/DeliveryCheckoutHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useDeliveryCheckout } from "@/features/delivery/useDeliveryCheckout";

export default function DeliveryCheckoutScreen() {
  const {
  insets, tokens, accent, styles, isProcessing, stops, price, route, itemsEstimate, deliveryFee,
  stopCharges, handleConfirm
  } = useDeliveryCheckout();

  return (
    <ScreenShell>
      <DeliveryCheckoutHeader
        insets={insets}
        route={route}
        stops={stops}
        styles={styles}
        tokens={tokens}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
        <RouteSummaryCard
          route={route}
          stops={stops}
          styles={styles}
          tokens={tokens}
        />

        {itemsEstimate > 0 && (
          <StorePaymentEstimate
            itemsEstimate={itemsEstimate}
            styles={styles}
          />
        )}

        <DeliveryChargesCard
          deliveryFee={deliveryFee}
          price={price}
          route={route}
          stopCharges={stopCharges}
          stops={stops}
          styles={styles}
        />

        <PaymentMethodCard
          styles={styles}
          tokens={tokens}
        />
      </ScrollView>

      <DeliveryCheckoutFooter
        accent={accent}
        handleConfirm={handleConfirm}
        insets={insets}
        isProcessing={isProcessing}
        price={price}
        stops={stops}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
