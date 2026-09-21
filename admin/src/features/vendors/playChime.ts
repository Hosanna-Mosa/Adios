/** Two-note chime played on a new order or scheduled-delivery socket event. */
export const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
  } catch (e) {
    console.warn("Failed to play chime:", e);
  }
};
