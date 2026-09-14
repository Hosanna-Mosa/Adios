import { ScrollView, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { PersonalDetailsPhoneField } from "./PersonalDetailsPhoneField";

// Moved out of app/personal-details.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  blurField: any;
  editField: any;
  email: any;
  errors: any;
  handleSave: any;
  insets: any;
  name: any;
  saving: any;
  setEmail: any;
  setName: any;
  setUsername: any;
  styles: any;
  tokens: any;
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
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 12 }}>
        <Animated.View entering={staggerListItem(0)}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={[styles.field, errors.name && styles.fieldInvalid]}
            value={name}
            onChangeText={editField("name", setName)}
            onBlur={blurField("name", name)}
            placeholder="Your name"
            placeholderTextColor={tokens.muted}
          />
          {!!errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(1)}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.field, errors.username && styles.fieldInvalid]}
            value={username}
            onChangeText={editField("username", setUsername)}
            onBlur={blurField("username", username)}
            placeholder="@handle"
            autoCapitalize="none"
            placeholderTextColor={tokens.muted}
          />
          {!!errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(2)}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.field, errors.email ? styles.fieldInvalid : { borderColor: accent.accent, borderWidth: 2 }]}
            value={email}
            onChangeText={editField("email", setEmail)}
            onBlur={blurField("email", email)}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={tokens.muted}
          />
          {!!errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
        </Animated.View>
        <Animated.View entering={staggerListItem(3)}>
          <Text style={styles.label}>Phone</Text>
          <PersonalDetailsPhoneField
            styles={styles}
            user={user}
          />
          <Text style={styles.phoneHint}>This is your login number. Contact <Text style={styles.phoneHintLink} onPress={() => router.push("/support")}>support</Text> to change it — there&apos;s no self-serve way to re-verify a new number yet.</Text>
        </Animated.View>
      </View>
    </ScrollView>

    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <Button title="Update profile" onPress={handleSave} loading={saving} fullWidth />
    </View>
    </>
  );
}
