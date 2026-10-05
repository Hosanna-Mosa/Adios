import i18n from "@/i18n";

// Decodes Google's encoded-polyline format into coordinates.
// Moved out of components/MapBackground.tsx unchanged.


// Pre-sized map-marker icons (40×40 dp, with @2x/@3x variants) for <Marker image={…}>.
// Markers must NOT render an <Image> child on Android: react-native-maps snapshots
// custom marker children on a software canvas, and an image decoded as a hardware
// bitmap crashes it ("Software rendering doesn't support hardware bitmaps"). The
// `image` prop path converts hardware bitmaps itself, so it is safe.
const MARKER_BIKE = require("@/assets/images/markers/marker_bike.png");
const MARKER_AUTO = require("@/assets/images/markers/marker_auto.png");
const MARKER_CAB = require("@/assets/images/markers/marker_cab.png");
// The 3D delivery rider seen from above, facing up (north) so the map can turn it
// to the heading; 48x48 dp, centred. Same palette as the rider sticker below.
const MARKER_RIDER_TOP = require("@/assets/images/markers/marker_rider_top.png");

// Food / meat orders: the outlet as a 3D restaurant and the delivery address as a
// 3D home (same artwork as the driver app). 168x192 px @3x; both stand on their
// stop, which is the ground under the front corner, 170 of 192 px down.
export const RESTAURANT_MARKER = require("@/assets/images/markers/marker_restaurant.png");
export const HOME_MARKER = require("@/assets/images/markers/marker_home.png");
export const BUILDING_ANCHOR = { x: 0.5, y: 170 / 192 };

// Rides: a green "Pickup" and a red "Drop" bubble, pre-rendered per app language
// (source: scratch render of the bubble in a browser, for real Telugu / Devanagari
// shaping). Drawn as views they were cut off on Android, which snapshots a custom
// marker before its text has its full width. 96x42 dp; the pointer tip is (48, 38).
const RIDE_STOP_BUBBLES = {
  pickup: {
    en: require("@/assets/images/markers/marker_pickup_en.png"),
    hi: require("@/assets/images/markers/marker_pickup_hi.png"),
    te: require("@/assets/images/markers/marker_pickup_te.png"),
  },
  drop: {
    en: require("@/assets/images/markers/marker_drop_en.png"),
    hi: require("@/assets/images/markers/marker_drop_hi.png"),
    te: require("@/assets/images/markers/marker_drop_te.png"),
  },
};
export const RIDE_STOP_ANCHOR = { x: 0.5, y: 38 / 42 };

/** The ride pickup / drop bubble image in the app's current language. */
export function rideStopMarker(kind: "pickup" | "drop") {
  const lang = String(i18n.language || "en").slice(0, 2) as "en" | "hi" | "te";
  return RIDE_STOP_BUBBLES[kind][lang] ?? RIDE_STOP_BUBBLES[kind].en;
}

// Bike riders on the customer's map. "topview" draws the 3D delivery rider from
// above, turning with the heading like the other top-down vehicles; "sticker" is
// the same rider from the side, upright and facing the way they travel; "classic"
// is the old top-down blue scooter. Autos and cabs keep their own icons.
export const RIDER_MARKER_STYLE: "topview" | "sticker" | "classic" = "topview";

/** Map-marker icon for a vehicle/service name, e.g. "auto", "cab_prime". */
export const vehicleMarkerIcon = (vehicleType?: string | null) => {
  const type = (vehicleType || "bike").toLowerCase();
  if (type.includes("auto") || type.includes("rickshaw")) return MARKER_AUTO;
  if (type.includes("cab") || type.includes("car") || type.includes("prime")) return MARKER_CAB;
  return RIDER_MARKER_STYLE === "topview" ? MARKER_RIDER_TOP : MARKER_BIKE;
};

// 56x52 dp (168x156 px @3x). The rider stands on the ground under the wheels,
// 28 across and 47 down. Source: assets/images/markers/source/rider.svg, rendered
// at 1x/2x/3x (and mirrored for left) in a browser with a transparent background.
const RIDER_RIGHT = require("@/assets/images/markers/marker_rider_right.png");
const RIDER_LEFT = require("@/assets/images/markers/marker_rider_left.png");
const RIDER_ANCHOR = { x: 28 / 56, y: 47 / 52 };

export type RiderFacing = "left" | "right";

const isTwoWheeler = (vehicleType?: string | null) => {
  const icon = vehicleMarkerIcon(vehicleType);
  return icon !== MARKER_AUTO && icon !== MARKER_CAB;
};

/**
 * Which way the sticker faces for a compass heading (0 = north, 90 = east). Headings
 * close to due north/south keep the previous facing, so a rider going straight up the
 * screen doesn't flip back and forth on every GPS wobble.
 */
export function riderFacing(heading: number | null | undefined, previous: RiderFacing = "right"): RiderFacing {
  if (heading == null || Number.isNaN(Number(heading))) return previous;
  const h = ((Number(heading) % 360) + 360) % 360;
  if (h > 20 && h < 160) return "right";
  if (h > 200 && h < 340) return "left";
  return previous;
}

/**
 * Marker props for a driver's pin. With the "sticker" style bike riders are drawn
 * upright and never rotated. Everything else is a top-down icon that turns with the
 * heading when `rotateWithHeading` is set (the live tracking pin); the "topview"
 * rider also turns for nearby riders whenever their heading is known.
 */
export function driverMarkerLook(
  vehicleType: string | null | undefined,
  opts: { heading?: number | null; facing?: RiderFacing; rotateWithHeading?: boolean } = {},
) {
  if (RIDER_MARKER_STYLE === "sticker" && isTwoWheeler(vehicleType)) {
    const facing = opts.facing ?? riderFacing(opts.heading);
    return { image: facing === "left" ? RIDER_LEFT : RIDER_RIGHT, anchor: RIDER_ANCHOR, flat: false, rotation: 0 };
  }
  const turn =
    !!opts.rotateWithHeading ||
    (RIDER_MARKER_STYLE === "topview" && isTwoWheeler(vehicleType) && opts.heading != null);
  return {
    image: vehicleMarkerIcon(vehicleType),
    anchor: { x: 0.5, y: 0.5 },
    flat: turn,
    rotation: turn ? Number(opts.heading) || 0 : 0,
  };
}

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
