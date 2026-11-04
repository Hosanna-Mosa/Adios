import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
  valid: boolean;
  dirty: boolean;
  onSave: () => void;
  isSaving: boolean;
}

/** "Max unhelpful answers before agent" -- SystemConfig supportBot.maxUnhelpfulAnswers. */
export function BotLimitCard({ value, onChange, valid, dirty, onSave, isSaving }: Props) {
  const { t } = useTranslation();
  return (
    <div className="section-card p-5 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[240px]">
        <p className="font-semibold text-foreground">{t("supportBot.limitTitle")}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("supportBot.limitDescription")}</p>
      </div>
      <div className="w-24">
        <Input type="number" min={1} max={20} className="h-10" value={value} onChange={(e) => onChange(e.target.value)} />
        {!valid && <p className="text-[11px] text-destructive mt-1">{t("supportBot.limitInvalid")}</p>}
      </div>
      <Button className="rounded-xl" onClick={onSave} disabled={!dirty || isSaving}>
        {isSaving ? t("common.savingEllipsis") : t("supportBot.save")}
      </Button>
    </div>
  );
}
