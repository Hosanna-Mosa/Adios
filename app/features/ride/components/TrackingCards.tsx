import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { MapBackground } from "@/components/MapBackground";
import { OrderSteps } from "@/components/shared/OrderSteps";
import { cardTitle, serviceIcon, RIDE_SERVICE_KEYS, type Stepper } from "@/components/shared/orderProgress";
import { type ThemeTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";
import { detailLines, longDate, orderCodeLine, statusMessage, vehicleName } from "@/features/ride/trackingContent";

// The cards of the Tracking page, top to bottom: summary + stepper, map, status message,
// partner, details. Each one reads only what it is given.

interface Common {
  styles: TrackingStyles;
  tokens: ThemeTokens;
}

export function TrackingSummaryCard({ serviceKey, orderId, steps, styles, tokens }: Common & { serviceKey: string; orderId: string | null; steps: Stepper }) {
  return (
    <View style={styles.tkCard}>
      <View style={styles.tkSummaryTop}>
        <Ionicons name={serviceIcon(serviceKey)} size={moderateScale(30)} color={tokens.brand} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.tkSummaryTitle} numberOfLines={1}>{cardTitle(serviceKey)}</Text>
          <Text style={styles.tkSummaryId} numberOfLines={1}>{orderCodeLine(serviceKey, orderId)}</Text>
        </View>
      </View>
      <View style={styles.tkPillWrap}>
        <View style={styles.tkPill}>
          <View style={{ width: moderateScale(10), height: moderateScale(10), borderRadius: moderateScale(5), borderWidth: 2, borderColor: tokens.info }} />
          <Text style={styles.tkPillText} numberOfLines={1}>{steps.labels[steps.current]}</Text>
        </View>
      </View>
      <OrderSteps steps={steps} tokens={tokens} />
    </View>
  );
}

export function TrackingMapCard(props: Common & {
  mapRef: any; stops: any; route: any; status: string; driverLocation: any; driver: any; userLocCoords: any;
  outletOrder: boolean; rideOrder: boolean; radius: any; eta: number | null;
}) {
  const { styles, tokens, mapRef, stops, route, status, driverLocation, driver, userLocCoords, outletOrder, rideOrder, radius, eta } = props;
  const { t } = useTranslation();
  const arrived = status === "arrived_pickup" || status === "arrived_delivery";
  return (
    <View style={styles.tkMap}>
      {/* Not interactive: the map sits in a scrolling page, so drags must scroll the page. */}
      <View style={{ flex: 1 }} pointerEvents="none">
        <MapBackground
          ref={mapRef}
          stops={stops}
          polyline={["en_route_delivery", "arrived_delivery"].includes(status) ? route?.polyline : undefined}
          driverLocation={driverLocation}
          driverVehicleType={driver?.vehicle && driver.vehicle !== "unknown" ? driver.vehicle : undefined}
          userLocation={userLocCoords}
          outletOrder={outletOrder}
          rideOrder={rideOrder}
          radiusCenter={stops?.[0]?.lat !== undefined && stops?.[0]?.lng !== undefined ? { lat: stops[0].lat, lng: stops[0].lng } : null}
          radiusMeters={radius ? radius * 1000 : undefined}
          hideZoomControls
          style={{ flex: 1 }}
        />
      </View>
      {eta != null && !arrived && (
        <View style={styles.tkEta} pointerEvents="none">
          <Text style={styles.tkEtaLabel}>{t("app.tracking.eta", "ETA")}</Text>
          <Text style={styles.tkEtaValue}>{t("app.ride.etaMinutes", { min: eta })}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.tkLocate}
        onPress={() => mapRef.current?.fitToRoute?.()}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t("app.tracking.recenter", "Recenter map")}
      >
        <Ionicons name="locate-outline" size={moderateScale(20)} color={tokens.brand} />
      </TouchableOpacity>
    </View>
  );
}

export function TrackingStatusCard({ serviceKey, steps, waiting, styles, tokens }: Common & { serviceKey: string; steps: Stepper; waiting: boolean }) {
  const msg = statusMessage(serviceKey, steps, waiting);
  return (
    <View style={[styles.tkCard, styles.tkStatusRow]}>
      <View style={styles.tkStatusTile}>
        <Ionicons name={serviceIcon(serviceKey)} size={moderateScale(22)} color={tokens.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.tkStatusTitle}>{msg.title}</Text>
        <Text style={styles.tkStatusSub}>{msg.subtitle}</Text>
      </View>
    </View>
  );
}

