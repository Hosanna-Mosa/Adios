import React from "react";
import { ScrollView, Text, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ContactOptionCard,
  FaqAccordion,
  SupportHero,
} from "@/features/support/components";
import { FAQS } from "@/features/support/faqs";
import { styles } from "@/features/support/support.styles";
import { ScreenHeader } from "@/components/shared/ScreenHeader";

const CONTACT_OPTIONS = [
  { id: "chat", icon: "message-square" as const, label: "Live Chat", description: "Instant support" },
  { id: "call", icon: "phone" as const, label: "Call Support", description: "Talk to agent" },
  { id: "email", icon: "mail" as const, label: "Email Us", description: "Reply in 1 hour" },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  const handleContactOption = (type: string) => {
    if (type === "chat") {
      router.push("/support-chat");
    } else if (type === "call") {
      Alert.alert("Calling Partner Support", "Connecting you to our driver hotline +1 (800) 555-DRIV...");
    } else if (type === "email") {
      Alert.alert("Email Partner Support", "Opening mail composer to partner-support@swiftradius.com...");
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Partner Support"
        paddingTop={insets.top + 16}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <SupportHero
          badge="DRIVERS HELPLINE"
          title="How can we assist you today?"
          subtitle="Get dynamic support resolution for active manifests, pricing adjustments, or document verifications."
        />

        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.contactGrid}>
          {CONTACT_OPTIONS.map((option) => (
            <ContactOptionCard
              key={option.id}
              icon={option.icon}
              label={option.label}
              description={option.description}
              onPress={() => handleContactOption(option.id)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Frequently Asked Questions</Text>
        <FaqAccordion faqs={FAQS} />
      </ScrollView>
    </View>
  );
}
