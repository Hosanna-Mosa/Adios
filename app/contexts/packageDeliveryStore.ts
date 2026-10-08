import { create } from "zustand";

// The package delivery being booked: where it's collected, where it goes, who hands it over and
// who receives it. In-memory only — a booking in progress isn't worth restoring after a
// restart, and the order itself is tracked through deliveryStore once it's placed.

export type PackageDeliveryPointKind = "pickup" | "drop";
export type PackageDeliveryVehicle = "bike" | "auto";
export type PackageDeliveryPayAt = "pickup" | "drop";

export interface PackageDeliveryPoint {
  /** The full address as the place search (or reverse geocode) returned it. */
  address: string;
  lat: number;
  lng: number;
  /** Flat / house / building, typed by the customer. Sent ahead of `address`. */
  houseNo?: string;
  contactName: string;
  /** 10 digits, no country code. */
  contactPhone: string;
  /** Filled from the device's location rather than picked by the customer. */
  fromCurrentLocation?: boolean;
}

interface PackageDeliveryState {
  pickup: PackageDeliveryPoint | null;
  drop: PackageDeliveryPoint | null;
  vehicle: PackageDeliveryVehicle;
  payAt: PackageDeliveryPayAt;
  setPoint: (kind: PackageDeliveryPointKind, point: PackageDeliveryPoint | null) => void;
  /** Pickup becomes drop and drop becomes pickup, contacts and all. */
  swap: () => void;
  setVehicle: (vehicle: PackageDeliveryVehicle) => void;
  setPayAt: (payAt: PackageDeliveryPayAt) => void;
  reset: () => void;
}

const initialState = {
  pickup: null,
  drop: null,
  vehicle: "bike" as PackageDeliveryVehicle,
  payAt: "pickup" as PackageDeliveryPayAt,
};

export const usePackageDeliveryStore = create<PackageDeliveryState>((set) => ({
  ...initialState,
  setPoint: (kind, point) => set(kind === "pickup" ? { pickup: point } : { drop: point }),
  swap: () => set((s) => ({ pickup: s.drop, drop: s.pickup })),
  setVehicle: (vehicle) => set({ vehicle }),
  setPayAt: (payAt) => set({ payAt }),
  reset: () => set(initialState),
}));
