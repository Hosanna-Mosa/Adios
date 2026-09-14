import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

// react-native-maps has no web implementation. This stub keeps every caller's
// props/ref/children usage safe on web (rendering a plain "not available"
// placeholder) instead of crashing the whole web bundle at import time.
export const PROVIDER_GOOGLE = "google" as unknown as undefined;
export const PROVIDER_DEFAULT = undefined;

type MapViewHandle = { animateToRegion: (region: unknown, duration?: number) => void };

const MapView = forwardRef<MapViewHandle, any>((props, ref) => {
  useImperativeHandle(ref, () => ({ animateToRegion: () => {} }));

  useEffect(() => {
    props.onMapReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { t } = useTranslation();

  return (
    <View style={[styles.placeholder, props.style]}>
      <Text style={styles.text}>{t("app.mapViewIsnapostAvailableOnWeb")}</Text>
    </View>
  );
});
MapView.displayName = "MapView";

export const Marker = (_props: any) => null;
export const Callout = (_props: any) => null;
export const Polyline = (_props: any) => null;
export const Circle = (_props: any) => null;

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#e5e5e5", padding: 24 },
  text: { textAlign: "center", color: "#555" },
});

export default MapView;
export type { Region, MapType, MapStyleElement } from "react-native-maps";
