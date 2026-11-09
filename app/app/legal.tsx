import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { LegalBody, type LegalDoc } from "@/features/legal/components/LegalBody";

// Terms of Service and Privacy Policy. Open with ?doc=privacy for the policy;
// reached from Sign up and from Profile.
export default function LegalScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const params = useLocalSearchParams<{ doc?: string }>();
  const [doc, setDoc] = useState<LegalDoc>(params.doc === "privacy" ? "privacy" : "terms");

  return (
    <ScreenShell style={{ paddingTop: insets.top }}>
      <Header title={t("app.legal.title")} onBack={() => router.back()} style={{ paddingTop: 12, paddingBottom: 12 }} />
      <LegalBody doc={doc} onChangeDoc={setDoc} insets={insets} tokens={tokens} />
    </ScreenShell>
  );
}
