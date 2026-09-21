export interface VelocityDatum {
  day: string;
  orders: number;
}

export interface HeatmapCell {
  id: number;
  intensity: number;
}

export interface Anomaly {
  id: string;
  status: string;
  statusVariant: "optimal" | "delay" | "transit";
  driver: string;
  value: string;
  activity: string;
}

export interface AnalyticsData {
  velocityData?: VelocityDatum[];
  heatmapData?: HeatmapCell[];
  anomalies?: Anomaly[];
}
