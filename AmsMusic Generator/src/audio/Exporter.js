// src/audio/Exporter.js
export async function renderToMp3({ durationSec = 30, tempo = 120 }) {
  const sampleRate = 44100;
  const offline = new OfflineAudioContext({ numberOfChannels: 2, length: durationSec * sampleRate, sampleRate });

  // Bypass worklets: pour un export concis on recrée les mêmes “instruments” à base de nodes natifs.
  // (Tu peux aussi charger les worklets dans offline.audioWorklet.addModule, si ton DSP est 100% worklet.)
  const master = offline.createGain(); master.connect(offline.destination);

  // Instruments nativement offline (kick/snare/hat) – réimplémenter comme plus haut (sans setTimeout)
  function scheduleKick(t) { /* identique à triggerKick mais avec offline */ }
  function scheduleSnare(t) { /* idem */ }
  function scheduleHat(t)   { /* idem */ }
  function scheduleLead(t)  { /* crée un Oscillator + env + filtre, stop à t+0.2 */ }

  const spb = 60 / tempo;
  let t = 0; let step = 0;
  while (t < durationSec) {
    const s = step % 16;
    if ([1,5,9,13].includes(s)) scheduleKick(t);
    if ([2,6,10,14].includes(s)) scheduleSnare(t);
    scheduleHat(t);
    if (s % 4 === 0) scheduleLead(t);
    t += spb/4; step++;
  }

  const renderedBuffer = await offline.startRendering();

  // MP3 avec lamejs
  const left  = renderedBuffer.getChannelData(0);
  const right = renderedBuffer.getChannelData(1);

  const encoder = new lamejs.Mp3Encoder(2, renderedBuffer.sampleRate, 192);
  const block = 1152; const mp3Data = [];

  function floatTo16(float) {
    const out = new Int16Array(float.length);
    for (let i = 0; i < float.length; i++) out[i] = Math.max(-1, Math.min(1, float[i])) * 0x7fff;
    return out;
  }

  for (let i = 0; i < left.length; i += block) {
    const l = floatTo16(left.subarray(i, i + block));
    const r = floatTo16(right.subarray(i, i + block));
    const buf = encoder.encodeBuffer(l, r);
    if (buf.length) mp3Data.push(buf);
  }
  const end = encoder.flush(); if (end.length) mp3Data.push(end);
  return new Blob(mp3Data, { type: 'audio/mpeg' });
}
