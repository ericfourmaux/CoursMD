---
title: "02 — Architecture de la Web Audio API (AudioGraph, nœuds & routage)"
tags: ["Web Audio API", "AudioContext", "AudioNode", "AudioParam", "graph", "routing", "mix", "fan-in", "fan-out", "feedback", "lifecycle", "TS", "Webpack"]
icon: "📘"
created: "2025-12-21"
---

# 📘 02 — Architecture de la Web Audio API (AudioGraph, nœuds & routage)

> 🎯 **Objectif du chapitre** : Comprendre la **structure interne** de la Web Audio API — le **graphe audio** — et savoir **créer, connecter, contrôler et déconnecter** des nœuds de manière robuste. Tu apprendras les **types de nœuds**, les **AudioParam**, le **fan-in/fan-out**, les **bus d’effets (aux sends)**, les **boucles de feedback** sécurisées et le **cycle de vie** d’un `AudioContext`.

---

## 🧠 Vue d’ensemble : AudioContext & AudioGraph

- **AudioContext** : point d’entrée du moteur audio. Il fournit l’horloge (`currentTime`), le **destination node** (sortie vers la carte son), et les usines de création de nœuds.
- **AudioGraph** : un **graphe orienté** où chaque **AudioNode** est un bloc (source, traitement, destination). Les **connexions** se font via `node.connect(autreNode)`.
- **Pourquoi un graphe** : Analogies avec une **console de mixage** ou un **réseau de tuyaux** : chaque module a une **entrée** et une **sortie**, on les enchaîne pour former une **chaîne** audio.

### 🧩 Schéma (Mermaid) — Graphe simple
```mermaid
graph LR
  OscA[Oscillator A] --> Mix[Gain (mix)]
  OscB[Oscillator B] --> Mix
  Mix --> LPF[BiquadFilter (lowpass)]
  LPF --> Out[AudioDestinationNode]
```

---

## 🧠 Typologie des nœuds (AudioNode)

- **Nœuds sources** : `OscillatorNode`, `AudioBufferSourceNode`, `MediaElementAudioSourceNode`, `MediaStreamAudioSourceNode` (micro).
- **Nœuds de traitement** : `GainNode`, `BiquadFilterNode`, `DynamicsCompressorNode`, `DelayNode`, `StereoPannerNode`, `ConvolverNode`, `WaveShaperNode`, `AnalyserNode`, `AudioWorkletNode` (custom DSP), `ChannelMerger/Splitter`.
- **Destination** : `AudioDestinationNode` (créé par le contexte, non instanciable directement).
- **AudioParam** : propriétés **automatisables** et **adressables** (ex. `gain.gain`, `osc.frequency`, `filter.Q`).

### 🔢 AudioParam — contrôle fin & automatisations
- **Définition** : Un `AudioParam` est une **entrée de contrôle** pouvant recevoir :
  1) une **valeur scalaire** (`.value`),
  2) des **automations temporelles** (chap. 4),
  3) un **signal audio** (connexion depuis un nœud, ex. un LFO).
- **Pourquoi** : Permet des **variations lisses ou programmées** (ex. sweeps de filtre, vibrato, enveloppes), synchronisées à l’horloge audio.

```js
// Exemple de contrôle d’un AudioParam par un LFO (oscillateur basse fréquence)
const ctx = new AudioContext();
const lfo = ctx.createOscillator(); // f basse (ex. 5 Hz)
lfo.frequency.value = 5;
const lfoGain = ctx.createGain();
lfoGain.gain.value = 50; // profondeur du vibrato (Hz si on cible frequency)

const osc = ctx.createOscillator();
osc.frequency.value = 440; // base

// Brancher le LFO -> lfoGain -> osc.frequency (AudioParam)
lfo.connect(lfoGain);
lfoGain.connect(osc.frequency);

osc.connect(ctx.destination);

// Respecter l’autoplay policy: démarrer sur geste utilisateur
// Ex.: bouton -> ctx.resume(); osc.start(); lfo.start();
```

---

## 🧠 Connexions : fan-in, fan-out, mix

- **Fan-in** : plusieurs sorties convergent vers une seule entrée (ex. plusieurs sources dans un bus `GainNode`).
- **Fan-out** : une sortie se branche sur plusieurs entrées (ex. source envoyée à la fois vers **master** et **aux reverb**).
- **Mix** (somme pondérée) :
  ```js
  // Modèle discret (pédagogique) d’un mix stéréo de k sources
  // y[n] = sum_i g[i] * x_i[n]
  function mixFrame(sources, gains) {
    let L = 0, R = 0;
    for (let i = 0; i < sources.length; i++) {
      L += gains[i] * sources[i].L; // canal gauche
      R += gains[i] * sources[i].R; // canal droit
    }
    // Option: soft-clip pour éviter saturation
    const soft = x => Math.tanh(x);
    return { L: soft(L), R: soft(R) };
  }
  ```

