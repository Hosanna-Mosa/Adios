import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "../paymentsTypes";
import { adminOrderStatusLabel } from "../adminOrderStatus";

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

/** The "Transaction Invoice" modal on Payments. */
export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("orders.transactionInvoice")}</DialogTitle>
        </DialogHeader>
        {transaction && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.invoiceReferenceColon")}</span>
              <span className="font-medium text-foreground">{transaction.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.dateColon")}</span>
              <span className="font-medium text-foreground">{transaction.date}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.timeColon")}</span>
              <span className="font-medium text-foreground">{transaction.time}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.fulfillmentRouteColon")}</span>
              <span className="font-medium text-foreground">{transaction.route}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.payoutAmountColon")}</span>
              <span className="font-bold text-foreground">{transaction.fee}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">{t("orders.invoiceStatusColon")}</span>
              <span className={`font-bold uppercase ${transaction.status === "SETTLED" ? "text-success" : "text-warning"}`}>{adminOrderStatusLabel(transaction.status, t)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
