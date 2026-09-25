import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { btnStyles } from "./PrimaryButton.styles";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

/** Full-width pill action button for the onboarding forms.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function PrimaryButton({
  title,
  onPress,
  icon,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Touchable
      style={[btnStyles.button, disabled && btnStyles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <AppText style={btnStyles.text}>{t("onboarding.pleaseWait")}</AppText>
      ) : (
        <>
          <AppText style={btnStyles.text}>{title}</AppText>
          {icon && <Feather name={icon} size={20} color={Colors.white} />}
        </>
      )}
    </Touchable>
  );
}
