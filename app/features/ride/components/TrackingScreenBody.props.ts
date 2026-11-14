// Props for TrackingScreenBody, kept beside it so neither file passes 150 lines.

export interface Props {
  status: any;
  /** Restaurant / meat-shop order: the map marks the restaurant and the delivery home. */
  outletOrder?: boolean;
  /** A ride: the map marks the pickup and drop with green / red bubbles. */
  rideOrder?: boolean;
  currentOrderId: any;
  route: any;
  stops: any;
  driver: any;
  unreadCount: any;
  insets: any;
  tokens: any;
  isRide: any;
  isHelper: any;
  accent: any;
  styles: any;
  eta: any;
  orderCreatedAt: any;
  tripModalVisible: any;
  setTripModalVisible: any;
  helperStatus: any;
  deliveryOtp: any;
  startOtp: any;
  /** Package delivery: show the delivery OTP for the whole trip, to share with the receiver. */
  isPackageDelivery?: boolean;
  /** Restaurant order: Order details + Cancel (until pickup) instead of the SOS "Help". */
  isFoodOrder?: boolean;
  /** The order can still be cancelled from here (ride until it starts, package until pickup, ...). */
  canCancel?: boolean;
  handleCancel?: () => void;
  cancelling?: boolean;
  cancelKind?: "food" | "ride" | "package" | "helper" | null;
  driverLocation: any;
  radius: any;
  totalPrice: any;
  mapRef: any;
  handleSOS: any;
  handleShareTrip: any;
  deliveryStop: any;
  userLocCoords: any;
  bannerText: any;
  timeline: any;
  pickupLabel: any;
  formatClock: any;
  vendorName?: string | null;
  vendorPartnerType?: string | null;
  serviceType?: string | null;
}
