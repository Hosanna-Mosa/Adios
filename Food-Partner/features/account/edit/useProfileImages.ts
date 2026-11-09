import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useUpdateProfile } from "@/queries/profile.queries";
import { uploadFoodImages } from "@/services/menu.service";
import { errorMessage } from "@/utils/errorMessage";

export type ProfileImageKind = "image" | "coverImage";

// Profile picture (square) and cover banner (wide): pick or capture, crop, upload, then save
// the returned URL on the outlet (PUT /vendors/me) so it survives closing the screen.
const ASPECT: Record<ProfileImageKind, [number, number]> = { image: [1, 1], coverImage: [16, 9] };

export function useProfileImages() {
  const { t } = useTranslation();
  const toast = useToast();
  const save = useUpdateProfile();
  const [busy, setBusy] = useState<ProfileImageKind | null>(null);

  const upload = async (kind: ProfileImageKind, asset: ImagePicker.ImagePickerAsset) => {
    setBusy(kind);
    try {
      const [url] = await uploadFoodImages([
        { uri: asset.uri, name: asset.fileName || `${kind}-${Date.now()}.jpg`, type: asset.mimeType || "image/jpeg" },
      ]);
      if (!url) throw new Error(t("editProfile.photoUploadFailed"));
      await save.mutateAsync({ [kind]: url });
      toast.show(t(kind === "image" ? "editProfile.photoSaved" : "editProfile.coverSaved"), "success");
    } catch (error) {
      toast.show(errorMessage(error, t("editProfile.photoUploadFailed")), "error");
    } finally {
      setBusy(null);
    }
  };

  const fromLibrary = async (kind: ProfileImageKind) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(t("dishForm.permissionTitle"), t("dishForm.libraryPermission"), undefined, "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: ASPECT[kind], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await upload(kind, result.assets[0]);
  };

  const fromCamera = async (kind: ProfileImageKind) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert(t("dishForm.permissionTitle"), t("dishForm.cameraPermission"), undefined, "warning");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: ASPECT[kind], quality: 0.8 });
    if (!result.canceled && result.assets[0]) await upload(kind, result.assets[0]);
  };

  const change = (kind: ProfileImageKind) => {
    if (busy) return;
    showAlert(t(kind === "image" ? "editProfile.photoTitle" : "editProfile.coverTitle"), t("dishForm.addPhotoMessage"), [
      { text: t("dishForm.takePhoto"), onPress: () => fromCamera(kind) },
      { text: t("dishForm.chooseFromGallery"), onPress: () => fromLibrary(kind) },
      { text: t("actions.cancel"), style: "cancel" },
    ]);
  };

  return { busy, change };
}
