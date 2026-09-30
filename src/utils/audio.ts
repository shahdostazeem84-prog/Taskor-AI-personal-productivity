// Subtle synthetic task completion chime using standard browser Web Audio API
export function playCompletionSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle melodic arpeggio chime (E5 -> G#5 -> B5)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.08); // G#5
    osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.16); // B5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Gracefully ignore if audio context is blocked by user gesture policy
  }
}
