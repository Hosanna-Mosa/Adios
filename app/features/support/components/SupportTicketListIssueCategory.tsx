import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Section of SupportTicketList, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  CATEGORIES: any[];
  accent: any;
  creatingTicket: any;
  handleCreateTicket: any;
  newCategory: any;
  newMessage: any;
  newTitle: any;
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  setNewTitle: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  ticket: any;
  tokens: any;
}

export function SupportTicketListIssueCategory({
  CATEGORIES,
  accent,
  creatingTicket,
  handleCreateTicket,
  newCategory,
  newMessage,
  newTitle,
  setNewCategory,
  setNewMessage,
  setNewTitle,
  styles,
  ticket,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <Animated.View entering={fadeInUp(0)} style={styles.formCard}>
      <Text style={styles.formLabel}>{t("app.support.issueCategory")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {CATEGORIES.map((c) => {
          const selected = newCategory === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              style={[styles.categoryChip, selected ? { backgroundColor: accent.accent, borderColor: accent.accent } : { backgroundColor: tokens.surface, borderColor: tokens.borderStrong }]}
              onPress={() => setNewCategory(c.value)}
            >
              <Text style={[styles.categoryChipText, { color: selected ? accent.on : tokens.sec }]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.formLabel}>{t("app.support.title")}</Text>
      <TextInput
        style={styles.formInput}
        placeholder={t("app.support.egChargedTwiceForOneTrip")}
        placeholderTextColor={tokens.muted}
        value={newTitle}
        onChangeText={setNewTitle}
        maxLength={60}
      />

      <Text style={[styles.formLabel, { marginTop: 14 }]}>{t("app.support.description")}</Text>
      <TextInput
        style={styles.formTextArea}
        placeholder={t("app.support.tellUsWhatHappenedAndWhen")}
        placeholderTextColor={tokens.muted}
        multiline
        numberOfLines={4}
        value={newMessage}
        onChangeText={setNewMessage}
        textAlignVertical="top"
      />
    </Animated.View>

    <Animated.View entering={fadeInUp(60)}>
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: accent.accent, opacity: creatingTicket ? 0.7 : 1 }]}
        onPress={handleCreateTicket}
        disabled={creatingTicket}
      >
        {creatingTicket ? <ActivityIndicator color={accent.on} /> : <Text style={[styles.submitBtnText, { color: accent.on }]}>{t("app.support.submitTicket")}</Text>}
      </TouchableOpacity>
    </Animated.View>
    </>
  );
}
