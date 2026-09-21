import { Feather } from "@expo/vector-icons";

export interface WeeklyPoint {
  day: string;
  amount: number;
}

export interface ActivityItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  amount: number;
  createdAt: string;
}

export interface EarningsResponse {
  availableBalance: number;
  weekBalance: number;
  trendPercent: number;
  weeklyBreakdown: WeeklyPoint[];
  recentActivity: ActivityItem[];
  stats: {
    onlineHours: number;
    totalDistance: number;
    completedTrips: number;
  };
  bank: {
    verified: boolean;
    last4: string | null;
    ifsc: string | null;
  };
}

export const emptyEarnings: EarningsResponse = {
  availableBalance: 0,
  weekBalance: 0,
  trendPercent: 0,
  weeklyBreakdown: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    amount: 0,
  })),
  recentActivity: [],
  stats: {
    onlineHours: 0,
    totalDistance: 0,
    completedTrips: 0,
  },
  bank: {
    verified: false,
    last4: null,
    ifsc: null,
  },
};
