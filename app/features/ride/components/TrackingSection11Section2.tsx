import { Dimensions, Linking, ScrollView, View } from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { TrackingFooterBtnOutline } from "@/features/ride/components/TrackingFooterBtnOutline";
import { TrackingFooterBtnOutline2 } from "@/features/ride/components/TrackingFooterBtnOutline2";
import { TrackingFooterBtnOutline3 } from "@/features/ride/components/TrackingFooterBtnOutline3";
import { TrackingFooterBtnOutline4 } from "@/features/ride/components/TrackingFooterBtnOutline4";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPinCard2 } from "@/features/ride/components/TrackingPinCard2";
import { TrackingPinCard3 } from "@/features/ride/components/TrackingPinCard3";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";
import { TrackingSheetBody } from "./TrackingSheetBody";

// Section of TrackingSection11, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  status: any;
  currentOrderId: any;
  stops: any;
  driver: any;
  unreadCount: any;
  insets: any;
  tokens: any;
  isRide: any;
  isHelper: any;
  accent: any;
  styles: any;
  eta: any;
  orderCreatedAt: any;
  tripModalVisible: any;
  setTripModalVisible: any;
  helperStatus: any;
  deliveryOtp: any;
  startOtp: any;
  totalPrice: any;
  handleSOS: any;
  handleShareTrip: any;
  deliveryStop: any;
  timeline: any;
  pickupLabel: any;
  formatClock: any;
}

export function TrackingSection11Section2({
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
