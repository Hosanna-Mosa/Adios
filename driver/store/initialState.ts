import type { DriverState } from "./types";

export const EMPTY_WEEK = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

type DriverData = Omit<
  DriverState,
  {
    [K in keyof DriverState]: DriverState[K] extends (...args: any[]) => any ? K : never;
  }[keyof DriverState]
>;

export const initialState: DriverData = {
  isOnline: false,
  homeMode: false,
  activeServices: [],
  currentOrder: null,
  incomingOrder: null,
  currentStep: 0,
  driverLocation: null,
  driverName: "",
  driverPhone: "",
  driverUserId: null,
  token: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  identityVerified: false,
  activeChat: [],
  unreadCount: 0,
  isChatActive: false,
  earnings: {
    today: 0,
    week: 0,
    totalDeliveries: 0,
    weeklyBreakdown: EMPTY_WEEK,
  },
  orderHistory: [],
};
