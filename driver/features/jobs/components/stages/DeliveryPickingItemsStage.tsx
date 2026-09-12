import React from "react";
import { View } from "react-native";

import { styles } from "../../active-order.styles";
import { useActiveOrderCtx } from "../../ActiveOrderContext";
import {
  ChecklistGroup,
  ChecklistRow,
  OrderStage,
  PickupActionRow,
  TimersGrid,
} from "../order";
import { CancelDeliveryButton } from "./CancelDeliveryButton";
import { RestaurantOtpEntry } from "./RestaurantOtpEntry";

export function DeliveryPickingItemsStage() {
  const {
    prepTimeRemaining, waitingComp, foodItems, verification,
    handleReportIssue, handleStatusTransition,
  } = useActiveOrderCtx();
  const { checkedItems, setCheckedItems, sealedChecked, setSealedChecked, countChecked, setCountChecked } =
    verification;

  return (
    <OrderStage title="Wait & Verify Order">
      <TimersGrid prepTimeRemaining={prepTimeRemaining} waitingComp={waitingComp} />

      <View style={styles.checklistScroll}>
        <ChecklistGroup title="ITEMS IN ORDER" />
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

        <ChecklistGroup title="PACKAGE SAFETY CHECKS" />
        <ChecklistRow
          checked={sealedChecked}
          label="Food package is sealed and tamper-proof"
          onToggle={() => setSealedChecked(!sealedChecked)}
        />
        <ChecklistRow
          checked={countChecked}
          label="Verified correct item count against invoice"
          onToggle={() => setCountChecked(!countChecked)}
        />

        <RestaurantOtpEntry />
      </View>

      <PickupActionRow
        onReportIssue={handleReportIssue}
        onConfirm={handleStatusTransition}
        confirmLabel="Confirm Picked Up"
      />
      <CancelDeliveryButton />
    </OrderStage>
  );
}
