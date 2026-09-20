export interface DevDriver {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  status: "ONLINE" | "OFFLINE";
  vehicleType: "bike" | "auto" | "car";
  currentLocation?: {
    coordinates: [number, number]; // [lng, lat]
  };
}
