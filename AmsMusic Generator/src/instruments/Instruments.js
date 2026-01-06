// src/instruments/Instruments.js
export function createInstruments(audioEngine) {
  const ctx = audioEngine.ctx;
  const bus = audioEngine.createBusNode();

  // ---- Synth poly ----
  const voiceNode = new AudioWorkletNode(ctx, 'voice-processor', {
    numberOfOutputs: 1, outputChannelCount: [1]
  });
  voiceNode.connect(bus);

  function noteOn(freq, id = crypto.randomUUID()) {
    voiceNode.port.postMessage({ type: 'noteOn', id, freq });
    return id;
  }
  function noteOff(id) { voiceNode.port.postMessage({ type: 'noteOff', id }); }

  // ---- Kick (sine + pitch envelope + drive) ----
  function triggerKick(time, { pitchStart = 80, pitchEnd = 30, dur = 0.2, gain = 1.0 } = {}) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    const ws  = ctx.createWaveShaper();

    // Pitch envelope
    osc.frequency.setValueAtTime(pitchStart, time);
    osc.frequency.exponentialRampToValueAtTime(pitchEnd, time + dur * 0.9);

    // Amplitude env
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);

    // Soft drive
    ws.curve = new Float32Array(256).map((_,i)=> {
      const x = i/128 - 1; return Math.tanh(3*x);
    });

    osc.type = 'sine';
    osc.connect(ws).connect(g).connect(bus);
    osc.start(time); osc.stop(time + dur + 0.02);
  }

  // ---- Snare (noise burst + BP resonant) ----
  function triggerSnare(time, { dur = 0.15, freq = 1800, q = 1.5, gain = 0.8 } = {}) {
    const noise = new AudioWorkletNode(ctx, 'noise-processor');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.value = freq;
    const g  = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    noise.connect(bp).connect(g).connect(bus);
    // Gate par déconnexion
    setTimeout(()=> noise.disconnect(), (dur*1000)|0);
  }

  // ---- HiHat (noise HP + amplitude rapide + ring) ----
  function triggerHat(time, { dur = 0.08, freq = 8000, gain = 0.4 } = {}) {
    const noise = new AudioWorkletNode(ctx, 'noise-processor');
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = freq;
    const g  = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    noise.connect(hp).connect(g).connect(bus);
    setTimeout(()=> noise.disconnect(), (dur*1000)|0);
  }

  return {
    voiceNode,
    noteOn, noteOff,
    triggerKick, triggerSnare, triggerHat
  };
}
