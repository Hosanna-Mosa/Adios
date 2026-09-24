export interface Transaction {
  id: string;
  date: string;
  time: string;
  route: string;
  fee: string;
  status: string;
  statusVariant: string;
}

export const getRevenueBreakdown = (t: (key: string) => string) => [
  { label: t("orders.directShipping"), pct: 65, width: "65%" },
  { label: t("orders.premiumExpress"), pct: 25, width: "25%" },
  { label: t("orders.lastMileLocal"), pct: 10, width: "10%" },
];
