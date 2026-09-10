import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "../paymentsTypes";

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

/** The "Transaction Invoice" modal on Payments. */
export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Transaction Invoice</DialogTitle>
        </DialogHeader>
        {transaction && (
          <div className="space-y-4 py-4 text-sm">
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Invoice Reference:</span>
              <span className="font-medium text-foreground">{transaction.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Date:</span>
              <span className="font-medium text-foreground">{transaction.date}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Time:</span>
              <span className="font-medium text-foreground">{transaction.time}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Fulfillment Route:</span>
              <span className="font-medium text-foreground">{transaction.route}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Payout Amount:</span>
              <span className="font-bold text-foreground">{transaction.fee}</span>
            </div>
            <div className="flex justify-between border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground">Invoice Status:</span>
              <span className="font-bold uppercase text-success">{transaction.status}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
