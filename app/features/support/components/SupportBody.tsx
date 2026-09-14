import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)}>
        <Text style={styles.heroTitle}>{t("app.support.howCanWeHelp")}</Text>
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
              <Text style={[styles.recentEyebrow, { color: accent.accent }]}>{isActive ? t("app.support.activeOrder") : t("app.support.recentOrder")}</Text>
              <Text style={styles.recentTitle} numberOfLines={1}>{recentTitle} · ₹{Math.round(recentOrder.totalPrice || 0)}</Text>
              <Text style={styles.recentMeta}>{formatRelativeDate(recentOrder.createdAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
          </TouchableOpacity>
        </Animated.View>
      )}
      <Text style={styles.recentHint}>{t("app.support.mostIssuesAreAboutASpecific")}</Text>

      <Text style={styles.sectionLabel}>{t("app.support.contactUs")}</Text>
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

      <Text style={[styles.sectionLabel, { marginTop: 22 }]}>{t("app.support.commonQuestions")}</Text>
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
