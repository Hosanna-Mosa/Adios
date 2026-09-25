import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, router } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import {
  ZoneGeofence,
  ZoneMapError,
  ZoneMapLoading,
  ZoneMapOverlay,
} from "@/features/jobs/components";
import { styles } from "@/features/jobs/zone-map.styles";
import { Box } from "@/components/ui/Box";

// Default fallback to Rajahmundry coordinates if undefined
const DEFAULT_LAT = 16.9891;
const DEFAULT_LNG = 81.7836;

export default function ZoneMapScreen() {
  const { t } = useTranslation();
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!zoneId) {
        setError(t("jobs.invalidZoneIdProvided"));
        setLoading(false);
        return;
      }
      try {
        const token = useDriverStore.getState().token;
        const apiUri = API_URL;
        const res = await fetch(`${apiUri}/zones/${zoneId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(t("jobs.failedToRetrieveZoneDetails"));
        }
        const result = await res.json();
        setZone(result.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("jobs.failedToLoadZoneMap"));
      } finally {
        setLoading(false);
      }
    })();
  }, [zoneId, t]);

  if (loading) {
    return <ZoneMapLoading message={t("jobs.loadingOperationalGeofenceMap")} />;
  }

  if (error || !zone) {
    return (
      <ZoneMapError
        message={error || t("jobs.zoneDataCouldNotBeFetched")}
        actionLabel={t("jobs.backToOnboarding")}
        onAction={() => router.back()}
      />
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
    <Box style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        <ZoneGeofence
          isPolygon={isPolygon}
          coordinates={mapCoordinates}
          circleCenter={circleCenter}
          circleRadius={circleRadius}
        />
      </MapView>

      <ZoneMapOverlay
        name={zone.name}
        description={zone.description}
        onBack={() => router.back()}
      />
    </Box>
  );
}
