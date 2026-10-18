import { StyleSheet } from "react-native";
import { type ThemeTokens } from "@/constants/colors";

// Part of the ride-searching.styles stylesheet, kept under the 150-line file limit.
// Migrated from the legacy `Colors` palette to `designTokens` (BUG-098) — see
// ride-searching.styles.ts for the mapping. Pixel sizes/radii/spacing are
// unchanged; only colors moved to tokens.

export const createRootStyles = (tokens: ThemeTokens, insets: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: tokens.surface,
    },
    // Visible for a frame before the map tiles paint — was a hardcoded light
    // grey that stayed light-grey in dark mode. tokens.sunken is the same
    // neutral-placeholder surface the rest of the app uses under images/maps.
    mapArea: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.sunken,
    },
    screenBackButton: {
      position: "absolute",
      top: insets.top + 12,
      left: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 8,
    },
    pickupMarkerWrap: {
      alignItems: "center",
    },
    pickupMarker: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: tokens.success,
      borderWidth: 3,
      borderColor: tokens.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    pickupDot: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: tokens.surface,
    },
    pickupStem: {
      width: 3,
      height: 24,
      backgroundColor: tokens.sec,
      marginTop: -1,
    },
    dropMarker: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: tokens.error,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: tokens.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    driverMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: tokens.brand,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: tokens.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dropMarkerInner: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: tokens.surface,
    },
    panel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24,
      justifyContent: "flex-end",
    },
  });
