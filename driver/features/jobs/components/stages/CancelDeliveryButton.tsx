import React from "react";
import { useTranslation } from "react-i18next";

import Colors from "@/constants/colors";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import { StageActionButton } from "../order";

export function CancelDeliveryButton() {
  const { t } = useTranslation();
  const { handleCancelOrder } = useActiveOrderCtx();
  return (
    <StageActionButton
      label={t("jobs.cancelDelivery")}
      onPress={handleCancelOrder}
      style={{ backgroundColor: Colors.error, marginTop: 8 }}
    />
  );
}
