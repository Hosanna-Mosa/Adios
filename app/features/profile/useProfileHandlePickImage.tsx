import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { changePassword, uploadProfilePicture } from "@/services/users.service";

// Split out of useProfile so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useProfileHandlePickImage(setUser: any, setLoading: any, setSecurityVisible: any, currentPassword: any, setCurrentPassword: any, newPassword: any, setNewPassword: any, confirmPassword: any, setConfirmPassword: any, setChangingPassword: any) {
  const { t } = useTranslation();
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0].uri) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const fd = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image";
      fd.append("image", { uri, name: filename, type } as any);
      const data = await uploadProfilePicture(fd);
      if (data && data.user) setUser(data.user);
    } catch (err) {
      Alert.alert(t("actions.error"), t("app.profile.failedToUploadImage"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("app.profile.missingFields"), t("app.profile.allFieldsAreRequired"));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t("app.profile.weakPassword"), t("app.profile.newPasswordMustBeAtLeast"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("app.profile.doesntMatch"), t("app.profile.passwordsDoNotMatch"));
      return;
    }
    try {
      setChangingPassword(true);
      // customFetch rather than a hand-built fetch, so an expired session here
      // goes through the same 401 interceptor as every other call.
      await changePassword({ currentPassword, newPassword });
      Alert.alert(t("app.profile.success"), t("app.profile.passwordChangedSuccessfully"));
      setSecurityVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert(t("actions.error"), err.message || t("app.auth.somethingWentWrongTryAgain"));
    } finally {
      setChangingPassword(false);
    }
  };

  return { handlePickImage, handleChangePassword };
}
