// src/reorch/from-analysis.js
export function scheduleFromAnalysis(instruments, ctx, analysis) {
  const { onsets, pitches, bpm } = analysis;
  const spb = 60 / bpm;

  onsets.forEach((o, idx) => {
    const time = ctx.currentTime + o.t; // calage absolu dans le contexte courant

    // Heuristique : 1er onset d'une mesure -> kick ; milieu -> snare ; autres -> hat
    const beatPos = (o.t / spb) % 4;
    if (beatPos < 0.25) instruments.triggerKick(time);
    else if (beatPos > 1.9 && beatPos < 2.1) instruments.triggerSnare(time);
    else instruments.triggerHat(time);

    // Pitch proche de l'onset -> note
    const nearest = pitches.reduce((best, p) =>
      Math.abs(p.t - o.t) < Math.abs((best?.t ?? 99) - o.t) ? p : best, null);
    if (nearest?.f0) {
      const id = instruments.noteOn(nearest.f0);
      setTimeout(() => instruments.noteOff(id), 180); // sustain court
    }
  });
}
