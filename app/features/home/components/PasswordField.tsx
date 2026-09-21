import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type LandingStyles } from "@/features/home/index.styles";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  isPasswordVisible: boolean;
  password: string;
  setIsPasswordVisible: any;
  setPassword: any;
  styles: LandingStyles;
  tokens: ThemeTokens;
}

export function PasswordField({
  isPasswordVisible,
  password,
  setIsPasswordVisible,
  setPassword,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
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
    </View>
  );
}
