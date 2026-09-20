import { SignupHeaderRow } from "@/features/auth/components/SignupHeaderRow";
import { SignupBody } from "@/features/auth/components/SignupBody";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useSignup } from "@/features/auth/useSignup";
import type { PasswordStrength } from "@/features/auth/useSignup";
import type { ThemeTokens } from "@/constants/colors";

export default function SignupScreen() {
  const {
  insets, name, setName, phoneNumber, setPhoneNumber, email, setEmail, password, setPassword,
  isPasswordVisible, setIsPasswordVisible, agreedToTerms, setAgreedToTerms, loading, tokens,
  accent, styles, isPhoneDisabled, passwordStrength, handleBack, handleRegister, canSubmit
  } = useSignup();

  return (
    <ScreenShell keyboardAvoiding>
      {/* Back button */}
      <SignupHeaderRow
        handleBack={handleBack}
        insets={insets}
        name={name}
        styles={styles}
        tokens={tokens}
      />

      <SignupBody
        barFillFor={barFillFor}
        strengthLabelColor={strengthLabelColor}
        strengthLabelText={strengthLabelText}
        accent={accent}
        agreedToTerms={agreedToTerms}
        canSubmit={canSubmit}
        email={email}
        handleRegister={handleRegister}
        isPasswordVisible={isPasswordVisible}
        isPhoneDisabled={isPhoneDisabled}
        loading={loading}
        name={name}
        password={password}
        passwordStrength={passwordStrength}
        phoneNumber={phoneNumber}
        setAgreedToTerms={setAgreedToTerms}
        setEmail={setEmail}
        setIsPasswordVisible={setIsPasswordVisible}
        setName={setName}
        setPassword={setPassword}
        setPhoneNumber={setPhoneNumber}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}

function barFillFor(strength: PasswordStrength, index: number, tokens: ThemeTokens) {
  const filled =
    (strength === "weak" && index === 0) ||
    (strength === "fair" && index <= 1) ||
    (strength === "good" && index <= 2);
  return { backgroundColor: filled ? (strength === "weak" ? tokens.error : tokens.success) : tokens.sunken };
}

function strengthLabelColor(strength: PasswordStrength, tokens: ThemeTokens) {
  return { color: strength === "weak" ? tokens.error : tokens.success };
}

function strengthLabelText(strength: PasswordStrength) {
  if (strength === "weak") return "Weak";
  if (strength === "fair") return "Fair";
  if (strength === "good") return "Good";
  return "";
}
