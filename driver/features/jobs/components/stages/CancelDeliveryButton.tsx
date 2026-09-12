import React from "react";

import Colors from "@/constants/colors";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { StageActionButton } from "../order";

export function CancelDeliveryButton() {
  const { handleCancelOrder } = useActiveOrderCtx();
  return (
    <StageActionButton
      label="Cancel Delivery"
      onPress={handleCancelOrder}
      style={{ backgroundColor: Colors.error, marginTop: 8 }}
    />
  );
}
