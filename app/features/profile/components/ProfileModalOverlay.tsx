import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type ProfileStyles } from "@/features/profile/profile.styles";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  changingPassword: any;
  confirmPassword: string;
  currentPassword: any;
  handleChangePassword: () => void;
  newPassword: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function ProfileModalOverlay({
  accent,
  changingPassword,
  confirmPassword,
  currentPassword,
  handleChangePassword,
  newPassword,
  setConfirmPassword,
  setCurrentPassword,
  setNewPassword,
  setSecurityVisible,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    // The sheet sits at the bottom of the screen, so without this the keyboard
    // covered all three fields and the Update button (same pattern as DistanceSheet).
    <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
      <View style={styles.modalBody}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("app.profile.changePassword")}</Text>
          <TouchableOpacity onPress={() => { setSecurityVisible(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>
            <Ionicons name="close" size={moderateScale(22)} color={tokens.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ marginBottom: 16 }} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("app.profile.currentPassword")}</Text>
            <TextInput style={styles.textInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder={t("app.profile.enterCurrentPassword")} placeholderTextColor={tokens.muted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("app.profile.newPassword")}</Text>
            <TextInput style={styles.textInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder={t("app.profile.min8Characters")} placeholderTextColor={tokens.muted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("app.profile.confirmNewPassword")}</Text>
            <TextInput style={styles.textInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder={t("app.profile.confirmNewPassword")} placeholderTextColor={tokens.muted} />
          </View>
        </ScrollView>
        <TouchableOpacity style={[styles.saveBtn, { opacity: changingPassword ? 0.7 : 1 }]} onPress={handleChangePassword} disabled={changingPassword}>
          {changingPassword ? <ActivityIndicator color={accent.on} /> : <Text style={styles.saveBtnText}>{t("app.profile.updatePassword")}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
