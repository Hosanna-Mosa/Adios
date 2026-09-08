import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  changingPassword: any;
  confirmPassword: any;
  currentPassword: any;
  handleChangePassword: any;
  newPassword: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: any;
  tokens: any;
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
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBody}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Change password</Text>
          <TouchableOpacity onPress={() => { setSecurityVisible(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>
            <Ionicons name="close" size={moderateScale(22)} color={tokens.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ marginBottom: 16 }}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current password</Text>
            <TextInput style={styles.textInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Enter current password" placeholderTextColor={tokens.muted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New password</Text>
            <TextInput style={styles.textInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Min. 8 characters" placeholderTextColor={tokens.muted} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm new password</Text>
            <TextInput style={styles.textInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" placeholderTextColor={tokens.muted} />
          </View>
        </ScrollView>
        <TouchableOpacity style={[styles.saveBtn, { opacity: changingPassword ? 0.7 : 1 }]} onPress={handleChangePassword} disabled={changingPassword}>
          {changingPassword ? <ActivityIndicator color={accent.on} /> : <Text style={styles.saveBtnText}>Update password</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
