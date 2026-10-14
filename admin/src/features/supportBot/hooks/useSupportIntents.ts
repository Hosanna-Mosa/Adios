import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import {
  DEFAULT_MAX_UNHELPFUL,
  EMPTY_INTENT_FORM,
  type IntentForm,
  type ResolverInfo,
  type SupportIntent,
} from "../types";

const INTENTS_KEY = ["admin", "support-intents"];
const CONFIG_KEY = ["admin", "config"];

const toForm = (i: SupportIntent): IntentForm => ({
  key: i.key,
  category: i.category,
  question: { en: i.question.en, te: i.question.te ?? "", hi: i.question.hi ?? "" },
  resolver: i.resolver,
  needsOrder: i.needsOrder,
  staticAnswer: { en: i.staticAnswer?.en ?? "", te: i.staticAnswer?.te ?? "", hi: i.staticAnswer?.hi ?? "" },
  enabled: i.enabled,
  sortOrder: String(i.sortOrder),
});

const toPayload = (f: IntentForm, isEdit: boolean) => ({
  ...(isEdit ? {} : { key: f.key.trim() }),
  category: f.category,
  question: f.question,
  resolver: f.resolver,
  needsOrder: f.needsOrder,
  ...(f.resolver === "static" ? { staticAnswer: f.staticAnswer } : {}),
  enabled: f.enabled,
  sortOrder: Number(f.sortOrder) || 0,
});

/** All state/query/mutation logic for SupportBot.tsx: questions CRUD plus the unhelpful-answers limit. */
export function useSupportIntents() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SupportIntent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<IntentForm>(EMPTY_INTENT_FORM);
  const [limitInput, setLimitInput] = useState(String(DEFAULT_MAX_UNHELPFUL));

  const { data: intents = [], isLoading } = useQuery<SupportIntent[]>({
    queryKey: INTENTS_KEY,
    queryFn: () => adminFetch<SupportIntent[]>("/admin/support-intents"),
  });
  const { data: resolvers = [] } = useQuery<ResolverInfo[]>({
    queryKey: [...INTENTS_KEY, "resolvers"],
    queryFn: () => adminFetch<ResolverInfo[]>("/admin/support-intents/resolvers"),
    staleTime: Infinity,
  });
  const { data: config } = useQuery<{ supportBot?: { maxUnhelpfulAnswers: number } }>({
    queryKey: CONFIG_KEY,
    queryFn: () => adminFetch("/admin/config"),
  });
  const savedLimit = config?.supportBot?.maxUnhelpfulAnswers ?? DEFAULT_MAX_UNHELPFUL;
  useEffect(() => setLimitInput(String(savedLimit)), [savedLimit]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: INTENTS_KEY });
  const onError = (err: Error) => toast.error(err.message || t("supportBot.saveFailed"));

  const saveMutation = useMutation({
    mutationFn: ({ f, id }: { f: IntentForm; id?: string }) =>
      adminFetch(id ? `/admin/support-intents/${id}` : "/admin/support-intents", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(toPayload(f, !!id)),
      }),
    onSuccess: () => {
      toast.success(t("supportBot.saved"));
      setIsOpen(false);
      refresh();
    },
    onError,
  });

  const toggleMutation = useMutation({
    mutationFn: (i: SupportIntent) =>
      adminFetch(`/admin/support-intents/${i._id}`, { method: "PUT", body: JSON.stringify({ enabled: !i.enabled }) }),
    onSuccess: refresh,
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/support-intents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("supportBot.deleted"));
      refresh();
    },
    onError,
  });

  const limitMutation = useMutation({
    mutationFn: (n: number) =>
      adminFetch("/admin/config", { method: "PUT", body: JSON.stringify({ supportBot: { maxUnhelpfulAnswers: n } }) }),
    onSuccess: () => {
      toast.success(t("supportBot.limitSaved"));
      queryClient.invalidateQueries({ queryKey: CONFIG_KEY });
    },
    onError,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_INTENT_FORM);
    setIsOpen(true);
  };
  const openEdit = (i: SupportIntent) => {
    setEditing(i);
    setForm(toForm(i));
    setIsOpen(true);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ f: form, id: editing?._id });
  };
  const remove = async (i: SupportIntent) => {
    if (await appConfirm(t("supportBot.confirmDelete", { question: i.question.en }))) deleteMutation.mutate(i._id);
  };

  const limitValue = Number(limitInput);
  const limitValid = Number.isInteger(limitValue) && limitValue >= 1 && limitValue <= 20;

  return {
    intents,
    resolvers,
    isLoading,
    isOpen,
    setIsOpen,
    editing,
    form,
    setForm,
    openCreate,
    openEdit,
    submit,
    remove,
    isSaving: saveMutation.isPending,
    toggle: (i: SupportIntent) => toggleMutation.mutate(i),
    limitInput,
    setLimitInput,
    limitValid,
    limitDirty: limitValid && limitValue !== savedLimit,
    saveLimit: () => limitValid && limitMutation.mutate(limitValue),
    isSavingLimit: limitMutation.isPending,
  };
}
