import React from "react";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../../OnboardingContext";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { fieldMessage, validateHomeAddress } from "@/utils/validation";
import { HomeAddressSuggestions, LocationVerifiedBox } from "../HomeAddressPicker";

export function HomeAddressSection() {
  const { t } = useTranslation();
  const { step1 } = useOnboardingCtx();
  const code = validateHomeAddress(step1.homeAddressLine, step1.homeLat !== null && step1.homeLng !== null);
  // "Pick a suggestion" waits until the list has appeared (or been used) so it doesn't nag mid-typing.
  const showError = !!step1.homeAddressLine.trim() && code !== null && (code !== "addressNotPicked" || step1.suggestions.length === 0);

  return (
    <FieldColumn gap={16}>
      <FormInput
        label={t("onboarding.fullHomeAddress")}
        value={step1.homeAddressLine}
        onChangeText={(t) => {
          step1.setHomeAddressLine(t);
          step1.fetchSuggestions(t);
        }}
        placeholder={t("onboarding.egHomeAddress")}
        icon="home"
        error={showError ? fieldMessage(t, code) : undefined}
      />

      <HomeAddressSuggestions
        suggestions={step1.suggestions}
        onSelect={(item) => {
          step1.setHomeAddressLine(item.address);
          step1.setHomeLat(item.lat);
          step1.setHomeLng(item.lng);
          step1.setSuggestions([]);
        }}
      />

      <LocationVerifiedBox lat={step1.homeLat} lng={step1.homeLng} />
    </FieldColumn>
  );
}
