// A short two-tone chime for "you need to look at this now" alerts (new order,
// scheduled delivery request). Shared so every listener plays the exact same
// sound instead of each page defining its own copy.
export const playNewOrderChime = () => {
  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();

    // Browsers suspend a freshly-created AudioContext until a user gesture has
    // happened on the page. A vendor who opens the dashboard and then just
    // leaves it open waiting for orders — the whole point of this feature — may
    // never have interacted with the page at all, so the very first chime could
    // start(), run, and stop() on a suspended context and produce no sound,
    // with no error to say so. Resuming first (safe to call even when already
    // running) is what actually makes the first order's chime audible.
    const play = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.start();

      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.6);

      osc.stop(ctx.currentTime + 0.6);
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(play).catch(() => {
        // Autoplay was blocked outright (no gesture has happened on the page yet)
        // — the in-app toast still carries the alert, so nothing is lost silently.
        console.warn("[notificationSound] Audio blocked until the page is interacted with.");
      });
    } else {
      play();
    }
  } catch (e) {
    console.warn("Failed to play chime:", e);
  }
};