export function TrackingPartnerCard({ driver, serviceKey, unreadCount, Linking, styles, tokens }: Common & { driver: any; serviceKey: string; unreadCount: number; Linking: any }) {
  const { t } = useTranslation();
  const isRide = RIDE_SERVICE_KEYS.includes(serviceKey) && serviceKey !== "packageDelivery";
  const unit = serviceKey === "helper" ? t("app.tracking.services", "services") : isRide ? t("app.tracking.rides", "rides") : t("app.tracking.deliveries", "deliveries");
  const role = serviceKey === "helper" ? t("app.tracking.servicePartner", "Service Partner") : isRide ? t("app.tracking.driver", "Driver") : t("app.tracking.deliveryPartner", "Delivery Partner");
  const rating = driver.rating != null ? Number(driver.rating).toFixed(1) : t("app.ride.newDriverRating");
  const count = driver.ratingCount ? ` (${Number(driver.ratingCount).toLocaleString()} ${unit})` : "";
  return (
    <View style={[styles.tkCard, styles.tkPartnerRow]}>
      <View style={styles.tkAvatar}>
        <Ionicons name="person" size={moderateScale(24)} color={tokens.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.tkPartnerName} numberOfLines={1}>{driver.name || t("app.ride.assignedPartnerFallback")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
          <Ionicons name="star" size={moderateScale(12)} color={tokens.warning} />
          <Text style={styles.tkPartnerMeta} numberOfLines={1}>{rating}{count}</Text>
        </View>
        <Text style={styles.tkPartnerMeta}>{role}</Text>
      </View>
      <TouchableOpacity style={styles.tkRoundBtn} hitSlop={5} onPress={() => Linking.openURL(`tel:${driver.phone || ""}`)} accessibilityRole="button" accessibilityLabel={t("app.delivery.call")}>
        <Ionicons name="call-outline" size={moderateScale(18)} color={tokens.brand} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.tkRoundBtn} hitSlop={5} onPress={() => router.push("/chat")} accessibilityRole="button" accessibilityLabel={t("app.delivery.message")}>
        <Ionicons name="chatbubble-outline" size={moderateScale(18)} color={tokens.brand} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: tokens.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function TrackingDetailsCard(props: Common & {
  serviceKey: string; vendorName: string | null; stops: any[]; deliveryStop: any; pickupLabel: string;
  totalPrice: number | null; orderCreatedAt: any; onOpen: () => void;
}) {
  const { styles, tokens, serviceKey, vendorName, stops, deliveryStop, pickupLabel, totalPrice, orderCreatedAt, onOpen } = props;
  const { t } = useTranslation();
  const isRide = RIDE_SERVICE_KEYS.includes(serviceKey);
  const isOutlet = serviceKey === "food" || serviceKey === "meat";
  const isPackage = serviceKey === "packageDelivery";
  const isHelper = serviceKey === "helper";
  const lines = detailLines(deliveryStop, stops);
  const to = stops?.length > 1 ? stops[stops.length - 1]?.address : "";
  const total = totalPrice != null ? `₹${Math.round(totalPrice)}` : "—";
  const title = isRide ? t("app.tracking.tripDetails", "Trip Details") : isPackage ? t("app.tracking.packageDetails", "Package Details") : isHelper ? t("app.tracking.serviceDetails", "Service Details") : t("app.tracking.orderDetails", "Order Details");
  const button = isRide ? t("app.tracking.tripDetails", "Trip Details") : isOutlet ? t("app.tracking.viewOrderDetails", "View Order Details") : t("app.tracking.viewDetails", "View Details");

  const headRow = (icon: keyof typeof Ionicons.glyphMap, text: string) => (
    <TouchableOpacity style={styles.tkHead} onPress={onOpen} activeOpacity={0.8}>
      <Ionicons name={icon} size={moderateScale(20)} color={tokens.brand} />
      <Text style={styles.tkLineText} numberOfLines={1}>{text}</Text>
      <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.text} />
    </TouchableOpacity>
  );
  const place = (kind: "from" | "to", text: string) => (
    <View style={styles.tkHead}>
      <Ionicons name={kind === "from" ? "location" : "location"} size={moderateScale(20)} color={kind === "from" ? tokens.success : tokens.error} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.tkLineMuted}>{kind === "from" ? t("app.orders.from", "From") : t("app.orders.to", "To")}</Text>
        <Text style={styles.tkLineText} numberOfLines={2}>{text || "—"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.tkCard}>
      <Text style={styles.tkSectionTitle}>{title}</Text>

      {isOutlet && (
        <>
          {headRow("storefront-outline", vendorName || "")}
          <View style={styles.tkDivider} />
          {lines.map((l, i) => (
            <View key={l.name + i} style={styles.tkLine}>
              <Text style={styles.tkLineText} numberOfLines={1}>{l.name} ×{l.qty}</Text>
              {l.amount != null && <Text style={styles.tkLineAmount}>₹{l.amount}</Text>}
            </View>
          ))}
        </>
      )}

      {isRide && (
        <>
          {place("from", pickupLabel)}
          <View style={styles.tkDivider} />
          {place("to", to)}
          <View style={styles.tkDivider} />
          <View style={styles.tkHead}>
            <Ionicons name={serviceIcon(serviceKey)} size={moderateScale(20)} color={tokens.brand} />
            <Text style={styles.tkLineText}>{vehicleName(serviceKey)}</Text>
            <Text style={styles.tkLineAmount}>{total}</Text>
          </View>
        </>
      )}

      {isPackage && (
        <>
          {headRow("cube-outline", lines.length ? lines.map((l) => `${l.name} ×${l.qty}`).join(", ") : t("app.orders.parcelFallback", "Parcel x1"))}
          <View style={styles.tkDivider} />
          {place("from", pickupLabel)}
          <View style={styles.tkDivider} />
          {place("to", to)}
        </>
      )}

      {isHelper && (
        <>
          {headRow("construct-outline", lines[0]?.name || t("app.orders.helperFallback", "Helper task"))}
          {!!longDate(orderCreatedAt) && (
            <View style={styles.tkHead}>
              <Ionicons name="calendar-outline" size={moderateScale(20)} color={tokens.brand} />
              <View>
                <Text style={styles.tkLineMuted}>{t("app.tracking.date", "Date")}</Text>
                <Text style={styles.tkLineText}>{longDate(orderCreatedAt)}</Text>
              </View>
            </View>
          )}
        </>
      )}

      {!isRide && (
        <>
          <View style={styles.tkDivider} />
          <View style={styles.tkLine}>
            <Text style={styles.tkTotalLabel}>{t("app.orders.total", "Total")}</Text>
            <Text style={styles.tkLineAmount}>{total}</Text>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.tkDetailsBtn} onPress={onOpen} activeOpacity={0.85} accessibilityRole="button">
        <Text style={styles.tkDetailsBtnText}>{button}</Text>
      </TouchableOpacity>
    </View>
  );
}
