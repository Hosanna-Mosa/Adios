import { Dimensions, Linking, ScrollView, View } from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";
import { TrackingSheetBody } from "./TrackingSheetBody";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type TrackingStyles } from "@/features/ride/tracking.styles";
import type { Driver } from "@/types/models";
import type { OrderStop } from "@/types/models";

// Section of TrackingScreenBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  status: string;
  currentOrderId: string | null;
  stops: OrderStop[];
  driver: Driver;
  unreadCount: number;
  insets: EdgeInsets;
  tokens: ThemeTokens;
  isRide: boolean;
  isHelper: boolean;
  accent: ServiceTokens;
  styles: TrackingStyles;
  eta: number;
  orderCreatedAt: any;
  tripModalVisible: any;
  setTripModalVisible: any;
  helperStatus: any;
  deliveryOtp: any;
  startOtp: any;
  totalPrice: number | null;
  handleSOS: () => void;
  handleShareTrip: () => void;
  deliveryStop: any;
  timeline: any;
  pickupLabel: string;
  formatClock: any;
}

export function TrackingBottomSheet({
  status,
  currentOrderId,
  stops,
  driver,
  unreadCount,
  insets,
  tokens,
  isRide,
  isHelper,
  accent,
  styles,
  eta,
  orderCreatedAt,
  tripModalVisible,
  setTripModalVisible,
  helperStatus,
  deliveryOtp,
  startOtp,
  totalPrice,
  handleSOS,
  handleShareTrip,
  deliveryStop,
  timeline,
  pickupLabel,
  formatClock,
}: Props) {
  return (
    <>
    <BottomSheet style={styles.bottomSheet} defaultHeight={Dimensions.get("window").height * 0.5} disableExpand={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TrackingSheetBody
              accent={accent}
              deliveryOtp={deliveryOtp}
              deliveryStop={deliveryStop}
              driver={driver}
              eta={eta}
              formatClock={formatClock}
              handleSOS={handleSOS}
              handleShareTrip={handleShareTrip}
              helperStatus={helperStatus}
              isHelper={isHelper}
              isRide={isRide}
              orderCreatedAt={orderCreatedAt}
              pickupLabel={pickupLabel}
              setTripModalVisible={setTripModalVisible}
              startOtp={startOtp}
              status={status}
              stops={stops}
              styles={styles}
              timeline={timeline}
              tokens={tokens}
              unreadCount={unreadCount}
            />
      </ScrollView>
    </BottomSheet>

    <TripDetailsModal
      accent={accent}
      currentOrderId={currentOrderId}
      insets={insets}
      pickupLabel={pickupLabel}
      setTripModalVisible={setTripModalVisible}
      stops={stops}
      styles={styles}
      tokens={tokens}
      totalPrice={totalPrice}
      tripModalVisible={tripModalVisible}
    />
    </>
  );
}
