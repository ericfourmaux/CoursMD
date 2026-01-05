---
title: "06 — Temps et scheduling précis"
tags: ["Web Audio API", "scheduling", "currentTime", "tempo", "BPM", "sequencer", "lookahead", "metronome", "swing", "AudioBufferSourceNode", "OscillatorNode", "AudioParam", "Worker", "drift"]
icon: "📘"
created: "2025-12-21"
---

# 📘 06 — Temps et scheduling précis

> 🎯 **Objectif du chapitre** : Programmer des événements audio **au bon instant**. Tu vas apprendre à utiliser l’horloge audio (`AudioContext.currentTime`), à construire un **séquenceur 16 pas** au tempo (BPM), à implémenter une **stratégie de lookahead** fiable, à gérer le **swing**, à synchroniser des **LFO** et des enveloppes au tempo, et à **mettre en pause/reprendre** proprement.

---

## 🧠 Horloge audio vs timers JS

- **`currentTime`** : temps **monotone** (en secondes) géré par le moteur audio. Toutes les planifications (`start(when)`, automations d’`AudioParam`) doivent utiliser cette horloge.
- **Pourquoi éviter `setTimeout`/`setInterval` pour déclencher** : ces timers ont du **jitter** (variations) → imprécision audible. On les utilise uniquement pour le **lookahead** (scanner une fenêtre de futur et **planifier** sur l’horloge audio).
- **Rendu par blocs** (render quantum) : l’audio est calculé **par paquets** (généralement **128 frames**). D’où l’importance de **planifier à l’avance**.

### 🔢 Formules (JS) — conversions de temps
```js
// BPM -> secondes par battement
const spb = 60 / bpm;
// Durée d’une noire (1/4) en 4/4 = spb
// croche (1/8) = spb / 2 ; double croche (1/16) = spb / 4

// Fréquence LFO synchronisée au tempo
// Ex.: LFO qui fait 1 cycle par noire (1/4): fLFO = 1/spb = bpm/60
const fLFO_quarter = bpm / 60;
// Pour un LFO 1 cycle par croche: fLFO = 2/spb
const fLFO_eighth = 2 * (bpm / 60);
// Triplet de croche (3 par noire): fLFO = 3/spb
const fLFO_eighthTriplet = 3 * (bpm / 60);
```

---

## 🧠 Stratégie de scheduling (lookahead)

- **Principe** : toutes les `Δ` millisecondes, on regarde une **fenêtre** de `horizon` secondes **dans le futur** et on **planifie** les événements dont l’heure tombe dans cette fenêtre.
- **Paramètres typiques** : `Δ ≈ 25 ms`, `horizon ≈ 0.1–0.2 s`.
- **Pourquoi** : robuste face aux blocages du thread principal; l’audio reste **précis** car on utilise `currentTime`.

### 🧩 Schéma (Mermaid) — Lookahead
```mermaid
graph LR
  Tick[Timer lookahead (Δ)] --> Window[Fenêtre horizon]
  Window --> Planif[Planifier sur currentTime]
  Planif --> Audio[AudioContext]
```

---

## 🧪 Séquenceur 16 pas — version minimale (tons synthétiques)

> ℹ️ Ici, on utilise des **Oscillateurs** pour des "ticks" et des **notes synthétiques**. En pratique, on déclenchera des **samples** avec `AudioBufferSourceNode` (plus loin).

