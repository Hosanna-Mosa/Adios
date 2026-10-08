export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface UserOrderItem {
  _id: string;
  serviceType: string;
  packageDelivery?: unknown;
  vendor?: unknown;
  totalPrice: number;
  status: string;
  createdAt: string;
  stops: { address?: string }[];
}

export interface UserDetailResponse {
  user: UserProfile;
  stats: {
    totalOrders: number;
    deliveryOrders: number;
    ridesOrders: number;
    helperOrders: number;
    /** Older backends don't send it. */
    packageDeliveryOrders?: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderAt: string | null;
  };
  orders: UserOrderItem[];
}

export interface OrderChatMessage {
  _id: string;
  role: string;
  text: string;
  time?: string;
  createdAt: string;
  senderId?: { name?: string };
}
