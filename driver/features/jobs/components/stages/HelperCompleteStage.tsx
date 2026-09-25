import React from "react";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { StageActionButton, StopInfoItem, StopsPanel } from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export function HelperCompleteStage() {
  const { t } = useTranslation();
  const { taskTimerSeconds, currentOrder, handleStatusTransition } = useActiveOrderCtx();

  return (
    <Box style={styles.stepContainer}>
      <AppText style={[styles.stepTitle, { color: Colors.success }]}>{t("jobs.taskComplete")}</AppText>
      <StopsPanel>
        <StopInfoItem
          label={t("jobs.timeLogged")}
          name={<>{t("jobs.minsN", { value: Math.floor(taskTimerSeconds / 60), defaultValue: "{{value}} Mins" })}</>}
        />
        <StopInfoItem
          label={t("jobs.totalPayout")}
          name={<>₹{(currentOrder as any).totalPrice || 0}</>}
          nameStyle={{ color: Colors.success, fontWeight: "900" }}
        />
      </StopsPanel>
      <StageActionButton label={t("jobs.finishAndReturnToHome")} onPress={handleStatusTransition} />
    </Box>
  );
}
