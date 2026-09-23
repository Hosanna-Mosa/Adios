import i18n from "@/i18n";
import type { Hotspot } from "./components/HighDemandAreas";

/** Shown until the live hotspot feed answers, and again if it fails.
 * Place names/addresses are real-world proper nouns and are not translated;
 * only the surge multiplier's "Surge" label is. */
export function getFallbackHotspots(): Hotspot[] {
  const surge = (multiplier: string) =>
    i18n.t("jobs.surgeMultiplier", { value: multiplier, defaultValue: "{{value}}x Surge" });

  return [
    {
      id: "fallback-kr-market",
      name: "KR Market",
      address: "KR Market, Huriopet, Chickpet, Bengaluru, Karnataka",
      lat: 12.9616,
      lng: 77.5769,
      surge: surge("1.5"),
    },
    {
      id: "fallback-kempegowda-airport",
      name: "Kempegowda Airport",
      address: "Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka",
      lat: 13.1986,
      lng: 77.7066,
      surge: surge("1.3"),
    },
    {
      id: "fallback-orion-mall",
      name: "Orion Mall",
      address: "Orion Mall, Dr Rajkumar Road, Rajajinagar, Bengaluru, Karnataka",
      lat: 13.0112,
      lng: 77.5549,
      surge: surge("1.2"),
    },
  ];
}
