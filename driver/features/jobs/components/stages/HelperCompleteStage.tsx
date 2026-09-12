import React from "react";

import Colors from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { StageActionButton, StopInfoItem, StopsPanel } from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export function HelperCompleteStage() {
  const { taskTimerSeconds, currentOrder, handleStatusTransition } = useActiveOrderCtx();

  return (
    <Box style={styles.stepContainer}>
      <AppText style={[styles.stepTitle, { color: Colors.success }]}>Task Complete!</AppText>
      <StopsPanel>
        <StopInfoItem
          label="Time Logged"
          name={<>{Math.floor(taskTimerSeconds / 60)} Mins</>}
        />
        <StopInfoItem
          label="Total Payout"
          name={<>₹{(currentOrder as any).totalPrice || 0}</>}
          nameStyle={{ color: Colors.success, fontWeight: "900" }}
        />
      </StopsPanel>
      <StageActionButton label="Finish & Return to Home" onPress={handleStatusTransition} />
    </Box>
  );
}
