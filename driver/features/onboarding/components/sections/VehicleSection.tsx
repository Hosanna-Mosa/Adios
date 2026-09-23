import React from "react";

import { staggerListItem } from "@/motion/presets";
import { useOnboardingCtx } from "../../OnboardingContext";
import { getVehicles } from "../../vehicles";
import { FieldColumn } from "../FieldColumn";
import { SelectCard } from "../SelectCard";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export function VehicleSection() {
  const { step1 } = useOnboardingCtx();
  const VEHICLES = getVehicles();

  return (
    <FieldColumn gap={12}>
      {VEHICLES.map((v, idx) => (
        <AnimatedBox key={v.id} entering={staggerListItem(idx)}>
          <SelectCard
            selected={step1.vehicle === v.id}
            onSelect={() => step1.setVehicle(v.id)}
            icon={v.icon}
            label={v.label}
            desc={v.desc}
          />
        </AnimatedBox>
      ))}
    </FieldColumn>
  );
}
