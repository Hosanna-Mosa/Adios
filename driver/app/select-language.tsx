import React from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDriverStore } from "@/store/driverStore";
import { signedInHome } from "@/hooks/useAuthGate";
import { Box } from "@/components/ui/Box";
import { Colors } from "@/constants/colors";
import { SelectLanguageBody } from "@/features/language/components/SelectLanguageBody";
import { useLanguageStore, type SupportedLanguage } from "@/store/languageStore";

// Language gate — reached whenever app/_layout.tsx's routing guard (via
// useAuthGate) finds the current process not yet past the gate (see
// `languageConfirmed`): on first launch, on every subsequent unauthenticated
// cold start, and after logout. A previously persisted language pre-selects
// an option here, but only tapping Continue lets the guard move on to /auth.
export default function SelectLanguageScreen() {
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const confirmLanguage = useLanguageStore((s) => s.confirmLanguage);

  // Selecting only updates the language (and pre-selects for next time); it
  // does not navigate. The routing-guard effect depends on
  // `languageConfirmed`, not `language`, so nothing happens until Continue.
  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  // Always navigate from here rather than waiting on useAuthGate's effect.
  // Signed out → sign in. Already signed in (the saved session finished
  // restoring after this screen opened) → straight to where they belong;
  // this used to do nothing for them, so Continue looked broken.
  const handleContinue = () => {
    confirmLanguage();
    const state = useDriverStore.getState();
    router.replace(state.isAuthenticated && state.token ? signedInHome(state) : "/auth");
  };

  return (
    <Box style={{ flex: 1, backgroundColor: Colors.background, justifyContent: "center", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <SelectLanguageBody
        onSelect={handleSelect}
        selectedLanguage={language}
        onContinue={handleContinue}
      />
    </Box>
  );
}
