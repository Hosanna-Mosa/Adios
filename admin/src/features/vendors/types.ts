// DayKey/WeeklyHours/OpenState/HoursDraft moved to components/shared/hoursUtils.ts
// once features/catalog/ (MeatCenters) needed the exact same shapes.
import type { HoursDraft, OpenState, WeeklyHours } from "@/components/shared/hoursUtils";
export type { HoursDraft, OpenState, WeeklyHours } from "@/components/shared/hoursUtils";

export interface VendorLegal {
  gstin?: string;
  panNumber?: string;
  fssaiNumber?: string;
  bankAccount?: string;
  ifsc?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  googlePlaceId: string;
  address: string;
  rating: number;
  reviews: string;
  isPureVeg: boolean;
  phone: string;
  email: string;
  commissionRate?: number;
  onboardingStatus?: string;
  isManuallyClosed?: boolean;
  openingHours?: WeeklyHours;
  openState?: OpenState;
  legal?: VendorLegal;
}

export interface EditVendorForm {
  name: string;
  email: string;
  phone: string;
  isPureVeg: boolean;
  address: string;
  isManuallyClosed: boolean;
}

export interface NewVendorForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  isPureVeg: boolean;
  country: string;
  state: string;
  city: string;
}

export interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
}
