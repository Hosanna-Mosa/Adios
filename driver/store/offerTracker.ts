/** Offer ids the driver just accepted or declined. The offer poll neither
 * re-shows these nor clears them while the accept/decline is still in flight. */
const HANDLED_TTL_MS = 2 * 60 * 1000;
const handled = new Map<string, number>();

export function markOfferHandled(id: string | undefined | null) {
  if (id) handled.set(String(id), Date.now());
}

export function isOfferHandled(id: string | undefined | null): boolean {
  if (!id) return false;
  const at = handled.get(String(id));
  if (at === undefined) return false;
  if (Date.now() - at > HANDLED_TTL_MS) {
    handled.delete(String(id));
    return false;
  }
  return true;
}
