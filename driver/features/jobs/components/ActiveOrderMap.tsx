import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";
import { decodePolyline } from "../utils/polyline";
import { fitMapToCoords } from "../mapFit";
import { useLegRoute } from "../hooks/useLegRoute";
import { Box } from "@/components/ui/Box";
import { BUILDING_ANCHOR, CUSTOMER_MARKER, RESTAURANT_MARKER, RIDE_STOP_ANCHOR, RouteLine, rideStopMarker } from "./ActiveOrderMap.parts";

interface Point {
  lat?: number | string | null;
  lng?: number | string | null;
}

// Once the order is picked up, the way to follow is the one to the customer.
const DELIVERY_LEG_STATUSES = ["picked_up", "en_route_delivery", "arrived_delivery", "delivered", "completed"];
const DONE_STATUSES = ["delivered", "completed"];

/** Job map: pickup, drop, the live driver marker, and the route between them. */
export function ActiveOrderMap({
  mapRef,
  pickupStop,
  deliveryStop,
  driverLocation,
  driverHeading,
  polyline,
  status = "",
  showLegRoute = false,
  restaurantName,
  customerName,
  isRide = false,
}: {
  mapRef: React.RefObject<MapView | null>;
  pickupStop?: Point | null;
  deliveryStop?: Point | null;
  driverLocation?: Point | null;
  driverHeading?: number | null;
  polyline?: string | null;
  /** Lower-case order status; picks which leg the live route follows. */
  status?: string;
  /** Delivery orders: draw the live way from the driver to the current stop. */
  showLegRoute?: boolean;
  /** Set for restaurant / meat-shop orders: the pickup is drawn as a 3D restaurant. */
  restaurantName?: string | null;
  /** Delivery orders: label for the customer's 3D home marker. */
  customerName?: string | null;
  /** Rides: pickup and drop are green "Pickup" / red "Drop" bubbles. */
  isRide?: boolean;
}) {
  const hasCoords = (p?: Point | null) => p != null && p.lat != null && p.lng != null;

  const onDeliveryLeg = DELIVERY_LEG_STATUSES.includes(status);
  const legTarget = onDeliveryLeg ? deliveryStop : pickupStop;
  const liveRoute = useLegRoute(driverLocation, legTarget, showLegRoute && !DONE_STATUSES.includes(status));
  // The order's own route: restaurant → customer. Orders without one stored get
  // it from the routing endpoint instead (planned once — both ends are fixed).
  const storedRoute = useMemo(() => (polyline ? decodePolyline(polyline) : null), [polyline]);
  const fetchedTripRoute = useLegRoute(pickupStop, deliveryStop, showLegRoute && !storedRoute);
  const tripRoute = storedRoute ?? fetchedTripRoute;

  // Frame each new leg once its route is in, so the whole way is on screen. After
  // pickup that is the restaurant → customer path (plus wherever the driver is).
  const framedLeg = useRef("");
  useEffect(() => {
    const leg = onDeliveryLeg ? "delivery" : "pickup";
    if (framedLeg.current === leg) return;
    const coords = onDeliveryLeg && showLegRoute ? [...(tripRoute ?? []), ...(liveRoute ?? [])] : liveRoute ?? [];
    if (coords.length < 2) return;
    framedLeg.current = leg;
    const last = coords[coords.length - 1];
    fitMapToCoords(mapRef.current, coords, { lat: last.latitude, lng: last.longitude }, 0.02, 800);
  }, [liveRoute, tripRoute, onDeliveryLeg, showLegRoute, mapRef]);

  return (
    <Box style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        initialRegion={{
          latitude: Number(pickupStop?.lat) || 12.9716,
          longitude: Number(pickupStop?.lng) || 77.5946,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        }}
      >
        {hasCoords(pickupStop) && isRide ? (
          <Marker
            coordinate={{ latitude: Number(pickupStop!.lat), longitude: Number(pickupStop!.lng) }}
            image={rideStopMarker("pickup")}
            anchor={RIDE_STOP_ANCHOR}
            zIndex={3}
          />
        ) : hasCoords(pickupStop) && restaurantName ? (
          <Marker
            coordinate={{ latitude: Number(pickupStop!.lat), longitude: Number(pickupStop!.lng) }}
            image={RESTAURANT_MARKER}
            anchor={BUILDING_ANCHOR}
            title={restaurantName}
            zIndex={3}
          />
        ) : hasCoords(pickupStop) ? (
          <Marker
            coordinate={{ latitude: Number(pickupStop!.lat), longitude: Number(pickupStop!.lng) }}
          >
            <Box style={styles.userMarkerWrap}>
              <Box style={styles.userMarkerBadge}>
                <Ionicons name="person" size={14} color={Colors.white} />
              </Box>
            </Box>
          </Marker>
        ) : null}

        {hasCoords(deliveryStop) && isRide ? (
          <Marker
            coordinate={{ latitude: Number(deliveryStop!.lat), longitude: Number(deliveryStop!.lng) }}
            image={rideStopMarker("drop")}
            anchor={RIDE_STOP_ANCHOR}
            zIndex={3}
          />
        ) : hasCoords(deliveryStop) && showLegRoute ? (
          <Marker
            coordinate={{ latitude: Number(deliveryStop!.lat), longitude: Number(deliveryStop!.lng) }}
            image={CUSTOMER_MARKER}
            anchor={BUILDING_ANCHOR}
            title={customerName || undefined}
            zIndex={3}
          />
        ) : hasCoords(deliveryStop) ? (
          <Marker
            coordinate={{ latitude: Number(deliveryStop!.lat), longitude: Number(deliveryStop!.lng) }}
          >
            <Box style={styles.redMarkerDot} />
          </Marker>
        ) : null}

        {/* Driver's own location — was rendered with the same top-view vehicle
            image customers see on the driver, which reads as "there's a bike
            here" rather than "this is you, facing this way". Google Maps'
            own convention (a heading-oriented arrow) is what a driver expects
            of their own live position, so this marker uses that instead. */}
        {hasCoords(driverLocation) ? (
          <Marker
            coordinate={{ latitude: Number(driverLocation!.lat), longitude: Number(driverLocation!.lng) }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={driverHeading || 0}
            zIndex={4}
          >
            <Box style={styles.navArrowMarker}>
              <Ionicons name="navigate" size={20} color="#fff" />
            </Box>
          </Marker>
        ) : null}

        {/* Delivery orders: before pickup, the way to the restaurant (live) with the
            restaurant → customer path previewed dashed; after pickup, that path is the
            one to follow, with the live way from wherever the driver is on top.
            Rides and helper tasks draw the order's own route exactly as before. */}
        {tripRoute && !showLegRoute ? (
          <Polyline coordinates={tripRoute} strokeWidth={4} strokeColor={Colors.success} zIndex={1} />
        ) : tripRoute && onDeliveryLeg ? (
          <RouteLine coordinates={tripRoute} />
        ) : tripRoute ? (
          <Polyline coordinates={tripRoute} strokeWidth={4} strokeColor={Colors.textMuted} lineDashPattern={[14, 10]} zIndex={1} />
        ) : null}

        {liveRoute ? <RouteLine coordinates={liveRoute} /> : null}
      </MapView>
    </Box>
  );
}
