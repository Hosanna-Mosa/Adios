import { Modal } from "react-native";
import { ProfileModalOverlay } from "./ProfileModalOverlay";
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
  securityVisible: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function SecuritySheet({
  changingPassword,
  confirmPassword,
  currentPassword,
  handleChangePassword,
  insets,
  newPassword,
  securityVisible,
  setConfirmPassword,
  setCurrentPassword,
  setNewPassword,
  setSecurityVisible,
  styles,
  tokens,
}: Props) {
  return (
    <Modal visible={securityVisible} animationType="slide" transparent>
      <ProfileModalOverlay
        changingPassword={changingPassword}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        handleChangePassword={handleChangePassword}
        insets={insets}
        newPassword={newPassword}
        setConfirmPassword={setConfirmPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setSecurityVisible={setSecurityVisible}
        styles={styles}
        tokens={tokens}
      />
    </Modal>
  );
}