### 🧩 Schéma (Mermaid) — Fan-out avec bus d’effets
```mermaid
graph LR
  S[Source] --> M[Master Gain]
  S --> AuxSnd[Aux Send Gain]
  AuxSnd --> Rev[Convolver (reverb)]
  Rev --> MixBus[Mix Bus]
  M --> MixBus
  MixBus --> Out[Destination]
```

### 🧪 Exemple — Deux oscillateurs, bus master + reverb aux
```js
const ctx = new AudioContext();

// Deux sources
const oscA = ctx.createOscillator(); oscA.type = 'sawtooth'; oscA.frequency.value = 220;
const oscB = ctx.createOscillator(); oscB.type = 'square';   oscB.frequency.value = 330;

// Master
const master = ctx.createGain(); master.gain.value = 0.4;

// Aux reverb (Convolver + send)
const auxSend = ctx.createGain(); auxSend.gain.value = 0.2;
const convolver = ctx.createConvolver();
// TODO: charger une IR (réponse impulsionnelle) dans convolver.buffer

// Routage fan-out des sources
oscA.connect(master); oscA.connect(auxSend);
oscB.connect(master); oscB.connect(auxSend);

// Chaîne aux -> reverb -> mix bus
const mixBus = ctx.createGain();
auxSend.connect(convolver); convolver.connect(mixBus);
master.connect(mixBus);

// Sortie
mixBus.connect(ctx.destination);

// Démarrage (sur geste utilisateur)
// oscA.start(); oscB.start();
```

---

## 🧠 Canaux, panner, et règles d’up/down-mix

- **Canaux** : mono (1), stéréo (2), multicanal (ex. 6). Chaque nœud a `channelCount`, `channelCountMode` ("max", "clamped-max", "explicit"), et `channelInterpretation` ("speakers" ou "discrete").
- **Up-mix / Down-mix** (simplifié) :
  - Mono → Stéréo : dupliquer sur L/R.
  - Stéréo → Mono : somme ou moyenne `(L + R)/2` (attention au niveau).
- **Pan** stéréo : `StereoPannerNode` (valeur -1..+1).

```js
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const pan = ctx.createStereoPanner();
pan.pan.value = -0.5; // penche vers la gauche
osc.connect(pan).connect(ctx.destination);
// osc.start();
```

---

## 🧠 Boucles de feedback (DelayNode)

- **Principe** : Les **feedback loops** nécessitent une **latence non nulle** pour être stables. En Web Audio, on réalise cela via `DelayNode`.
- **Exemple** : **echo** avec rétroaction contrôlée.

```js
const ctx = new AudioContext();
const src = ctx.createOscillator(); src.frequency.value = 440;
const delay = ctx.createDelay(); delay.delayTime.value = 0.25; // 250 ms
const feedback = ctx.createGain(); feedback.gain.value = 0.35; // rétroaction
const wet = ctx.createGain(); wet.gain.value = 0.4;
const dry = ctx.createGain(); dry.gain.value = 0.6;

// Chaîne de feedback
src.connect(dry).connect(ctx.destination);
src.connect(delay).connect(wet).connect(ctx.destination);
// boucle: sortie du delay -> feedback -> entrée du delay
delay.connect(feedback).connect(delay);

// src.start();
```

> ⚠️ **Note** : Tenter une boucle **sans** `DelayNode` mène à un **zéro délai** non supporté (comportement indéterminé/silence). Utilise toujours un `DelayNode` ou un traitement custom via **AudioWorklet** avec tampon.

---

## 🧠 Cycle de vie des nœuds et du contexte

- **États du contexte** : `running`, `suspended`, `closed`. Utiliser `ctx.resume()` et `ctx.suspend()` selon visibilité/UX (chap. 15). `close()` libère définitivement.
- **Création/démarrage/arrêt** :
  - Sources (`OscillatorNode`, `AudioBufferSourceNode`) : `start(when)`, `stop(when)`.
  - Traitements (`GainNode`, etc.) : pas de `start/stop` (actifs tant qu’ils sont connectés).
- **Déconnexion** : `node.disconnect()` pour libérer un graphe non utilisé.
- **Contexte unique** : éviter plusieurs `AudioContext` simultanés; réutiliser tant que possible.

```js
// Gestion simple UX
const ctx = new AudioContext();
async function ensureRunning() {
  if (ctx.state !== 'running') await ctx.resume();
}
```

---

