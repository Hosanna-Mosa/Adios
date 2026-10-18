// Ride-searching showed a hardcoded "Bike" name/icon regardless of which
// service the customer actually picked (bike/auto/cab all look the same on
// this screen). Shared by SearchingPanel and BookAgainOverlayBike so both
// read the real selection instead of guessing.

export function vehicleIconFor(serviceId?: string): "motorbike" | "rickshaw" | "car" {
  if (serviceId === "auto") return "rickshaw";
  if (serviceId?.startsWith("cab")) return "car";
  return "motorbike";
}

export function vehicleNameKeyFor(serviceId?: string): "app.rideTierNames.bike" | "app.rideTierNames.auto" | "app.rideTierNames.cab" {
  if (serviceId === "auto") return "app.rideTierNames.auto";
  if (serviceId?.startsWith("cab")) return "app.rideTierNames.cab";
  return "app.rideTierNames.bike";
}
