import React from "react";
import Animated from "react-native-reanimated";

import { staggerListItem } from "@/motion/presets";
import { useOnboardingCtx } from "../../OnboardingContext";
import { FieldColumn } from "../FieldColumn";
import { SelectCard } from "../SelectCard";

const OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

export function GenderSection() {
  const { step1 } = useOnboardingCtx();

  return (
    <FieldColumn gap={12}>
      {OPTIONS.map((o, idx) => (
        <Animated.View key={o.id} entering={staggerListItem(idx)}>
          <SelectCard
            selected={step1.gender === o.id}
            onSelect={() => step1.setGender(o.id)}
            icon="user"
            label={o.label}
          />
        </Animated.View>
      ))}
    </FieldColumn>
  );
}
