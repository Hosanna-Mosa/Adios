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
  };
  orders: UserOrderItem[];
}

export interface UserProfileForm {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface OrderChatMessage {
  _id: string;
  role: string;
  text: string;
  time?: string;
  createdAt: string;
  senderId?: { name?: string };
}
