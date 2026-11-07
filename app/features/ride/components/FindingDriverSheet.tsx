import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type FindingDriverStyles } from "@/features/ride/finding-driver.styles";
import type { FoodStage } from "@/contexts/delivery.types";
import { FindingDriverRaiseFare } from "./FindingDriverRaiseFare";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  dropStop: any;
  /** Restaurant orders: the restaurant hasn't accepted yet, or is cooking while a rider is found. */
  foodStage: FoodStage;
  isRide: boolean;
  orderSummary: any;
  pickupStop: any;
  setShowCancelSheet: React.Dispatch<React.SetStateAction<any>>;
  /** Reports the sheet's rendered height, so the map's zoom controls can clear it. */
  setSheetHeight?: (height: number) => void;
  spinStyle: any;
  styles: FindingDriverStyles;
  tierLabel: string;
  /** No rider has accepted yet: offer to add to the fare (rides and package deliveries). */
  showRaiseFare?: boolean;
  raising?: number | null;
  onRaiseFare?: (amount: number) => void;
}

export function FindingDriverSheet({
  dropStop,
  foodStage,
  isRide,
  orderSummary,
  pickupStop,
  setShowCancelSheet,
  setSheetHeight,
  spinStyle,
  styles,
  tierLabel,
  showRaiseFare = false,
  raising = null,
  onRaiseFare,
}: Props) {
  const { t } = useTranslation();
  const isPackageDelivery = !!orderSummary?.isPackageDelivery;
  const searchingText =
    (tierLabel ? t("app.ride.searchingNearby", { tier: tierLabel, defaultValue: "Searching {{tier}} nearby. " }) : t("app.ride.searchingNearbyCaptains")) +
    t("app.ride.usuallyUnderAMinute");
  const title =
    foodStage === "awaiting_restaurant"
      ? t("app.ride.waitingForRestaurantTitle")
      : foodStage === "preparing"
        ? t("app.ride.restaurantPreparingTitle")
        : isPackageDelivery
          ? t("app.ride.findingYourDeliveryPartner")
          : t("app.ride.findingYourCaptain");
  const subtitle =
    foodStage === "awaiting_restaurant"
      ? t("app.ride.waitingForRestaurantSubtitle")
      : foodStage === "preparing"
        ? t("app.ride.restaurantPreparingSubtitle")
        : searchingText;
  return (
    <View style={styles.sheet} onLayout={(e) => setSheetHeight?.(Math.round(e.nativeEvent.layout.height))}>
      <View style={styles.sheetHandle} />
      <View style={styles.titleRow}>
        <Animated.View style={[styles.spinner, spinStyle]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {(orderSummary.totalPrice != null || pickupStop || dropStop) && (
        <Animated.View entering={fadeInUp(0)} style={styles.routeCard}>
          {orderSummary.totalPrice != null && (
            <View style={styles.routeCardHead}>
              <Text style={styles.routeCardHeadLabel}>{t("app.ride.totalFare")}</Text>
              <Text style={styles.routeCardHeadValue}>₹{Math.round(orderSummary.totalPrice)}</Text>
            </View>
          )}
          {(pickupStop || dropStop) && (
            <View style={styles.routeRow}>
              <View style={styles.routeRail}>
                <View style={styles.routePickupDot} />
                <View style={styles.routeLine} />
                <View style={styles.routeDropSquare} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
                <Text style={styles.routeAddr} numberOfLines={1}>{pickupStop?.address || ""}</Text>
                <Text style={styles.routeAddr} numberOfLines={1}>{dropStop?.address || ""}</Text>
              </View>
              {(orderSummary.totalDistance != null || orderSummary.duration != null) && (
                <View style={{ alignItems: "flex-end" }}>
                  {orderSummary.totalDistance != null && <Text style={styles.routeMeta}>{orderSummary.totalDistance.toFixed(1)} km</Text>}
                  {orderSummary.duration != null && <Text style={[styles.routeMeta, { marginTop: 12 }]}>{Math.round(orderSummary.duration)} min</Text>}
                </View>
              )}
            </View>
          )}
        </Animated.View>
      )}

      {showRaiseFare && onRaiseFare && (
        <FindingDriverRaiseFare isPackageDelivery={isPackageDelivery} raising={raising} onRaise={onRaiseFare} />
      )}

      <View style={{ marginTop: "auto" }}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancelSheet(true)} activeOpacity={0.85}>
          <Text style={styles.cancelBtnText}>{isPackageDelivery ? t("app.packageDelivery.cancelDelivery") : isRide ? t("app.ride.cancelRideLower") : t("app.ride.cancelOrderLower")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
