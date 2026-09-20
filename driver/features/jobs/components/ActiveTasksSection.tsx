import React from "react";
import { router } from "expo-router";
import { ActiveTaskCard } from "./ActiveTaskCard";
import { NoActiveTasksCard } from "./NoActiveTasksCard";
import { SectionHeading } from "./SectionHeading";

/** The job in progress, or the empty state when there isn't one. */
export function ActiveTasksSection({
  currentOrder,
  isOnline,
}: {
  currentOrder: any;
  isOnline: boolean;
}) {
  const stops = currentOrder?.stops;
  const last = stops?.[stops.length - 1];

  return (
    <>
      <SectionHeading title="Active Tasks" />
      {currentOrder ? (
        <ActiveTaskCard
          mode={currentOrder.serviceType?.toLowerCase() === "helper" ? "delivery" : "ride"}
          time={
            currentOrder.timestamp
              ? new Date(currentOrder.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just Now"
          }
          pickup={stops?.[0]?.address || stops?.[0]?.locationName || "Pickup Location"}
          dropoff={last?.address || last?.locationName || "Drop-off Location"}
          onGo={() => router.push("/active-order")}
        />
      ) : (
        <NoActiveTasksCard isOnline={isOnline} />
      )}
    </>
  );
}
