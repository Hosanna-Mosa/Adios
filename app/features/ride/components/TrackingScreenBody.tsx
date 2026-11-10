import { Linking, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { WEB_TOP_OFFSET } from "@/constants/layout";
import { buildStepper } from "@/components/shared/orderProgress";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TrackingFooterButton } from "@/features/ride/components/TrackingFooterButton";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";
import { trackingServiceKey } from "@/features/ride/trackingContent";
import { goHomeFromTracking } from "../useTrackingHandleBack";
import { TrackingDetailsCard, TrackingMapCard, TrackingPartnerCard, TrackingStatusCard, TrackingSummaryCard } from "./TrackingCards";
import type { Props } from "./TrackingScreenBody.props";

/**
 * The Tracking page: a header, then cards on a scrolling page - summary with the step
 * tracker, map, what is happening now, the partner, and the order / trip / service details.
 * PIN codes, helper updates and the help / emergency buttons keep their place under the partner.
 */
export function TrackingScreenBody(props: Props) {
  const {
    accent, driver, driverLocation, eta, insets, mapRef, radius, route, status, stops, styles, tokens, userLocCoords,
    outletOrder, rideOrder, currentOrderId, unreadCount, isRide, isHelper, isPackageDelivery, helperStatus,
    deliveryOtp, startOtp, deliveryStop, pickupLabel, totalPrice, orderCreatedAt, tripModalVisible,
    setTripModalVisible, handleSOS, handleShareTrip, vendorName, vendorPartnerType, serviceType,
  } = props;
  const { t } = useTranslation();
  const foodStage = useDeliveryStore((s) => s.foodStage);

  const serviceKey = trackingServiceKey({ isRide: !!isRide, isHelper: !!isHelper, isPackageDelivery, serviceType, vendorName, vendorPartnerType });
  const waiting = foodStage === "awaiting_restaurant";
  const steps = buildStepper(serviceKey, status, waiting);
  const openDetails = () => setTripModalVisible(true);

  // A package delivery's OTP goes to the receiver, who gives it to the captain at the drop.
  const shareDeliveryOtp = () => {
    Share.share({ message: t("app.packageDelivery.shareOtpMessage", { otp: deliveryOtp }) }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View style={[styles.tkHeader, { paddingTop: insets.top + WEB_TOP_OFFSET + 8 }]}>
        <TouchableOpacity style={styles.tkBack} onPress={goHomeFromTracking} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
          <Ionicons name="chevron-back" size={moderateScale(24)} color={tokens.brand} />
        </TouchableOpacity>
        <Text style={styles.tkHeaderTitle}>{t("app.tracking.title", "Tracking")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.tkScroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TrackingSummaryCard serviceKey={serviceKey} orderId={currentOrderId} steps={steps} styles={styles} tokens={tokens} />

        <TrackingMapCard
          mapRef={mapRef} stops={stops} route={route} status={status} driverLocation={driverLocation} driver={driver}
          userLocCoords={userLocCoords} outletOrder={!!outletOrder} rideOrder={!!rideOrder} radius={radius} eta={eta}
          styles={styles} tokens={tokens}
        />

        {driver ? (
          <>
            <TrackingStatusCard serviceKey={serviceKey} steps={steps} waiting={waiting} styles={styles} tokens={tokens} />
            <TrackingPartnerCard driver={driver} serviceKey={serviceKey} unreadCount={unreadCount} Linking={Linking} styles={styles} tokens={tokens} />
          </>
        ) : (
          <View style={styles.tkCard}>
            <TrackingFindingWrap accent={accent} isHelper={!!isHelper} isRide={!!isRide} styles={styles} />
          </View>
        )}

        {driver && isRide && !isPackageDelivery && startOtp && ["confirmed", "driver_assigned", "en_route_pickup", "arrived_pickup"].includes(status) && (
          <TrackingPinCard accent={accent} otp={startOtp} label={t("app.ride.startRidePin")} hint={t("app.ride.giveThisToYourCaptainTo")} styles={styles} />
        )}
        {isPackageDelivery && deliveryOtp && !["delivered", "cancelled"].includes(status) && (
          <TrackingPinCard
            accent={accent} otp={deliveryOtp} label={t("app.packageDelivery.deliveryOtpLabel")} hint={t("app.packageDelivery.deliveryOtpHint")}
            onShare={shareDeliveryOtp} shareLabel={t("app.packageDelivery.shareOtp")} styles={styles}
          />
        )}
        {isRide && !isPackageDelivery && deliveryOtp && status === "arrived_delivery" && (
          <TrackingPinCard accent={accent} otp={deliveryOtp} label={t("app.ride.endRidePin")} styles={styles} />
        )}
        {!isRide && !isPackageDelivery && deliveryOtp && (
          <TrackingPinCard
            accent={accent} otp={deliveryOtp} label={isHelper ? t("app.ride.completionPin") : t("app.ride.deliveryPin")}
            hint={isHelper ? t("app.ride.giveThisToYourHelperOnceWorkIsFinished") : t("app.ride.onlyGiveThisCodeWhenYour")} styles={styles}
          />
        )}
        {isHelper && helperStatus ? <TrackingHelperUpdate accent={accent} helperStatus={helperStatus} styles={styles} /> : null}

        <TrackingDetailsCard
          serviceKey={serviceKey} vendorName={vendorName ?? null} stops={stops} deliveryStop={deliveryStop} pickupLabel={pickupLabel}
          totalPrice={totalPrice} orderCreatedAt={orderCreatedAt} onOpen={openDetails} styles={styles} tokens={tokens}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          {isRide && <TrackingFooterButton label={t("app.ride.shareTrip")} onPress={handleShareTrip} styles={styles} />}
          <TrackingFooterButton
            label={isRide ? t("app.ride.emergency") : t("app.ride.help")}
            onPress={handleSOS} tone="danger" styles={styles} tokens={tokens}
          />
        </View>
      </ScrollView>

      <TripDetailsModal
        accent={accent} currentOrderId={currentOrderId} insets={insets} pickupLabel={pickupLabel}
        setTripModalVisible={setTripModalVisible} stops={stops} styles={styles} tokens={tokens}
        totalPrice={totalPrice} tripModalVisible={tripModalVisible}
      />
    </View>
  );
}
