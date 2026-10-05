import React, { useRef } from "react";
import { View } from "react-native";
import { Marker } from "@/components/maps";
import { styles } from "@/components/MapBackground.styles";
import type { DeliveryStop } from "@/contexts/deliveryStore";
import { BUILDING_ANCHOR, HOME_MARKER, RESTAURANT_MARKER, RIDE_STOP_ANCHOR, driverMarkerLook, rideStopMarker, riderFacing, type RiderFacing } from "@/components/mapBackground.utils";
import i18n from "@/i18n";
import { useSmoothedHeading } from "@/components/useSmoothedHeading";

// The stop pins plus the "you are here" and driver pins. Moved out of
// components/MapBackground.tsx unchanged.

interface Props {
  stops: DeliveryStop[];
  userLocation?: { lat: number; lng: number } | null;
  driverLocation?: { lat: number; lng: number } | null;
  /** The assigned driver's vehicle, so their live marker matches what was booked.
   * Falls back to the selected service; it used to always draw a scooter. */
  driverVehicleType?: string | null;
  selectedService?: string | null;
  /** A restaurant / meat-shop order: the pickup is drawn as a 3D restaurant and the
   * drop as a 3D home, so it's clear which is which. Other orders keep plain pins. */
  outletOrder?: boolean;
  /** A ride: the pickup and drop are green "Pickup" / red "Drop" bubbles. */
  rideOrder?: boolean;
}

const stopKind = (stop: DeliveryStop) => String((stop as any).type || "").toLowerCase();

export function MapLocationMarkers({ stops, userLocation, driverLocation, driverVehicleType, selectedService, outletOrder, rideOrder }: Props) {
  // The rider sticker faces the way they're heading; remembered so near-north/south
  // headings keep the last direction instead of flipping.
  const facing = useRef<RiderFacing>("right");
  // Eased, so the live marker turns smoothly rather than spinning on every update.
  const heading = useSmoothedHeading((driverLocation as any)?.heading);
  facing.current = riderFacing(heading, facing.current);
  const driverLook = driverMarkerLook(driverVehicleType || selectedService, { heading, facing: facing.current, rotateWithHeading: true });

  return (
    <>
        {stops.map((stop, index) => (
          (stop.lat != null && stop.lng != null) ? (
            outletOrder && ["pickup", "drop", "delivery"].includes(stopKind(stop)) ? (
              <Marker
                key={stop.id}
                coordinate={{ latitude: Number(stop.lat), longitude: Number(stop.lng) }}
                image={stopKind(stop) === "pickup" ? RESTAURANT_MARKER : HOME_MARKER}
                anchor={BUILDING_ANCHOR}
                title={stopKind(stop) === "pickup" ? stop.storeName || i18n.t("app.tracking.restaurantPin") : i18n.t("app.tracking.deliveryLocationPin")}
                description={stop.address}
                zIndex={2}
              />
            ) : rideOrder && ["pickup", "drop", "delivery"].includes(stopKind(stop)) ? (
              <Marker
                key={stop.id}
                coordinate={{ latitude: Number(stop.lat), longitude: Number(stop.lng) }}
                image={rideStopMarker(stopKind(stop) === "pickup" ? "pickup" : "drop")}
                anchor={RIDE_STOP_ANCHOR}
                description={stop.address}
                zIndex={2}
              />
            ) : (
            <Marker
              key={stop.id}
              coordinate={{ latitude: Number(stop.lat), longitude: Number(stop.lng) }}
              title={stop.storeName || `Pickup ${index + 1}`}
              description={stop.address}
            />
            )
          ) : null
        ))}

        {/* On outlet orders and rides the drop already has its own marker, and the
            customer's real position is the map's own blue dot (see MapBackground). */}
        {userLocation && !outletOrder && !rideOrder && (
          <Marker
            key="user-location-pin"
            coordinate={{ latitude: Number(userLocation.lat), longitude: Number(userLocation.lng) }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarkerWrap}>
              <View style={styles.userMarkerBadge} />
            </View>
          </Marker>
        )}

        {driverLocation && (
          <Marker
            key="driver-location-pin"
            coordinate={{ latitude: Number(driverLocation.lat), longitude: Number(driverLocation.lng) }}
            title="Driver"
            anchor={driverLook.anchor}
            flat={driverLook.flat}
            rotation={driverLook.rotation}
            // image prop, not an <Image> child: see vehicleMarkerIcon (Android hardware-bitmap crash).
            image={driverLook.image}
            zIndex={3}
          />
        )}
    </>
  );
}