```js
const ctx = new AudioContext();
let bpm = 120;
const steps = 16;           // 16 pas
const pattern = Array(steps).fill(false);
pattern[0] = true; pattern[4] = true; pattern[8] = true; pattern[12] = true; // kick-like

// Transport
let currentStep = 0;
let isPlaying = false;
let nextNoteTime = 0; // en seconds (currentTime)
const lookaheadMs = 25;      // intervalle du timer
const scheduleHorizon = 0.15; // fenêtre de planification en secondes

function secondsPerStep(){
  // 16 pas par mesure 4/4 => un pas = double croche = 1/16
  const spb = 60 / bpm;   // 1 battement (noire)
  return spb / 4;         // 4 pas par noire => 16 par mesure
}

function makeClick(time){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square'; osc.frequency.value = 1000; // petit click
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  // mini enveloppe
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.8, time + 0.005);
  gain.gain.linearRampToValueAtTime(0, time + 0.02);
  osc.start(time);
  osc.stop(time + 0.03);
}

function makeNote(time){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = 220;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.7, time + 0.01);
  gain.gain.linearRampToValueAtTime(0, time + 0.2);
  osc.start(time);
  osc.stop(time + 0.21);
}

function scheduleStep(stepIndex, time){
  // Tick visuel/sonore
  makeClick(time);
  // Note si active dans le pattern
  if (pattern[stepIndex]) makeNote(time);
}

function scheduler(){
  const sp = secondsPerStep();
  while (nextNoteTime < ctx.currentTime + scheduleHorizon) {
    scheduleStep(currentStep, nextNoteTime);
    nextNoteTime += sp;
    currentStep = (currentStep + 1) % steps;
  }
}

let timerId;
async function start(){
  await ctx.resume();
  isPlaying = true;
  currentStep = 0;
  nextNoteTime = ctx.currentTime + 0.05; // petite latence initiale
  timerId = setInterval(() => {
    scheduler();
  }, lookaheadMs);
}

function stop(){
  isPlaying = false;
  clearInterval(timerId);
}
```

---

## 🧠 Swing (ternaire) sur croches

- **Définition** : le **swing** retarde **l’"off-beat"** (la croche paire) pour donner un **ressenti ternaire**.
- **Formule simple** : appliquer un **offset** aux pas pairs.

```js
function swingOffset(stepIndex, sp, swing = 0.6){
  // swing ∈ [0.5..0.75] ; 0.5 = binaire, 2/3 ≈ 0.666 = ternaire classique
  const isEven = (stepIndex % 2) === 1; // 0-based: 1,3,5... sont "off-beat"
  return isEven ? (swing - 0.5) * sp : 0;
}

// Intégrer au scheduler
function schedulerSwing(){
  const sp = secondsPerStep();
  while (nextNoteTime < ctx.currentTime + scheduleHorizon) {
    const offset = swingOffset(currentStep, sp, 2/3);
    scheduleStep(currentStep, nextNoteTime + offset);
    nextNoteTime += sp;
    currentStep = (currentStep + 1) % steps;
  }
}
```

---

## 🧠 Metronome robuste (forte/noire, faible/croche)

```js
function metronomeTick(time, strong=false){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = strong ? 1500 : 1000;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(strong ? 1 : 0.6, time + 0.005);
  gain.gain.linearRampToValueAtTime(0, time + 0.03);
  osc.start(time);
  osc.stop(time + 0.04);
}
```

---

## 🧠 Déclenchement de **samples** (AudioBufferSourceNode)

> ℹ️ Si tu charges des fichiers audio, utilise `decodeAudioData` et `AudioBufferSourceNode`.

```js
async function loadSample(url){
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return await ctx.decodeAudioData(buf);
}

function triggerSample(buffer, time, playbackRate = 1){
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = playbackRate; // transpose grossièrement
  src.connect(ctx.destination);
  src.start(time);
}
```

---

## 🧠 Synchroniser **LFO** et **enveloppes** au tempo

- **LFO** : `lfo.frequency.value = bpm / 60` pour 1 cycle par noire.
- **Enveloppes** : planifier `attack/decay/release` en **fractions** de `spb`.

```js
function envAtTempo(ctx, param, spb){
  const now = ctx.currentTime;
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(1, now + spb * 0.1); // attack = 0.1 noire
  param.linearRampToValueAtTime(0.6, now + spb * 0.4); // decay = 0.3 noire
}
```

---

## 🧠 Pause / Reprise (transport)

```js
async function play(){
  if (ctx.state !== 'running') await ctx.resume();
  start();
}

async function pause(){
  await ctx.suspend();
  stop();
}
```

