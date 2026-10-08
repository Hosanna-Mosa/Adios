import { ActivityIndicator, Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { type ThemeTokens } from "@/constants/colors";
import { type ProfileStyles } from "@/features/profile/profile.styles";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleLogout: () => void;
  loading: boolean;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function ProfileSignOutBtn({
  handleLogout,
  loading,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} disabled={loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator size="small" color={tokens.error} /> : <Text style={styles.signOutBtnText}>{t("app.profile.signOut")}</Text>}
    </TouchableOpacity>
  );
}
