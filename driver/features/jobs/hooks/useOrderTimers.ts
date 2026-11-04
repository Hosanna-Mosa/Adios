import { useEffect, useState } from "react";

const toMs = (iso?: string | null) => (iso ? new Date(iso).getTime() : NaN);

/** The helper task clock. It counts from the server's taskStartedAt (so it survives an app
 * restart) and stops at taskCompletedAt; before the start OTP is accepted it reads 0.
 * (The restaurant prep countdown and the waiting fee it counted on the phone were
 * removed — neither came from the server.) */
export function useOrderTimers(
  status: string | undefined,
  isHelper: boolean,
  taskStartedAt?: string | null,
  taskCompletedAt?: string | null,
) {
  const [now, setNow] = useState(() => Date.now());
  const startMs = toMs(taskStartedAt);
  const endMs = toMs(taskCompletedAt);
  const done = status === "delivered" || status === "completed";
  const running = isHelper && !Number.isNaN(startMs) && !done && Number.isNaN(endMs);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const until = Number.isNaN(endMs) ? now : endMs;
  const taskTimerSeconds =
    isHelper && !Number.isNaN(startMs) ? Math.max(0, Math.floor((until - startMs) / 1000)) : 0;

  return { taskTimerSeconds };
}