> 💡 **Astuce** : quand `AudioContext` est **suspendu**, `currentTime` **n’avance plus**. Reprends le transport en recalculant `nextNoteTime = ctx.currentTime + petite marge`.

---

## 🧠 Variante avec **Web Worker** (anti-jank)

- **Idée** : déplacer le **timer lookahead** dans un **Worker** pour réduire le jitter du thread principal.

```js
// main.js
const worker = new Worker('scheduler-worker.js');
worker.onmessage = () => scheduler();
worker.postMessage({ interval: lookaheadMs });

// scheduler-worker.js
let id;
onmessage = (e) => {
  const { interval } = e.data;
  clearInterval(id);
  id = setInterval(() => postMessage({}), interval);
};
```

---

## 🧠 Mesurer le drift (pédagogique)

> ℹ️ On mesure le **décalage** entre l’heure **prévue** et l’heure **courante** au moment du rendu (approx.).

```js
let lastScheduled = 0;
function scheduleStepWithDrift(stepIndex, time){
  lastScheduled = time;
  makeClick(time);
}

function reportDrift(){
  const now = ctx.currentTime;
  const drift = now - lastScheduled; // si appelé juste après la frame
  console.log('drift ~', drift.toFixed(4), 's');
}
```

---

## 🧩 Schémas Mermaid

### Séquenceur 16 pas avec lookahead
```mermaid
graph LR
  UI[UI Tempo & Pattern] --> Transport[Transport]
  Transport --> Timer[Lookahead Timer]
  Timer --> Window[Fenêtre horizon]
  Window --> Planif[Planifier start(when)]
  Planif --> AudioGraph[AudioContext]
  AudioGraph --> Out[Destination]
```

### Swing sur pas pairs
```mermaid
graph LR
  Step0[Step 0] --> T0[time]
  Step1[Step 1 (pair)] --> T1[time + offset]
  T0 --> Out
  T1 --> Out
```

---

## 🔧 Exercices (progressifs)

1. **Séquenceur** : complète le séquenceur pour **4 pistes** (kick/snare/hh/note). Utilise `AudioBufferSourceNode` pour les drums.
2. **Swing** : ajoute un slider de swing et observe l’effet sur le groove.
3. **Metronome** : fais des **accents** sur le 1er temps, ajoute un compteur de mesures.
4. **Sync LFO** : lie un LFO (chap. 3) au tempo avec `f = bpm/60` et teste triplets.
5. **Pause/Reprise** : gère un bouton **Play/Pause** qui recalcul `nextNoteTime` proprement.
6. **Worker** : déplace le lookahead dans un **Worker** et compare la stabilité.

---

## 💡 Astuces & bonnes pratiques

- **Toujours planifier** avec `currentTime` et **en avance**.
- **Éviter** de déclencher directement via `setTimeout` → jitter audible.
- **Fenêtre** d’horizon **≥ 100 ms** pour absorber les blocages courts.
- **UI** réactive mais **indépendante** : ne jamais bloquer le thread audio.

---

## ⚠️ Pièges fréquents

- **Oublier** de **recalibrer** `nextNoteTime` après `suspend()`.
- **Planifier trop tard** (inside frame) → événements ratés.
- **Pas de marge** au démarrage → premier tick manqué.

---

## 🧾 Résumé du chapitre (points clés)

- **Horloge audio** (`currentTime`) = référence pour toutes les planifications.
- **Lookahead** : scanner une fenêtre future et **planifier** avec `start(when)` et automations.
- **Séquenceur 16 pas** : exemple concret; swing via **offset** sur pas pairs.
- **Sync tempo** : formules pour BPM ↔ secondes, LFO synchronisés.
- **Transport** : **play/pause** robustes; recalibrer `nextNoteTime`.
- **Worker** : timer lookahead stable; thread principal libre.

---

> ✅ **Prochaines étapes** : **Chapitre 7 — Fichiers audio, buffers et lecture** : chargement via `fetch`/`decodeAudioData`, lecture avec `AudioBufferSourceNode`, bouclage et `playbackRate`.
