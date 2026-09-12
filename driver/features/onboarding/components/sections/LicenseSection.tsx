import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, View } from "react-native";

import { useOnboardingCtx } from "../../OnboardingContext";
import { dlStyles } from "../../onboarding.styles";
import { validateDLFormat } from "../../validators";
import { FieldColumn } from "../FieldColumn";
import { FormInput } from "../FormInput";
import { InfoBanner } from "../InfoBanner";
import { ExpiryDateField, LicenseFormatError } from "../LicenseFields";

const FORMAT_HINT = (
  <>
    Invalid format. Expected 2 letters (state code) + 2 digits (RTO) + 4 digits (year) + 7 digits
    (serial).{"\n"}E.g. {"HR-06-2020-1234567"}
  </>
);

export function LicenseSection() {
  const { docs } = useOnboardingCtx();

  return (
    <FieldColumn gap={16}>
      <FormInput
        label="Driving License Number"
        value={docs.dlNumber}
        onChangeText={(t) => docs.setDlNumber(t.toUpperCase().slice(0, 19))}
        placeholder="HR-06-2020-1234567"
        autoCapitalize="characters"
        icon="file"
      />
      {docs.dlNumber.length > 0 &&
        (validateDLFormat(docs.dlNumber) ? (
          <InfoBanner icon="check-circle" text="Valid license number format" type="success" />
        ) : (
          <View style={dlStyles.errorBox}>
            <LicenseFormatError message={FORMAT_HINT} />
          </View>
        ))}

      <ExpiryDateField
        label="Expiry Date"
        value={docs.dlExpiry}
        placeholder="Select Expiry Date"
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
