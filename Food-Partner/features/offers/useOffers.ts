import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useCreateOffer, useDeleteOffer, useMyOffers, useSetOfferActive } from "@/queries/insights.queries";
import type { OfferInput, PartnerOffer } from "@/types/insights";
import { errorMessage } from "@/utils/errorMessage";
import { createOffersStyles } from "./offers.styles";
import { EMPTY_OFFER, validateOffer, type OfferErrors } from "./offerRules";

/** The partner's own offers: list, switch on / off, delete, and create a new one. */
export function useOffers() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createOffersStyles(tokens), [tokens]);
  const toast = useToast();
  const query = useMyOffers();
  const create = useCreateOffer();
  const toggle = useSetOfferActive();
  const remove = useDeleteOffer();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<OfferInput>(EMPTY_OFFER);
  const [errors, setErrors] = useState<OfferErrors>({});
  const [serverError, setServerError] = useState<string | undefined>();

  const update = <K extends keyof OfferInput>(key: K, value: OfferInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError(undefined);
  };

  const openSheet = () => {
    setForm(EMPTY_OFFER);
    setErrors({});
    setServerError(undefined);
    setSheetOpen(true);
  };

  const submit = () => {
    const found = validateOffer(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    create.mutate(form, {
      onSuccess: () => {
        toast.show(t("offers.created"), "success");
        setSheetOpen(false);
      },
      onError: (error) => setServerError(errorMessage(error, t("offers.createFailed"))),
    });
  };

  const setActive = (offer: PartnerOffer, isActive: boolean) =>
    toggle.mutate(
      { id: offer._id, isActive },
      { onError: (error) => toast.show(errorMessage(error, t("offers.updateFailed")), "error") },
    );

  const confirmDelete = (offer: PartnerOffer) =>
    showAlert(t("offers.deleteTitle"), t("offers.deleteMessage", { code: offer.code }), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("offers.delete"),
        style: "destructive",
        onPress: () => remove.mutate(offer._id, { onError: (error) => toast.show(errorMessage(error, t("offers.deleteFailed")), "error") }),
      },
    ]);

  return {
    insets,
    tokens,
    styles,
    offers: query.data ?? [],
    loading: query.isLoading,
    error: query.isError && !query.data,
    refreshing: query.isRefetching && !query.isLoading,
    refetch: query.refetch,
    togglingId: toggle.isPending ? toggle.variables?.id : undefined,
    setActive,
    confirmDelete,
    sheetOpen,
    openSheet,
    closeSheet: () => setSheetOpen(false),
    form,
    update,
    errors,
    serverError,
    saving: create.isPending,
    submit,
  };
}
