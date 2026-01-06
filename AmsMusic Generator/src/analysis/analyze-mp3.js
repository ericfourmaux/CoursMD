// src/analysis/analyze-mp3.js
export function analyzeAudioBuffer(audioBuffer) {
  const sr = audioBuffer.sampleRate;
  const ch0 = audioBuffer.getChannelData(0);

  // --- Prétraitement : normalisation légère
  const x = new Float32Array(ch0.length);
  let max = 0;
  for (let i = 0; i < ch0.length; i++) { max = Math.max(max, Math.abs(ch0[i])); }
  const g = max > 0 ? 1 / max : 1;
  for (let i = 0; i < ch0.length; i++) x[i] = ch0[i] * g;

  // --- Détection d'onsets simple (énergie + dérivée)
  const hop = 512, win = 1024;
  const onsets = [];
  let prevEnergy = 0;
  for (let p = 0; p + win < x.length; p += hop) {
    let e = 0;
    for (let i = 0; i < win; i++) { const s = x[p + i]; e += s * s; }
    e /= win;
    const diff = e - prevEnergy;
    if (diff > 0.005) { // seuil empirique
      const t = (p / sr);
      onsets.push({ t, energy: e });
    }
    prevEnergy = e * 0.9 + prevEnergy * 0.1; // lissage
  }

  // --- BPM (autocorrélation des inter-onset intervals)
  const IOIs = [];
  for (let i = 1; i < onsets.length; i++) IOIs.push(onsets[i].t - onsets[i - 1].t);
  const guessBPM = (() => {
    if (!IOIs.length) return 120;
    // moyenne robuste proche du quartile inférieur
    IOIs.sort((a, b) => a - b);
    const q = IOIs[Math.floor(IOIs.length * 0.25)] || IOIs[0];
    let bpm = Math.round(60 / q);
    // normaliser dans [60..180]
    while (bpm < 60) bpm *= 2;
    while (bpm > 180) bpm /= 2;
    return Math.round(bpm);
  })();

  // --- Pitch tracking simple (autocorrélation) pour basse/lead
  function detectPitch(buffer, start, length) {
    const N = Math.min(length, buffer.length - start);
    if (N < 1024) return null;
    let bestLag = 0, bestVal = 0;
    const maxLag = Math.floor(sr / 40);  // 40 Hz min
    const minLag = Math.floor(sr / 500); // 500 Hz max
    for (let lag = minLag; lag < maxLag; lag++) {
      let acc = 0;
      for (let i = 0; i < N - lag; i++) acc += buffer[start + i] * buffer[start + i + lag];
      if (acc > bestVal) { bestVal = acc; bestLag = lag; }
    }
    if (bestLag > 0) return sr / bestLag;
    return null;
  }

  // échantillonne des pitches autour des onsets (monophonique "grossier")
  const pitches = [];
  for (const o of onsets) {
    const start = Math.floor(o.t * sr);
    const f0 = detectPitch(x, start, 2048);
    if (f0 && f0 > 40 && f0 < 1000) pitches.push({ t: o.t, f0 });
  }

  return { bpm: guessBPM, onsets, pitches, sampleRate: sr, duration: ch0.length / sr };
}
