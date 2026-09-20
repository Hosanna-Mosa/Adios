export interface Transaction {
  id: string;
  date: string;
  time: string;
  route: string;
  fee: string;
  status: string;
  statusVariant: string;
}

export const revenueBreakdown = [
  { label: "Direct Shipping", pct: 65, width: "65%" },
  { label: "Premium Express", pct: 25, width: "25%" },
  { label: "Last Mile Local", pct: 10, width: "10%" },
];
