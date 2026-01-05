---
title: "18 — Projet final (Séquenceur + Pedalboard)"
tags: ["Projet", "Vue 3", "React", "Vite", "sequencer", "pedalboard", "AudioWorklet", "lookahead", "aux", "export WAV", "tests"]
icon: "📘"
created: "2025-12-21"
---

# 📘 18 — Projet final (Séquenceur + Pedalboard)

> 🎯 **Objectif du chapitre** : Assembler tout ce que tu as appris pour construire une **application complète** : un **séquenceur 16 pas** avec **4 pistes** (kick/snare/hh/synth), un **pedalboard** (delay, reverb, soft‑clip via **AudioWorklet**, EQ), un **scheduler lookahead** robuste (Worker), **visualisation** (VU + spectre), et **export WAV** via `OfflineAudioContext`. Le projet est proposé en **Vue 3 + Vite** (exemples React aussi).

---

## 🧠 Vue d’ensemble : architecture et flux

- **Service audio** (`AudioEngine`) central : contexte, master, chargement des samples, instanciation des effets.
- **Sequencer store** (état) : BPM, swing, pattern (16 pas × 4 pistes), transport (`play/pause`).
- **Scheduler** (Worker) : lookahead (Δ=25 ms, horizon ≈ 150 ms) qui planifie sur l’**horloge audio**.
- **Pedalboard** : chaînes **série** + **aux** (reverb/delay) et **soft‑clip** en **AudioWorklet**.
- **UI** : `AudioToggle`, `TransportBar`, `StepGrid`, `FxPanel`, `Meters`, `ExportPanel`.
- **Export** : `OfflineAudioContext` pour rendre la boucle et produire un **WAV** téléchargeable.

### 🧩 Schéma (Mermaid) — Architecture
```mermaid
graph LR
  UI[Vue/React UI] --> Store[Sequencer Store]
  Store --> Scheduler[Lookahead Worker]
  Scheduler --> Plan[Planifier start(when)]
  Plan --> Engine[AudioEngine]
  Engine --> Graph[Web Audio Graph]
  Graph --> FX[Pedalboard (Delay/Reverb/SoftClip/EQ)]
  Graph --> Meters[Analyser (VU/Spectre)]
  Export[OfflineAudioContext] --> WAV[Export WAV]
```

---

## 🗂️ Structure de projet (Vue 3 + Vite, exemple)

```
src/
  audio/
    AudioEngine.ts          # Service central
    load-sample.ts          # Utilitaire fetch + decodeAudioData
    worklet-loader.ts       # Chargement AudioWorklet
    pedalboard.ts           # Chaîne d’effets
    scheduler.ts            # API pour Worker
  worklets/
    soft-clip.js            # AudioWorkletProcessor (soft saturation)
  workers/
    scheduler-worker.ts     # Timer lookahead (postMessage)
  store/
    sequencer.ts            # État BPM, swing, pattern, transport
  components/
    AudioToggle.vue
    TransportBar.vue
    StepGrid.vue
    FxPanel.vue
    Meters.vue
    ExportPanel.vue
  App.vue
  main.ts
assets/
  kick.wav
  snare.wav
  hat.wav
  ir-hall.wav               # IR pour la reverb (optionnel)
```

---

## 🛠️ AudioEngine (TypeScript) — service central

```ts
// src/audio/AudioEngine.ts
export class AudioEngine {
  private ctx: AudioContext;
  private master: GainNode;
  private analyser: AnalyserNode;
  private buffers: Record<string, AudioBuffer> = {};

  constructor(ctx?: AudioContext){
    this.ctx = ctx ?? new AudioContext();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.85;
    this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 1024;
    this.master.connect(this.analyser).connect(this.ctx.destination);
  }

  get context(){ return this.ctx; }
  get output(){ return this.master; }
  get analyserNode(){ return this.analyser; }

  async ensureRunning(){ if (this.ctx.state !== 'running') await this.ctx.resume(); }

  async load(name: string, url: URL){
    const res = await fetch(url); const ab = await res.arrayBuffer();
    this.buffers[name] = await this.ctx.decodeAudioData(ab);
  }

  playSample(name: string, when: number, gainVal = 0.9){
    const buf = this.buffers[name]; if (!buf) return;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain(); g.gain.value = gainVal;
    src.connect(g).connect(this.master);
    src.start(when);
    src.onended = () => { try { src.disconnect(); g.disconnect(); } catch{} };
  }

  playSynth(freq: number, when: number, len = 0.2, type: OscillatorType = 'triangle'){
    const osc = this.ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = 0;
    osc.connect(g).connect(this.master);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.8, when + 0.01);
    g.gain.linearRampToValueAtTime(0, when + len);
    osc.start(when); osc.stop(when + len + 0.02);
  }
}
```

