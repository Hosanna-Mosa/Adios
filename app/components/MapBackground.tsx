import React, { forwardRef } from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useMapCamera } from '@/components/useMapCamera';
import { useMapEffects } from '@/components/useMapEffects';
import { MapDriverMarkers } from '@/components/MapDriverMarkers';
import { MapLocationMarkers } from '@/components/MapLocationMarkers';
import { StyleSheet, View, ViewStyle, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE, type Region, type MapType, Marker, Polyline, Circle } from '@/components/maps';
import { Feather } from '@expo/vector-icons';
import { DeliveryStop } from '@/contexts/deliveryStore';
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import Colors, { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { styles } from "@/components/MapBackground.styles";
import { decodePolyline } from "@/components/mapBackground.utils";
import { useMapStyle } from "@/components/useMapStyle";


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
  /** The caller's own bottom sheet height (measured, or its known resting
   * height), so the zoom controls sit just above it instead of at a fixed
   * position unrelated to what's actually on screen. Omit for a caller with
   * no bottom sheet — the controls then sit just above the safe area. */
  sheetHeight?: number;
  /** Same purpose as sheetHeight, for a caller whose sheet height changes via
   * gesture/animation rather than layout (e.g. Tracking's draggable
   * BottomSheet) -- its onLayout height never changes, only its transform
   * does, so this live value is used instead when provided. Takes priority
   * over the static sheetHeight while present. */
  sheetHeightValue?: SharedValue<number>;
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
  sheetHeight = 0,
  sheetHeightValue,
}, ref) => {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const insets = useSafeAreaInsets();

  const animatedZoomStyle = useAnimatedStyle(() => {
    if (!sheetHeightValue) return {};
    return { bottom: insets.bottom + sheetHeightValue.value + 16 };
  });
  const {
    region, setRegion, autoRoutePolyline, setAutoRoutePolyline,
    selectedService, handleZoom, internalMapRef, locationRef,
    validRouteStops, getRegionForLocation,
  } = useMapCamera({ ref, initialRegion, stops, driverLocation });

  const mapStyle = useMapStyle();

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
        customMapStyle={mapStyle}
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
              fillColor={`${tokens.brand}26`}
              strokeColor={`${tokens.brand}99`}
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
            strokeColor={tokens.brand}
          />
        ) : null}
      </MapView>

      {/* Clean Zoom Controls */}
      <Animated.View style={[styles.zoomControlsContainer, { bottom: insets.bottom + sheetHeight + 16 }, animatedZoomStyle]}>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
          onPress={() => handleZoom(0.5)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("app.ride.zoomIn")}
        >
          <Feather name="plus" size={18} color={tokens.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
          onPress={() => handleZoom(2.0)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("app.ride.zoomOut")}
        >
          <Feather name="minus" size={18} color={tokens.text} />
        </TouchableOpacity>
      </Animated.View>

      {children}
    </View>
  );
});

MapBackground.displayName = "MapBackground";
