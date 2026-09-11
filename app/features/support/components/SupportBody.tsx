import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { SupportContactRow } from "./SupportContactRow";
import { SupportContactRow2 } from "./SupportContactRow2";
import { SupportFaqCard } from "./SupportFaqCard";
import { SupportContactRow3 } from "./SupportContactRow3";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatRelativeDate: any;
  Linking: any;
  FAQS: any;
  accent: any;
  expandedFAQ: any;
  insets: any;
  isActive: any;
  meta: any;
  recentOrder: any;
  recentTitle: any;
  styles: any;
  toggleFAQ: any;
  tokens: any;
}

export function SupportBody({
  formatRelativeDate,
  Linking,
  FAQS,
  accent,
  expandedFAQ,
  insets,
  isActive,
  meta,
  recentOrder,
  recentTitle,
  styles,
  toggleFAQ,
  tokens,
}: Props) {
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)}>
        <Text style={styles.heroTitle}>How can we help?</Text>
      </Animated.View>

      {recentOrder && (
        <Animated.View entering={fadeInUp(60)}>
          <TouchableOpacity
            style={styles.recentCard}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: "/tracking", params: { orderId: recentOrder._id } })}
          >
            <View style={[styles.recentIcon, { backgroundColor: accent.skin }]}>
              <Ionicons name={meta?.accent === "ride" ? "car" : meta?.accent === "task" ? "construct" : meta?.accent === "delivery" ? "cube" : "fast-food"} size={19} color={accent.accent} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.recentEyebrow, { color: accent.accent }]}>{isActive ? "Active order" : "Recent order"}</Text>
              <Text style={styles.recentTitle} numberOfLines={1}>{recentTitle} · ₹{Math.round(recentOrder.totalPrice || 0)}</Text>
              <Text style={styles.recentMeta}>{formatRelativeDate(recentOrder.createdAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
          </TouchableOpacity>
        </Animated.View>
      )}
      <Text style={styles.recentHint}>Most issues are about a specific order — start there and we&apos;ll skip the questions.</Text>

      <Text style={styles.sectionLabel}>Contact us</Text>
      <Animated.View entering={fadeInUp(120)} style={{ gap: 10 }}>
        <SupportContactRow
          styles={styles}
          tokens={tokens}
        />

        <SupportContactRow2
          Linking={Linking}
          styles={styles}
          tokens={tokens}
        />

        <SupportContactRow3
          Linking={Linking}
          styles={styles}
          tokens={tokens}
        />
      </Animated.View>

      <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Common questions</Text>
      <SupportFaqCard
        FAQS={FAQS}
        accent={accent}
        expandedFAQ={expandedFAQ}
        styles={styles}
        toggleFAQ={toggleFAQ}
        tokens={tokens}
      />
    </ScrollView>
    </>
  );
}
