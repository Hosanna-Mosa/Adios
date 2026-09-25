import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { AdminDriver, AdminOrderSummary, OrderChatMessage } from "../types";

interface DriverOrderChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatDriver: AdminDriver | null;
  orders: AdminOrderSummary[];
  selectedOrderId: string | undefined;
  onSelectOrder: (order: AdminOrderSummary | null) => void;
  chatMessages: OrderChatMessage[];
  loadingChatMessages: boolean;
  hasSelectedOrder: boolean;
}

/** Order Chats dialog for a driver: pick an order, view the user/driver conversation for it. */
export function DriverOrderChatDialog({
  open,
  onOpenChange,
  chatDriver,
  orders,
  selectedOrderId,
  onSelectOrder,
  chatMessages,
  loadingChatMessages,
  hasSelectedOrder,
}: DriverOrderChatDialogProps) {
  const { t } = useTranslation();
  const driverOrders = orders.filter(
    (o) => (typeof o.driver === "object" ? o.driver?._id : o.driver) === chatDriver?._id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-border flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{t("drivers.chatsForDriverColon", { name: chatDriver?.user?.name, defaultValue: "Chats for Driver: {{name}}" })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">{t("drivers.selectOrder")}</label>
            <Select
              value={selectedOrderId || "none"}
              onValueChange={(val) => {
                const o = orders.find((order) => order._id === val);
                onSelectOrder(o || null);
              }}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder={t("drivers.selectOrderToViewChat")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">{t("drivers.selectOrderEllipsis")}</SelectItem>
                {driverOrders.map((o) => (
                  <SelectItem key={o._id} value={o._id}>
                    {o._id.startsWith("ORD-") ? o._id : `#${o._id.substring(o._id.length - 6).toUpperCase()}`} ({o.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 border border-border rounded-xl p-4 bg-muted/20 overflow-y-auto flex flex-col space-y-3 min-h-[300px]">
            {hasSelectedOrder ? (
              loadingChatMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">{t("orderChat.loadingChatMessages")}</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">{t("drivers.noChatMessagesFoundForOrder")}</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const senderId = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
                  const isDriver = senderId === chatDriver?.user?._id;
                  return (
                    <div key={msg._id} className={`flex flex-col max-w-[80%] ${isDriver ? "self-end items-end" : "self-start items-start"}`}>
                      <span className="text-[10px] text-muted-foreground font-semibold mb-0.5">
                        {(typeof msg.senderId === "object" ? msg.senderId?.name : undefined) || t("drivers.systemSender")}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-sm ${
                          isDriver ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[9px] block mt-1 text-right ${isDriver ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  {t("drivers.selectOrderToViewConversationDesc")}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => onOpenChange(false)} className="rounded-xl">
              {t("drivers.closeChats")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
