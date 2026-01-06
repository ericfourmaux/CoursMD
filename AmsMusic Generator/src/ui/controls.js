// src/ui/controls.js
// Rattache les contrôles DOM aux AudioParams et au scheduler.

export function setupControls({ engine, instruments, scheduler }) {
  const ctx = engine.ctx;
  const voice = instruments.voiceNode;

  // ----- Sélecteurs DOM -----
  const tempoEl   = document.getElementById('tempo');
  const cutoffEl  = document.getElementById('cutoff');
  const resoEl    = document.getElementById('reso');
  const attackEl  = document.getElementById('att');

  // Ajouts UI optionnels (à créer dans index.html si tu veux les voir)
  const driveEl   = document.getElementById('drive');      // Synth: drive
  const boostEl   = document.getElementById('boost');      // Bus: toggle boost
  const startBtn  = document.getElementById('start');
  const stopBtn   = document.getElementById('stop');

  // ----- Tempo -----
  if (tempoEl) {
    tempoEl.addEventListener('input', (e) => {
      const bpm = parseFloat(e.target.value || 120);
      scheduler.setTempo(bpm);
    });
  }

  // ----- Voice (Synth) -----
  if (cutoffEl) {
    cutoffEl.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      voice.parameters.get('cutoff').setValueAtTime(v, ctx.currentTime);
    });
  }
  if (resoEl) {
    resoEl.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      voice.parameters.get('reso').setValueAtTime(v, ctx.currentTime);
    });
  }
  if (attackEl) {
    attackEl.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      voice.parameters.get('attack').setValueAtTime(v, ctx.currentTime);
    });
  }
  if (driveEl) {
    driveEl.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      voice.parameters.get('drive').setValueAtTime(v, ctx.currentTime);
    });
  }

  // ----- Bus (si présent) -----
  // Notre AudioEngine retourne soit bus-processor, soit masterGain.
  const busNode = engine.createBusNode();
  const busParams = (busNode instanceof AudioWorkletNode) ? busNode.parameters : null;

  if (boostEl && busParams) {
    boostEl.addEventListener('change', (e) => {
      const on = !!e.target.checked;
      const now = ctx.currentTime;
      // Boost = plus de drive + un peu de ceiling plus bas et outputGain compensé
      busParams.get('drive').setValueAtTime(on ? 0.25 : 0.10, now);
      busParams.get('ceiling').setValueAtTime(on ? 0.92 : 0.96, now);
      busParams.get('outputGain').setValueAtTime(on ? 1.05 : 1.00, now);
    });
  }

  // ----- Transport -----
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      if (ctx.state !== 'running') await ctx.resume();
      scheduler.start((t) => instruments.sequencer?.tick ? instruments.sequencer.tick(t) : null);
    });
  }
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      scheduler.stop();
    });
  }
}
