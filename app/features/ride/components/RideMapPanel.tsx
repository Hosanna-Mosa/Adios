import React from "react";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from "@/components/maps";
import MapViewDirections from "@/components/maps/MapViewDirections";
import { fadeIn } from "@/motion/presets";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { router } from "expo-router";
import Animated from "react-native-reanimated";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

import type { Props } from "./RideMapPanel.props";
import { RIDE_STOP_ANCHOR, rideStopMarker, vehicleMarkerIcon } from "@/components/mapBackground.utils";

export function RideMapPanel(props: Props) {
  const { GOOGLE_MAPS_APIKEY, dropCoords, dropIsValid,
  fitTripToMap, getDisplayName, handleAddStopFromMap, handleRecenter, handleShareRoute,
  initialRegion, insets, mapRef, nearbyDrivers, params, pickupCoords, pickupIsValid,
  routeCoordinates, selectedFare, selectedTier, setMapReady, styles, tokens, tripCoordinates,
  userLocation, validStops } = props;
  const { t } = useTranslation();
  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        zoomEnabled scrollEnabled pitchEnabled rotateEnabled zoomTapEnabled
        showsUserLocation={false}
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
      >
        {routeCoordinates.length > tripCoordinates.length && (
          <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor={tokens.text} />
        )}
        {GOOGLE_MAPS_APIKEY && pickupIsValid && dropIsValid && (
          <MapViewDirections
            origin={pickupCoords}
            destination={dropCoords}
            waypoints={validStops.map((s: any) => ({ latitude: s.latitude, longitude: s.longitude }))}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor={tokens.text}
            optimizeWaypoints
            onReady={() => fitTripToMap(true)}
            onError={(errorMessage) => { console.warn("Map directions failed:", errorMessage); fitTripToMap(true); }}
          />
        )}

        {nearbyDrivers.map((driver) => {
          const vehicleType = (driver.vehicleType || "bike").toLowerCase();
          const isAutoVehicle = vehicleType.includes("auto");
          if ((selectedTier === "auto") !== isAutoVehicle) return null;
          return (
            // image prop, not an <Image> child: see vehicleMarkerIcon (Android hardware-bitmap crash).
            <Marker
              key={driver.id}
              coordinate={{ latitude: Number(driver.lat), longitude: Number(driver.lng) }}
              anchor={{ x: 0.5, y: 0.5 }}
              image={vehicleMarkerIcon(isAutoVehicle ? "auto" : "bike")}
            />
          );
        })}

        {pickupIsValid && (
          // Bubble via `image` (a custom view gets cut off on Android); the Callout still opens on tap.
          <Marker coordinate={pickupCoords} image={rideStopMarker("pickup")} anchor={RIDE_STOP_ANCHOR} zIndex={3}>
            <Callout tooltip onPress={() => router.back()}>
              <View style={styles.locationBubble}>
                <Text style={styles.locationBubbleText} numberOfLines={1}>{getDisplayName(params.pickupName)}</Text>
                <View style={styles.editBubbleBtn}><Feather name="edit-2" size={10} color={tokens.text} /></View>
              </View>
            </Callout>
          </Marker>
        )}

        {validStops.map((stop: any, index: number) => (
          <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
            <View collapsable={false} style={styles.stopPin}><Text style={styles.stopPinText}>{index + 1}</Text></View>
            <Callout tooltip><View style={styles.locationBubble}><Text style={styles.locationBubbleText} numberOfLines={1}>{getDisplayName(stop.name)}</Text></View></Callout>
          </Marker>
        ))}

        {dropIsValid && (
          <Marker coordinate={dropCoords} image={rideStopMarker("drop")} anchor={RIDE_STOP_ANCHOR} zIndex={3}>
            <Callout tooltip onPress={() => router.back()}>
              <View style={styles.locationBubble}>
                <Text style={styles.locationBubbleText} numberOfLines={1}>{getDisplayName(params.dropName)}</Text>
                <View style={styles.editBubbleBtn}><Feather name="edit-2" size={10} color={tokens.text} /></View>
              </View>
            </Callout>
          </Marker>
        )}

        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
            <View collapsable={false} style={styles.userPin}><View style={styles.pinInnerDot} /></View>
            <Callout tooltip><View style={styles.locationBubble}><Text style={styles.locationBubbleText}>{t("app.ride.myLocation")}</Text></View></Callout>
          </Marker>
        )}
      </MapView>

      <Animated.View style={[styles.mapOverlay, { top: insets.top + 10 }]} entering={fadeIn(0)}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.toolCircleBtn} onPress={handleShareRoute}>
            <Ionicons name="share-social-outline" size={17} color={tokens.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCircleBtn} onPress={handleRecenter}>
            <Ionicons name="locate" size={17} color={tokens.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCircleBtn} onPress={handleAddStopFromMap}>
            <Ionicons name="add" size={20} color={tokens.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={styles.routeChip} entering={fadeIn(60)}>
        <Text style={styles.routeChipMain} numberOfLines={1}>{getDisplayName(params.pickupName)} → {getDisplayName(params.dropName)}</Text>
        {selectedFare && (
          <Text style={styles.routeChipSub}>{selectedFare.distanceInKm.toFixed(1)} km · about {selectedFare.estimatedMinutes} min</Text>
        )}
      </Animated.View>
    </View>
  );
}
