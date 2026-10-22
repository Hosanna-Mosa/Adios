import { Animated } from "react-native";
import Reanimated from "react-native-reanimated";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { LandingBody } from "@/features/home/components/LandingBody";
import { LandingLoadingBody } from "@/features/home/components/LandingLoadingBody";
import { useAuth } from "@/features/home/useAuth";
import { LandingBrandBackdrop } from "@/features/home/components/LandingBrandBackdrop";
import { useAuthStore } from "@/contexts/authStore";
import { useLanguageStore } from "@/contexts/languageStore";

export default function AuthScreen() {
  const {
  insets, showSplash, splashOpacity, introAnims, identifier,
  setIdentifier, password, setPassword, isPasswordVisible, setIsPasswordVisible,
  loading, isInitialized, tokens, styles, handleSignIn, handleForgotPassword
  } = useAuth();
  const token = useAuthStore((s) => s.token);
  const languageConfirmed = useLanguageStore((s) => s.languageConfirmed);

  if (showSplash) {
    return (
      <Animated.View style={{
        flex: 1,
        backgroundColor: tokens.brand,
        justifyContent: "center",
        alignItems: "center",
        opacity: splashOpacity,
      }}>
        <LandingLoadingBody anims={introAnims} />
      </Animated.View>
    );
  }

  // A saved session (or the language gate) means the routing gate in
  // app/_layout.tsx is about to leave this screen. Keep the splash's brand
  // colour up instead of the login form (or a white loader screen) so a
  // logged-in user goes from the splash straight to Home.
  const hasSession = Boolean(token);
  const redirectingAway = hasSession || !languageConfirmed;

  if (!isInitialized || redirectingAway) {
    return <LandingBrandBackdrop tokens={tokens} showLoader={!isInitialized} />;
  }

  return (
    <ScreenShell keyboardAvoiding>
      <LandingBody
        Reanimated={Reanimated}
        handleForgotPassword={handleForgotPassword}
        handleSignIn={handleSignIn}
        identifier={identifier}
        insets={insets}
        isPasswordVisible={isPasswordVisible}
        loading={loading}
        password={password}
        setIdentifier={setIdentifier}
        setIsPasswordVisible={setIsPasswordVisible}
        setPassword={setPassword}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
