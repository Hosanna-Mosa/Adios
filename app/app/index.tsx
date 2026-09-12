import { Animated } from "react-native";
import Reanimated from "react-native-reanimated";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { LandingBody } from "@/features/home/components/LandingBody";
import { LandingLoadingBody } from "@/features/home/components/LandingLoadingBody";
import { useAuth } from "@/features/home/useAuth";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";

export default function AuthScreen() {
  const {
  insets, showSplash, splashOpacity, letters, translateAnim, opacityAnim, identifier,
  setIdentifier, password, setPassword, isPasswordVisible, setIsPasswordVisible, sendingOtp,
  loading, isInitialized, tokens, styles, handleSignIn, handleForgotPassword,
  handleContinueWithOtp
  } = useAuth();

  if (showSplash) {
    return (
      <Animated.View style={{
        flex: 1,
        backgroundColor: tokens.brand,
        justifyContent: "center",
        alignItems: "center",
        opacity: splashOpacity,
      }}>
        <LandingLoadingBody
          letters={letters}
          opacityAnim={opacityAnim}
          translateAnim={translateAnim}
        />
      </Animated.View>
    );
  }

  if (!isInitialized) {
    return (
      <ScreenShell style={{ justifyContent: "center", alignItems: "center" }}>
        <FullScreenLoader color={tokens.brand} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell keyboardAvoiding>
      <LandingBody
        Reanimated={Reanimated}
        handleContinueWithOtp={handleContinueWithOtp}
        handleForgotPassword={handleForgotPassword}
        handleSignIn={handleSignIn}
        identifier={identifier}
        insets={insets}
        isPasswordVisible={isPasswordVisible}
        loading={loading}
        password={password}
        sendingOtp={sendingOtp}
        setIdentifier={setIdentifier}
        setIsPasswordVisible={setIsPasswordVisible}
        setPassword={setPassword}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
