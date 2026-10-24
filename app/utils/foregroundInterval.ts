import { AppState } from "react-native";

/**
 * `setInterval` for polling: ticks only while the app is in the foreground.
 * Going to the background stops the timer; coming back runs `fn` once straight
 * away (the data is stale by then) and restarts it. Returns a function that
 * stops it for good, to call where `clearInterval` would be.
 */
export function setForegroundInterval(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (timer === null) timer = setInterval(fn, ms);
  };
  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (AppState.currentState === "active") start();

  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      if (timer === null) {
        fn();
        start();
      }
    } else {
      stop();
    }
  });

  return () => {
    stop();
    sub.remove();
  };
}
