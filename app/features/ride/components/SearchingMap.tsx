import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "@/components/maps";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Moved out of app/ride-searching.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  VEHICLE_CAB_3D: any;
  VEHICLE_BIKE_3D: any;
  VEHICLE_AUTO_3D: any;
  colors: any;
  dropCoords: any;
  fitTripMarkers: any;
  mapRef: any;
  onlineDrivers: any[];
  pickupCoords: any;
  styles: any;
}

export function SearchingMap({
  VEHICLE_CAB_3D,
  VEHICLE_BIKE_3D,
  VEHICLE_AUTO_3D,
  colors,
  dropCoords,
  fitTripMarkers,
  mapRef,
  onlineDrivers,
  pickupCoords,
  styles,
}: Props) {
  return (
    <View style={styles.mapArea}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...pickupCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsCompass={false}
        showsMyLocationButton={false}
        onMapReady={fitTripMarkers}
      >
        <Circle
          center={pickupCoords}
          radius={170}
          fillColor="rgba(61, 132, 215, 0.12)"
          strokeColor="rgba(61, 132, 215, 0.08)"
          strokeWidth={1}
        />
        <Circle
          center={pickupCoords}
          radius={86}
          fillColor="rgba(61, 132, 215, 0.22)"
          strokeColor="rgba(61, 132, 215, 0.18)"
          strokeWidth={1}
        />
        <Marker coordinate={dropCoords} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.dropMarker}>
            <View style={styles.dropMarkerInner} />
          </View>
        </Marker>
        {onlineDrivers.map((drv) => {
          const coords = drv.currentLocation?.coordinates;
          if (
            !coords ||
            coords.length < 2 ||
            typeof coords[0] !== "number" ||
            typeof coords[1] !== "number" ||
            Number.isNaN(coords[0]) ||
            Number.isNaN(coords[1]) ||
            (coords[0] === 0 && coords[1] === 0)
          ) {
            return null;
          }
          return (
            <Marker
              key={drv._id}
              coordinate={{
                latitude: coords[1],
                longitude: coords[0],
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image
                source={
                  drv.vehicleType === "auto"
                    ? VEHICLE_AUTO_3D
                    : drv.vehicleType === "car"
                    ? VEHICLE_CAB_3D
                    : VEHICLE_BIKE_3D
                }
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}
        <Marker coordinate={pickupCoords} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.pickupMarkerWrap}>
            <View style={styles.pickupMarker}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.pickupStem} />
          </View>
        </Marker>
      </MapView>
      <TouchableOpacity
        style={styles.screenBackButton}
        activeOpacity={0.85}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}
