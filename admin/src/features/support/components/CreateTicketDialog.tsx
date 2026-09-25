import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { NewTicketForm } from "../types";

interface CreateTicketDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newTicket: NewTicketForm;
  onChange: (form: NewTicketForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** The "Create New Support Case" dialog. */
export function CreateTicketDialog({ isOpen, onOpenChange, newTicket, onChange, onSubmit }: CreateTicketDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("support.createNewSupportCase")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("support.issueSummaryTitle")}</label>
            <Input value={newTicket.title} onChange={(e) => onChange({ ...newTicket, title: e.target.value })} placeholder="e.g. Order #QX-9903 Damage" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("support.affectedUserName")}</label>
            <Input value={newTicket.user} onChange={(e) => onChange({ ...newTicket, user: e.target.value })} placeholder="e.g. Alex Rivera" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("support.supportCategory")}</label>
            <select
              value={newTicket.category}
              onChange={(e) => onChange({ ...newTicket, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="OPERATIONAL ISSUE">{t("support.categoryOperationalIssue")}</option>
              <option value="DELAYED DELIVERY">{t("support.categoryDelayedDelivery")}</option>
              <option value="MULTI-STOP ADJUSTMENT">{t("support.categoryMultiStopAdjustment")}</option>
              <option value="QUALITY CONTROL">{t("support.categoryQualityControl")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("support.detailedIssueMessage")}</label>
            <Textarea value={newTicket.message} onChange={(e) => onChange({ ...newTicket, message: e.target.value })} placeholder={t("support.describeComplaintPlaceholder")} required />
          </div>
          <Button type="submit" className="w-full mt-4 bg-primary text-primary-foreground">
            {t("support.submitTicketCase")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
