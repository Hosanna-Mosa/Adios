import { Modal } from "react-native";
import { StatusBarFill } from "@/components/StatusBarFill";
import { ProfileModalOverlay } from "./ProfileModalOverlay";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  changingPassword: any;
  confirmPassword: any;
  currentPassword: any;
  handleChangePassword: any;
  newPassword: any;
  securityVisible: any;
  setConfirmPassword: any;
  setCurrentPassword: any;
  setNewPassword: any;
  setSecurityVisible: any;
  styles: any;
  tokens: any;
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
    <Modal visible={securityVisible} animationType="slide" transparent statusBarTranslucent>
      <StatusBarFill />
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
