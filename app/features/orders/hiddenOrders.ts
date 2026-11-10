import { useEffect } from "react";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// "Delete this order" on a past order hides it from the list on this device. The order and its
// receipt stay on the server (invoices and refunds still need them), so this is a local hide.

const KEY = "orders:hidden";

interface HiddenState {
  ids: string[];
  loaded: boolean;
  load: () => Promise<void>;
  hide: (id: string) => void;
}

const useHiddenStore = create<HiddenState>((set, get) => ({
  ids: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      set({ ids: Array.isArray(ids) ? ids : [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  hide: (id) => {
    const ids = Array.from(new Set([...get().ids, id]));
    set({ ids });
    AsyncStorage.setItem(KEY, JSON.stringify(ids)).catch(() => {});
  },
}));

/** Ids of orders the customer deleted from their history on this device, plus a way to add one. */
export function useHiddenOrders() {
  const ids = useHiddenStore((s) => s.ids);
  const hide = useHiddenStore((s) => s.hide);
  const load = useHiddenStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return { hiddenIds: ids, hideOrder: hide };
}
