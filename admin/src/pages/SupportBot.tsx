import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useSupportIntents } from "@/features/supportBot/hooks/useSupportIntents";
import { IntentTable } from "@/features/supportBot/components/IntentTable";
import { IntentDialog } from "@/features/supportBot/components/IntentDialog";
import { BotLimitCard } from "@/features/supportBot/components/BotLimitCard";

export default function SupportBot() {
  const { t } = useTranslation();
  const bot = useSupportIntents();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{t("supportBot.title")}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t("supportBot.description")}</p>
          </div>
          <Button className="gap-2 rounded-xl" onClick={bot.openCreate}>
            <Plus className="h-4 w-4" /> {t("supportBot.newQuestion")}
          </Button>
        </div>

        <BotLimitCard
          value={bot.limitInput}
          onChange={bot.setLimitInput}
          valid={bot.limitValid}
          dirty={bot.limitDirty}
          onSave={bot.saveLimit}
          isSaving={bot.isSavingLimit}
        />

        <IntentTable intents={bot.intents} isLoading={bot.isLoading} onToggle={bot.toggle} onEdit={bot.openEdit} onDelete={bot.remove} />

        <IntentDialog
          open={bot.isOpen}
          onOpenChange={bot.setIsOpen}
          isEdit={!!bot.editing}
          form={bot.form}
          onChange={bot.setForm}
          resolvers={bot.resolvers}
          onSubmit={bot.submit}
          isSaving={bot.isSaving}
        />
      </div>
    </DashboardLayout>
  );
}
