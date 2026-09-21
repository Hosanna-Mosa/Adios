import { Modal } from "react-native";
import { ProfileModalOverlay } from "./ProfileModalOverlay";
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
  securityVisible: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: ProfileStyles;
  tokens: ThemeTokens;
}

export function SecuritySheet({
  accent,
  changingPassword,
  confirmPassword,
  currentPassword,
  handleChangePassword,
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
        accent={accent}
        changingPassword={changingPassword}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        handleChangePassword={handleChangePassword}
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
