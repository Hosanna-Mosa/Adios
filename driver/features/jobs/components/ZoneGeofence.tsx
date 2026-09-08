import React from "react";
import { Circle, LatLng, Polygon } from "react-native-maps";
import { Colors } from "@/constants/colors";

/** The zone's coverage area — a drawn boundary, or a radius when the zone
 * is defined as a centre point. */
export function ZoneGeofence({
  isPolygon,
  coordinates,
  circleCenter,
  circleRadius,
}: {
  isPolygon: boolean;
  coordinates: LatLng[];
  circleCenter: LatLng;
  circleRadius: number;
}) {
  const fill = "rgba(0, 180, 198, 0.3)";

  if (isPolygon) {
    if (coordinates.length === 0) return null;
    return (
      <Polygon
        coordinates={coordinates}
        fillColor={fill}
        strokeColor={Colors.brand}
        strokeWidth={3}
      />
    );
  }

  return (
    <Circle
      center={circleCenter}
      radius={circleRadius}
      fillColor={fill}
      strokeColor={Colors.brand}
      strokeWidth={3}
    />
  );
}
