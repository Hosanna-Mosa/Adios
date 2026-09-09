export interface AdminZoneActiveHours {
  start: string;
  end: string;
}

export interface AdminZone {
  _id: string;
  name: string;
  type: "polygon" | "circle";
  pricingMultiplier: number;
  isActive: boolean;
  description?: string;
  allowedServices?: string[];
  autoSurgeEnabled?: boolean;
  currentSurge?: number;
  supplyCount?: number;
  demandCount?: number;
  activeHours?: AdminZoneActiveHours;
  center?: { coordinates?: [number, number] };
  boundary?: { coordinates?: [number, number][][] };
  radius?: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NewZonePayload {
  name: string;
  type: "polygon" | "circle";
  pricingMultiplier: number;
  isActive: boolean;
  description?: string;
  allowedServices?: string[];
  autoSurgeEnabled: boolean;
  activeHours?: AdminZoneActiveHours;
  center?: { coordinates: [number, number] };
  radius?: number;
  boundary?: { coordinates: [number, number][][] };
}
