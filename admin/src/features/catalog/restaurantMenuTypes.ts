export interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isPureVeg: boolean;
  rating: number;
  reviews: string;
}

export interface MenuItem {
  name: string;
  price: number;
  description: string;
  category: string;
  isVeg: boolean;
  images?: string[];
}

export interface RestaurantForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  isPureVeg: boolean;
}
