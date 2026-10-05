import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { uploadFoodImages, type LocalImage } from "@/services/menu.service";
import { errorMessage } from "@/utils/errorMessage";

// Picking and uploading a dish's photos — split out of useDishForm the way the
// customer app splits a screen hook into useX / useXHandle… files. Photos
// upload as soon as they're picked, exactly like the web panel's dropzone, so
// saving the dish only sends URLs.

export const MAX_IMAGES = 5; // POST /food/upload accepts at most 5 files per request

const toUpload = (asset: ImagePicker.ImagePickerAsset, index: number): LocalImage => ({
  uri: asset.uri,
  name: asset.fileName || `dish-${Date.now()}-${index}.jpg`,
  type: asset.mimeType || "image/jpeg",
});

export function useDishPhotos(images: string[], onUploaded: (urls: string[]) => void) {
  const { t } = useTranslation();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const room = MAX_IMAGES - images.length;

  const upload = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets.length) return;
    setUploading(true);
    try {
      onUploaded(await uploadFoodImages(assets.map(toUpload)));
      toast.show(t("dishForm.photosUploaded"), "success");
    } catch (error) {
      toast.show(errorMessage(error, t("dishForm.uploadFailed")), "error");
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(t("dishForm.permissionTitle"), t("dishForm.libraryPermission"), undefined, "warning");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: room, quality: 0.7 });
    if (!result.canceled) await upload(result.assets.slice(0, room));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert(t("dishForm.permissionTitle"), t("dishForm.cameraPermission"), undefined, "warning");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [4, 3] });
    if (!result.canceled) await upload(result.assets.slice(0, 1));
  };

  const addPhotos = () => {
    if (room <= 0) {
      toast.show(t("dishForm.maxPhotos", { count: MAX_IMAGES }), "info");
      return;
    }
    showAlert(t("dishForm.addPhotoTitle"), t("dishForm.addPhotoMessage"), [
      { text: t("dishForm.takePhoto"), onPress: takePhoto },
      { text: t("dishForm.chooseFromGallery"), onPress: pickFromLibrary },
      { text: t("actions.cancel"), style: "cancel" },
    ]);
  };

  return { uploading, addPhotos };
}
