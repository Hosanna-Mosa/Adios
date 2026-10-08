import React, { forwardRef } from 'react';
import { useMapCamera } from '@/components/useMapCamera';
import { useMapEffects } from '@/components/useMapEffects';
import { MapDriverMarkers } from '@/components/MapDriverMarkers';
import { MapLocationMarkers } from '@/components/MapLocationMarkers';
import { StyleSheet, View, ViewStyle, Text, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region, type MapType, Marker, Polyline, Circle } from '@/components/maps';
import { Feather } from '@expo/vector-icons';
import { DeliveryStop } from '@/contexts/deliveryStore';
import { typography } from "@/constants/typography";
import Colors from "@/constants/colors";
import { styles } from "@/components/MapBackground.styles";
import { decodePolyline } from "@/components/mapBackground.utils";


interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | any;
  mapType?: MapType;
  stops?: DeliveryStop[];
  polyline?: string;
  driverLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  onLocationUpdate?: (coords: { lat: number, lng: number }) => void;
  markers?: any[];
  driverMarkers?: any[];
  initialRegion?: Region;
  onMarkerPress?: (marker: any) => void;
  radiusCenter?: { lat: number; lng: number } | null;
  radiusMeters?: number;
  /** The assigned driver's vehicle, so their live marker matches what was booked.
   * Falls back to the selected service; it used to always draw a scooter. */
  driverVehicleType?: string | null;
  /** Restaurant / meat-shop order: 3D restaurant + home markers, and the live blue dot. */
  outletOrder?: boolean;
  /** Ride: green "Pickup" / red "Drop" bubbles, and the live blue dot. */
  rideOrder?: boolean;
}

export interface MapBackgroundRef {
  recenter: () => void;
  panTo: (lat: number, lng: number, delta?: number) => void;
  fitToRoute: () => void;
  fitToMarkers: (markers: any[]) => void;
}


export const MapBackground = forwardRef<MapBackgroundRef, Props>(({
  children,
  style,
  mapType = 'standard',
  stops = [],
  markers = [],
  driverMarkers = [],
  initialRegion,
  polyline,
  driverLocation,
  userLocation,
  onLocationUpdate,
  onMarkerPress,
  radiusCenter,
  driverVehicleType,
  radiusMeters,
  outletOrder,
  rideOrder,
}, ref) => {
  const {
    region, setRegion, autoRoutePolyline, setAutoRoutePolyline,
    selectedService, handleZoom, internalMapRef, locationRef,
    validRouteStops, getRegionForLocation,
  } = useMapCamera({ ref, initialRegion, stops, driverLocation });

  useMapEffects({
    initialRegion, stops, polyline, driverLocation, userLocation, onLocationUpdate,
    radiusCenter, radiusMeters, region, setRegion, setAutoRoutePolyline,
    internalMapRef, locationRef, validRouteStops, getRegionForLocation,
  });


  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <MapView
        ref={internalMapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        mapType={mapType}
        showsUserLocation={!userLocation || !!outletOrder || !!rideOrder}
        showsPointsOfInterest={false}
        showsCompass={false}
        showsMyLocationButton={false}
        pointerEvents="auto"
        onMapReady={() => {
          if (userLocation && internalMapRef.current) {
            const regionForUser = getRegionForLocation(userLocation.lat, userLocation.lng, 0.015, 0.015);
            internalMapRef.current.animateToRegion(regionForUser, 500);
          }
        }}
      >
        {(radiusCenter != null && radiusMeters != null && radiusMeters > 0) ? (
          <>
            <Circle
              center={{ latitude: Number(radiusCenter.lat), longitude: Number(radiusCenter.lng) }}
              radius={Number(radiusMeters)}
              fillColor="rgba(79, 70, 229, 0.15)"
              strokeColor="rgba(79, 70, 229, 0.6)"
              strokeWidth={2}
            />
            <Marker
              key="radius-badge"
              coordinate={{
                latitude: Number(radiusCenter.lat) - (Number(radiusMeters) / 111320),
                longitude: Number(radiusCenter.lng)
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={{
                backgroundColor: Colors.light.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: typography.sizes.small }}>
                  {radiusMeters >= 1000 ? `${radiusMeters / 1000} KM` : `${radiusMeters} M`}
                </Text>
              </View>
            </Marker>
          </>
        ) : null}

        {markers.map((item) => (
          (item.lat != null && item.lng != null) ? (
            <Marker
              key={item.id}
              coordinate={{ latitude: Number(item.lat), longitude: Number(item.lng) }}
              onPress={() => onMarkerPress?.(item)}
              pinColor="#EF4444"
              tracksViewChanges={true}
            />
          ) : null
        ))}

        <MapDriverMarkers driverMarkers={driverMarkers} selectedService={selectedService} food={!!outletOrder} />

        <MapLocationMarkers
          stops={stops}
          userLocation={userLocation}
          driverLocation={driverLocation}
          driverVehicleType={driverVehicleType}
          selectedService={selectedService}
          outletOrder={outletOrder}
          rideOrder={rideOrder}
        />

        {(polyline || autoRoutePolyline) ? (
          <Polyline
            coordinates={decodePolyline(polyline || autoRoutePolyline || "")}
            strokeWidth={4}
            strokeColor="#16A34A"
          />
        ) : null}
      </MapView>

      {/* Clean Zoom Controls */}
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoom(0.5)}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={18} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoom(2.0)}
          activeOpacity={0.7}
        >
          <Feather name="minus" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {children}
    </View>
  );
});

MapBackground.displayName = "MapBackground";
