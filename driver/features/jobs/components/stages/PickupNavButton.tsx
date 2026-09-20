import React from "react";
import { Linking } from "react-native";

import { RoundCommButton } from "../order";

/** Opens turn-by-turn directions to the restaurant, when it has coordinates. */
export function PickupNavButton({ pickupStop }: { pickupStop: any }) {
  if (!pickupStop?.lat || !pickupStop?.lng) return null;
  return (
    <RoundCommButton
      icon="location"
      onPress={() =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${pickupStop.lat},${pickupStop.lng}`,
        )
      }
    />
  );
}
