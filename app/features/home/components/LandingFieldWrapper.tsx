import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  identifier: any;
  setIdentifier: any;
  styles: any;
  tokens: any;
}

export function LandingFieldWrapper({
  identifier,
  setIdentifier,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{t("app.home.phoneOrEmail")}</Text>
      <View style={[styles.inputContainer, styles.inputContainerAccent]}>
        <TextInput
          style={styles.input}
          placeholder="98490 21734"
          placeholderTextColor={tokens.muted}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}
