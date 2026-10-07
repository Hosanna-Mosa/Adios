import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { usePartnerProfile, useUpdateProfile } from "@/queries/profile.queries";
import type { OutletLocation, PartnerProfile, ProfileUpdate } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createEditStyles } from "./editProfile.styles";
import { useCurrentLocation } from "./useCurrentLocation";

export interface ProfileForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  branchCode: string;
  location: OutletLocation | null;
}

export type ProfileErrors = Partial<Record<"name" | "phone" | "email", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The stored number as 10 digits: "+91 98765 43210" -> "9876543210". */
const tenDigits = (phone?: string) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(-10) : digits;
};

const fromProfile = (p: PartnerProfile | null): ProfileForm => ({
  name: p?.name ?? "",
  phone: tenDigits(p?.phone),
  email: p?.email ?? "",
  address: p?.address ?? "",
  branchCode: p?.branchCode ?? "",
  location: p?.currentLocation ?? null,
});

/** Only what changed is sent, so an untouched phone or email can't trip a uniqueness check. */
function changes(form: ProfileForm, initial: ProfileForm): ProfileUpdate {
  const update: ProfileUpdate = {};
  if (form.name.trim() !== initial.name) update.name = form.name.trim();
  if (form.phone !== initial.phone) update.phone = form.phone;
  if (form.email.trim() !== initial.email) update.email = form.email.trim().toLowerCase();
  if (form.address.trim() !== initial.address) update.address = form.address.trim();
  if (form.branchCode.trim() !== initial.branchCode) update.branchCode = form.branchCode.trim() || null;
  if (JSON.stringify(form.location) !== JSON.stringify(initial.location)) update.currentLocation = form.location;
  return update;
}

/** Edit restaurant details: name, phone, email, address, branch code and current location — PUT /vendors/me. */
export function useEditProfile() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createEditStyles(tokens), [tokens]);
  const toast = useToast();
  const { profile, loaded, failed } = usePartnerProfile();
  const save = useUpdateProfile();
  const location = useCurrentLocation();
  const [initial, setInitial] = useState<ProfileForm>(() => fromProfile(loaded ? profile : null));
  const [form, setForm] = useState<ProfileForm>(initial);
  const [errors, setErrors] = useState<ProfileErrors>({});
  // The sign-in snapshot has no address or branch code: fill the form once the
  // real profile arrives, and only once, so a minute's refresh never wipes typing.
  const [hydrated, setHydrated] = useState(loaded);
  useEffect(() => {
    // A failed load still opens the form, with what sign-in saved.
    if (!hydrated && (loaded || failed)) {
      const next = fromProfile(profile);
      setInitial(next);
      setForm(next);
      setHydrated(true);
    }
  }, [hydrated, loaded, failed, profile]);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const captureLocation = async () => {
    const found = await location.capture();
    if (found) update("location", found);
  };

  const submit = () => {
    const email = form.email.trim();
    const next: ProfileErrors = {
      name: form.name.trim() ? undefined : t("editProfile.nameRequired"),
      phone: /^\d{10}$/.test(form.phone) ? undefined : t("editProfile.phoneInvalid"),
      email: !email || EMAIL.test(email) ? undefined : t("editProfile.emailInvalid"),
    };
    setErrors(next);
    if (next.name || next.phone || next.email) return;

    const body = changes(form, initial);
    if (!Object.keys(body).length) return router.back();
    save.mutate(body, {
      onSuccess: () => {
        toast.show(t("editProfile.saved"), "success");
        router.back();
      },
      onError: (error) => toast.show(errorMessage(error, t("editProfile.saveFailed")), "error"),
    });
  };

  return {
    insets,
    tokens,
    styles,
    loading: !hydrated,
    form,
    update,
    errors,
    locating: location.locating,
    captureLocation,
    removeLocation: () => update("location", null),
    saving: save.isPending,
    submit,
  };
}
