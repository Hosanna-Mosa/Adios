import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Switch } from "@/components/ui/switch";
import type { SupportIntent } from "../types";

interface Props {
  intents: SupportIntent[];
  isLoading: boolean;
  onToggle: (i: SupportIntent) => void;
  onEdit: (i: SupportIntent) => void;
  onDelete: (i: SupportIntent) => void;
}

/** The bot's questions with their enabled switch and how often the answer helped. */
export function IntentTable({ intents, isLoading, onToggle, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const columns: DataTableColumn<SupportIntent>[] = [
    {
      key: "question",
      header: t("supportBot.question"),
      cell: (i) => (
        <div>
          <p className="font-semibold text-foreground">{i.question.en}</p>
          <p className="text-[10px] text-muted-foreground">
            {i.key}
            {!i.question.te || !i.question.hi ? ` · ${t("supportBot.missingTranslation")}` : ""}
          </p>
        </div>
      ),
    },
    { key: "category", header: t("supportBot.category"), cell: (i) => t(`supportBot.categories.${i.category}`) },
    { key: "resolver", header: t("supportBot.resolver"), cell: (i) => <code className="text-xs">{i.resolver}</code> },
    {
      key: "feedback",
      header: t("supportBot.helped"),
      cell: (i) => {
        const total = i.helpfulCount + i.notHelpfulCount;
        return (
          <span className="text-sm">
            {i.helpfulCount} / {total}
            {total > 0 && <span className="text-muted-foreground"> ({Math.round((i.helpfulCount / total) * 100)}%)</span>}
          </span>
        );
      },
    },
    { key: "enabled", header: t("supportBot.enabled"), cell: (i) => <Switch checked={i.enabled} onCheckedChange={() => onToggle(i)} /> },
    {
      key: "actions",
      header: "",
      cell: (i) => (
        <div className="flex gap-2 justify-end">
          <button className="p-1.5 rounded-lg hover:bg-muted" onClick={() => onEdit(i)} aria-label={t("supportBot.edit")}>
            <Pencil className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => onDelete(i)} aria-label={t("supportBot.delete")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="section-card overflow-hidden">
      <DataTable
        columns={columns}
        data={intents}
        rowKey={(i) => i._id}
        isLoading={isLoading}
        loadingLabel={t("supportBot.loading")}
        emptyLabel={t("supportBot.empty")}
        headerRowClassName="bg-muted/50"
        rowClassName="border-t border-border hover:bg-muted/30 transition-colors text-sm"
      />
    </div>
  );
}
