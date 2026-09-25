import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { type ThemeTokens } from "@/constants/colors";
import { type ProfileStyles } from "@/features/profile/profile.styles";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleSignOutAllDevices: () => void;
  loading: boolean;
  signingOutAll: any;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function ProfileSignOutAllBtn({
  handleSignOutAllDevices,
  loading,
  signingOutAll,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.signOutAllBtn} onPress={handleSignOutAllDevices} disabled={signingOutAll || loading} activeOpacity={0.8}>
      {signingOutAll ? <ActivityIndicator size="small" color={tokens.sec} /> : <Text style={styles.signOutAllBtnText}>{t("app.profile.signOutOfAllDevicesButton")}</Text>}
    </TouchableOpacity>
  );
}
