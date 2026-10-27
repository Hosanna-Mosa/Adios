import React from "react";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../../OnboardingContext";
import { fieldMessage, validateEmail } from "@/utils/validation";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { AppText } from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

/** Mandatory contact email — application review outcomes are emailed here. */
export function EmailSection() {
  const { t } = useTranslation();
  const { step1 } = useOnboardingCtx();
  const error = step1.email.trim().length > 0 ? fieldMessage(t, validateEmail(step1.email)) : undefined;

  return (
    <FieldColumn gap={8}>
      <FormInput
        label={t("onboarding.emailLabel", "Email address")}
        value={step1.email}
        onChangeText={(value) => step1.setEmail(value.replace(/\s/g, ""))}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail"
      />
      {error ? (
        <AppText size="small" color={Colors.error} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </FieldColumn>
  );
}
