export interface VendorOrderStop {
  type: string;
  address?: string;
  items?: {
    lines?: { name: string; quantity: number; price: number }[];
    deliveryAddress?: { formattedAddress?: string };
  };
}

export interface VendorOrder {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  restaurantPickupCode?: string;
  user?: { name?: string; phone?: string };
  stops?: VendorOrderStop[];
  driver?: {
    user?: { name?: string; phone?: string };
    vehicleType?: string;
  };
}

export interface ScheduledDeliveryRequest {
  requestId: string;
  customerName?: string;
  customerPhone?: string;
  scheduledFor: string;
}

export interface StatusDisplay {
  text: string;
  color: string;
}

export interface VendorData {
  _id?: string;
  name?: string;
  role?: string;
}
