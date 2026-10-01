import { ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { PersonalDetailsPhoneField } from "./PersonalDetailsPhoneField";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";

// Moved out of app/personal-details.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  blurField: (field: string, value: string) => () => void;
  editField: any;
  email: string;
  errors: Partial<Record<"name" | "username" | "email", string>>;
  handleSave: () => void;
  insets: EdgeInsets;
  name: string;
  saving: any;
  setEmail: any;
  setName: any;
  setUsername: any;
  styles: any;
  tokens: ThemeTokens;
  user: any;
  username: any;
}

export function PersonalDetailsBody({
  accent,
  blurField,
  editField,
  email,
  errors,
  handleSave,
  insets,
  name,
  saving,
  setEmail,
  setName,
  setUsername,
  styles,
  tokens,
  user,
  username,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 12 }}>
        <Animated.View entering={staggerListItem(0)}>
          <Text style={styles.label}>{t("app.auth.fullName")}</Text>
          <TextInput
            style={[styles.field, errors.name && styles.fieldInvalid]}
            value={name}
            onChangeText={editField("name", setName)}
            onBlur={blurField("name", name)}
            placeholder={t("app.auth.yourName")}
            placeholderTextColor={tokens.muted}
          />
          {!!errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(1)}>
          <Text style={styles.label}>{t("app.auth.username")}</Text>
          <TextInput
            style={[styles.field, errors.username && styles.fieldInvalid]}
            value={username}
            onChangeText={editField("username", setUsername)}
            onBlur={blurField("username", username)}
            placeholder={t("app.auth.handle")}
            autoCapitalize="none"
            placeholderTextColor={tokens.muted}
          />
          {!!errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(2)}>
          <Text style={styles.label}>{t("app.auth.email")}</Text>
          <TextInput
            style={[styles.field, errors.email ? styles.fieldInvalid : { borderColor: accent.accent, borderWidth: 2 }]}
            value={email}
            onChangeText={editField("email", setEmail)}
            onBlur={blurField("email", email)}
            placeholder={t("app.auth.youremailcom")}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={tokens.muted}
          />
          {!!errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(3)}>
          <Text style={styles.label}>{t("app.auth.phone")}</Text>
          <PersonalDetailsPhoneField
            styles={styles}
            user={user}
          />
          <Text style={styles.phoneHint}>{t("app.auth.thisIsYourLoginNumberContact")} <Text style={styles.phoneHintLink} onPress={() => router.push("/support")}>{t("app.auth.supportLinkText")}</Text> {t("app.auth.toChangeItThereapossNoSelfserve")}</Text>
        </Animated.View>
      </View>
    </ScrollView>

    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <Button title={t("app.auth.updateProfile")} onPress={handleSave} loading={saving} fullWidth />
    </View>
    </>
  );
}
