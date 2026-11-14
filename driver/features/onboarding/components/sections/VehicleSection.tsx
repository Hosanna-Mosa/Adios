import React from "react";

import { staggerListItem } from "@/motion/presets";
import { useOnboardingCtx } from "../../OnboardingContext";
import { getVehicles } from "../../vehicles";
import { FieldColumn } from "../FieldColumn";
import { SelectCard } from "../SelectCard";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { FormInput } from "../FormInput";
import { useTranslation } from "react-i18next";

export function VehicleSection() {
  const { t } = useTranslation();
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
      <FormInput
        label={t("onboarding.vehicleNumberLabel", "Vehicle number")}
        value={step1.vehicleNumber}
        onChangeText={(value) => step1.setVehicleNumber(value.toUpperCase().slice(0, 14))}
        placeholder="AP05AB1234"
        autoCapitalize="characters"
      />
    </FieldColumn>
  );
}
