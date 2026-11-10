import { create } from 'zustand';

// Hands a spoken search from the mic sheet (HomeIntro) to the Home search state
// (useHomeRestaurants) without threading a setter through the Home props.
// In-memory only; the Home screen consumes and clears it.

interface VoiceSearchState {
  pendingText: string | null;
  submit: (text: string) => void;
  clear: () => void;
}

export const useVoiceSearchStore = create<VoiceSearchState>((set) => ({
  pendingText: null,
  submit: (text) => set({ pendingText: text.trim() || null }),
  clear: () => set({ pendingText: null }),
}));
