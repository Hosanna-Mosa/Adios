import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

import i18n from "@/i18n";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

export type DocumentFields = ReturnType<typeof useDocumentFields>;

export function useDocumentFields() {
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("");
  // Set when the licence was read from the transport department via DigiLocker.
  const [dlVerified, setDlVerified] = useState(false);
  const [dlVehicleClass, setDlVehicleClass] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dlExpiryDate, setDlExpiryDate] = useState(new Date());
  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankVerified, setBankVerified] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selfieUploading, setSelfieUploading] = useState(false);

  // ── Capture & upload the onboarding selfie ───────────────────────────────
  // This used to just flip `selfieCaptured` to true with no camera involved,
  // and completion always PATCHed the literal string "captured" as the
  // selfieImage — every driver ended up with the same fake value and no
  // actual photo. It now opens the camera, uploads the real photo to
  // Cloudinary via the account profile-pic endpoint, and keeps the resulting
  // URL to send as the driver's selfieImage on completion.
  const handleCaptureSelfie = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        i18n.t("onboarding.cameraPermissionNeeded"),
        i18n.t("onboarding.allowCameraForSelfie"),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    const uri = result.assets[0].uri;
    const token = useDriverStore.getState().token;
    if (!token || !API_URL) return;

    setSelfieUploading(true);
    try {
      const filename = uri.split("/").pop() || "selfie.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const formData = new FormData();
      formData.append("image", { uri, name: filename, type } as any);

      const res = await fetch(`${API_URL}/users/profile-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setSelfieUri(data.profilePic || uri);
      setSelfieCaptured(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("Selfie upload failed:", err);
      Alert.alert(
        i18n.t("onboarding.uploadFailed"),
        i18n.t("onboarding.couldNotUploadSelfie"),
      );
    } finally {
      setSelfieUploading(false);
    }
  }, []);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === "ios");
      if (selectedDate) {
        setDlExpiryDate(selectedDate);
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();
        setDlExpiry(`${day}/${month}/${year}`);
      }
    },
    [],
  );

  return {
    dlNumber, setDlNumber,
    dlExpiry, setDlExpiry,
    dlVerified, setDlVerified,
    dlVehicleClass, setDlVehicleClass,
    showDatePicker, setShowDatePicker,
    dlExpiryDate, setDlExpiryDate,
    handleDateChange,
    bankAccount, setBankAccount,
    bankConfirm, setBankConfirm,
    ifsc, setIfsc,
    bankVerified, setBankVerified,
    selfieCaptured, setSelfieCaptured,
    selfieUri,
    selfieUploading,
    handleCaptureSelfie,
  };
}
