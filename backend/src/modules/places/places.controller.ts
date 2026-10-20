import { Request, Response } from "express";
import { expandQueryVariants, interleaveSuggestions, mapNominatimResult, mergeSuggestions, type PlaceSuggestion } from "./places.search";

const GOOGLE_MAPS_APIKEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA";

// OpenStreetMap's public services ask every client to identify itself.
const OSM_USER_AGENT = "Adios/1.0 address autocomplete";
const MAX_SUGGESTIONS = 10;

/** GET + parse JSON, or null when the service is slow (6 s), down or answers badly. */
const fetchJson = async (url: string, headers?: Record<string, string>): Promise<any | null> => {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(6000) });
    return await response.json();
  } catch {
    return null;
  }
};

const isFiniteCoordinate = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue);
};

const getFirstAddressPart = (address: string) => address.split(",")[0]?.trim() || address;

const firstQueryValue = (value: unknown) => Array.isArray(value) ? value[0] : value;

const mapAutocompletePrediction = (p: any) => ({
  id: p.place_id,
  name: p.structured_formatting?.main_text || p.description,
  address: p.description,
  main_text: p.structured_formatting?.main_text,
  secondary_text: p.structured_formatting?.secondary_text,
  distance_meters: p.distance_meters,
  source: "places",
});

const mapGeocodeResult = (r: any) => ({
  id: r.place_id,
  name: r.address_components?.[0]?.long_name || getFirstAddressPart(r.formatted_address || ""),
  address: r.formatted_address || "",
  main_text: r.address_components?.[0]?.long_name || getFirstAddressPart(r.formatted_address || ""),
  secondary_text: (r.formatted_address || "").split(",").slice(1).join(",").trim(),
  lat: r.geometry?.location?.lat,
  lng: r.geometry?.location?.lng,
  source: "geocode",
});

const mapPhotonFeature = (feature: any) => {
  const props = feature.properties || {};
  const [lng, lat] = feature.geometry?.coordinates || [];
  const addressParts = [
    props.name,
    props.street,
    props.locality,
    props.city,
    props.county,
    props.state,
    props.country,
  ].filter(Boolean);
  const address = Array.from(new Set(addressParts)).join(", ");

  return {
    id: `photon:${props.osm_type || "x"}:${props.osm_id || `${lat},${lng}`}`,
    name: props.name || getFirstAddressPart(address),
    address,
    main_text: props.name || getFirstAddressPart(address),
    secondary_text: addressParts.slice(1).join(", "),
    lat: Number(lat),
    lng: Number(lng),
    source: "photon",
  };
};

const getBoundsParam = (lat: unknown, lng: unknown, radius: unknown) => {
  if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) return null;

  const latitude = Number(lat);
  const longitude = Number(lng);
  const radiusKm = Math.min(Math.max(Number(radius) || 10000, 1000), 50000) / 1000;
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.max(Math.cos(latitude * Math.PI / 180), 0.2));

  return `${latitude - latDelta},${longitude - lngDelta}|${latitude + latDelta},${longitude + lngDelta}`;
};

