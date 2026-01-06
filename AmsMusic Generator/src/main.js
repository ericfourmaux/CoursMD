// src/main.js

// --- Imports internes (assure-toi que les chemins/nom de fichiers correspondent à ton arborescence) ---
import { AudioEngine }           from './audio/AudioEngine.js';
import { Scheduler }             from './audio/Scheduler.js';
import { createInstruments }     from './instruments/Instruments.js';
import { renderToMp3 }           from './audio/Exporter.js';
import { Sequencer }             from './sequencer/Sequencer.js';
import { setupControls }         from './ui/controls.js';
import { initSynthParams, Presets } from './instruments/params.js';

// Pipeline MP3
import { loadMp3File }           from './import/mp3-loader.js';
import { analyzeAudioBuffer }    from './analysis/analyze-mp3.js';
import { scheduleFromAnalysis }  from './reorch/from-analysis.js';

// --- Sélecteurs DOM ---
const startBtn   = document.getElementById('start');
const stopBtn    = document.getElementById('stop');
const exportBtn  = document.getElementById('export');

const tempoEl    = document.getElementById('tempo');
const cutoffEl   = document.getElementById('cutoff');
const resoEl     = document.getElementById('reso');
const attackEl   = document.getElementById('att');
const driveEl    = document.getElementById('drive');      // optionnel
const boostEl    = document.getElementById('boost');      // optionnel

// Import MP3
const mp3Input   = document.getElementById('mp3File');
const loadMp3Btn = document.getElementById('loadMp3');
const mp3MetaDiv = document.getElementById('mp3Meta');

// Mode de lecture courant: "pattern" (séquenceur interne) ou "analysis" (ré-orchestration MP3)
let playMode = 'pattern';
let lastAnalysis = null;

// --- Bootstrap AudioEngine + Instruments + Sequencer ---
const engine = new AudioEngine();
await engine.init();                         // Charge les worklets (AudioWorklet) et crée masterGain

// Crée les instruments dynamiques (kick/snare/hat/synth) et les route vers le bus/master
const instruments = createInstruments(engine);

// Init paramètres du synthé (cutoff/reso/ADSR/FM/drive)
initSynthParams(instruments.voiceNode, engine.ctx, Presets.synth);

// Séquenceur "pattern" (16 pas, basique) + scheduler (lookahead)
const scheduler = new Scheduler(engine.ctx, parseFloat(tempoEl?.value || 120));
const sequencer = new Sequencer(instruments);
instruments.sequencer = sequencer;

// UI ↔ AudioParam / Transport
setupControls({ engine, instruments, scheduler });

// --- Helpers ---
function setTempoFromUI() {
  const bpm = parseFloat(tempoEl?.value || 120);
  scheduler.setTempo(bpm);
}
function ensureAudioRunning() {
  // Certaines API (Web Audio) exigent une interaction utilisateur pour démarrer l'audio
  return engine.ctx.state !== 'running' ? engine.ctx.resume() : Promise.resolve();
}

// --- Transport: Start/Stop pattern (séquenceur interne) ---
startBtn?.addEventListener('click', async () => {
  await ensureAudioRunning();
  playMode = 'pattern';
  // programmer le séquenceur 16 pas
  scheduler.start((t) => sequencer.tick(t));
});

stopBtn?.addEventListener('click', () => {
  scheduler.stop();
  // NB : les évènements déjà planifiés continuent (Web Audio planifie dans le futur).
  // Si nécessaire, on pourrait implémenter un "kill switch" par contrôle de gain/master.
});

// --- Import/Analyse/Ré-orchestration MP3 ---
loadMp3Btn?.addEventListener('click', async () => {
  const file = mp3Input?.files?.[0];
  if (!file) return alert('Choisis un fichier .mp3');

  try {
    // 1) Import + décodage (decodeAudioData) -> AudioBuffer
    const { audioBuffer, meta } = await loadMp3File(file);

    // 2) Analyse (onsets + pitch simplifiés) pour interpréter le groove et la ligne principale
    const analysis = analyzeAudioBuffer(audioBuffer);
    lastAnalysis = analysis;

    // UI méta
    mp3MetaDiv.textContent =
      `Import .mp3 OK — Durée: ${meta.duration.toFixed(2)}s • SR: ${meta.sampleRate}Hz • Ch: ${meta.channels} • BPM estimé: ${analysis.bpm}`;

    // 3) Caler le tempo interne sur l’estimation BPM (optionnel)
    tempoEl.value = String(analysis.bpm);
    setTempoFromUI();

    // 4) Ré‑orchestration: mapper les onsets/pitches vers nos instruments dynamiques
    //    (On planifie directement dans le graphe WebAudio)
    playMode = 'analysis';
    instruments.sequencer = null;          // désactive le tick pattern depuis controls.js
    await ensureAudioRunning();
    scheduleFromAnalysis(instruments, engine.ctx, analysis);

    // NB : si tu souhaites une lecture “transport-like”, tu peux remplacer la planification directe
    // par un scheduler qui parcourt onsets/pitches avec une fenêtre lookahead.

  } catch (err) {
    console.error(err);
    alert('Échec import/analyse .mp3 : ' + err.message);
  }
});

// --- Export MP3 (rendu OfflineAudioContext + lame.js) ---
exportBtn?.addEventListener('click', async () => {
  try {
    // Durée d’export :
    // - si dernière analyse disponible, on exporte la durée du morceau
    // - sinon, par défaut 20 s
    const durationSec = lastAnalysis?.duration ? Math.ceil(lastAnalysis.duration) : 20;

    // Rendu offline + encodage MP3 (voir src/audio/Exporter.js)
    const blob = await renderToMp3({
      durationSec,
      tempo: parseFloat(tempoEl?.value || 120)
    });

    // Téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reorch.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert('Export MP3 impossible : ' + e.message);
  }
});

// --- Binding UI immédiats (cutoff/reso/attack/drive changent en temps réel) ---
cutoffEl?.addEventListener('input', async () => {
  instruments.voiceNode.parameters.get('cutoff')
    .setValueAtTime(parseFloat(cutoffEl.value), engine.ctx.currentTime);
});
resoEl?.addEventListener('input', async () => {
  instruments.voiceNode.parameters.get('reso')
    .setValueAtTime(parseFloat(resoEl.value), engine.ctx.currentTime);
});
attackEl?.addEventListener('input', async () => {
  instruments.voiceNode.parameters.get('attack')
    .setValueAtTime(parseFloat(attackEl.value), engine.ctx.currentTime);
});
driveEl?.addEventListener('input', async () => {
  instruments.voiceNode.parameters.get('drive')
    .setValueAtTime(parseFloat(driveEl.value), engine.ctx.currentTime);
});
tempoEl?.addEventListener('input', () => setTempoFromUI());

// --- Optionnel : switch “Boost bus” (drive/ceiling/outputGain du bus-processor) ---
boostEl?.addEventListener('change', () => {
  // controls.js applique déjà un boost via engine.createBusNode() si présent.
  // Ici, on se limite à mettre en cohérence le label UI, la logique est dans controls.js.
});

// --- Démarrage : préparer AudioContext et appliquer preset synth ---
await ensureAudioRunning();
setTempoFromUI();
// NOTE : on ne démarre pas automatiquement le séquenceur ici. Utilise Start/Stop ou importe un .mp3.
