// src/audio/AudioEngine.js
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.workletsLoaded = false;
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    // Charger modules AudioWorklet
    await this.ctx.audioWorklet.addModule('/src/worklets/voice-processor.js');
    await this.ctx.audioWorklet.addModule('/src/worklets/noise-processor.js');
    // (optionnel) bus traitement
    try { await this.ctx.audioWorklet.addModule('/src/worklets/bus-processor.js'); } catch {}

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;
    this.masterGain.connect(this.ctx.destination);

    this.workletsLoaded = true;
    return this;
  }

  createBusNode() {
    // si bus-processor dispo, sinon bypass maître
    try {
      const busNode = new AudioWorkletNode(this.ctx, 'bus-processor', { numberOfInputs: 1, numberOfOutputs: 1 });
      busNode.connect(this.masterGain);
      return busNode;
    } catch {
      return this.masterGain;
    }
  }
}
