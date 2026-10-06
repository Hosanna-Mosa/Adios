// Every query key in one place, so an invalidation can never miss a cache
// because of a typo.
export const queryKeys = {
  /** The live set: today's orders plus anything still in progress. */
  orders: (vendorId: string) => ["vendor-orders", vendorId] as const,
  /** Paged history before today. */
  orderHistory: (vendorId: string) => ["vendor-order-history", vendorId] as const,
  order: (orderId: string) => ["vendor-order", orderId] as const,
  scheduled: (vendorId: string) => ["vendor-scheduled", vendorId] as const,
  foodMenu: (vendorId: string) => ["vendor-food-menu", vendorId] as const,
  meatInventory: (vendorId: string) => ["vendor-meat-inventory", vendorId] as const,
  supportTickets: (vendorId: string) => ["partner-support-tickets", vendorId] as const,
  profile: (vendorId: string) => ["partner-profile", vendorId] as const,
  payouts: (vendorId: string) => ["partner-payouts", vendorId] as const,
};
