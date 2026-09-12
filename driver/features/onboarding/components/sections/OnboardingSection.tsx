import React from "react";

import { useOnboardingCtx } from "../../OnboardingContext";
import { SelfieCaptureSection } from "../SelfieCaptureSection";
import { AadhaarSection } from "./AadhaarSection";
import { BankSection } from "./BankSection";
import { GenderSection } from "./GenderSection";
import { HomeAddressSection } from "./HomeAddressSection";
import { LicenseSection } from "./LicenseSection";
import { PanSection } from "./PanSection";
import { VehicleSection } from "./VehicleSection";
import { ZoneSection } from "./ZoneSection";

export function OnboardingSection() {
  const { currentKey, docs } = useOnboardingCtx();

  switch (currentKey) {
    case "gender": return <GenderSection />;
    case "vehicle": return <VehicleSection />;
    case "zone": return <ZoneSection />;
    case "homeAddress": return <HomeAddressSection />;
    case "aadhaar": return <AadhaarSection />;
    case "pan": return <PanSection />;
    case "license": return <LicenseSection />;
    case "bank": return <BankSection />;
    case "selfie":
      return (
        <SelfieCaptureSection
          captured={docs.selfieCaptured}
          onCapture={() => docs.setSelfieCaptured(true)}
        />
      );
    default: return null;
  }
}
