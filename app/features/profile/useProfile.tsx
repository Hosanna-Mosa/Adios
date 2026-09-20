import { useProfileInsets } from "./useProfileInsets";
import { useProfileHandlePickImage } from "./useProfileHandlePickImage";
import { useProfileHandleSignOutAllDevices } from "./useProfileHandleSignOutAllDevices";

// State, data loading and handlers for app/(tabs)/profile.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useProfile() {
  const { insets, tabBarHeight, user, logout, setUser, theme, toggleTheme, tokens, accent, styles, loading, setLoading, unreadCount, securityVisible, setSecurityVisible, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword, setChangingPassword, signingOutAll, setSigningOutAll } = useProfileInsets();
  const { handlePickImage, handleRemoveImage, handleAvatarPress, handleChangePassword } = useProfileHandlePickImage(user, setUser, setLoading, setSecurityVisible, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, setChangingPassword);
  const { handleSignOutAllDevices, handleLogout, memberSinceYear, MENU_ITEMS } = useProfileHandleSignOutAllDevices(user, logout, setLoading, unreadCount, setSecurityVisible, setSigningOutAll);

  return {
  insets, tabBarHeight, user, theme, toggleTheme, tokens, accent, styles, loading,
  securityVisible, setSecurityVisible, currentPassword, setCurrentPassword,
  newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword,
  signingOutAll, handlePickImage, handleRemoveImage, handleAvatarPress, handleChangePassword,
  handleSignOutAllDevices, handleLogout,
  memberSinceYear, MENU_ITEMS
  };
}

