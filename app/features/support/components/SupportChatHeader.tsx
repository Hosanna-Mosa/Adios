import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Header } from "@/components/ui/Header";
import { WEB_TOP_OFFSET } from "@/constants/layout";
import { type ThemeTokens } from "@/constants/colors";

// The support-chat header (case list + conversation view). Built from the
// shared Header so it matches the Help & Support screen's header instead of
// carrying its own 38pt/surface-bar chip.

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  insets: { top: number };
  /** Cases list only: jumps straight to "Raise a new ticket" instead of
   * requiring a scroll past every existing case. Omit to hide the button
   * (e.g. on the conversation view, which has nothing to raise). */
  onAddPress?: () => void;
  tokens?: ThemeTokens;
}

export function SupportChatHeader({ title, subtitle, onBack, insets, onAddPress, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      backHitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={t("app.a11y.goBack")}
      style={{ paddingTop: insets.top + WEB_TOP_OFFSET + 12 }}
      right={
        onAddPress && tokens ? (
          <TouchableOpacity
            onPress={onAddPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t("app.support.raiseANewTicket")}
            style={{
              width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
              backgroundColor: tokens.brand, alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={moderateScale(22)} color={tokens.onBrand} />
          </TouchableOpacity>
        ) : undefined
      }
    />
  );
}
