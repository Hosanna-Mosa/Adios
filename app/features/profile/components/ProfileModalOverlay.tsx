import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ProfileStyles } from "@/features/profile/profile.styles";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  changingPassword: any;
  confirmPassword: string;
  currentPassword: any;
  handleChangePassword: () => void;
  insets: EdgeInsets;
  newPassword: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function ProfileModalOverlay({
  changingPassword,
  confirmPassword,
  currentPassword,
  handleChangePassword,
  insets,
  newPassword,
  setConfirmPassword,
  setCurrentPassword,
  setNewPassword,
  setSecurityVisible,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  const closeSheet = () => { setSecurityVisible(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); };
  return (
    // The sheet sits at the bottom of the screen, so without this the keyboard
    // covered all three fields and the Update button (same pattern as DistanceSheet).
    <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
      <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFillObject} onPress={closeSheet} />
      <View style={[styles.modalBody, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t("app.profile.changePassword")}</Text>
          <TouchableOpacity
            onPress={closeSheet}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t("app.support.closeModal")}
          >
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
        <Button title={t("app.profile.updatePassword")} onPress={handleChangePassword} loading={changingPassword} fullWidth />
      </View>
    </KeyboardAvoidingView>
  );
}
