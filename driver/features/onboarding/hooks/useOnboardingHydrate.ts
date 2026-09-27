import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

import { useDriverStore } from "@/store/driverStore";
import {
  bailIfUnauthorized,
  getAddresses,
  getOnboarding,
  getZones,
} from "../onboardingApi";
import type { DocumentFields } from "./useDocumentFields";
import type { IdentityFields } from "./useIdentityFields";
import type { Step1Fields } from "./useStep1Fields";

/** Pre-populates the form from whatever the driver has already saved. */
export function useOnboardingHydrate(
  step1: Step1Fields,
  identity: IdentityFields,
  docs: DocumentFields,
) {
  useEffect(() => {
    (async () => {
      const token = useDriverStore.getState().token;
      if (!token) return;

      try {
        const res = await getOnboarding(token);
        if (bailIfUnauthorized(res.status)) return;
        if (res.ok) {
          const d = (await res.json()).data;
          if (d) {
            if (d.gender) step1.setGender(d.gender);
            if (d.vehicleType) step1.setVehicle(d.vehicleType);
            if (d.preferredZone) step1.setPreferredZone(d.preferredZone);
            if (d.aadhaarNumber)
              identity.setAadhaarNumber(d.aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 "));
            if (d.aadhaarVerified) identity.setAadhaarVerified(d.aadhaarVerified);
            if (d.panNumber) identity.setPanNumber(d.panNumber);
            if (d.panVerified) identity.setPanVerified(true);
            if (d.digilockerVerified) identity.setDigilockerVerified(true);
            if (d.dlVerified) docs.setDlVerified(true);
            if (d.dlVehicleClass) docs.setDlVehicleClass(d.dlVehicleClass);
            if (d.dlNumber) docs.setDlNumber(d.dlNumber);
            if (d.dlExpiry) docs.setDlExpiry(d.dlExpiry);
            if (d.bankAccountNumber) docs.setBankAccount(d.bankAccountNumber);
            if (d.bankIfsc) docs.setIfsc(d.bankIfsc);
            if (d.bankVerified) docs.setBankVerified(d.bankVerified);
          }
        }
      } catch {
        // silently ignore
      }

      try {
        const res = await getZones(token);
        if (res.ok) step1.setZones((await res.json()).data || []);
      } catch (err) {
        console.error("Failed to fetch zones for onboarding:", err);
      }

      try {
        const res = await getAddresses(token);
        if (res.ok) {
          const data = await res.json();
          const home = Array.isArray(data)
            ? data.find((a) => a.label?.toLowerCase() === "home")
            : undefined;
          if (home) {
            step1.setHomeAddressLine(home.addressLine);
            const coords = home.location?.coordinates;
            if (coords && coords.length >= 2) {
              step1.setHomeLng(coords[0]);
              step1.setHomeLat(coords[1]);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch saved addresses on onboarding mount:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-read just the identity flags whenever this screen regains focus.
  // DigiLocker verification happens on another screen and updates the driver
  // record server-side, so without this the Aadhaar step would still look
  // unverified after coming back. Deliberately narrow: it must not clobber
  // fields the driver is part-way through typing.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const token = useDriverStore.getState().token;
        if (!token) return;

        try {
          const res = await getOnboarding(token);
          if (!res.ok) return;

          const d = (await res.json()).data;
          if (!d || cancelled) return;

          if (d.aadhaarVerified) {
            identity.setAadhaarVerified(true);
            if (d.aadhaarNumber) {
              identity.setAadhaarNumber(d.aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 "));
            }
          }
          if (d.panVerified) identity.setPanVerified(true);
          if (d.panNumber) identity.setPanNumber(d.panNumber);
          if (d.digilockerVerified) identity.setDigilockerVerified(true);
          if (d.dlVerified) docs.setDlVerified(true);
          if (d.dlNumber) docs.setDlNumber(d.dlNumber);
          if (d.dlExpiry) docs.setDlExpiry(d.dlExpiry);
          if (d.dlVehicleClass) docs.setDlVehicleClass(d.dlVehicleClass);
        } catch {
          // Non-fatal — the driver can still verify manually.
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
}
