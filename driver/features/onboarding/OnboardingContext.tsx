import React, { createContext, useContext } from "react";

import type { OnboardingController } from "./hooks/useOnboarding";

const OnboardingContext = createContext<OnboardingController | null>(null);

export function OnboardingProvider({
  value,
  children,
}: {
  value: OnboardingController;
  children: React.ReactNode;
}) {
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingCtx(): OnboardingController {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboardingCtx must be used inside <OnboardingProvider>");
  return ctx;
}
