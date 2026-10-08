import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type SupportStyles } from "@/features/support/support.styles";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  FAQS: any[];
  accent: ServiceTokens;
  expandedFAQ: any;
  styles: SupportStyles;
  toggleFAQ: any;
  tokens: ThemeTokens;
}

export function SupportFaqCard({
  FAQS,
  accent,
  expandedFAQ,
  styles,
  toggleFAQ,
  tokens,
}: Props) {
  return (
    <View style={styles.faqCard}>
      {FAQS.map((faq, idx) => {
        const isExpanded = expandedFAQ === idx;
        return (
          <Animated.View key={faq.question} entering={staggerListItem(idx)}>
            <TouchableOpacity
              style={[styles.faqRow, idx < FAQS.length - 1 && { borderBottomWidth: 1, borderBottomColor: tokens.border }]}
              activeOpacity={0.7}
              onPress={() => toggleFAQ(idx)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name={isExpanded ? "remove" : "add"} size={18} color={accent.accent} />
              </View>
              {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
