export type PartnerType = "food" | "meat";

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  isVeg: boolean;
  isBestseller: boolean;
  photo: File | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface UploadedMenuRow {
  id: string;
  category: string;
  itemName: string;
  price: string;
  description: string;
  type: string;
  isBestseller: string;
  image: File | null;
}

export type DayTimeSlots = Record<string, { open: string; close: string }[]>;
