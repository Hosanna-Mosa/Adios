export interface LiveOrder {
  _id: string;
  status: string;
  createdAt: string;
  user?: { name?: string };
  driver?: { user?: { name?: string } };
  stops?: unknown[];
}
