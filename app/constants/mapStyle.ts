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
