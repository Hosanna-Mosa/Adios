import type { MapStyleElement } from "react-native-maps";

/** Warm neutral base map in the app's burgundy palette (was green-tinted). */
export const LIGHT_WARM_MAP_STYLE: MapStyleElement[] = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#667085" }] },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 2 }],
  },
  { featureType: "all", elementType: "labels.icon", stylers: [{ saturation: -20 }, { lightness: 15 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#FCF6F6" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#FCEEF2" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#FCEEF2" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E8E5E7" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#D2CDD0" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#F3EEF0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#DCEBF5" }] },
];
