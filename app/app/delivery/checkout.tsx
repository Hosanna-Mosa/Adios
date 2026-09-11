import { ScrollView } from "react-native";
import { DeliveryCheckoutFooter } from "@/features/delivery/components/DeliveryCheckoutFooter";
import { DeliveryCheckoutSection } from "@/features/delivery/components/DeliveryCheckoutSection";
import { DeliveryCheckoutSection2 } from "@/features/delivery/components/DeliveryCheckoutSection2";
import { DeliveryCheckoutSection3 } from "@/features/delivery/components/DeliveryCheckoutSection3";
import { DeliveryCheckoutSection4 } from "@/features/delivery/components/DeliveryCheckoutSection4";
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
        <DeliveryCheckoutSection
          route={route}
          stops={stops}
          styles={styles}
          tokens={tokens}
        />

        {itemsEstimate > 0 && (
          <DeliveryCheckoutSection2
            itemsEstimate={itemsEstimate}
            styles={styles}
          />
        )}

        <DeliveryCheckoutSection3
          deliveryFee={deliveryFee}
          price={price}
          route={route}
          stopCharges={stopCharges}
          stops={stops}
          styles={styles}
        />

        <DeliveryCheckoutSection4
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
