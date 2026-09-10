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
  user?: { name?: string };
  vehicleNumber?: string;
}

export interface Order {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  driver?: OrderDriver;
  stops?: OrderStop[];
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
