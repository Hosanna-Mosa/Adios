import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ContactOptionCard,
  FaqAccordion,
  SupportHero,
} from "@/features/support/components";
import { getFaqs } from "@/features/support/faqs";
import { styles } from "@/features/support/support.styles";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const CONTACT_OPTIONS = [
    { id: "chat", icon: "message-square" as const, label: t("support.liveChat"), description: t("support.instantSupport") },
    { id: "call", icon: "phone" as const, label: t("support.callSupport"), description: t("support.talkToAgent") },
    { id: "email", icon: "mail" as const, label: t("support.emailUs"), description: t("support.replyIn1Hour") },
  ];

  const handleContactOption = (type: string) => {
    if (type === "chat") {
      router.push("/support-chat");
    } else if (type === "call") {
      Alert.alert(t("support.callingPartnerSupport"), t("support.connectingYouToOurDriverHotline"));
    } else if (type === "email") {
      Alert.alert(t("support.emailPartnerSupport"), t("support.openingMailComposer"));
    }
  };

  return (
    <Box style={styles.root}>
      <ScreenHeader
        title={t("support.partnerSupport")}
        paddingTop={insets.top + 16}
        onBack={() => router.back()}
      />

      <ScrollBox
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <SupportHero
          badge={t("support.driversHelpline")}
          title={t("support.howCanWeAssistYouToday")}
          subtitle={t("support.getDynamicSupportResolution")}
        />

        <AppText style={styles.sectionTitle}>{t("support.getInTouch")}</AppText>
        <Box style={styles.contactGrid}>
          {CONTACT_OPTIONS.map((option) => (
            <ContactOptionCard
              key={option.id}
              icon={option.icon}
              label={option.label}
              description={option.description}
              onPress={() => handleContactOption(option.id)}
            />
          ))}
        </Box>

        <AppText style={[styles.sectionTitle, { marginTop: 32 }]}>{t("support.frequentlyAskedQuestions")}</AppText>
        <FaqAccordion faqs={getFaqs()} />
      </ScrollBox>
    </Box>
  );
}
