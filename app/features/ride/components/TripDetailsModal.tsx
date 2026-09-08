import { Modal } from "react-native";
import { TrackingModalOverlay } from "./TrackingModalOverlay";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  currentOrderId: any;
  insets: any;
  pickupLabel: any;
  setTripModalVisible: any;
  stops: any;
  styles: any;
  tokens: any;
  totalPrice: any;
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
