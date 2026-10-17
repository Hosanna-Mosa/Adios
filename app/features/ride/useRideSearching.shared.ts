

// Module-level values shared by the parts of useRideSearching.

export const normalizeServiceType = (serviceId?: string) => {
  if (serviceId === "bike-lite") return "bike";
  // if (serviceId === "cab-prime") return "cab_prime";
  if (serviceId === "bike" || serviceId === "auto" || serviceId === "cab") {
    return serviceId;
  }
  return "cab";
};

/** The fare card's icon for the vehicle actually booked (it always showed a motorbike). */
export const rideVehicleIcon = (serviceId?: string): "motorbike" | "rickshaw" | "car" => {
  const type = normalizeServiceType(serviceId);
  return type === "bike" ? "motorbike" : type === "auto" ? "rickshaw" : "car";
};

export const parseFare = (value?: string, fallback?: string) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return Math.round(numeric);
  const fromPrice = Number(String(fallback || "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(fromPrice) && fromPrice > 0) return Math.round(fromPrice);
  return 25;
};