---

## 🎛️ Pedalboard (delay, reverb, soft‑clip, EQ)

```ts
// src/audio/pedalboard.ts
export function attachPedalboard(ctx: AudioContext, source: AudioNode, master: AudioNode){
  // Delay
  const delay = ctx.createDelay(); delay.delayTime.value = 0.28;
  const fb = ctx.createGain(); fb.gain.value = 0.35; delay.connect(fb).connect(delay);
  const wetDelay = ctx.createGain(); wetDelay.gain.value = 0.35;

  // Reverb
  const conv = ctx.createConvolver(); // charge IR via ailleurs (option)
  const wetRev = ctx.createGain(); wetRev.gain.value = 0.4;

  // Soft‑clip (AudioWorklet)
  const soft = new AudioWorkletNode(ctx, 'soft-clip');
  soft.parameters.get('drive')?.setValueAtTime(2.0, ctx.currentTime);

  // EQ simple (lowpass)
  const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 6000;

  // Routage: source -> soft -> lpf -> delay(wet) & reverb(wet) -> master
  source.connect(soft).connect(lpf);
  lpf.connect(delay).connect(wetDelay).connect(master);
  lpf.connect(conv).connect(wetRev).connect(master);
}
```

### 🔧 AudioWorklet — soft‑clip processor
```js
// src/worklets/soft-clip.js
class SoftClip extends AudioWorkletProcessor {
  static get parameterDescriptors(){
    return [{ name:'drive', defaultValue:1.0, minValue:0.1, maxValue:5, automationRate:'a-rate' }];
  }
  process(inputs, outputs, params){
    const input = inputs[0]; const output = outputs[0]; const drive = params.drive;
    for (let ch = 0; ch < output.length; ch++){
      const inCh = input[ch] || input[0]; const outCh = output[ch];
      for (let i=0; i<outCh.length; i++){
        const d = drive.length === 1 ? drive[0] : drive[i];
        const x = inCh ? inCh[i] * d : 0; outCh[i] = Math.tanh(x);
      }
    }
    return true;
  }
}
registerProcessor('soft-clip', SoftClip);
```

---

## ⏱️ Scheduler (Worker) — lookahead robuste

```ts
// src/workers/scheduler-worker.ts
self.onmessage = (e) => {
  const { interval } = e.data; setInterval(() => (self as any).postMessage({}), interval);
};
```

```ts
// src/audio/scheduler.ts
export function startScheduler(interval = 25, tick: () => void){
  const url = new URL('../workers/scheduler-worker.ts', import.meta.url);
  const worker = new Worker(url, { type: 'module' });
  worker.onmessage = () => tick();
  worker.postMessage({ interval });
  return worker;
}
```

---

## 🗃️ Store Sequencer (BPM, swing, pattern, transport)

```ts
// src/store/sequencer.ts
export type Track = 'kick'|'snare'|'hat'|'synth';
export type Pattern = Record<Track, boolean[]>; // 16 pas

export class SequencerStore {
  bpm = 120; swing = 0.66; steps = 16; playing = false;
  pattern: Pattern = {
    kick:  Array(16).fill(false).map((_,i)=> i%4===0),
    snare: Array(16).fill(false).map((_,i)=> i%8===4),
    hat:   Array(16).fill(true),
    synth: Array(16).fill(false)
  };
}
```

---

## 🎚️ Transport & planification (utilisant AudioEngine)

```ts
// src/audio/transport.ts
import { SequencerStore } from '@/store/sequencer';
import { AudioEngine } from '@/audio/AudioEngine';

export class Transport {
  constructor(private store: SequencerStore, private engine: AudioEngine){}
  private worker?: Worker; private nextNoteTime = 0; private currentStep = 0;

  secondsPerStep(){ return (60/this.store.bpm) / 4; } // 4 pas/par noire → 16 par mesure
  swingOffset(step: number, sp: number){ return (step%2===1) ? (this.store.swing - 0.5)*sp : 0; }

  async play(){ await this.engine.ensureRunning(); this.store.playing = true;
    this.currentStep = 0; this.nextNoteTime = this.engine.context.currentTime + 0.05;
    this.worker = startScheduler(25, () => this.scheduler());
  }
  pause(){ this.store.playing = false; if (this.worker) this.worker.terminate(); }

  scheduler(){ const sp = this.secondsPerStep(); const ctx = this.engine.context;
    while (this.nextNoteTime < ctx.currentTime + 0.15){
      const t = this.nextNoteTime + this.swingOffset(this.currentStep, sp);
      this.scheduleStep(this.currentStep, t); this.nextNoteTime += sp;
      this.currentStep = (this.currentStep + 1) % this.store.steps;
    }
  }

  scheduleStep(step: number, time: number){
    const { pattern } = this.store;
    if (pattern.kick[step])  this.engine.playSample('kick',  time, 0.9);
    if (pattern.snare[step]) this.engine.playSample('snare', time, 0.9);
    if (pattern.hat[step])   this.engine.playSample('hat',   time, 0.6);
    if (pattern.synth[step]) this.engine.playSynth(220, time, 0.18, 'sawtooth');
  }
}
```

