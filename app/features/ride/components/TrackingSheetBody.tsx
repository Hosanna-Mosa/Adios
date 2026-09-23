import { TrackingFooterButton } from "@/features/ride/components/TrackingFooterButton";
import { Linking, View } from "react-native";
import { useTranslation } from "react-i18next";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";

// The tracking bottom sheet's contents, split out of TrackingBottomSheet
// so both files stay under 150 lines. The markup is unchanged.

import type { Props } from "./TrackingSheetBody.props";

export function TrackingSheetBody(props: Props) {
  const { accent, deliveryOtp, deliveryStop, driver, eta, formatClock, handleSOS, handleShareTrip,
  helperStatus, isHelper, isRide, orderCreatedAt, pickupLabel, pulse1Style, pulse2Style,
  setTripModalVisible, startOtp, status, stops, styles, timeline, tokens, unreadCount } = props;
  const { t } = useTranslation();
  return (
    <>
    {!driver ? (
      <TrackingFindingWrap
        accent={accent}
        isHelper={isHelper}
        isRide={isRide}
        pulse1Style={pulse1Style}
        pulse2Style={pulse2Style}
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
            otp={startOtp}
            label={t("app.ride.startRidePin")}
            hint={t("app.ride.giveThisToYourCaptainTo")}
            styles={styles}
          />
        )}
        {isRide && deliveryOtp && status === "arrived_delivery" && (
          <TrackingPinCard
            accent={accent}
            otp={deliveryOtp}
            label={t("app.ride.endRidePin")}
            styles={styles}
          />
        )}
        {!isRide && !isHelper && deliveryOtp && (
          <TrackingPinCard
            accent={accent}
            otp={deliveryOtp}
            label={t("app.ride.deliveryPin")}
            hint={t("app.ride.onlyGiveThisCodeWhenYour")}
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
            <TrackingFooterButton
              label={t("app.ride.shareTrip")}
              onPress={handleShareTrip}
              styles={styles}
            />
            <TrackingFooterButton
              label={t("app.ride.emergency")}
              onPress={handleSOS}
              tone="danger"
              styles={styles}
              tokens={tokens}
            />
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <TrackingFooterButton
              label={t("app.ride.orderDetails")}
              onPress={() => setTripModalVisible(true)}
              styles={styles}
            />
            <TrackingFooterButton
              label={t("app.ride.help")}
              onPress={handleSOS}
              tone="danger"
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
