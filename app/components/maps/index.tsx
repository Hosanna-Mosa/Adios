// Single import surface for react-native-maps across the app. Route/component
// files should import from "@/components/maps" instead of "react-native-maps"
// directly, so Metro can swap in index.web.tsx (a no-op stub) when bundling
// for web — react-native-maps has no web implementation and crashes the whole
// web bundle if imported directly from a file that's part of the web graph.
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker, Callout, Polyline, Circle } from "react-native-maps";

export default MapView;
export { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker, Callout, Polyline, Circle };
export type { Region, MapType, MapStyleElement } from "react-native-maps";
