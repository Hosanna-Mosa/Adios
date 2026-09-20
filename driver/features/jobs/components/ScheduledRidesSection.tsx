import React from "react";

import { useDriverStore } from "@/store/driverStore";
import { styles } from "../home.styles";
import { ScheduledRideCard } from "./ScheduledRideCard";
import { SectionHeading } from "./SectionHeading";
import { Box } from "@/components/ui/Box";

/** Rides booked for later. Hidden when there are none. */
export function ScheduledRidesSection({
  rides,
  blockedByCurrentOrder,
}: {
  rides: any[];
  blockedByCurrentOrder: boolean;
}) {
  if (rides.length === 0) return null;

  return (
    <Box style={styles.sectionSpacing}>
      <SectionHeading title={`Scheduled Rides (${rides.length})`} />
      <Box style={{ gap: 12, marginTop: 8 }}>
        {rides.map((ride, idx) => (
          <ScheduledRideCard
            key={ride._id}
            ride={ride}
            index={idx}
            disabled={blockedByCurrentOrder}
            onStart={() => {
              const { startReservedRide } = useDriverStore.getState();
              startReservedRide(ride._id);
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
