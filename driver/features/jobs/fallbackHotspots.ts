import type { Hotspot } from "./components/HighDemandAreas";

/** Shown until the live hotspot feed answers, and again if it fails. */
export const fallbackHotspots: Hotspot[] = [
  {
    id: "fallback-kr-market",
    name: "KR Market",
    address: "KR Market, Huriopet, Chickpet, Bengaluru, Karnataka",
    lat: 12.9616,
    lng: 77.5769,
    surge: "1.5x Surge",
  },
  {
    id: "fallback-kempegowda-airport",
    name: "Kempegowda Airport",
    address: "Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka",
    lat: 13.1986,
    lng: 77.7066,
    surge: "1.3x Surge",
  },
  {
    id: "fallback-orion-mall",
    name: "Orion Mall",
    address: "Orion Mall, Dr Rajkumar Road, Rajajinagar, Bengaluru, Karnataka",
    lat: 13.0112,
    lng: 77.5549,
    surge: "1.2x Surge",
  },
];
