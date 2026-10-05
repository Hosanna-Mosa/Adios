import React from "react";
import { useTranslation } from "react-i18next";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ChecklistGroup,
  ChecklistRow,
  OrderStage,
  StageActionButton,
} from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { RestaurantOtpEntry } from "./RestaurantOtpEntry";
import { Box } from "@/components/ui/Box";

export function DeliveryPickingItemsStage() {
  const { t } = useTranslation();
  const {
    foodItems, verification, handleStatusTransition,
  } = useActiveOrderCtx();
  const { checkedItems, setCheckedItems, sealedChecked, setSealedChecked } = verification;

  return (
    <OrderStage title={t("jobs.waitAndVerifyOrder")}>
      <Box style={styles.checklistScroll}>
        <ChecklistGroup title={t("jobs.itemsInOrder")} />
        {foodItems.map((item: any, idx: number) => (
          <ChecklistRow
            key={idx}
            checked={!!checkedItems[item.name]}
            label={`${item.quantity}x ${item.name}`}
            onToggle={() =>
              setCheckedItems((prev) => ({ ...prev, [item.name]: !checkedItems[item.name] }))
            }
            emphasiseWhenChecked
          />
        ))}

        <ChecklistGroup title={t("jobs.packageSafetyChecks")} />
        <ChecklistRow
          checked={sealedChecked}
          label={t("jobs.foodPackageIsSealedAndTamperProof")}
          onToggle={() => setSealedChecked(!sealedChecked)}
        />

        <RestaurantOtpEntry />
      </Box>

      <StageActionButton label={t("jobs.confirmPickedUp")} onPress={handleStatusTransition} />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
