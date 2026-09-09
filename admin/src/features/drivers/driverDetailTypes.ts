export interface DriverProfile {
  _id: string;
  status: string;
  isAvailable: boolean;
  vehicleType?: string;
  gender?: string;
  onboardingStatus: string;
  aadhaarNumber?: string;
  aadhaarVerified: boolean;
  panNumber?: string;
  dlNumber?: string;
  dlExpiry?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankVerified: boolean;
  user?: {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    isBlocked: boolean;
  };
  preferredZone?: {
    _id: string;
    name: string;
  };
  preferredZones?: {
    _id: string;
    name: string;
  }[];
}

export interface DriverOrderItem {
  _id: string;
  serviceType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  stops: { address?: string }[];
}

export interface DriverDetailResponse {
  driver: DriverProfile;
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  orders: DriverOrderItem[];
}

export interface DetailZoneOption {
  _id: string;
  name: string;
}

export interface OrderChatMessage {
  _id: string;
  role: string;
  text: string;
  time?: string;
  createdAt: string;
  senderId?: { name?: string };
}
