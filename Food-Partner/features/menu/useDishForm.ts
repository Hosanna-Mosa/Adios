import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useFoodMenu, useSaveFoodItem } from "@/queries/menu.queries";
import { usePartnerProfile } from "@/queries/profile.queries";
import type { FoodItemInput } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./dishForm.styles";
import { dishToInput, EMPTY_DISH, formDiscount, hasErrors, validateDish, type DishErrors } from "./dishValidation";
import { MAX_IMAGES, useDishPhotos } from "./useDishPhotos";

// Add / edit one dish — the web panel's FoodItemForm (shared by its Add and
// Edit dialogs) as a full screen. Photo handling lives in useDishPhotos, the
// rules in dishValidation. Saving goes through a preview of the dish as
// customers will see it; only its Confirm button saves.

export function useDishForm(id?: string) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const menu = useFoodMenu();
  const { profile } = usePartnerProfile();
  const save = useSaveFoodItem();
  const existing = id ? menu.data?.find((item) => item._id === id) : undefined;

  const [form, setForm] = useState<FoodItemInput>(() => (existing ? dishToInput(existing) : EMPTY_DISH));
  const [errors, setErrors] = useState<DishErrors>({});
  const [previewing, setPreviewing] = useState(false);
  // Opened before the menu had loaded (e.g. straight after a cold start): fill
  // the form once the dish arrives, but never overwrite what was typed since.
  const [hydrated, setHydrated] = useState(!id || !!existing);
  useEffect(() => {
    if (!hydrated && existing) {
      setForm(dishToInput(existing));
      setHydrated(true);
    }
  }, [hydrated, existing]);

  const photos = useDishPhotos(form.images, (urls) => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, MAX_IMAGES) }));
    setErrors((prev) => ({ ...prev, images: undefined }));
  });

  // Suggestions come only from the database: the categories already on this
  // outlet's menu, then the cuisines it registered with. A new outlet with
  // neither just types its first category.
  const categories = useMemo(() => {
    const onMenu = (menu.data ?? []).map((item) => item.category?.trim());
    const cuisines = (profile?.categories ?? []).map((c) => c?.trim());
    return Array.from(new Set([...onMenu, ...cuisines].filter(Boolean) as string[])).slice(0, 12);
  }, [menu.data, profile?.categories]);

  const update = <K extends keyof FoodItemInput>(key: K, value: FoodItemInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
    // The offer is checked against the price, so a new price re-opens that check too.
    if (key === "price" && errors.offerPrice) setErrors((prev) => ({ ...prev, offerPrice: undefined }));
    if (key === "promoteBestseller") setErrors((prev) => ({ ...prev, bestsellerMinOrders: undefined }));
  };

  /** Validates, then shows the preview — nothing is saved yet. */
  const submit = () => {
    const next = validateDish(form, !!id, t);
    setErrors(next);
    if (!hasErrors(next)) setPreviewing(true);
  };

  const confirm = () =>
    save.mutate(
      { id, input: form },
      {
        onSuccess: () => {
          setPreviewing(false);
          toast.show(id ? t("dishForm.updated") : t("dishForm.added"), "success");
          router.back();
        },
        onError: (error) => toast.show(errorMessage(error, id ? t("dishForm.updateFailed") : t("dishForm.addFailed")), "error"),
      },
    );

  return {
    insets,
    tokens,
    styles,
    isEdit: !!id,
    notFound: !!id && !menu.isLoading && !existing,
    loadingItem: !!id && menu.isLoading,
    form,
    update,
    errors,
    categories,
    uploading: photos.uploading,
    addPhotos: photos.addPhotos,
    removeImage: (index: number) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })),
    discount: formDiscount(form),
    saving: save.isPending,
    submit,
    previewing,
    closePreview: () => setPreviewing(false),
    confirm,
  };
}
