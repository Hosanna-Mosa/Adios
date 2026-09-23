import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleCallInstead: () => void;
  styles: OtpStyles;
}

export function OtpCallRow({
  handleCallInstead,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.callRow} onPress={handleCallInstead} activeOpacity={0.7}>
      <Text style={styles.callText}>
        {t("app.auth.didnapostGetIt")} <Text style={styles.callHighlight}>{t("app.auth.getACallInstead")}</Text>
      </Text>
    </TouchableOpacity>
  );
}
