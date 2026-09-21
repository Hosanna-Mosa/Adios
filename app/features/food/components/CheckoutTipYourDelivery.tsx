import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type CheckoutStyles } from "@/features/food/checkout.styles";

// Section of CheckoutBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  TIP_OPTIONS: any[];
  accent: ServiceTokens;
  isOtherTip: boolean;
  otherTipText: string;
  setIsOtherTip: React.Dispatch<React.SetStateAction<any>>;
  setOtherTipText: React.Dispatch<React.SetStateAction<any>>;
  setTipAmount: React.Dispatch<React.SetStateAction<any>>;
  styles: CheckoutStyles;
  tipAmount: any;
  tokens: ThemeTokens;
}

export function CheckoutTipYourDelivery({
  TIP_OPTIONS,
  accent,
  isOtherTip,
  otherTipText,
  setIsOtherTip,
  setOtherTipText,
  setTipAmount,
  styles,
  tipAmount,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(180)} style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.tipYourDeliveryPartner")}</Text>
      <Text style={styles.tipSub}>{t("app.food.100OfTheTipGoesTo")}</Text>
      <View style={styles.tipRow}>
        {TIP_OPTIONS.map((opt) => {
          const isSelected = !isOtherTip && tipAmount === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.tipPill, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}
              onPress={() => { setIsOtherTip(false); setTipAmount(opt); }}
            >
              <Text style={[styles.tipPillText, isSelected && { color: accent.on }]}>{opt === 0 ? t("app.food.none") : `₹${opt}`}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.tipPill, isOtherTip && { backgroundColor: accent.accent, borderColor: accent.accent }]}
          onPress={() => setIsOtherTip(true)}
        >
          <Text style={[styles.tipPillText, isOtherTip && { color: accent.on }]}>{t("app.food.other")}</Text>
        </TouchableOpacity>
      </View>
      {isOtherTip && (
        <TextInput
          style={styles.otherTipInput}
          placeholder={t("app.food.enterAmount")}
          placeholderTextColor={tokens.muted}
          keyboardType="numeric"
          value={otherTipText}
          onChangeText={setOtherTipText}
        />
      )}
    </Animated.View>
  );
}