## 🧠 Sécurité des connexions

- **Même contexte** : On ne peut **pas** connecter des nœuds de **contexte différents**.
- **Erreurs courantes** : connecter une **sortie** sur une **destination invalide**, ou réutiliser un node **après `stop()`** (selon le type).
- **Bonnes pratiques** : définir un **service Audio** central, gérer le **routing** au même endroit.

---

## 🛠️ (Optionnel) Intégration TypeScript & Webpack

> 💡 Aligné avec tes objectifs : typage strict et bundling.

### TS : types minimaux d’un service Audio
```ts
// audio-engine.ts
export class AudioEngine {
  private ctx: AudioContext;
  private master: GainNode;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
  }

  createOsc(freq = 440, type: OscillatorType = 'sine') {
    const osc = this.ctx.createOscillator();
    osc.type = type; osc.frequency.value = freq;
    const gain = this.ctx.createGain(); gain.gain.value = 0.2;
    osc.connect(gain).connect(this.master);
    return { osc, gain } as const;
  }

  async resume() { if (this.ctx.state !== 'running') await this.ctx.resume(); }
}
```

### Webpack (extrait de config ciblé)
```js
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.(wav|mp3)$/i, type: 'asset/resource' },
    ]
  },
  resolve: { extensions: ['.ts', '.js'] },
  devServer: { static: './dist', hot: true },
};
```

---

## 🔧 Exercices (progressifs)

1. **Fan-in** : Crée 3 `OscillatorNode` et mixe-les via un unique `GainNode`.
2. **Fan-out & Aux** : Route une source vers master + reverb aux (`ConvolverNode`). Ajoute un potard de **send**.
3. **Pan** : Ajoute `StereoPannerNode` et automatises `pan` entre -1 et +1.
4. **Feedback** : Crée une boucle delay + feedback stable (contrôle de `gain` ≤ 0.6).
5. **AudioParam via LFO** : Connecte un LFO à `filter.frequency` et compare avec une automation programmée (`setValueAtTime`).
6. **Lifecycle** : Implémente un bouton **Play/Pause** qui `resume()`/`suspend()` proprement et nettoie (`disconnect()`).

---

## 💡 Astuces & bonnes pratiques

- **Un seul `AudioContext`** par appli quand c’est possible.
- **Centraliser le routing** : service dédié pour clarté et maintenance.
- **Limiter les niveaux** : master < 1, utiliser `DynamicsCompressorNode` en sortie si nécessaire.
- **Éviter les cycles sans latence** : toujours via `DelayNode`.
- **Connecter des signaux à des `AudioParam`** pour des modulations riches.

---

## ⚠️ Pièges fréquents

- **Policy d’autoplay** : oublier `resume()` sur geste utilisateur → silence.
- **Connexions cross-context** : interdit.
- **Niveaux trop élevés** : clipping; surveiller visuellement avec un `AnalyserNode`.
- **Feedback instable** : `gain` ≥ 1 → oscillation diverge.

---

## 🧩 Schémas supplémentaires (Mermaid)

### Chaîne complète avec bus aux & LFO
```mermaid
graph LR
  Src[AudioBufferSource] --> Flt[BiquadFilter]
  LFO[Oscillator 5 Hz] --> LFOGain[Gain (depth)] --> FltFreq[AudioParam: filter.frequency]
  Flt --> Dry[Gain Dry]
  Src --> Send[Gain Send]
  Send --> Rev[Convolver]
  Rev --> Wet[Gain Wet]
  Dry --> Mix[Mix Bus]
  Wet --> Mix
  Mix --> Out[Destination]
```

---

## 🧾 Résumé du chapitre (points clés)

- **AudioContext** héberge le **AudioGraph** et fournit `destination` et l’horloge.
- **AudioNode** : sources, traitements, destination; connexions via `connect()`.
- **AudioParam** : contrôles automatisables; peut recevoir un **signal audio**.
- **Fan-in/Fan-out** : mixer plusieurs sources ou distribuer une source vers plusieurs traitements.
- **Bus aux** : envoyer vers reverb/delay en parallèle; combiner avec mix bus.
- **Canaux & Pan** : `StereoPannerNode`, règles d’up/down-mix basiques.
- **Feedback** : requis **DelayNode** (latence non nulle) pour stabilité.
- **Cycle de vie** : `resume()/suspend()/close()`, `start()/stop()`, `disconnect()`.
- **Bonnes pratiques** : un seul contexte, routing centralisé, niveaux sûrs.

---

> ✅ **Prochaines étapes** : passer à **Chapitre 3 — Oscillateurs et synthèse de base** pour explorer les formes d’onde, le pitch et le démarrage/arrêt précis des sources.
