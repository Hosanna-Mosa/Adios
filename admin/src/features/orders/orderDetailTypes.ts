export interface OrderStopItem {
  name: string;
  quantity: number;
}

export interface OrderStop {
  address?: string;
  type?: string;
  location?: { coordinates?: [number, number] };
  items?: OrderStopItem[] | unknown;
}

export interface OrderDriver {
  /** The driver's User. GET /admin/orders/:id may leave it unpopulated (just an id), so read it defensively. */
  user?: { name?: string; phone?: string };
  vehicleNumber?: string;
}

export interface Order {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  driver?: OrderDriver;
  stops?: OrderStop[];
  /** Food (broadcast) orders: the rider search, whose accepted offer records when a driver took the order. */
  dispatch?: { offers?: { outcome?: string; respondedAt?: string }[] };
}

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  address: string;
  type?: string;
}

export interface TimelineStep {
  time: string;
  title: string;
  desc: string;
  status: "completed" | "in_progress" | "pending";
  label?: string;
}
