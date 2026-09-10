export interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  itemType: string;
  isActive: boolean;
  position: string;
  displayOrder: number;
  color1?: string;
  color2?: string;
}

export interface BannerFormData {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  itemType: string;
  position: string;
  displayOrder: number;
  isActive: boolean;
  color1: string;
  color2: string;
}
