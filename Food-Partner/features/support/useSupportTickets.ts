import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePartner } from "@/contexts/authStore";
import { queryKeys } from "@/queries/keys";
import { createSupportTicket, getSupportTickets, resolveTicket, sendTicketMessage } from "@/services/support.service";
import type { SupportTicket } from "@/types/models";

// The partner's support cases. Replies arrive over the socket (ticket_updated,
// handled in GlobalSocketHandler); the poll only covers a missed event, like
// the customer app's 4 s interval but gentler.

export function useSupportTickets(polling = false) {
  const partner = usePartner();
  return useQuery({
    queryKey: queryKeys.supportTickets(partner?._id ?? ""),
    queryFn: getSupportTickets,
    enabled: !!partner,
    refetchInterval: polling ? 8_000 : false,
  });
}

function usePutTicket() {
  const partner = usePartner();
  const queryClient = useQueryClient();
  return (ticket: SupportTicket) =>
    queryClient.setQueryData<SupportTicket[]>(queryKeys.supportTickets(partner?._id ?? ""), (list = []) =>
      list.some((t) => t._id === ticket._id) ? list.map((t) => (t._id === ticket._id ? ticket : t)) : [ticket, ...list],
    );
}

export function useCreateTicket() {
  const put = usePutTicket();
  return useMutation({ mutationFn: createSupportTicket, onSuccess: put });
}

export function useSendTicketMessage() {
  const put = usePutTicket();
  return useMutation({
    mutationFn: ({ ticketId, text }: { ticketId: string; text: string }) => sendTicketMessage(ticketId, text),
    onSuccess: put,
  });
}

export function useResolveTicket() {
  const put = usePutTicket();
  return useMutation({
    mutationFn: ({ ticketId, approve }: { ticketId: string; approve: boolean }) => resolveTicket(ticketId, approve),
    onSuccess: put,
  });
}
