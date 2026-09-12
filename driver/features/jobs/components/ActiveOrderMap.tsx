import React from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";
import { decodePolyline } from "../utils/polyline";
import { AppImage } from "@/components/ui/AppImage";
import { Box } from "@/components/ui/Box";

const VEHICLE_BIKE_3D = require("@/assets/images/scooter_blue_top_view_2.png");

interface Point {
  lat?: number | string | null;
  lng?: number | string | null;
}

/** Job map: pickup, drop, the live driver marker, and the route between them. */
export function ActiveOrderMap({
  mapRef,
  pickupStop,
  deliveryStop,
  driverLocation,
  driverHeading,
  polyline,
}: {
  mapRef: React.RefObject<MapView | null>;
  pickupStop?: Point | null;
  deliveryStop?: Point | null;
  driverLocation?: Point | null;
  driverHeading?: number | null;
  polyline?: string | null;
}) {
  const hasCoords = (p?: Point | null) => p != null && p.lat != null && p.lng != null;

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
        {hasCoords(pickupStop) ? (
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

        {hasCoords(deliveryStop) ? (
          <Marker
            coordinate={{ latitude: Number(deliveryStop!.lat), longitude: Number(deliveryStop!.lng) }}
          >
            <Box style={styles.redMarkerDot} />
          </Marker>
        ) : null}

        {hasCoords(driverLocation) ? (
          <Marker
            coordinate={{ latitude: Number(driverLocation!.lat), longitude: Number(driverLocation!.lng) }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={driverHeading || 0}
          >
            <AppImage source={VEHICLE_BIKE_3D} style={styles.driverMarkerImage} resizeMode="contain" />
          </Marker>
        ) : null}

        {polyline ? (
          <Polyline
            coordinates={decodePolyline(polyline)}
            strokeWidth={4}
            strokeColor={Colors.success}
          />
        ) : null}
      </MapView>
    </Box>
  );
}
