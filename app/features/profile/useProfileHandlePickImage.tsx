import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { customFetch } from "@/utils/api/custom-fetch";

// Part 2 of useProfile, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useProfileHandlePickImage(setUser: any, setLoading: any, setSecurityVisible: any, currentPassword: any, setCurrentPassword: any, newPassword: any, setNewPassword: any, confirmPassword: any, setConfirmPassword: any, setChangingPassword: any) {
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
      const data = await customFetch<any>("/users/profile-pic", { method: "POST", body: fd, isFormData: true });
      if (data && data.user) setUser(data.user);
    } catch (err) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Weak password", "New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Doesn't match", "Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      // customFetch rather than a hand-built fetch, so an expired session here
      // goes through the same 401 interceptor as every other call.
      await customFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      Alert.alert("Success", "Password changed successfully.");
      setSecurityVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  };

  return { handlePickImage, handleChangePassword };
}
