export interface AdminDriverUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  isBlocked?: boolean;
  profilePic?: string;
}

export interface AdminDriverZoneRef {
  _id: string;
  name: string;
  type: string;
}

export interface AdminDriver {
  _id: string;
  status?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  currentLocation?: { coordinates?: [number, number] };
  user?: AdminDriverUser;
  rating?: number;
  preferredZone?: string | AdminDriverZoneRef | null;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankVerified?: boolean;
  dlNumber?: string;
  dlExpiry?: string;
  onboardingStatus?: string;
  selfieImage?: string;
}

export interface AdminZone {
  _id: string;
  name: string;
  type: string;
  isActive?: boolean;
  pricingMultiplier?: number;
}

export interface AdminOrderSummary {
  _id: string;
  createdAt?: string;
  status?: string;
  totalPrice?: number;
  deliveryFee?: number;
  driver?: string | { _id: string };
}

export interface OrderChatMessage {
  _id: string;
  senderId?: string | { _id?: string; name?: string };
  text?: string;
  createdAt?: string;
}