---

## 🧰 UI (Vue 3) — composants clés (extraits)

### `AudioToggle.vue`
```vue
<template>
  <button @click="enable" :disabled="running">🎵 Activer le son</button>
</template>
<script setup lang="ts">
import { useAudioEngine } from '@/composables/useAudioEngine';
const { running, enable } = useAudioEngine();
</script>
```

### `TransportBar.vue`
```vue
<template>
  <div class="transport">
    <label>BPM <input type="number" v-model.number="store.bpm"/></label>
    <label>Swing <input type="range" min="0.5" max="0.75" step="0.01" v-model.number="store.swing"/></label>
    <button @click="onPlay">Play</button>
    <button @click="onPause">Pause</button>
  </div>
</template>
<script setup lang="ts">
import { SequencerStore } from '@/store/sequencer';
import { Transport } from '@/audio/transport';
import { useAudioEngine } from '@/composables/useAudioEngine';
const store = new SequencerStore();
const { engine, enable } = useAudioEngine();
const transport = new Transport(store, engine);
async function onPlay(){ await enable(); transport.play(); }
function onPause(){ transport.pause(); }
</script>
```

### `StepGrid.vue` (16 × 4)
```vue
<template>
  <div class="grid">
    <div v-for="track in tracks" :key="track" class="row">
      <button v-for="(on, i) in store.pattern[track]" :key="i" class="cell" :class="{on}" @click="toggle(track,i)">{{ i+1 }}</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SequencerStore } from '@/store/sequencer';
const store = new SequencerStore();
const tracks: Array<keyof SequencerStore['pattern']> = ['kick','snare','hat','synth'];
function toggle(track: keyof SequencerStore['pattern'], i: number){ store.pattern[track][i] = !store.pattern[track][i]; }
</script>
<style scoped>
.grid{ display:grid; gap:6px }
.row{ display:grid; grid-template-columns: repeat(16, 1fr); gap:4px }
.cell{ padding:8px; background:#eee; border:0; }
.cell.on{ background:#1f77b4; color:white }
</style>
```

### `Meters.vue` (VU simplifié)
```vue
<template><canvas ref="cv" width="300" height="60"></canvas></template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAudioEngine } from '@/composables/useAudioEngine';
const { engine } = useAudioEngine(); const cv = ref<HTMLCanvasElement>();
onMounted(() => {
  const c = cv.value!.getContext('2d')!; const an = engine.analyserNode; const buf = new Float32Array(an.fftSize);
  function draw(){ an.getFloatTimeDomainData(buf); let acc=0, pk=0; for(let i=0;i<buf.length;i++){ acc+=buf[i]*buf[i]; pk=Math.max(pk,Math.abs(buf[i])); }
    const rms = Math.sqrt(acc/buf.length); c.clearRect(0,0,300,60); c.fillStyle='#1f77b4'; c.fillRect(10,40,280*rms,10); c.fillStyle='#d62728'; c.fillRect(10+280*pk,20,2,30); requestAnimationFrame(draw);
  } requestAnimationFrame(draw);
});
</script>
```

### `ExportPanel.vue` (WAV offline)
```vue
<template>
  <button @click="render">Export WAV</button>
</template>
<script setup lang="ts">
import { renderMixdown, audioBufferToWav } from '@/export/offline';
async function render(){ const buf = await renderMixdown({ sr:44100, seconds:4 }); const wav = audioBufferToWav(buf); const url = URL.createObjectURL(wav); const a = document.createElement('a'); a.href=url; a.download='loop.wav'; a.click(); URL.revokeObjectURL(url); }
</script>
```

---

## 🧪 Export offline — utilitaires

