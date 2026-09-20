import type { Order } from "./types";

export const useMockIncomingOrder = (): Order => ({
  id: `ORD-${Date.now()}`,
  distance: "4.2 km",
  duration: "18 min",
  earnings: 85,
  customerName: "Rahul Sharma",
  customerPhone: "+91 98765 43210",
  status: "pending",
  timestamp: new Date(),
  stops: [
    {
      id: "stop-1",
      type: "pickup",
      locationName: "Swiggy Cloud Kitchen",
      address: "12, MG Road, Koramangala, Bangalore",
      lat: 12.935,
      lng: 77.614,
      items: [
        { name: "Butter Chicken", quantity: 2 },
        { name: "Garlic Naan", quantity: 4 },
      ],
      instructions: "Call on arrival",
    },
    {
      id: "stop-2",
      type: "pickup",
      locationName: "Zomato Partner - Fresh Bakes",
      address: "45, 80 Feet Road, Indiranagar, Bangalore",
      lat: 12.979,
      lng: 77.638,
      items: [
        { name: "Chocolate Cake", quantity: 1 },
        { name: "Cupcakes", quantity: 6 },
      ],
    },
    {
      id: "stop-3",
      type: "delivery",
      locationName: "Customer Location",
      address: "78, Brigade Road, Shivajinagar, Bangalore",
      lat: 12.972,
      lng: 77.598,
      instructions: "Leave at door",
    },
  ],
});
