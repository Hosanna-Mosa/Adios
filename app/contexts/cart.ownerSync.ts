import { useAuthStore } from "@/contexts/authStore";
import { clearSyncTimer, runSync, useCartStore } from "@/contexts/cartStore";

// Keeps the cart tied to the signed-in account. Split out of
// contexts/cartStore.ts unchanged.

const ownerIdOf = (state: { user: any | null; token: string | null }) => {
  if (!state.token || !state.user) return null;
  const id = state.user._id || state.user.id;
  return id ? String(id) : null;
};

let lastOwnerId: string | null = null;
let lastToken: string | null = null;

/**
 * The cart follows the account, not the JS runtime. Every sign-in path
 * (cold-start restore, password login, OTP login) and sign-out ends in an auth
 * store write, so one subscription covers all of them — including an account
 * switch, which resets before it hydrates.
 */
function syncOwnerFromAuth(state: { user: any | null; token: string | null }) {
  const nextOwner = ownerIdOf(state);
  const previousOwner = lastOwnerId;
  const previousToken = lastToken;
  lastOwnerId = nextOwner;
  lastToken = state.token;

  if (nextOwner === previousOwner) return;

  if (previousOwner) {
    // Sign-out drops the token before any debounced write has run, so the last
    // edit is pushed here with the credentials it was made under.
    clearSyncTimer();
    runSync(previousOwner, previousToken);
  }

  useCartStore.getState().reset();
  if (nextOwner) {
    void useCartStore.getState().hydrate(nextOwner);
  }
}

useAuthStore.subscribe((state) => syncOwnerFromAuth(state));
syncOwnerFromAuth(useAuthStore.getState());
