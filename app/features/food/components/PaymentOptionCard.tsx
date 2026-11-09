import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fadeIn } from "@/motion/presets";
import { type PaymentOptionsStyles } from "../paymentOptions.styles";

// One way to pay. Tapping the card selects it; the selected card carries its own pay button,
// so the customer confirms right where they chose.

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
  payLabel: string;
  selected: boolean;
  processing: boolean;
  onSelect: () => void;
  onPay: () => void;
  styles: PaymentOptionsStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
}

export function PaymentOptionCard({
  icon,
  title,
  hint,
  payLabel,
  selected,
  processing,
  onSelect,
  onPay,
  styles,
  tokens,
  accent,
}: Props) {
  return (
    <View style={[styles.optionCard, selected && styles.optionCardActive]}>
      <TouchableOpacity
        style={styles.optionRow}
        activeOpacity={0.85}
        onPress={onSelect}
        disabled={processing}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled: processing }}
        accessibilityLabel={title}
      >
        <View style={[styles.optionIcon, selected && styles.optionIconActive]}>
          <Ionicons name={icon} size={moderateScale(20)} color={selected ? accent.accent : tokens.sec} />
        </View>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionHint}>{hint}</Text>
        </View>
        <Ionicons
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          size={moderateScale(22)}
          color={selected ? accent.accent : tokens.muted}
        />
      </TouchableOpacity>

      {selected && (
        <Animated.View entering={fadeIn()}>
          <TouchableOpacity
            style={[styles.payBtn, processing && styles.payBtnDisabled]}
            activeOpacity={0.9}
            onPress={onPay}
            disabled={processing}
            accessibilityRole="button"
            accessibilityLabel={payLabel}
          >
            {processing ? (
              <ActivityIndicator size="small" color={accent.on} />
            ) : (
              <Text style={styles.payBtnText} numberOfLines={1}>{payLabel}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
