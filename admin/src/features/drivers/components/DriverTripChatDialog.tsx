import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OrderChatMessage } from "../driverDetailTypes";

interface DriverTripChatDialogProps {
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
  messages: OrderChatMessage[];
  isLoading: boolean;
}

/** Chat log dialog for one trip, opened directly from the trips table (no order picker -- the order is already known). */
export function DriverTripChatDialog({ orderId, onOpenChange, messages, isLoading }: DriverTripChatDialogProps) {
  return (
    <Dialog open={!!orderId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Chat Log for {orderId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">Loading chat messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No chat history recorded for this trip.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isDriver = msg.role === "driver";
                return (
                  <div key={msg._id} className={`flex flex-col ${isDriver ? "items-start" : "items-end"}`}>
                    <span className="text-[10px] text-muted-foreground font-semibold px-1 mb-0.5">
                      {msg.senderId?.name || (isDriver ? "Driver" : "User")} ({msg.role.toUpperCase()})
                    </span>
                    <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-xs ${isDriver ? "bg-muted text-foreground rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground px-1 mt-0.5">{msg.time || new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
