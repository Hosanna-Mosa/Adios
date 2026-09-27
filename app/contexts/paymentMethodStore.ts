import { create } from 'zustand';

export type PaymentMethod = 'cash' | 'online';

/** Every place the customer pays. Each keeps its own choice. */
export type PaymentFlow = 'food' | 'delivery' | 'ride' | 'helper';

// Defaults match what each flow did before the choice existed: food and package delivery
// were online-only, rides and helper tasks were cash.
const DEFAULTS: Record<PaymentFlow, PaymentMethod> = {
  food: 'online',
  delivery: 'online',
  ride: 'cash',
  helper: 'cash',
};

interface PaymentMethodState {
  /** In-memory only: the choice lasts for this app session. */
  methods: Record<PaymentFlow, PaymentMethod>;
  setMethod: (flow: PaymentFlow, method: PaymentMethod) => void;
}

export const usePaymentMethodStore = create<PaymentMethodState>((set) => ({
  methods: DEFAULTS,
  setMethod: (flow, method) => set((s) => ({ methods: { ...s.methods, [flow]: method } })),
}));

/** For place-order handlers, which read the choice at the moment Pay is tapped. */
export const getPaymentMethod = (flow: PaymentFlow): PaymentMethod =>
  usePaymentMethodStore.getState().methods[flow];
