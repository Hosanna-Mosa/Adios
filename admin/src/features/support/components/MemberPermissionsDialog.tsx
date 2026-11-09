import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SupportPermission } from "../supportExtras";
import type { SupportMember } from "../types";
import { MemberPermissions } from "./MemberPermissions";

interface Props {
  member: SupportMember;
  onClose: () => void;
  onSave: (permissions: SupportPermission[]) => Promise<unknown>;
}

/** Admin edits what one support member may do. Takes effect on their next action. */
export function MemberPermissionsDialog({ member, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState<SupportPermission[]>(member.permissions);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(value);
      toast.success(t("supportTools.permissionsSaved", "Permissions updated."));
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("supportTools.permissionsFor", { name: member.name, defaultValue: "Permissions for {{name}}" })}</DialogTitle>
          <DialogDescription>{t("supportTools.permissionsDesc", "Admins can always do everything. These apply to this support member only.")}</DialogDescription>
        </DialogHeader>
        <MemberPermissions value={value} onChange={setValue} />
        <Button onClick={save} disabled={saving} className="w-full h-11">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("supportTools.savePermissions", "Save permissions")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
