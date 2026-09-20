export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable?: boolean;
}

export interface FoodItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  isVeg: boolean;
  images: string[];
}
