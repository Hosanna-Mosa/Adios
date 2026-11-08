import { Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import type { RideConfirmationStyles } from "@/features/ride/ride-confirmation.styles";

// Secondary footer action. It replaces rather than pushes, so the confirmed
// ride is not left on the back stack.

interface Props {
  styles: RideConfirmationStyles;
}

export function BackToHomeButton({ styles }: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.footerSecondaryBtn} onPress={() => router.replace("/(tabs)")}>
      <Text style={styles.footerSecondaryBtnText}>{t("app.rideconfirmation.backToHome")}</Text>
    </TouchableOpacity>
  );
}
