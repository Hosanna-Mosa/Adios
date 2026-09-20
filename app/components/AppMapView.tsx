import React, { forwardRef } from "react";
import MapView, { PROVIDER_GOOGLE, type MapViewProps } from "react-native-maps";

// Thin wrapper so callers (e.g. map-picker.tsx) import this instead of
// react-native-maps directly — lets AppMapView.web.tsx stand in in web
// bundles, where react-native-maps has no implementation at all.
const AppMapView = forwardRef<MapView, MapViewProps>((props, ref) => (
  <MapView ref={ref} provider={PROVIDER_GOOGLE} {...props} />
));
AppMapView.displayName = "AppMapView";

export default AppMapView;
