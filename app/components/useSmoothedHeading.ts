import { useEffect, useRef, useState } from "react";

// Turns smaller than this are ignored, so the marker doesn't twitch.
const IGNORE_BELOW_DEGREES = 12;
// A turn eases in over this long instead of snapping.
const TURN_MS = 900;
const STEP_MS = 50;

/**
 * The rotation to draw for a heading that changes in jumps: eased the short way
 * round over TURN_MS, small wobbles ignored. Used for the rider's live marker.
 */
export function useSmoothedHeading(target: number | null | undefined) {
  const [shown, setShown] = useState(() => Number(target) || 0);
  const shownRef = useRef(shown);

  useEffect(() => {
    if (target == null || Number.isNaN(Number(target))) return;
    const from = shownRef.current;
    const delta = ((((Number(target) - from) % 360) + 540) % 360) - 180;
    if (Math.abs(delta) < IGNORE_BELOW_DEGREES) return;

    const start = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / TURN_MS);
      const eased = t * (2 - t);
      const value = (((from + delta * eased) % 360) + 360) % 360;
      shownRef.current = value;
      setShown(value);
      if (t >= 1) clearInterval(timer);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [target]);

  return shown;
}
