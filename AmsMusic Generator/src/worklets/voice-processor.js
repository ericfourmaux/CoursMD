// src/worklets/voice-processor.js
class VoiceProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'cutoff', defaultValue: 2000, minValue: 100, maxValue: 12000 },
      { name: 'reso',   defaultValue: 0.2,  minValue: 0.05, maxValue: 1.0 },
      { name: 'attack', defaultValue: 0.01, minValue: 0.001, maxValue: 2.0 },
      { name: 'decay',  defaultValue: 0.15, minValue: 0.001, maxValue: 3.0 },
      { name: 'sustain',defaultValue: 0.6,  minValue: 0.0,   maxValue: 1.0 },
      { name: 'release',defaultValue: 0.25, minValue: 0.001, maxValue: 4.0 },
      { name: 'fmDepth',defaultValue: 0.0,  minValue: 0.0,   maxValue: 300.0 },
      { name: 'drive',  defaultValue: 0.0,  minValue: 0.0,   maxValue: 0.9 },
    ];
  }

  constructor(options) {
    super(options);
    // État des notes actives: { freq, phase, envPhase, gateOn, tOn, tOff }
    this.voices = new Map();
    this.sampleRate = sampleRate;

    this.port.onmessage = (ev) => {
      const { type, id, freq } = ev.data || {};
      if (type === 'noteOn') {
        this.voices.set(id, { freq, phase: 0, envPhase: 0, gateOn: true, tOn: currentTime });
      } else if (type === 'noteOff') {
        const v = this.voices.get(id);
        if (v) { v.gateOn = false; v.tOff = currentTime; }
      }
    };
  }

  process(inputs, outputs, parameters) {
    const out = outputs[0];
    const channel = out[0];

    const cutoff = parameters.cutoff;
    const reso   = parameters.reso;
    const att    = parameters.attack;
    const dec    = parameters.decay;
    const sus    = parameters.sustain;
    const rel    = parameters.release;
    const fm     = parameters.fmDepth;
    const drive  = parameters.drive;

    // Très simplifié: oscillateur saw + FM sin, envelope ADSR par échantillon
    channel.fill(0);

    const twoPi = 2 * Math.PI;
    for (const [id, v] of this.voices) {
      for (let i = 0; i < channel.length; i++) {
        // ADSR (linéaire, simplifié)
        const t = i / this.sampleRate;
        let env;
        if (v.gateOn) {
          const tEnv = (currentTime + t) - (v.tOn || currentTime);
          env = tEnv < att[0] ? (tEnv / att[0]) :
                tEnv < att[0] + dec[0] ? (1 - (1 - sus[0]) * (tEnv - att[0]) / dec[0]) :
                sus[0];
        } else {
          const tEnv = (currentTime + t) - (v.tOff || currentTime);
          env = Math.max(0, (sus[0] * (1 - (tEnv / rel[0]))));
          if (env <= 0) { this.voices.delete(id); break; }
        }

        const fmPhase = v.phase + (fm[0] * Math.sin(v.phase)) / this.sampleRate;
        const saw = ( (fmPhase % twoPi) / Math.PI ) - 1;           // saw de -1 à +1 (naïf)
        let sample = saw * env;

        // Filtre + résonance (approx. simple biquad lowpass dans le domaine audio ?)
        // Par souci de concision, on applique ici un "tilt" paramétrique approximatif:
        const tilt = Math.min(0.99, cutoff[0] / 12000);
        sample = (1 - tilt) * sample + tilt * (sample * 0.5);

        // Drive soft-clipping
        const d = drive[0];
        sample = Math.tanh(sample * (1 + 10 * d));

        channel[i] += sample;
        v.phase += twoPi * (v.freq / this.sampleRate);
        if (v.phase > 1e12) v.phase = 0; // éviter overflow
      }
    }

    return true;
  }
}
registerProcessor('voice-processor', VoiceProcessor);
