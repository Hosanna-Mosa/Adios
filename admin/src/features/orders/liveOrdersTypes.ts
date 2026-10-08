import type { OrderServiceFields } from "@/components/shared/orderService";

export interface LiveOrder extends OrderServiceFields {
  _id: string;
  status: string;
  createdAt: string;
  user?: { name?: string };
  driver?: { user?: { name?: string }; rating?: number };
  stops?: unknown[];
}
