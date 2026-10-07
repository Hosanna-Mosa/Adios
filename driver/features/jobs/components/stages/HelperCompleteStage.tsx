import React from "react";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { StageActionButton, StopInfoItem, StopsPanel } from "../order";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { formatCurrency } from "@/utils/format";

export function HelperCompleteStage() {
  const { t } = useTranslation();
  const { taskTimerSeconds, earnings, handleStatusTransition } = useActiveOrderCtx();

  return (
    <Box style={styles.stepContainer}>
      <AppText style={[styles.stepTitle, { color: Colors.success }]}>{t("jobs.taskComplete")}</AppText>
      <StopsPanel>
        <StopInfoItem
          label={t("jobs.timeLogged")}
          name={<>{t("jobs.minsN", { value: Math.floor(taskTimerSeconds / 60), defaultValue: "{{value}} Mins" })}</>}
        />
        {/* The driver's pay. Was the order's totalPrice, which the mapped order
            doesn't carry (so it always read ₹0) and is the customer's fare anyway. */}
        <StopInfoItem
          label={t("jobs.totalPayout")}
          name={formatCurrency(earnings.total)}
          nameStyle={{ color: Colors.success, fontWeight: "900" }}
        />
      </StopsPanel>
      <StageActionButton label={t("jobs.finishAndReturnToHome")} onPress={handleStatusTransition} />
    </Box>
  );
}
