// The support pages poll GET /admin/tickets at this interval (only while the
// tab is visible) in place of the old "ticket_updated" socket event — short,
// because a customer is waiting on the other end of these chats.
export const TICKETS_REFRESH_MS = 10_000;
