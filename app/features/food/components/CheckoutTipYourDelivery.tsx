import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Section of CheckoutBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  TIP_OPTIONS: any[];
  accent: any;
  isOtherTip: any;
  otherTipText: any;
  setIsOtherTip: React.Dispatch<React.SetStateAction<any>>;
  setOtherTipText: React.Dispatch<React.SetStateAction<any>>;
  setTipAmount: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  tipAmount: any;
  tokens: any;
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
  return (
    <Animated.View entering={fadeInUp(180)} style={styles.section}>
      <Text style={styles.sectionLabel}>Tip your delivery partner</Text>
      <Text style={styles.tipSub}>100% of the tip goes to the partner.</Text>
      <View style={styles.tipRow}>
        {TIP_OPTIONS.map((opt) => {
          const isSelected = !isOtherTip && tipAmount === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.tipPill, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}
              onPress={() => { setIsOtherTip(false); setTipAmount(opt); }}
            >
              <Text style={[styles.tipPillText, isSelected && { color: accent.on }]}>{opt === 0 ? "None" : `₹${opt}`}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.tipPill, isOtherTip && { backgroundColor: accent.accent, borderColor: accent.accent }]}
          onPress={() => setIsOtherTip(true)}
        >
          <Text style={[styles.tipPillText, isOtherTip && { color: accent.on }]}>Other</Text>
        </TouchableOpacity>
      </View>
      {isOtherTip && (
        <TextInput
          style={styles.otherTipInput}
          placeholder="Enter amount"
          placeholderTextColor={tokens.muted}
          keyboardType="numeric"
          value={otherTipText}
          onChangeText={setOtherTipText}
        />
      )}
    </Animated.View>
  );
}
