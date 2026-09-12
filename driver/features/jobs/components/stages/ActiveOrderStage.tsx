import React from "react";

import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { DeliveryAcceptedStage } from "./DeliveryAcceptedStage";
import { DeliveryArrivedPickupStage } from "./DeliveryArrivedPickupStage";
import { DeliveryArrivedStage } from "./DeliveryArrivedStage";
import { DeliveryCompletedStage } from "./DeliveryCompletedStage";
import { DeliveryEnRoutePickupStage } from "./DeliveryEnRoutePickupStage";
import { DeliveryEnRouteStage } from "./DeliveryEnRouteStage";
import { DeliveryPickingItemsStage } from "./DeliveryPickingItemsStage";
import { HelperCompleteStage } from "./HelperCompleteStage";
import { HelperTaskStage } from "./HelperTaskStage";
import { RideAcceptedStage } from "./RideAcceptedStage";
import { RideCompletedStage } from "./RideCompletedStage";
import { RideArrivedDeliveryStage, RideArrivedPickupStage } from "./RideOtpStages";
import { RideEnRoutePickupStage, RideInProgressStage } from "./RideTravelStages";

const RIDE_STAGES: Record<string, React.ComponentType> = {
  accepted: RideAcceptedStage,
  driver_assigned: RideAcceptedStage,
  en_route_pickup: RideEnRoutePickupStage,
  arrived_pickup: RideArrivedPickupStage,
  en_route_delivery: RideInProgressStage,
  arrived_delivery: RideArrivedDeliveryStage,
  delivered: RideCompletedStage,
  completed: RideCompletedStage,
};

const DELIVERY_STAGES: Record<string, React.ComponentType> = {
  accepted: DeliveryAcceptedStage,
  driver_assigned: DeliveryAcceptedStage,
  en_route_pickup: DeliveryEnRoutePickupStage,
  arrived_pickup: DeliveryArrivedPickupStage,
  picking_items: DeliveryPickingItemsStage,
  en_route_delivery: DeliveryEnRouteStage,
  arrived_delivery: DeliveryArrivedStage,
  delivered: DeliveryCompletedStage,
  completed: DeliveryCompletedStage,
};

/** Picks the bottom-sheet body for the current service type and order status. */
export function ActiveOrderStage() {
  const { isHelper, isRide, status } = useActiveOrderCtx();

  if (isHelper) {
    return status === "delivered" || status === "completed" ? (
      <HelperCompleteStage />
    ) : (
      <HelperTaskStage />
    );
  }

  const Stage = (isRide ? RIDE_STAGES : DELIVERY_STAGES)[status];
  return Stage ? <Stage /> : null;
}
