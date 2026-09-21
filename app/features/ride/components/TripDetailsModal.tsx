import { Modal } from "react-native";
import { TrackingModalOverlay } from "./TrackingModalOverlay";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type TrackingStyles } from "@/features/ride/tracking.styles";
import type { OrderStop } from "@/types/models";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  currentOrderId: string | null;
  insets: EdgeInsets;
  pickupLabel: string;
  setTripModalVisible: any;
  stops: OrderStop[];
  styles: TrackingStyles;
  tokens: ThemeTokens;
  totalPrice: number | null;
  tripModalVisible: any;
}

export function TripDetailsModal({
  accent,
  currentOrderId,
  insets,
  pickupLabel,
  setTripModalVisible,
  stops,
  styles,
  tokens,
  totalPrice,
  tripModalVisible,
}: Props) {
  return (
    <Modal visible={tripModalVisible} animationType="slide" transparent onRequestClose={() => setTripModalVisible(false)}>
      <TrackingModalOverlay
        accent={accent}
        currentOrderId={currentOrderId}
        insets={insets}
        pickupLabel={pickupLabel}
        setTripModalVisible={setTripModalVisible}
        stops={stops}
        styles={styles}
        tokens={tokens}
        totalPrice={totalPrice}
      />
    </Modal>
  );
}
