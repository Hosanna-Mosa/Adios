/**
 * In-app replacement for the browser's alert() / confirm().
 *
 *   if (await appConfirm({ title: "Delete this?", tone: "destructive" })) { ... }
 *   await appAlert("Saved.");
 *
 * Requests are queued and rendered one at a time by <AppDialogHost />, which
 * is mounted once in App.tsx. Never call window.alert/confirm/prompt — ESLint's
 * `no-alert` rule enforces this.
 */

export type DialogTone = "default" | "destructive";

export interface DialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" styles the confirm button red, for delete/remove actions. */
  tone?: DialogTone;
}

export interface DialogRequest extends DialogOptions {
  id: number;
  kind: "alert" | "confirm";
  resolve: (confirmed: boolean) => void;
}

let nextId = 1;
const queue: DialogRequest[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function enqueue(
  kind: DialogRequest["kind"],
  options: DialogOptions | string,
): Promise<boolean> {
  const normalised = typeof options === "string" ? { title: options } : options;
  return new Promise<boolean>((resolve) => {
    queue.push({ ...normalised, kind, id: nextId++, resolve });
    emit();
  });
}

/** Ask the user to confirm. Resolves true on confirm, false on cancel/dismiss. */
export const appConfirm = (options: DialogOptions | string) =>
  enqueue("confirm", options);

/** Show a message with a single OK button. Resolves once it is dismissed. */
export const appAlert = (options: DialogOptions | string) =>
  enqueue("alert", options).then(() => undefined);

// ── Store plumbing for AppDialogHost (useSyncExternalStore) ──

export function subscribeDialogs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getCurrentDialog = (): DialogRequest | null => queue[0] ?? null;

/**
 * Settle the dialog with this id and move on to the next queued one. Keyed by
 * id because closing fires both a button click and onOpenChange(false); the
 * second call must not settle the *next* dialog in the queue.
 */
export function settleDialog(id: number, confirmed: boolean) {
  if (queue[0]?.id !== id) return;
  const current = queue.shift()!;
  current.resolve(confirmed);
  emit();
}
