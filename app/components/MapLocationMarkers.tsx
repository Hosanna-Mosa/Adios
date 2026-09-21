import React from "react";
import { Image, View } from "react-native";
import { Marker } from "@/components/maps";
import { styles } from "@/components/MapBackground.styles";
import type { DeliveryStop } from "@/contexts/deliveryStore";

// The stop pins plus the "you are here" and driver pins. Moved out of
// components/MapBackground.tsx unchanged.

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");

interface Props {
  stops: DeliveryStop[];
  userLocation?: { lat: number; lng: number } | null;
  driverLocation?: { lat: number; lng: number } | null;
}

export function MapLocationMarkers({ stops, userLocation, driverLocation }: Props) {
  return (
    <>
        {stops.map((stop, index) => (
          (stop.lat != null && stop.lng != null) ? (
            <Marker
              key={stop.id}
              coordinate={{ latitude: Number(stop.lat), longitude: Number(stop.lng) }}
              title={stop.storeName || `Pickup ${index + 1}`}
              description={stop.address}
            />
          ) : null
        ))}

        {userLocation && (
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
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={(driverLocation as any).heading || 0}
          >
            <Image
              source={VEHICLE_BIKE_3D}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}
    </>
  );
}
