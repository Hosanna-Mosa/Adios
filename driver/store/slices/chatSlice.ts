import type { DriverState, SetDriverState } from "../types";

type Actions = Pick<
  DriverState,
  "addChatMessage" | "clearChat" | "setUnreadCount" | "incrementUnreadCount" | "setIsChatActive"
>;

export const createChatSlice = (set: SetDriverState): Actions => ({
  addChatMessage: (msg) => set((state) => ({ activeChat: [...state.activeChat, msg] })),
  clearChat: () => set({ activeChat: [], unreadCount: 0 }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  setIsChatActive: (isChatActive) => set({ isChatActive }),
});
