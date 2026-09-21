import React from "react";
import { Image } from "react-native";
import { Marker } from "@/components/maps";

// The live driver pins on the map. Moved out of components/MapBackground.tsx
// unchanged, including the filtering rules: cabs are hidden for now, and the
// selected service decides whether autos or scooters are shown — never both.

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");

interface Props {
  driverMarkers: any[];
  selectedService: string | null;
}

export function MapDriverMarkers({ driverMarkers, selectedService }: Props) {
  return (
    <>
              {driverMarkers.map((driver) => {
          const vehicleType = (driver.vehicleType || driver.vehicle || "bike").toLowerCase();

          // Disable car/cab markers for now
          if (vehicleType.includes("car") || vehicleType.includes("cab") || vehicleType.includes("prime")) {
            return null;
          }

          const isAutoVehicle = vehicleType.includes("auto") || vehicleType.includes("rickshaw");
          const isAutoService = selectedService === "auto";

          // If selected service is auto, only show auto drivers.
          // For all other cases (bike/default), show only scooty drivers.
          if (isAutoService) {
            if (!isAutoVehicle) return null;
          } else {
            if (isAutoVehicle) return null;
          }

          let markerImage = isAutoVehicle ? VEHICLE_AUTO_3D : VEHICLE_BIKE_3D;

          return (
            <Marker
              key={driver.id || driver._id}
              coordinate={{ latitude: Number(driver.lat), longitude: Number(driver.lng) }}
              anchor={{ x: 0.5, y: 0.5 }}
              title={driver.name || "Driver"}
            >
              <Image
                source={markerImage}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}
    </>
  );
}
