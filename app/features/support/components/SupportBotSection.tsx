import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Badge";
import { type ThemeTokens } from "@/constants/colors";
import { useSupportBot } from "../useSupportBot";
import { createBotStyles } from "../supportBot.styles";
import { SupportBotAnswerCard } from "./SupportBotAnswerCard";

interface Props {
  tokens: ThemeTokens;
}

// Replaces the hardcoded FAQ: category chips, the admin-managed question list with
// "Helped X people", and the answer card once a question is picked.
export function SupportBotSection({ tokens }: Props) {
  const { t } = useTranslation();
  const bot = useSupportBot();
  const styles = React.useMemo(() => createBotStyles(tokens), [tokens]);

  if (bot.isLoading) return <ActivityIndicator color={tokens.brand} />;
  if (bot.isError) {
    return (
      <View style={styles.answerCard}>
        <Text style={styles.answerText}>{t("app.supportBot.error")}</Text>
        <Button title={t("app.supportBot.tryAgain")} variant="secondary" size="sm" onPress={() => bot.refetch()} />
      </View>
    );
  }

  if (bot.intent) {
    return (
      <View>
        <TouchableOpacity style={styles.back} onPress={bot.reset} hitSlop={8}>
          <Ionicons name="chevron-back" size={16} color={tokens.brand} />
          <Text style={styles.backText}>{t("app.supportBot.allQuestions")}</Text>
        </TouchableOpacity>
        <SupportBotAnswerCard bot={bot} styles={styles} tokens={tokens} />
      </View>
    );
  }

  if (bot.limitReached) {
    return (
      <View style={styles.answerCard}>
        <View style={styles.note}>
          <Text style={styles.noteText}>{t("app.supportBot.limitReached")}</Text>
        </View>
        <Button title={t("app.supportBot.talkToAgent")} onPress={bot.talkToAgentDirect} />
      </View>
    );
  }

  if (!bot.intents.length && !bot.categories.length) {
    return <Text style={styles.empty}>{t("app.supportBot.noQuestions")}</Text>;
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {bot.categories.map((c) => (
          <Chip key={c} label={t(`app.supportBot.categories.${c}`)} selected={c === bot.activeCategory} onPress={() => bot.setCategory(c)} />
        ))}
      </ScrollView>
      <View style={styles.card}>
        {bot.intents.map((q, i) => (
          <TouchableOpacity
            key={q.key}
            activeOpacity={0.7}
            style={[styles.row, i < bot.intents.length - 1 && styles.rowDivider]}
            onPress={() => bot.ask(q)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.question}>{q.question}</Text>
              {q.helpfulCount > 0 && <Text style={styles.helped}>{t("app.supportBot.helpedPeople", { count: q.helpfulCount })}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
