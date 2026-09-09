export interface AdminUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  isBlocked?: boolean;
  addresses?: unknown[];
  createdAt: string;
  updatedAt: string;
}
