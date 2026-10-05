import React from "react";
import { Marker } from "@/components/maps";
import { driverMarkerLook } from "@/components/mapBackground.utils";

// The live driver pins on the map. Moved out of components/MapBackground.tsx
// unchanged, including the filtering rules: cabs are hidden for now, and the
// selected service decides whether autos or scooters are shown — never both.

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

          // image prop, not an <Image> child: see vehicleMarkerIcon (Android hardware-bitmap crash).
          const look = driverMarkerLook(vehicleType, { heading: driver.heading });
          return (
            <Marker
              key={driver.id || driver._id}
              coordinate={{ latitude: Number(driver.lat), longitude: Number(driver.lng) }}
              anchor={look.anchor}
              title={driver.name || "Driver"}
              image={look.image}
            />
          );
        })}
    </>
  );
}
