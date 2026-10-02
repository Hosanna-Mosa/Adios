export interface BarDatum {
  time: string;
  delivered: number;
  target: number;
}

export interface ActivityLogItem {
  type: "DELIVERY" | "SYSTEM" | "USER_REG" | string;
  title: string;
  desc?: string;
  /** When the event happened (ISO string); rendered as "5m ago". */
  time?: string | null;
}

export interface ManifestItem {
  /** Display id (e.g. "#ORD-1234"). */
  id: string;
  /** The underlying order's _id, used for navigation and cancel. */
  orderId?: string;
  dest?: string;
  driver?: string | null;
  /** ISO timestamp of the estimated delivery. */
  eta?: string | null;
  priority: "HIGH" | "STANDARD" | "EXPRESS" | string;
}

export interface DashboardStats {
  totalOrders?: number;
  activeDrivers?: number;
  totalUsers?: number;
  totalRevenue?: number;
  barData?: BarDatum[];
  weeklyBarData?: BarDatum[];
  activityLog?: ActivityLogItem[];
  manifests?: ManifestItem[];
}

