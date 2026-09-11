import React from "react";

// Props for RideMapPanel, kept beside it so neither file passes 150 lines.

export interface Props {
  VEHICLE_BIKE_3D: any;
  VEHICLE_AUTO_3D: any;
  GOOGLE_MAPS_APIKEY: any;
  dropCoords: any;
  dropIsValid: any;
  fitTripToMap: any;
  getDisplayName: any;
  handleAddStopFromMap: any;
  handleRecenter: any;
  handleShareRoute: any;
  initialRegion: any;
  insets: any;
  mapRef: any;
  nearbyDrivers: any[];
  params: any;
  pickupCoords: any;
  pickupIsValid: any;
  routeCoordinates: any;
  selectedFare: any;
  selectedTier: any;
  setMapReady: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tokens: any;
  tripCoordinates: any;
  userLocation: any;
  validStops: any[];
}
