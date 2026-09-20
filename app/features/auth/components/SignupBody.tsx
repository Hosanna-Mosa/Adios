import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { SignupForm } from "./SignupForm";
import { Button } from "@/components/ui/Button";
import { SignupHeroBlock } from "./SignupHeroBlock";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type SignupStyles } from "@/features/auth/signup.styles";

// Moved out of app/signup.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  strengthLabelText: any;
  strengthLabelColor: any;
  barFillFor: any;
  accent: ServiceTokens;
  agreedToTerms: any;
  canSubmit: any;
  email: string;
  handleRegister: () => void;
  isPasswordVisible: boolean;
  isPhoneDisabled: boolean;
  loading: boolean;
  name: string;
  password: string;
  passwordStrength: any;
  phoneNumber: any;
  setAgreedToTerms: any;
  setEmail: any;
  setIsPasswordVisible: any;
  setName: any;
  setPassword: any;
  setPhoneNumber: any;
  styles: SignupStyles;
  tokens: ThemeTokens;
}

export function SignupBody({
  strengthLabelText,
  strengthLabelColor,
  barFillFor,
  accent,
  agreedToTerms,
  canSubmit,
  email,
  handleRegister,
  isPasswordVisible,
  isPhoneDisabled,
  loading,
  name,
  password,
  passwordStrength,
  phoneNumber,
  setAgreedToTerms,
  setEmail,
  setIsPasswordVisible,
  setName,
  setPassword,
  setPhoneNumber,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { minHeight: "100%" }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Centered like the sign-in screen's hero — same treatment, not a one-off */}
      <SignupHeroBlock
        styles={styles}
      />

      <SignupForm
        barFillFor={barFillFor}
        strengthLabelColor={strengthLabelColor}
        strengthLabelText={strengthLabelText}
        email={email}
        isPasswordVisible={isPasswordVisible}
        isPhoneDisabled={isPhoneDisabled}
        name={name}
        password={password}
        passwordStrength={passwordStrength}
        phoneNumber={phoneNumber}
        setEmail={setEmail}
        setIsPasswordVisible={setIsPasswordVisible}
        setName={setName}
        setPassword={setPassword}
        setPhoneNumber={setPhoneNumber}
        styles={styles}
        tokens={tokens}
      />

      <Animated.View entering={fadeInUp(160)}>
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={moderateScale(14)} color={accent.on} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.legalHighlight}>Terms</Text> and{" "}
            <Text style={styles.legalHighlight}>Privacy Policy</Text>.
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={fadeInUp(220)}>
        <Button
          title="Create account"
          onPress={handleRegister}
          disabled={!canSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: 14 }}
        />
      </Animated.View>

      <Animated.View entering={fadeInUp(280)}>
        <TouchableOpacity
          style={styles.loginLinkRow}
          onPress={() => router.replace("/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            Already have one? <Text style={styles.loginLinkHighlight}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
    </>
  );
}
