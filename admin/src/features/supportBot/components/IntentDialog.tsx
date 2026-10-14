import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BOT_CATEGORIES, type IntentForm, type ResolverInfo } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: IntentForm;
  onChange: (form: IntentForm) => void;
  resolvers: ResolverInfo[];
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

const LANGS = ["en", "te", "hi"] as const;
const selectClass = "w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "text-xs font-semibold text-muted-foreground";

/** Create/edit dialog for one support bot question. */
export function IntentDialog({ open, onOpenChange, isEdit, form, onChange, resolvers, onSubmit, isSaving }: Props) {
  const { t } = useTranslation();
  const resolverInfo = resolvers.find((r) => r.key === form.resolver);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEdit ? t("supportBot.editQuestion") : t("supportBot.newQuestion")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {!isEdit && (
            <div className="space-y-1.5">
              <label className={labelClass}>{t("supportBot.key")}</label>
              <Input className="h-10" placeholder="food_where_is_order" pattern="[a-z0-9_]{2,}" value={form.key} onChange={(e) => onChange({ ...form, key: e.target.value })} required />
            </div>
          )}

          {LANGS.map((lang) => (
            <div key={lang} className="space-y-1.5">
              <label className={labelClass}>{t("supportBot.questionIn", { lang: lang.toUpperCase() })}</label>
              <Input className="h-10" value={form.question[lang]} onChange={(e) => onChange({ ...form, question: { ...form.question, [lang]: e.target.value } })} required={lang === "en"} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>{t("supportBot.category")}</label>
              <select className={selectClass} value={form.category} onChange={(e) => onChange({ ...form, category: e.target.value as IntentForm["category"] })}>
                {BOT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`supportBot.categories.${c}`)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>{t("supportBot.sortOrder")}</label>
              <Input type="number" className="h-10" value={form.sortOrder} onChange={(e) => onChange({ ...form, sortOrder: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>{t("supportBot.resolver")}</label>
            <select className={selectClass} value={form.resolver} onChange={(e) => onChange({ ...form, resolver: e.target.value })}>
              {resolvers.map((r) => (
                <option key={r.key} value={r.key}>{r.key}</option>
              ))}
            </select>
            {resolverInfo && <p className="text-[11px] text-muted-foreground">{resolverInfo.description}</p>}
          </div>

          {form.resolver === "static" && (
            <div className="space-y-3">
              {LANGS.map((lang) => (
                <div key={lang} className="space-y-1.5">
                  <label className={labelClass}>{t("supportBot.answerIn", { lang: lang.toUpperCase() })}</label>
                  <Textarea rows={3} value={form.staticAnswer[lang]} onChange={(e) => onChange({ ...form, staticAnswer: { ...form.staticAnswer, [lang]: e.target.value } })} required={lang === "en"} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("supportBot.needsOrder")}</label>
            <Switch checked={form.needsOrder} onCheckedChange={(v) => onChange({ ...form, needsOrder: v })} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("supportBot.enabled")}</label>
            <Switch checked={form.enabled} onCheckedChange={(v) => onChange({ ...form, enabled: v })} />
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={isSaving}>
            {isSaving ? t("common.savingEllipsis") : t("supportBot.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
