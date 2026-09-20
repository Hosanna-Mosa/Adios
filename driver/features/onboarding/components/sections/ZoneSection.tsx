import { router } from "expo-router";
import React from "react";

import { useOnboardingCtx } from "../../OnboardingContext";
import { ZoneSelector } from "../ZoneSelector";

export function ZoneSection() {
  const { step1 } = useOnboardingCtx();

  return (
    <ZoneSelector
      zones={step1.zones}
      searchText={step1.zoneSearchText}
      onSearchChange={(t) => {
        step1.setZoneSearchText(t);
        step1.setIsZoneDropdownOpen(true);
      }}
      isDropdownOpen={step1.isZoneDropdownOpen}
      selectedZoneId={step1.preferredZone}
      onSelectZone={(id) => {
        step1.setPreferredZone(id);
        step1.setIsZoneDropdownOpen(false);
        step1.setZoneSearchText("");
      }}
      onOpenZoneMap={(zone) =>
        router.push({ pathname: "/zone-map", params: { zoneId: zone._id } })
      }
    />
  );
}
