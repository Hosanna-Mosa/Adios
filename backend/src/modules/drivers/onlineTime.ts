/**
 * How long a driver was online. Pure: the model stores one row per online stretch, this adds them up.
 *
 * A stretch that was never closed (the app was killed, the phone died, the driver lost signal) must not
 * count forever, so an open one only counts up to a little after the last time the driver was heard from.
 */

/** Silence longer than this means the driver is gone; the stretch ends where we last heard from them. */
export const SESSION_STALE_MS = 10 * 60 * 1000;

export interface OnlineSessionLike {
  startedAt: Date;
  endedAt?: Date | null;
  lastSeenAt: Date;
}

/** When a stretch ended: its recorded end, or for an open one, the last sign of life (never after `now`). */
export function sessionEnd(session: OnlineSessionLike, now: Date = new Date()): Date {
  if (session.endedAt) return session.endedAt;
  const lastHeard = new Date(session.lastSeenAt.getTime() + SESSION_STALE_MS);
  return lastHeard.getTime() < now.getTime() ? lastHeard : now;
}

/** Milliseconds of the stretch that fall inside [from, to). */
export function overlapMs(session: OnlineSessionLike, from: Date, to: Date, now: Date = new Date()): number {
  const start = Math.max(session.startedAt.getTime(), from.getTime());
  const end = Math.min(sessionEnd(session, now).getTime(), to.getTime());
  return Math.max(0, end - start);
}

/** Hours online inside [from, to), to one decimal. */
export function onlineHoursWithin(sessions: OnlineSessionLike[], from: Date, to: Date, now: Date = new Date()): number {
  const ms = sessions.reduce((sum, session) => sum + overlapMs(session, from, to, now), 0);
  return Math.round((ms / 3_600_000) * 10) / 10;
}
