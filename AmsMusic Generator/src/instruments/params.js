// src/instruments/params.js
// Presets et utilitaires pour les instruments générés dynamiquement.

/**
 * Présets simples : libre à toi d'en ajouter/adapter.
 * Les valeurs ont été choisies pour sonner "moderne" mais rester sages.
 */
export const Presets = {
  synth: {
    cutoff: 2200,   // Hz
    reso: 0.22,     // Q approx. (0-1 dans notre worklet)
    env: { attack: 0.015, decay: 0.160, sustain: 0.62, release: 0.28 },
    fmDepth: 25.0,  // légère modulation
    drive: 0.10,
  },
  kick: {
    pitchStart: 90,  // Hz
    pitchEnd: 32,    // Hz
    dur: 0.22,
    gain: 1.00,
  },
  snare: {
    dur: 0.14,
    freq: 1900, // centre du band-pass
    q: 1.6,
    gain: 0.80,
  },
  hat: {
    dur: 0.075,
    freq: 9000, // high-pass
    gain: 0.42,
  }
};

/**
 * Applique un preset "synth" au node AudioWorklet (voice-processor).
 * @param {AudioWorkletNode} voiceNode
 * @param {AudioContext} ctx
 * @param {Object} preset (cutoff, reso, env:{attack,decay,sustain,release}, fmDepth, drive)
 */
export function initSynthParams(voiceNode, ctx, preset = Presets.synth) {
  const t0 = ctx.currentTime;

  voiceNode.parameters.get('cutoff') .setValueAtTime(preset.cutoff,  t0);
  voiceNode.parameters.get('reso')   .setValueAtTime(preset.reso,    t0);

  voiceNode.parameters.get('attack') .setValueAtTime(preset.env.attack,  t0);
  voiceNode.parameters.get('decay')  .setValueAtTime(preset.env.decay,   t0);
  voiceNode.parameters.get('sustain').setValueAtTime(preset.env.sustain, t0);
  voiceNode.parameters.get('release').setValueAtTime(preset.env.release, t0);

  voiceNode.parameters.get('fmDepth').setValueAtTime(preset.fmDepth, t0);
  voiceNode.parameters.get('drive')  .setValueAtTime(preset.drive,   t0);
}

/**
 * Retourne un objet paramétré pour triggerKick/triggerSnare/triggerHat.
 * Utile pour cloner et muter sans modifier Presets.
 */
export function makeKickParams(overrides = {}) {
  return { ...Presets.kick, ...overrides };
}
export function makeSnareParams(overrides = {}) {
  return { ...Presets.snare, ...overrides };
}
export function makeHatParams(overrides = {}) {
  return { ...Presets.hat, ...overrides };
}
``