export class PlacesController {
  static async getNearbyPlaces(req: Request, res: Response) {
    const { lat, lng, radius = 5000, type, keyword } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    try {
      const typeParam = type ? `&type=${type}` : "";
      const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword as string)}` : "";
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}${typeParam}${keywordParam}&key=${GOOGLE_MAPS_APIKEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("GOOGLE NEARBY ERROR:", data);
        return res.status(500).json({ message: "Error fetching from Google Places", status: data.status });
      }

      const places = (data.results || []).map((item: any) => ({
        id: item.place_id,
        name: item.name,
        address: item.vicinity || item.formatted_address,
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng,
        rating: item.rating,
        user_ratings_total: item.user_ratings_total,
        type: item.types?.[0] || 'place',
        open_now: item.opening_hours?.open_now,
        price_level: item.price_level,
        photo_reference: item.photos?.[0]?.photo_reference
      }));

      res.json(places);
    } catch (error) {
      console.error("Places API Error:", error);
      res.status(500).json({ message: "Internal server error fetching places" });
    }
  }


  static async getAutocompleteSuggestions(req: Request, res: Response) {
    const { input, lat, lng, radius = 10000 } = req.query;
    const radiusValue = firstQueryValue(radius) ?? 10000;
    const inputText = String(input || "").trim();
    if (!inputText) {
      return res.status(400).json({ message: "input query param is required" });
    }

    try {
      const hasPoint = isFiniteCoordinate(lat) && isFiniteCoordinate(lng);
      // The typed text, then other ways of writing it ("busstand" -> "bus station", the two
      // spellings of Telugu town names): small places are often listed under those.
      const variants = expandQueryVariants(inputText, 4);

      const googleAutocomplete = async (text: string): Promise<PlaceSuggestion[]> => {
        const params = new URLSearchParams({ input: text, language: "en", components: "country:in", key: GOOGLE_MAPS_APIKEY });
        if (hasPoint) {
          params.set("location", `${lat},${lng}`);
          params.set("radius", String(radiusValue));
          params.set("origin", `${lat},${lng}`);
        }
        const data = await fetchJson(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`);
        if (data?.status === "OK") return (data.predictions || []).map(mapAutocompletePrediction);
        if (data && data.status !== "ZERO_RESULTS") {
          console.warn("GOOGLE AUTOCOMPLETE ERROR:", { status: data.status, error_message: data.error_message });
        }
        return [];
      };

      const googleGeocode = async (text: string): Promise<PlaceSuggestion[]> => {
        const params = new URLSearchParams({ address: text, components: "country:IN", key: GOOGLE_MAPS_APIKEY });
        const bounds = getBoundsParam(lat, lng, radiusValue);
        if (bounds) params.set("bounds", bounds);
        const data = await fetchJson(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
        if (data?.status === "OK") return (data.results || []).slice(0, 8).map(mapGeocodeResult);
        if (data && data.status !== "ZERO_RESULTS") {
          console.warn("GOOGLE GEOCODE FALLBACK ERROR:", { status: data.status, error_message: data.error_message });
        }
        return [];
      };

      const photonSearch = async (text: string): Promise<PlaceSuggestion[]> => {
        const params = new URLSearchParams({ q: `${text} India`, limit: "10", lang: "en" });
        if (hasPoint) {
          params.set("lat", String(lat));
          params.set("lon", String(lng));
        }
        const data = await fetchJson(`https://photon.komoot.io/api/?${params.toString()}`, { "User-Agent": OSM_USER_AGENT });
        const found = (data?.features || [])
          .map(mapPhotonFeature)
          .filter((item: any) => item.address && Number.isFinite(item.lat) && Number.isFinite(item.lng));
        const indian = found.filter((item: any) => item.address.toLowerCase().includes("india"));
        return indian.length > 0 ? indian : found;
      };

      const nominatimSearch = async (text: string): Promise<PlaceSuggestion[]> => {
        const params = new URLSearchParams({ format: "jsonv2", countrycodes: "in", limit: "8", q: text });
        const data = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { "User-Agent": OSM_USER_AGENT });
        return Array.isArray(data) ? data.map(mapNominatimResult).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)) : [];
      };

      // 1. Google's own suggestions — shown first, as before.
      let results = await googleAutocomplete(inputText);
      if (results.length < 5 && variants.length > 1) {
        results = mergeSuggestions([results, await googleAutocomplete(variants[1])], MAX_SUGGESTIONS);
      }
      if (results.length >= 6) return res.json(results.slice(0, MAX_SUGGESTIONS));

      // 2. Too few: add Google's geocoder and the OpenStreetMap-based searches (Photon and
      // Nominatim, which lists bus stations, stops and shops that Photon often misses). Each
      // spelling gets a fair share of the slots. Nominatim is a shared public service, so only
      // the typed text and its best alternative are sent, one request each.
      const [geocoded, photon, nominatim] = await Promise.all([
        googleGeocode(inputText),
        Promise.all(variants.map(photonSearch)),
        Promise.all(variants.slice(0, 2).map(nominatimSearch)),
      ]);
      results = mergeSuggestions(
        [results, geocoded, interleaveSuggestions([...nominatim, ...photon])],
        MAX_SUGGESTIONS,
      );

      return res.json(results);
    } catch (error) {
      console.error("Autocomplete API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getPlaceDetails(req: Request, res: Response) {
    const placeId = String(req.params.placeId || "");
    if (!placeId) {
      return res.status(400).json({ message: "placeId param is required" });
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        return res.json({
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        });
      }

      console.warn("GOOGLE PLACE DETAILS ERROR:", { status: data.status, error_message: data.error_message });

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_MAPS_APIKEY}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === "OK" && geocodeData.results?.[0]?.geometry?.location) {
        return res.json({
          lat: geocodeData.results[0].geometry.location.lat,
          lng: geocodeData.results[0].geometry.location.lng,
        });
      }

      return res.status(500).json({ message: "Error from Google Place Details", status: data.status });
    } catch (error) {
      console.error("Place Details API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  static async reverseGeocode(req: Request, res: Response) {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("GOOGLE GEOCODE ERROR:", data);
        return res.status(500).json({ message: "Error from Google Geocoding", status: data.status, detail: data.error_message });
      }


      const results = (data.results || []).map((r: any) => ({
        address: r.formatted_address || r.vicinity || "Unknown location",
        placeId: r.place_id,
        raw: r // Temporary for debugging
      }));

      console.log(`Geocoded ${lat},${lng} to:`, results[0]?.address);
      res.json(results);
    } catch (error) {
      console.error("Geocoding API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}


