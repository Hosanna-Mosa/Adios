export interface VelocityDatum {
  day: string;
  orders: number;
}

export interface Anomaly {
  id: string;
  status: string;
  statusVariant: "optimal" | "delay" | "transit";
  driver: string;
  value: string;
  activity: string;
}

export interface AnalyticsSummary {
  totalOrders?: number;
  completedOrders?: number;
  netRevenue?: number;
  avgDeliveryMinutes?: number | null;
  activeDrivers?: number;
}

export interface AnalyticsData {
  velocityData?: VelocityDatum[];
  summary?: AnalyticsSummary;
  anomalies?: Anomaly[];
  rangeDays?: number;
}
