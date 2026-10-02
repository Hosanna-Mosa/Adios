import React from "react";
import { Image, View } from "react-native";
import { Marker } from "@/components/maps";
import { styles } from "@/components/MapBackground.styles";
import type { DeliveryStop } from "@/contexts/deliveryStore";
import { vehicleMarkerImage } from "@/components/mapBackground.utils";

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
}

export function MapLocationMarkers({ stops, userLocation, driverLocation, driverVehicleType, selectedService }: Props) {
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
              source={vehicleMarkerImage(driverVehicleType || selectedService)}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}
    </>
  );
}
