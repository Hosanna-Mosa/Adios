export interface BarDatum {
  time: string;
  delivered: number;
  target: number;
}

export interface ActivityLogItem {
  type: "DELIVERY" | "SYSTEM" | "USER_REG" | string;
  title: string;
  desc: string;
}

export interface ManifestItem {
  id: string;
  dest: string;
  driver: string;
  eta: string;
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

export interface DownloadRow {
  [key: string]: string | number;
}
