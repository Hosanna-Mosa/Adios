/** Shapes returned by GET /analytics/live and /analytics/summary. */

export type ActivityApp = "customer" | "driver";

export interface AppActivity {
  /** Distinct users (signed-in by account, signed-out by session) in the last 5 minutes. */
  activeNow: number;
  /** Same, across the whole window. */
  activeUsers: number;
  signedInUsers: number;
  events: number;
}

export interface MinuteRow {
  minute: string;
  customer: number;
  driver: number;
}

export interface TopEvent {
  app: ActivityApp;
  name: string;
  count: number;
}

export interface TopScreen {
  app: ActivityApp;
  screen: string | null;
  views: number;
}

export interface RecentEvent {
  _id: string;
  name: string;
  app: ActivityApp;
  user?: { _id: string; name?: string; phone?: string } | null;
  role?: string;
  props?: Record<string, string | number | boolean>;
  platform: string;
  appVersion?: string;
  at: string;
}

export interface LiveActivity {
  generatedAt: string;
  windowMinutes: number;
  apps: Record<ActivityApp, AppActivity>;
  perMinute: MinuteRow[];
  topEvents: TopEvent[];
  topScreens: TopScreen[];
  recent: RecentEvent[];
}

export interface DailyRow {
  day: string;
  customerUsers?: number;
  customerEvents?: number;
  driverUsers?: number;
  driverEvents?: number;
}

export interface ActivitySummary {
  days: number;
  daily: DailyRow[];
}

/** GET /analytics/top-items — food/meat items ranked by menu taps and by units ordered. */
export interface TopClickedItem {
  itemId: string;
  name?: string;
  vendorId?: string;
  vendorName?: string;
  clicks: number;
  uniqueUsers: number;
}

export interface TopOrderedItem {
  itemId: string;
  name?: string;
  vendorId?: string;
  vendorName?: string;
  quantity: number;
  orders: number;
  revenue: number;
}

export interface TopItems {
  days: number;
  clicked: TopClickedItem[];
  ordered: TopOrderedItem[];
}
