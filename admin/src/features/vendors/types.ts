export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export type WeeklyHours = Partial<Record<DayKey, DayHours>>;

/** Server-evaluated open/closed verdict returned on every vendor row. */
export interface OpenState {
  isOpen: boolean;
  label: string;
  opensAt: string | null;
  today: string | null;
  week: { day: string; hours: string }[];
}

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

export type HoursDraft = Record<DayKey, { open: string; close: string; closed: boolean }>;

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
