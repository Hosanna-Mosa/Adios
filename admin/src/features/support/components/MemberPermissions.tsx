import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { SUPPORT_PERMISSION_KEYS, type SupportPermission } from "../supportExtras";

const LABELS: Record<SupportPermission, [string, string]> = {
  reply: ["Reply to customers", "Answer tickets and chats"],
  resolve: ["Resolve and reopen", "Ask the customer to confirm resolution, or reopen a case"],
  priority: ["Change priority", "Set how urgent a ticket is"],
  notes: ["Internal notes", "Write private notes on a ticket"],
  cancel_orders: ["Cancel orders", "Cancel an order on a customer's behalf"],
  export: ["Export tickets", "Download the tickets CSV"],
  manage_canned: ["Manage canned replies", "Create, edit and delete the shared replies"],
};

/** The list of things a support member may do. Controlled: the caller keeps the selection. */
export function MemberPermissions({ value, onChange }: { value: SupportPermission[]; onChange: (next: SupportPermission[]) => void }) {
  const { t } = useTranslation();
  const toggle = (key: SupportPermission, on: boolean) => onChange(on ? [...value, key] : value.filter((p) => p !== key));
  return (
    <div className="space-y-2">
      {SUPPORT_PERMISSION_KEYS.map((key) => (
        <label key={key} className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 cursor-pointer hover:bg-muted/30">
          <Checkbox checked={value.includes(key)} onCheckedChange={(on) => toggle(key, on === true)} className="mt-0.5" />
          <span>
            <span className="block text-sm font-semibold text-foreground">{t(`supportTools.permission.${key}`, LABELS[key][0])}</span>
            <span className="block text-xs text-muted-foreground">{t(`supportTools.permissionHint.${key}`, LABELS[key][1])}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

