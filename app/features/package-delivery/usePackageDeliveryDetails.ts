import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/contexts/authStore";
import { usePackageDeliveryStore, type PackageDeliveryPoint, type PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import { createAddress } from "@/services/users.service";
import { createPackageDeliveryDetailsStyles } from "./packageDeliveryDetails.styles";
import { usePackageDeliveryTheme } from "./usePackageDeliveryTheme";
import { fullAddress, isPhone10, toPhone10 } from "./packageDelivery.utils";

// State and handlers for app/package-delivery/details.tsx: the flat / building and the person who
// hands over (pickup) or receives (drop) the package. Reached two ways — with a freshly
// picked place in the params, or with ?edit=1 to change a point that's already chosen.

export type FavouriteLabel = "Home" | "Work" | "Gym" | "College" | "Hostel" | "Other";
export const FAVOURITE_LABELS: FavouriteLabel[] = ["Home", "Work", "Gym", "College", "Hostel"];

interface Params {
  kind?: string;
  edit?: string;
  address?: string;
  lat?: string;
  lng?: string;
  contactName?: string;
  contactPhone?: string;
}

export function usePackageDeliveryDetails() {
  const { t } = useTranslation();
  const { insets, tokens, accent, styles } = usePackageDeliveryTheme(createPackageDeliveryDetailsStyles);
  const params = useLocalSearchParams<Params & Record<string, string>>();
  const kind: PackageDeliveryPointKind = params.kind === "pickup" ? "pickup" : "drop";
  const isEdit = params.edit === "1";
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const myName = String(user?.name || "").trim();
  const myPhone = toPhone10(user?.phone);

  // The point being edited, or the place just picked on the search screen.
  const existing = isEdit ? usePackageDeliveryStore.getState()[kind] : null;
  const place = useMemo(() => existing
    ? { address: existing.address, lat: existing.lat, lng: existing.lng }
    : { address: String(params.address || ""), lat: Number(params.lat), lng: Number(params.lng) },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  // A new pickup defaults to the customer's own contact; a drop starts empty unless the
  // saved address it came from carried a receiver.
  const initial = useMemo(() => {
    if (existing) return { name: existing.contactName, phone: existing.contactPhone };
    if (params.contactName || params.contactPhone) return { name: String(params.contactName || ""), phone: toPhone10(params.contactPhone) };
    return kind === "pickup" ? { name: myName, phone: myPhone } : { name: "", phone: "" };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [houseNo, setHouseNo] = useState(existing?.houseNo ?? "");
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [useMine, setUseMine] = useState(!!myPhone && initial.phone === myPhone);
  const [favourite, setFavourite] = useState<FavouriteLabel | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const nameError = !name.trim() ? t("app.packageDelivery.nameRequired") : "";
  const phoneError = !isPhone10(phone) ? t("app.packageDelivery.phoneInvalid") : "";
  const canConfirm = !nameError && !phoneError && Number.isFinite(place.lat) && Number.isFinite(place.lng);

  const changeName = (text: string) => { setName(text); setUseMine(false); };
  const changePhone = (text: string) => { setPhone(text.replace(/\D/g, "").slice(0, 10)); setUseMine(false); };

  const toggleUseMine = () => {
    if (useMine) {
      setUseMine(false);
      setName("");
      setPhone("");
      return;
    }
    setUseMine(true);
    setName(myName);
    setPhone(myPhone);
  };

  const confirm = () => {
    if (!canConfirm) {
      setShowErrors(true);
      return;
    }
    const point: PackageDeliveryPoint = {
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      houseNo: houseNo.trim() || undefined,
      contactName: name.trim(),
      contactPhone: phone,
      fromCurrentLocation: !!existing?.fromCurrentLocation,
    };
    usePackageDeliveryStore.getState().setPoint(kind, point);

    // Saving to favourites is a convenience: a failure must never block the booking.
    const label = favourite === "Other" ? customLabel.trim() || "Other" : favourite;
    if (label) {
      createAddress({
        label,
        addressLine: fullAddress(point),
        phone: point.contactPhone,
        receiverName: point.contactName,
        receiverPhone: point.contactPhone,
        coordinates: { lat: point.lat, lng: point.lng },
      })
        .then((addresses: any) => {
          const current = useAuthStore.getState().user;
          if (current && Array.isArray(addresses)) setUser({ ...current, addresses });
        })
        .catch((error) => console.warn("Package delivery: could not save the favourite address", error));
    }

    if (isEdit) {
      router.back();
      return;
    }
    // Back to the package delivery screen, then straight on to vehicles once both ends are known.
    const { pickup, drop } = usePackageDeliveryStore.getState();
    router.dismissTo("/package-delivery");
    if (pickup && drop && pickup.contactPhone && drop.contactPhone) router.push("/package-delivery/confirm");
  };

  return {
    insets, tokens, accent, styles, kind, place, houseNo, setHouseNo, name, changeName, phone, changePhone,
    useMine, toggleUseMine, hasMyContact: !!myPhone, favourite, setFavourite, customLabel, setCustomLabel,
    nameError: showErrors ? nameError : "", phoneError: showErrors ? phoneError : "", canConfirm, confirm,
    goBack: () => router.back(),
  };
}
