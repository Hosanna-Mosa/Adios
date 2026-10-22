import type { MapStyleElement } from "react-native-maps";

/** Warm neutral base map in the app's orange palette (was green-tinted). */
export const LIGHT_WARM_MAP_STYLE: MapStyleElement[] = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#56505E" }] },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 2 }],
  },
  { featureType: "all", elementType: "labels.icon", stylers: [{ saturation: -20 }, { lightness: 15 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#FAF8F5" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#F0ECE6" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#FDF0E2" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E4DFD7" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#CFC8BC" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#EDE8E0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#DCEBF5" }] },
];

/** Night base map so dark-mode screens don't sit on a bright map. */
export const DARK_MAP_STYLE: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];
