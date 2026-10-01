// Decodes Google's encoded-polyline format into coordinates.
// Moved out of components/MapBackground.tsx unchanged.

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");
const VEHICLE_CAB_3D = require("@/assets/images/services/cab.png");

/** Picks the top-down vehicle art for a vehicle/service name, e.g. "auto", "cab_prime". */
export const vehicleMarkerImage = (vehicleType?: string | null) => {
  const type = (vehicleType || "bike").toLowerCase();
  if (type.includes("auto") || type.includes("rickshaw")) return VEHICLE_AUTO_3D;
  if (type.includes("cab") || type.includes("car") || type.includes("prime")) return VEHICLE_CAB_3D;
  return VEHICLE_BIKE_3D;
};

// Utility to decode Google Polyline
export function decodePolyline(encoded: string) {
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    const p = {
      latitude: (lat / 1e5),
      longitude: (lng / 1e5),
    };
    poly.push(p);
  }
  return poly;
}
