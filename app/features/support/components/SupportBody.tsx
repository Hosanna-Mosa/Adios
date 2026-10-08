import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { SupportContactRow } from "./SupportContactRow";
import { SupportFaqCard } from "./SupportFaqCard";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type SupportStyles } from "@/features/support/support.styles";
import { trackEvent } from "@/utils/analytics";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatRelativeDate: any;
  Linking: any;
  FAQS: any;
  accent: ServiceTokens;
  expandedFAQ: any;
  insets: EdgeInsets;
  isActive: boolean;
  meta: any;
  recentOrder: any;
  recentTitle: string;
  styles: SupportStyles;
  toggleFAQ: any;
  tokens: ThemeTokens;
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
          icon="chatbubble-ellipses"
          iconSize={17}
          iconBackground={tokens.brandSkin}
          iconColor={tokens.brand}
          label={t("app.support.liveChat")}
          description={t("app.support.messageOurSupportTeam")}
          onPress={() => {
            trackEvent("support_opened", { action: "live_chat" });
            router.push("/support-chat");
          }}
          styles={styles}
          tokens={tokens}
        />

        <SupportContactRow
          icon="call"
          iconSize={16}
          iconBackground={tokens.sunken}
          iconColor={tokens.sec}
          label={t("app.support.callHelpline")}
          description="1800 202 4477 · 7 AM – 1 AM"
          onPress={() => Linking.openURL("tel:18002024477")}
          styles={styles}
          tokens={tokens}
        />

        <SupportContactRow
          icon="mail"
          iconSize={16}
          iconBackground={tokens.sunken}
          iconColor={tokens.sec}
          label={t("app.support.emailUs")}
          description={t("app.support.careflavourinWithin24Hours")}
          onPress={() => Linking.openURL("mailto:care@flavour.in")}
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
