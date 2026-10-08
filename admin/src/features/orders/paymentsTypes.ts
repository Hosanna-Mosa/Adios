export interface Transaction {
  id: string;
  date: string;
  time: string;
  route: string;
  fee: string;
  /** "SETTLED" (paid online / cash collected) or "PENDING", per GET /admin/payments. */
  status: string;
  statusVariant: "settled" | "pending";
}
