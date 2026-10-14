import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { type ThemeTokens } from "@/constants/colors";
import { type SupportBot } from "../useSupportBot";
import { type BotStyles } from "../supportBot.styles";
import { SupportBotOrderPicker } from "./SupportBotOrderPicker";

interface Props {
  bot: SupportBot;
  styles: BotStyles;
  tokens: ThemeTokens;
}

// One question and its answer: skeleton while the worker builds it, then the plain-text
// answer, which order it is about (with "Change"), Yes/No, and "Talk to an agent".
export function SupportBotAnswerCard({ bot, styles, tokens }: Props) {
  const { t } = useTranslation();
  const [picking, setPicking] = React.useState(false);
  const { intent, phase, result, orderId, feedback } = bot;
  if (!intent) return null;

  const failed = phase === "error" || phase === "timeout";
  const helpedYes = feedback === true;

  return (
    <View style={styles.answerCard}>
      <Text style={styles.answerQuestion}>{intent.question}</Text>

      {phase === "asking" && (
        <View style={{ gap: 8 }}>
          <Skeleton width="95%" height={14} />
          <Skeleton width="80%" height={14} />
          <Skeleton width="60%" height={14} />
        </View>
      )}

      {failed && (
        <View style={styles.answerBubble}>
          <Text style={styles.answerText}>{t(phase === "timeout" ? "app.supportBot.timeout" : "app.supportBot.error")}</Text>
          <Button title={t("app.supportBot.tryAgain")} variant="secondary" size="sm" onPress={() => bot.ask(intent)} />
        </View>
      )}

      {phase === "answered" && result && (
        <>
          <View style={styles.answerBubble}>
            <Text style={styles.answerText}>{result.answer}</Text>
            {intent.needsOrder && orderId && (
              <>
                <View style={styles.orderRow}>
                  <Text style={styles.orderText}>{t("app.supportBot.aboutOrder", { id: orderId })}</Text>
                  <TouchableOpacity onPress={() => setPicking((p) => !p)} hitSlop={8}>
                    <Text style={styles.changeText}>{t("app.supportBot.change")}</Text>
                  </TouchableOpacity>
                </View>
                {picking && (
                  <SupportBotOrderPicker
                    category={intent.category}
                    selectedId={orderId}
                    styles={styles}
                    tokens={tokens}
                    onPick={(id) => {
                      setPicking(false);
                      if (id !== orderId) bot.changeOrder(id);
                    }}
                  />
                )}
              </>
            )}
          </View>

          {result.status === "done" && feedback === null && (
            <>
              <Text style={styles.feedbackLabel}>{t("app.supportBot.didThisHelp")}</Text>
              <View style={styles.feedbackRow}>
                <Button style={styles.feedbackBtn} title={t("app.supportBot.yes")} variant="secondary" size="sm" onPress={() => bot.giveFeedback(true)} />
                <Button style={styles.feedbackBtn} title={t("app.supportBot.no")} variant="secondary" size="sm" onPress={() => bot.giveFeedback(false)} />
              </View>
            </>
          )}
          {helpedYes && <Text style={styles.thanks}>{t("app.supportBot.glad")}</Text>}
        </>
      )}

      {(phase === "answered" || failed) && (
        <Button
          title={t("app.supportBot.talkToAgent")}
          variant={feedback === false || failed ? "primary" : "ghost"}
          size="sm"
          loading={bot.escalating}
          disabled={!bot.result && failed}
          onPress={bot.talkToAgent}
        />
      )}
      {phase === "asking" && <ActivityIndicator color={tokens.brand} style={{ alignSelf: "flex-start" }} />}
    </View>
  );
}
