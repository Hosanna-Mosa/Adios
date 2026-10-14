import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useLanguageStore } from "@/contexts/languageStore";
import {
  askBot,
  escalateBotQuery,
  getBotIntents,
  getBotQuery,
  sendBotFeedback,
  type BotCategory,
  type BotIntent,
  type BotQuery,
} from "@/services/support.service";
import { ApiError } from "@/utils/api/custom-fetch";
import { trackEvent } from "@/utils/analytics";

// State and data for the support bot on app/support.tsx: the question list from
// GET /support/bot/intents, and one question at a time through
// ask → (worker builds the answer) → poll → feedback → maybe escalate to an agent.

export const SUPPORT_BOT_INTENTS_QUERY_KEY = ["support-bot", "intents"] as const;

// The worker normally answers well under a second; give it a while before offering a retry.
const POLL_MS = 1500;
const POLL_TIMEOUT_MS = 15_000;

export type BotPhase = "idle" | "asking" | "answered" | "error" | "timeout";

export function useSupportBot() {
  const queryClient = useQueryClient();
  const language = useLanguageStore((s) => s.language) ?? "en";

  const [category, setCategory] = React.useState<BotCategory | null>(null);
  const [intent, setIntent] = React.useState<BotIntent | null>(null);
  const [phase, setPhase] = React.useState<BotPhase>("idle");
  const [queryId, setQueryId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BotQuery | null>(null);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<boolean | null>(null);
  const [escalating, setEscalating] = React.useState(false);
  const [limitHit, setLimitHit] = React.useState(false);

  const intentsQuery = useQuery({
    queryKey: [...SUPPORT_BOT_INTENTS_QUERY_KEY, language],
    queryFn: () => getBotIntents(language),
    staleTime: 60_000,
  });

  const data = intentsQuery.data;
  const limitReached = limitHit || !!data?.limitReached;
  const categories = data?.categories ?? [];
  const activeCategory = category ?? categories[0] ?? null;
  const visibleIntents = (data?.intents ?? []).filter((i) => i.category === activeCategory);

  // Poll for the answer while the worker is building it.
  React.useEffect(() => {
    if (phase !== "asking" || !queryId) return;
    let stopped = false;
    const startedAt = Date.now();
    const tick = async () => {
      try {
        const q = await getBotQuery(queryId);
        if (stopped) return;
        if (q.status !== "queued") {
          setResult(q);
          setPhase("answered");
          trackEvent("support_bot_answer_shown", { intent: q.status === "done" ? intent?.key : "failed", ms: Date.now() - startedAt });
          return;
        }
      } catch {
        // Transient network error: keep polling until the timeout.
      }
      if (stopped) return;
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) setPhase("timeout");
    };
    const id = setInterval(tick, POLL_MS);
    tick();
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [phase, queryId, intent?.key]);

  const ask = React.useCallback(
    async (target: BotIntent, chosenOrderId?: string) => {
      setIntent(target);
      setPhase("asking");
      setResult(null);
      setFeedback(null);
      setQueryId(null);
      trackEvent("support_bot_question_selected", { intent: target.key, changed_order: !!chosenOrderId });
      try {
        const res = await askBot({ intentKey: target.key, orderId: chosenOrderId, lang: language });
        setOrderId(res.orderId);
        setQueryId(res.queryId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setLimitHit(true);
          setPhase("idle");
          setIntent(null);
          return;
        }
        setPhase("error");
      }
    },
    [language]
  );

  const changeOrder = React.useCallback((newOrderId: string) => intent && ask(intent, newOrderId), [intent, ask]);

  const giveFeedback = React.useCallback(
    async (helpful: boolean) => {
      if (!queryId || feedback !== null) return;
      setFeedback(helpful);
      trackEvent("support_bot_feedback", { intent: intent?.key, helpful });
      try {
        const limit = await sendBotFeedback(queryId, helpful);
        setLimitHit(limit.limitReached);
      } catch {
        // Already recorded, or the answer isn't ready: the buttons simply stay in their new state.
      }
      queryClient.invalidateQueries({ queryKey: SUPPORT_BOT_INTENTS_QUERY_KEY });
    },
    [queryId, feedback, intent?.key, queryClient]
  );

  const talkToAgent = React.useCallback(async () => {
    if (!queryId || escalating) return;
    setEscalating(true);
    trackEvent("support_bot_escalated", { intent: intent?.key, after_feedback: feedback === null ? "none" : feedback });
    try {
      const { ticketId } = await escalateBotQuery(queryId);
      router.push({ pathname: "/support-chat", params: { ticketId } });
    } catch {
      router.push("/support-chat");
    } finally {
      setEscalating(false);
    }
  }, [queryId, escalating, intent?.key, feedback]);

  // Limit reached: no question was asked, so there is no bot query to attach; open a plain chat.
  const talkToAgentDirect = React.useCallback(() => {
    trackEvent("support_bot_escalated", { intent: "limit_reached", after_feedback: false });
    router.push("/support-chat");
  }, []);

  const reset = React.useCallback(() => {
    setIntent(null);
    setPhase("idle");
    setQueryId(null);
    setResult(null);
    setFeedback(null);
  }, []);

  return {
    categories,
    activeCategory,
    setCategory,
    intents: visibleIntents,
    isLoading: intentsQuery.isLoading,
    isError: intentsQuery.isError,
    refetch: intentsQuery.refetch,
    limitReached,
    intent,
    phase,
    result,
    orderId,
    feedback,
    escalating,
    ask,
    changeOrder,
    giveFeedback,
    talkToAgent,
    talkToAgentDirect,
    reset,
  };
}

export type SupportBot = ReturnType<typeof useSupportBot>;
