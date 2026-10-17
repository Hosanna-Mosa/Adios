import { useTranslation } from "react-i18next";
import { useSupportOrderChat } from "../../hooks/useSupportOrders";

/** The customer ↔ driver chat on an order, read-only. Customer messages on the left. */
export function SupportOrderChatLog({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const { data: messages = [], isLoading, isError } = useSupportOrderChat(orderId, true);

  if (isLoading) return <p className="px-4 pb-4 text-sm text-muted-foreground">{t("supportOrders.loadingChat")}</p>;
  if (isError) return <p className="px-4 pb-4 text-sm text-destructive">{t("supportOrders.chatLoadFailed")}</p>;
  if (!messages.length) return <p className="px-4 pb-4 text-sm italic text-muted-foreground">{t("supportOrders.noChat")}</p>;

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto px-4 pb-4">
      {messages.map((m, i) => {
        // The socket stores "driver" for the driver's messages; anything else is the customer.
        const fromCustomer = String(m.role).toLowerCase() !== "driver";
        return (
          <div key={i} className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${fromCustomer ? "bg-muted text-foreground" : "bg-primary/10 text-foreground"}`}>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {fromCustomer ? t("supportOrders.customer") : t("supportOrders.driver")} · {m.time}
              </p>
              <p className="whitespace-pre-wrap break-words">{m.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
