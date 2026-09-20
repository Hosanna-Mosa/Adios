// Shared by app/restaurant-details.tsx and the vendor-details section
// components, so the screen and its parts agree on one shape.

export interface VendorDetails {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  detailedAddress?: { landmark?: string };
  rating: number;
  reviews: string;
  categories: string[];
  isPureVeg: boolean;
  isOpen: boolean;
  /** Server-evaluated schedule — see backend utils/openingHours.ts. */
  openState?: {
    isOpen: boolean;
    label: string;
    opensAt: string | null;
    today: string | null;
    week: { day: string; hours: string }[];
  };
  legal?: { fssaiNumber?: string };
  location?: { type: string; coordinates: number[] };
}

export interface VendorOffer {
  code: string;
  title: string;
  description: string;
  minOrder: number;
}
