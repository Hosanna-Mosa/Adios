import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "@/components/maps";
import { RIDE_STOP_ANCHOR, driverMarkerLook, rideStopMarker } from "@/components/mapBackground.utils";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPoint, PackageDeliveryVehicle } from "@/contexts/packageDeliveryStore";
import { driverMatches, type NearbyDriver } from "../usePackageDeliveryTrip";

// The trip on a map: pickup and drop pins, the road route between them, and the online
// captains who drive the selected vehicle. Framed to stay clear of the bottom sheet.

interface Props {
  pickup: PackageDeliveryPoint;
  drop: PackageDeliveryPoint;
  route: { latitude: number; longitude: number }[];
  drivers: NearbyDriver[];
  vehicle: PackageDeliveryVehicle;
  /** Space the top bar and the bottom sheet take up, so the route is never under them. */
  topInset: number;
  bottomInset: number;
  tokens: ThemeTokens;
  /** Re-frames the trip whenever this changes (the recenter button bumps it). */
  fitKey: number;
}

export function PackageDeliveryRouteMap({ pickup, drop, route, drivers, vehicle, topInset, bottomInset, tokens, fitKey }: Props) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const pickupCoord = { latitude: pickup.lat, longitude: pickup.lng };
  const dropCoord = { latitude: drop.lat, longitude: drop.lng };

  const fit = useCallback(() => {
    if (!ready || !mapRef.current) return;
    const points = route.length > 1 ? route : [pickupCoord, dropCoord];
    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: topInset, right: 56, bottom: bottomInset, left: 56 },
      animated: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, route, pickup.lat, pickup.lng, drop.lat, drop.lng, topInset, bottomInset]);

  useEffect(() => {
    fit();
  }, [fit, fitKey]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: (pickup.lat + drop.lat) / 2,
        longitude: (pickup.lng + drop.lng) / 2,
        latitudeDelta: Math.max(Math.abs(pickup.lat - drop.lat) * 2.5, 0.03),
        longitudeDelta: Math.max(Math.abs(pickup.lng - drop.lng) * 2.5, 0.03),
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsPointsOfInterest={false}
      toolbarEnabled={false}
      onMapReady={() => setReady(true)}
    >
      <Polyline coordinates={route.length > 1 ? route : [pickupCoord, dropCoord]} strokeWidth={4} strokeColor={tokens.text} lineDashPattern={route.length > 1 ? undefined : [8, 8]} />

      {drivers.filter((d) => driverMatches(d, vehicle)).map((driver) => {
        // image prop, not an <Image> child: see vehicleMarkerIcon (Android hardware-bitmap crash).
        const look = driverMarkerLook(driver.vehicleType, { heading: driver.heading });
        return (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.lat, longitude: driver.lng }}
            anchor={look.anchor}
            image={look.image}
            flat={look.flat}
            rotation={look.rotation}
            tracksViewChanges={false}
          />
        );
      })}

      <Marker coordinate={pickupCoord} image={rideStopMarker("pickup")} anchor={RIDE_STOP_ANCHOR} zIndex={3} />
      <Marker coordinate={dropCoord} image={rideStopMarker("drop")} anchor={RIDE_STOP_ANCHOR} zIndex={3} />
    </MapView>
  );
}
