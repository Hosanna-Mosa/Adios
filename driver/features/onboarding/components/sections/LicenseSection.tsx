import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

import { useOnboardingCtx } from "../../OnboardingContext";
import { dlStyles } from "../../onboarding.styles";
import { validateDLFormat } from "../../validators";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { ExpiryDateField, LicenseFormatError } from "../LicenseFields";
import { Box } from "@/components/ui/Box";

export function LicenseSection() {
  const { t } = useTranslation();
  const { docs } = useOnboardingCtx();
  const formatHint = (
    <>
      {t("onboarding.dlFormatHint", "Invalid format. Expected 2 letters (state code) + 2 digits (RTO) + 4 digits (year) + 7 digits (serial).")}
      {"\n"}{t("onboarding.egDlFormat", "E.g. HR-06-2020-1234567")}
    </>
  );

  return (
    <FieldColumn gap={16}>
      <FormInput
        label={t("onboarding.drivingLicenseNumber")}
        value={docs.dlNumber}
        onChangeText={(t) => docs.setDlNumber(t.toUpperCase().slice(0, 19))}
        placeholder="HR-06-2020-1234567"
        autoCapitalize="characters"
        icon="file"
      />
      {docs.dlNumber.length > 0 &&
        (validateDLFormat(docs.dlNumber) ? (
          <InfoBanner icon="check-circle" text={t("onboarding.validLicenseNumberFormat")} type="success" />
        ) : (
          <Box style={dlStyles.errorBox}>
            <LicenseFormatError message={formatHint} />
          </Box>
        ))}

      <ExpiryDateField
        label={t("onboarding.expiryDate")}
        value={docs.dlExpiry}
        placeholder={t("onboarding.selectExpiryDate")}
        onPress={() => docs.setShowDatePicker(true)}
      />

      {docs.showDatePicker && (
        <DateTimePicker
          value={docs.dlExpiryDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={docs.handleDateChange}
        />
      )}
    </FieldColumn>
  );
}
