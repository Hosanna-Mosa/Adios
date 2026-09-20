import { Linking, View } from "react-native";
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

// The tracking bottom sheet's contents, split out of TrackingSection11Section2
// so both files stay under 150 lines. The markup is unchanged.

import type { Props } from "./TrackingSheetBody.props";

export function TrackingSheetBody(props: Props) {
  const { accent, deliveryOtp, deliveryStop, driver, eta, formatClock, handleSOS, handleShareTrip,
  helperStatus, isHelper, isRide, orderCreatedAt, pickupLabel,
  setTripModalVisible, startOtp, status, stops, styles, timeline, tokens, unreadCount } = props;
  return (
    <>
    {!driver ? (
      <TrackingFindingWrap
        accent={accent}
        isHelper={isHelper}
        isRide={isRide}
        styles={styles}
      />
    ) : (
      <>
        {/* Timeline */}
        <TrackingTimelineBlock
          formatClock={formatClock}
          accent={accent}
          eta={eta}
          helperStatus={helperStatus}
          isHelper={isHelper}
          orderCreatedAt={orderCreatedAt}
          styles={styles}
          timeline={timeline}
          tokens={tokens}
        />

        {/* Partner card */}
        <TrackingPartnerRow
          Linking={Linking}
          accent={accent}
          driver={driver}
          isHelper={isHelper}
          styles={styles}
          tokens={tokens}
          unreadCount={unreadCount}
        />

        {/* PIN blocks */}
        {isRide && startOtp && ["confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"].includes(status) && (
          <TrackingPinCard
            accent={accent}
            startOtp={startOtp}
            styles={styles}
          />
        )}
        {isRide && deliveryOtp && status === "arrived_delivery" && (
          <TrackingPinCard2
            accent={accent}
            deliveryOtp={deliveryOtp}
            styles={styles}
          />
        )}
        {!isRide && deliveryOtp && (
          <TrackingPinCard3
            accent={accent}
            deliveryOtp={deliveryOtp}
            isHelper={isHelper}
            styles={styles}
          />
        )}

        {/* Helper live status */}
        {isHelper && helperStatus ? (
          <TrackingHelperUpdate
            accent={accent}
            helperStatus={helperStatus}
            styles={styles}
          />
        ) : null}

        {/* Addresses */}
        <TrackingAddrCard
          accent={accent}
          deliveryStop={deliveryStop}
          isRide={isRide}
          pickupLabel={pickupLabel}
          stops={stops}
          styles={styles}
          tokens={tokens}
        />

        {/* Footer actions */}
        {isRide ? (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <TrackingFooterBtnOutline
              handleShareTrip={handleShareTrip}
              styles={styles}
            />
            <TrackingFooterBtnOutline2
              handleSOS={handleSOS}
              styles={styles}
              tokens={tokens}
            />
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <TrackingFooterBtnOutline3
              setTripModalVisible={setTripModalVisible}
              styles={styles}
            />
            <TrackingFooterBtnOutline4
              handleSOS={handleSOS}
              styles={styles}
              tokens={tokens}
            />
          </View>
        )}
        <View style={{ height: 12 }} />
      </>
    )}
    </>
  );
}
