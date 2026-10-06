import React from "react";
import { Polyline } from "react-native-maps";
import { Colors } from "@/constants/colors";
import i18n from "@/i18n";

// Pieces of ActiveOrderMap, split out to keep it under 150 lines.

// Pre-sized PNGs (@1x/@2x/@3x) passed through `image`: a custom-view marker is
// snapshotted on a software canvas on Android, which crashes on hardware bitmaps.
export const RESTAURANT_MARKER = require("@/assets/images/markers/marker_restaurant.png");
export const CUSTOMER_MARKER = require("@/assets/images/markers/marker_home.png");
// Both buildings stand on their stop: ground under the front corner is 170 of 192 px down.
export const BUILDING_ANCHOR = { x: 0.5, y: 170 / 192 };

// Rides: a green "Pickup" and a red "Drop" bubble, the same images as the customer
// app, one per app language (rendered in a browser for real Telugu / Devanagari
// shaping; a text view inside a marker gets cut off on Android). 96x42 dp; the
// pointer's tip, which marks the spot, is at (48, 38).
const RIDE_STOP_BUBBLES = {
  pickup: {
    en: require("@/assets/images/markers/marker_pickup_en.png"),
    hi: require("@/assets/images/markers/marker_pickup_hi.png"),
    te: require("@/assets/images/markers/marker_pickup_te.png"),
  },
  drop: {
    en: require("@/assets/images/markers/marker_drop_en.png"),
    hi: require("@/assets/images/markers/marker_drop_hi.png"),
    te: require("@/assets/images/markers/marker_drop_te.png"),
  },
};
export const RIDE_STOP_ANCHOR = { x: 0.5, y: 38 / 42 };

/** The ride pickup / drop bubble in the app's current language. */
export function rideStopMarker(kind: "pickup" | "drop") {
  const lang = String(i18n.language || "en").slice(0, 2) as "en" | "hi" | "te";
  return RIDE_STOP_BUBBLES[kind][lang] ?? RIDE_STOP_BUBBLES[kind].en;
}

/** The route to follow: brand line with a darker edge, so it reads over any road colour. */
export function RouteLine({ coordinates }: { coordinates: { latitude: number; longitude: number }[] }) {
  return (
    <>
      <Polyline coordinates={coordinates} strokeWidth={9} strokeColor={Colors.primaryDark} zIndex={2} />
      <Polyline coordinates={coordinates} strokeWidth={6} strokeColor={Colors.brand} zIndex={3} />
    </>
  );
}
