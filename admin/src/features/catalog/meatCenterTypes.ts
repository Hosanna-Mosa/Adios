import type { OpenState, WeeklyHours } from "@/components/shared/hoursUtils";

export interface MeatCenter {
  _id: string;
  name: string;
  address: string;
  rating: number;
  reviews: string;
  phone: string;
  image: string;
  isManuallyClosed?: boolean;
  openingHours?: WeeklyHours;
  openState?: OpenState;
}

export interface EditMeatCenterForm {
  name: string;
  phone: string;
  address: string;
  isManuallyClosed: boolean;
}

export interface NewMeatCenterForm {
  name: string;
  phone: string;
  email: string;
  password: string;
  categories: string[];
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
}
