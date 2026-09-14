import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/signup.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  strengthLabelText: any;
  strengthLabelColor: any;
  barFillFor: any;
  email: any;
  isPasswordVisible: any;
  isPhoneDisabled: any;
  name: any;
  password: any;
  passwordStrength: any;
  phoneNumber: any;
  setEmail: any;
  setIsPasswordVisible: any;
  setName: any;
  setPassword: any;
  setPhoneNumber: any;
  styles: any;
  tokens: any;
}

export function SignupForm({
  strengthLabelText,
  strengthLabelColor,
  barFillFor,
  email,
  isPasswordVisible,
  isPhoneDisabled,
  name,
  password,
  passwordStrength,
  phoneNumber,
  setEmail,
  setIsPasswordVisible,
  setName,
  setPassword,
  setPhoneNumber,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.form} entering={fadeInUp(80)}>
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{t("app.auth.fullName")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("app.auth.rahulVerma")}
            placeholderTextColor={tokens.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{t("app.auth.phoneNumber")}</Text>
        <View
          style={[
            styles.inputContainer,
            styles.inputContainerAccent,
            isPhoneDisabled && styles.inputContainerDisabled,
          ]}
        >
          <Text style={styles.inputPrefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="98490 21734"
            placeholderTextColor={tokens.muted}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!isPhoneDisabled}
          />
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{t("app.auth.email")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("app.auth.rahulvermagmailcom")}
            placeholderTextColor={tokens.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{t("app.auth.password")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("app.auth.min8Characters")}
            placeholderTextColor={tokens.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={moderateScale(18)}
              color={tokens.sec}
            />
          </TouchableOpacity>
        </View>
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  barFillFor(passwordStrength, i, tokens),
                ]}
              />
            ))}
            <Text style={[styles.strengthLabel, strengthLabelColor(passwordStrength, tokens)]}>
              {strengthLabelText(passwordStrength)}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
