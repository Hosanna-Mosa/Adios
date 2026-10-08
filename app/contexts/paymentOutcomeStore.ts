import { create } from "zustand";

// The full-screen "Payment successful" / "Payment failed" animation shown when
// the customer comes back from the Razorpay checkout. utils/razorpay.ts raises
// it; components/PaymentOutcomeOverlay.tsx (mounted once in app/_layout.tsx)
// plays it and calls `finish` when it's done.

export type PaymentOutcome = "success" | "failure";

interface PaymentOutcomeState {
  outcome: PaymentOutcome | null;
  /** Bumped on every show, so the same outcome twice in a row replays. */
  playId: number;
  /** True while the overlay is mounted — with nothing to play it, `show` must not wait. */
  hasPlayer: boolean;
  setHasPlayer: (mounted: boolean) => void;
  show: (outcome: PaymentOutcome) => Promise<void>;
  finish: () => void;
}

// Never hold a caller longer than this, even if the overlay misses its cue.
const MAX_WAIT_MS = 4000;
let pending: { resolve: () => void; timer: ReturnType<typeof setTimeout> } | null = null;

function settlePending() {
  if (!pending) return;
  clearTimeout(pending.timer);
  pending.resolve();
  pending = null;
}

export const usePaymentOutcomeStore = create<PaymentOutcomeState>((set, get) => ({
  outcome: null,
  playId: 0,
  hasPlayer: false,
  setHasPlayer: (mounted) => {
    set({ hasPlayer: mounted });
    if (!mounted) settlePending();
  },
  show: (outcome) => {
    settlePending();
    if (!get().hasPlayer) return Promise.resolve();
    set((s) => ({ outcome, playId: s.playId + 1 }));
    return new Promise<void>((resolve) => {
      pending = { resolve, timer: setTimeout(() => get().finish(), MAX_WAIT_MS) };
    });
  },
  finish: () => {
    set({ outcome: null });
    settlePending();
  },
}));

/** Plays the outcome animation; resolves once it has finished (immediately if nothing can play it). */
export const showPaymentOutcome = (outcome: PaymentOutcome) => usePaymentOutcomeStore.getState().show(outcome);
