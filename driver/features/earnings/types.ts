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
  /** Cash the driver confirmed collecting on cash orders (already in their hands). */
  cashCollectedTotal?: number;
  /** Platform commission on cash orders not yet covered by online earnings. */
  cashCommissionDue?: number;
  weekBalance: number;
  trendPercent: number;
  weeklyBreakdown: WeeklyPoint[];
  recentActivity: ActivityItem[];
  /** Set when the admin couldn't pay a payout to the saved bank account and wants other details. */
  bankActionRequired?: { payoutId: string; amount: number; reason: string } | null;
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

export interface StatementTripRow {
  date: string;
  orderId: string;
  service: string;
  fare: number;
  earning: number;
  paymentMethod: "cash" | "online";
  cashCollected: number;
}

export interface StatementPayoutRow {
  date: string;
  amount: number;
  status: string;
  reference?: string | null;
}

/** `POST /drivers/earnings-statement` when the period is short enough to show here. */
export interface StatementResult {
  delivery: "inline";
  label: string;
  from: string;
  to: string;
  totals: {
    trips: number;
    fareTotal: number;
    earningsTotal: number;
    cashCollectedTotal: number;
    payoutsTotal: number;
  };
  trips: StatementTripRow[];
  payouts: StatementPayoutRow[];
  /** The printable statement page; the app turns it into the PDF. */
  html: string;
}
