import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useDeleteMeatItem, useMeatInventory, useSaveMeatItem } from "@/queries/menu.queries";
import { uploadFoodImages, type MeatItemInput } from "@/services/menu.service";
import type { MeatItem } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { parseNumber } from "@/utils/number";
import { createStyles } from "./dishForm.styles";

/** Categories offered for a new item; the centre's own categories are added to these. */
export const DEFAULT_MEAT_CATEGORIES = ["Chicken", "Mutton", "Fish", "Eggs", "Others"];

const EMPTY_MEAT: MeatItemInput = { name: "", weight: "", price: "", category: "", description: "", image: "", isAvailable: true };

const toInput = (item: MeatItem): MeatItemInput => ({
  name: item.name,
  weight: item.weight ?? "",
  price: String(item.price ?? ""),
  category: item.category ?? "",
  description: item.description ?? "",
  image: item.image ?? "",
  isAvailable: item.isAvailable !== false,
});

export type MeatItemErrors = Partial<Record<"name" | "weight" | "price" | "category", string>>;

/** Add / edit one meat item — /meat-item-form adds; /meat-item-form?id=… edits. */
export function useMeatItemForm(id?: string) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const inventory = useMeatInventory();
  const save = useSaveMeatItem();
  const remove = useDeleteMeatItem();
  const existing = id ? inventory.data?.find((item) => item._id === id) : undefined;

  const [form, setForm] = useState<MeatItemInput>(() => (existing ? toInput(existing) : EMPTY_MEAT));
  const [errors, setErrors] = useState<MeatItemErrors>({});
  const [uploading, setUploading] = useState(false);
  // Opened before the inventory had loaded: fill the form once the item arrives.
  const [hydrated, setHydrated] = useState(!id || !!existing);
  useEffect(() => {
    if (!hydrated && existing) {
      setForm(toInput(existing));
      setHydrated(true);
    }
  }, [hydrated, existing]);

  const categories = useMemo(() => {
    const own = (inventory.data ?? []).map((i) => i.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_MEAT_CATEGORIES, ...own]));
  }, [inventory.data]);

  /** A standard item's name, weight and category are fixed; the server ignores edits to them. */
  const fixedIdentity = !!existing?.isGlobalItem;

  const update = <K extends keyof MeatItemInput>(key: K, value: MeatItemInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const upload = async (asset?: ImagePicker.ImagePickerAsset) => {
    if (!asset) return;
    setUploading(true);
    try {
      const [url] = await uploadFoodImages([{ uri: asset.uri, name: asset.fileName || `meat-${Date.now()}.jpg`, type: asset.mimeType || "image/jpeg" }]);
      if (!url) throw new Error(t("dishForm.uploadFailed"));
      update("image", url);
    } catch (error) {
      toast.show(errorMessage(error, t("dishForm.uploadFailed")), "error");
    } finally {
      setUploading(false);
    }
  };

  const fromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return showAlert(t("dishForm.permissionTitle"), t("dishForm.libraryPermission"), undefined, "warning");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled) await upload(result.assets[0]);
  };

  const fromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return showAlert(t("dishForm.permissionTitle"), t("dishForm.cameraPermission"), undefined, "warning");
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled) await upload(result.assets[0]);
  };

  const changePhoto = () => {
    if (uploading) return;
    showAlert(t("dishForm.addPhotoTitle"), t("dishForm.addPhotoMessage"), [
      { text: t("dishForm.takePhoto"), onPress: fromCamera },
      { text: t("dishForm.chooseFromGallery"), onPress: fromLibrary },
      { text: t("actions.cancel"), style: "cancel" },
    ]);
  };

  const submit = () => {
    const price = parseNumber(form.price);
    const next: MeatItemErrors = {
      name: form.name.trim() ? undefined : t("meatForm.nameRequired"),
      weight: form.weight.trim() ? undefined : t("meatForm.weightRequired"),
      category: form.category.trim() ? undefined : t("meatForm.categoryRequired"),
      price: price != null && price > 0 ? undefined : t("meat.enterValidPrice"),
    };
    setErrors(next);
    if (next.name || next.weight || next.category || next.price) return;
    save.mutate(
      { id, input: form },
      {
        onSuccess: () => {
          toast.show(t(id ? "meatForm.updated" : "meatForm.added"), "success");
          router.back();
        },
        onError: (error) => toast.show(errorMessage(error, t("meatForm.saveFailed")), "error"),
      },
    );
  };

  const confirmDelete = () => {
    if (!id) return;
    showAlert(t("meatForm.deleteTitle"), t("meatForm.deleteMessage", { name: form.name }), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("meatForm.delete"),
        style: "destructive",
        onPress: () =>
          remove.mutate(id, {
            onSuccess: () => {
              toast.show(t("meatForm.deleted"), "success");
              router.back();
            },
            onError: (error) => toast.show(errorMessage(error, t("meatForm.deleteFailed")), "error"),
          }),
      },
    ]);
  };

  return {
    insets,
    tokens,
    styles,
    isEdit: !!id,
    loadingItem: !!id && !hydrated && inventory.isLoading,
    notFound: !!id && !hydrated && !inventory.isLoading,
    form,
    update,
    errors,
    categories,
    fixedIdentity,
    uploading,
    changePhoto,
    saving: save.isPending,
    deleting: remove.isPending,
    submit,
    confirmDelete,
  };
}
