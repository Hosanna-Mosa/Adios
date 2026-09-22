import React from "react";
import { useTranslation } from "react-i18next";

import { staggerListItem } from "@/motion/presets";
import { useOnboardingCtx } from "../../OnboardingContext";
import { FieldColumn } from "../FieldColumn";
import { SelectCard } from "../SelectCard";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

export function GenderSection() {
  const { t } = useTranslation();
  const { step1 } = useOnboardingCtx();
  const OPTIONS = [
    { id: "male", label: t("onboarding.male") },
    { id: "female", label: t("onboarding.female") },
  ];

  return (
    <FieldColumn gap={12}>
      {OPTIONS.map((o, idx) => (
        <AnimatedBox key={o.id} entering={staggerListItem(idx)}>
          <SelectCard
            selected={step1.gender === o.id}
            onSelect={() => step1.setGender(o.id)}
            icon="user"
            label={o.label}
          />
        </AnimatedBox>
      ))}
    </FieldColumn>
  );
}
