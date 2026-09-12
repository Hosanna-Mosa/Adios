import React from "react";
import Animated from "react-native-reanimated";

import { staggerListItem } from "@/motion/presets";
import { useOnboardingCtx } from "../../OnboardingContext";
import { VEHICLES } from "../../vehicles";
import { FieldColumn } from "../FieldColumn";
import { SelectCard } from "../SelectCard";

export function VehicleSection() {
  const { step1 } = useOnboardingCtx();

  return (
    <FieldColumn gap={12}>
      {VEHICLES.map((v, idx) => (
        <Animated.View key={v.id} entering={staggerListItem(idx)}>
          <SelectCard
            selected={step1.vehicle === v.id}
            onSelect={() => step1.setVehicle(v.id)}
            icon={v.icon}
            label={v.label}
            desc={v.desc}
          />
        </Animated.View>
      ))}
    </FieldColumn>
  );
}