```ts
// src/export/offline.ts
import { AudioEngine } from '@/audio/AudioEngine';

export async function renderMixdown({ sr=44100, seconds=4 }={}){
  const off = new OfflineAudioContext(2, Math.floor(sr*seconds), sr);
  // Exemple mini: un lead + reverb
  const lead = off.createOscillator(); lead.type='triangle'; lead.frequency.value=220;
  const rev = off.createConvolver(); // IR optionnelle
  const g = off.createGain(); g.gain.value=0.3;
  lead.connect(g).connect(off.destination); lead.start(0); lead.stop(seconds);
  return await off.startRendering();
}

export function audioBufferToWav(buf: AudioBuffer){
  const numCh=buf.numberOfChannels, sr=buf.sampleRate, len=buf.length; const out=new DataView(new ArrayBuffer(44+len*numCh*2));
  const writeStr=(o:number,s:string)=>{ for(let i=0;i<s.length;i++) out.setUint8(o+i, s.charCodeAt(i)); };
  let off=0; writeStr(off,'RIFF'); off+=4; out.setUint32(off, 36+len*numCh*2, true); off+=4; writeStr(off,'WAVE'); off+=4; writeStr(off,'fmt '); off+=4;
  out.setUint32(off,16,true); off+=4; out.setUint16(off,1,true); off+=2; out.setUint16(off,numCh,true); off+=2; out.setUint32(off,sr,true); off+=4;
  out.setUint32(off,sr*numCh*2,true); off+=4; out.setUint16(off,numCh*2,true); off+=2; out.setUint16(off,16,true); off+=2; writeStr(off,'data'); off+=4; out.setUint32(off,len*numCh*2,true); off+=4;
  const chans: Float32Array[]=[]; for(let ch=0;ch<numCh;ch++) chans[ch]=buf.getChannelData(ch);
  for(let i=0;i<len;i++){ for(let ch=0;ch<numCh;ch++){ const s=Math.max(-1,Math.min(1,chans[ch][i])); out.setInt16(off, s<0?s*0x8000:s*0x7FFF, true); off+=2; } }
  return new Blob([out.buffer], { type:'audio/wav' });
}
```

---

## 🧪 Tests (Jest) — scheduling & logique

```ts
// tests/scheduling.spec.ts
import { SequencerStore } from '@/store/sequencer';
import { Transport } from '@/audio/transport';

test('secondsPerStep@120', () => {
  const t = new Transport(new SequencerStore(), {} as any);
  expect(t.secondsPerStep()).toBeCloseTo(0.125);
});
```

---

## ✅ Checklist production

- **Activer le son** sur geste utilisateur (`resume()`), gestion `visibilitychange` (chap. 15).
- **Un seul** `AudioContext`, **réutiliser** les buffers, **disconnect** systématique (`onended`).
- **Lookahead** ≥ **100 ms**, Worker **stable**; recalculer `nextNoteTime` après `suspend()` (chap. 6).
- **Pedalboard** : feedback `< 1`, IR réaliste, soft‑clip **oversample** si nécessaire.
- **Visualisation** : `fftSize` raisonnable (512–1024), **fps** maîtrisé.
- **Export** : normaliser le rendu avant WAV (chap. 13).

---

## 🔧 Exercices (fin de parcours)

1. **Pistes supplémentaires** : ajoute **bass** (sample) et **lead** (synth) avec potards de **send** vers reverb/delay.
2. **Presets FX** : crée 3 presets d’EQ + delay + reverb (clair, sombre, médium creusé) commutables.
3. **Automation** : ajoute une automation de `filter.frequency` (LFO) synchronisée au **tempo** (chap. 6).
4. **Export avancé** : rends **8 mesures** offline, applique **normalisation** et télécharge en **WAV**.
5. **Tests** : écris des tests sur le **transport** (play/pause, swing) et la **durée** d’un rendu offline.
6. **React** : porte les composants vers **React** avec `useAudioEngine()` et compare UX.

---

## 🧾 Résumé du chapitre (points clés)

- **Application complète** : Séquenceur 16 pas, 4 pistes, pédalboard (delay/reverb/soft‑clip/EQ), scheduler Worker, VU/spectre, export WAV.
- **Architecture** : service audio, store sequencer, lookahead, AUX bus, AudioWorklet.
- **Production** : politiques d’autoplay, robustesse transport, performance visuelle et audio.
- **Tests** : Jest sur la logique, validations offline.

---

> 🏁 **Bravo !** Tu viens de boucler le cours et le **projet final**. Tu peux étendre l’app : **MIDI in/out**, **preset manager**, **enregistrement** live, et partager le projet sur GitHub.
