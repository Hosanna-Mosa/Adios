import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Polygon, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useDriverStore } from "@/store/driverStore";
import Colors from "@/constants/colors";

// Default fallback to Rajahmundry coordinates if undefined
const DEFAULT_LAT = 16.9891;
const DEFAULT_LNG = 81.7836;

export default function ZoneMapScreen() {
  const insets = useSafeAreaInsets();
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!zoneId) {
        setError("Invalid Zone ID provided");
        setLoading(false);
        return;
      }
      try {
        const token = useDriverStore.getState().token;
        const apiUri = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        const res = await fetch(`${apiUri}/zones/${zoneId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to retrieve zone details");
        }
        const result = await res.json();
        setZone(result.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load zone map");
      } finally {
        setLoading(false);
      }
    })();
  }, [zoneId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={styles.loadingText}>Loading operational geofence map...</Text>
      </View>
    );
  }

  if (error || !zone) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-triangle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || "Zone data could not be fetched"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Onboarding</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate Map center coordinate
  let initialRegion = {
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  let mapCoordinates: any[] = [];
  let isPolygon = zone.type === "polygon";
  let circleCenter = { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG };
  let circleRadius = 1000;

  if (isPolygon && zone.boundary?.coordinates?.[0]) {
    mapCoordinates = zone.boundary.coordinates[0].map(([lng, lat]: any) => ({
      latitude: Number(lat),
      longitude: Number(lng),
    }));

    if (mapCoordinates.length > 0) {
      initialRegion.latitude = mapCoordinates[0].latitude;
      initialRegion.longitude = mapCoordinates[0].longitude;
    }
  } else if (zone.type === "circle" && zone.center?.coordinates) {
    circleCenter = {
      latitude: Number(zone.center.coordinates[1]),
      longitude: Number(zone.center.coordinates[0]),
    };
    circleRadius = Number(zone.radius) || 1000;
    initialRegion.latitude = circleCenter.latitude;
    initialRegion.longitude = circleCenter.longitude;
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {isPolygon && mapCoordinates.length > 0 && (
          <Polygon
            coordinates={mapCoordinates}
            fillColor="rgba(0, 180, 198, 0.3)"
            strokeColor={Colors.brand}
            strokeWidth={3}
          />
        )}
        {!isPolygon && (
          <Circle
            center={circleCenter}
            radius={circleRadius}
            fillColor="rgba(0, 180, 198, 0.3)"
            strokeColor={Colors.brand}
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Map Floating Header overlay */}
      {/* Was a hardcoded top: 48, which is under the status bar on any device
          with a taller inset (notch/punch-hole) now that the bar is translucent. */}
      <View style={[styles.headerOverlay, { top: insets.top + 12 }]}>
        <TouchableOpacity style={styles.roundBackBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{zone.name}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {zone.description || "Operational geofence coverage area."}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.brand,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  headerOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  roundBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
