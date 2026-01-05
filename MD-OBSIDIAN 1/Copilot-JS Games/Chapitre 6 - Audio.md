
# Chapitre 6 : Audio et feedback (Vanilla JavaScript)

> **Objectif :** intégrer un **sound design** efficace avec l’API Audio du navigateur (HTMLAudioElement et surtout **Web Audio API**), relier les **événements de gameplay** à des sons (accélération, freinage, collisions, UI), gérer **volumes**, **boucles**, **mixage**, **latence**, et produire un **feedback** audiovisuel cohérent pour un jeu de **course**.

---

## 1) Choisir la bonne API : HTMLAudioElement vs Web Audio API

### Définition
- **HTMLAudioElement** (`new Audio(src)`) : simple, lecture directe d’un fichier, contrôle de base (play/pause/volume/boucle).
- **Web Audio API** (`AudioContext`) : pipeline **modulaire** (nœuds) pour **mixage**, **effets** (filtres, compression), **contrôles fins** (programmation temporelle, courbes d’enveloppe), **faible latence**.

### Pourquoi préférer Web Audio API pour un jeu ?
- Latence **réduite** et **précision temporelle** (`audioCtx.currentTime`).
- Mixage par **bus** (SFX, moteur, UI) et **automations** (rampes de volume).
- **Boucles** réalistes (moteur), **pitch** par `playbackRate`, **filtres** (skid, turbo), **compressor** (limiteur simple).

**Analogie :** HTMLAudio est une **radio** (tu appuies et ça joue). Web Audio est une **table de mixage** avec câbles et effets.

---

## 2) Préparer et débloquer l’audio (autoplay policies)

### Définition
Les navigateurs exigent une **interaction utilisateur** (clic/touche) avant d’autoriser la lecture sonore.

### Pattern de déblocage
```javascript
let audioCtx;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume(); // nécessite un geste utilisateur
  }
}
// Exemple : appeler sur le premier clic
window.addEventListener('pointerdown', initAudio, { once: true });
```

### Chargement et décodage des buffers (promises)
```javascript
async function loadAudioBuffer(url) {
  const res = await fetch(url);
  const arr = await res.arrayBuffer();
  const buf = await audioCtx.decodeAudioData(arr); // AudioBuffer
  return buf;
}
```

---

## 3) Architecture de mixage (bus)

### Définition
Créer des **bus** (nœuds `GainNode`) pour regrouper et contrôler des **familles** de sons :
- **master** (sortie globale)
- **sfx** (sons courts : collision, checkpoint)
- **engine** (boucle moteur)
- **ui** (menu, clics)

### Pourquoi ?
- Ajuster les **volumes** par catégorie.
- **Mute** rapide (ex. UI en pause), **crossfade** (ex. passer de moteur normal à turbo).

### Implémentation
```javascript
function createMixer(audioCtx) {
  const master = audioCtx.createGain(); master.gain.value = 1.0;
  const sfx = audioCtx.createGain(); sfx.gain.value = 0.9;
  const engine = audioCtx.createGain(); engine.gain.value = 0.8;
  const ui = audioCtx.createGain(); ui.gain.value = 0.7;

  sfx.connect(master);
  engine.connect(master);
  ui.connect(master);
  master.connect(audioCtx.destination);

  return { master, sfx, engine, ui };
}
```

---

## 4) Jouer des sons (SFX) avec AudioBufferSourceNode

### Définition
`AudioBufferSourceNode` joue un **AudioBuffer** (déjà décodé). On peut régler `playbackRate`, `detune`, `loop`, et **planifier** (`start(when)`).

### Pourquoi ?
- Lancer plusieurs **instances** en parallèle (collisions multiples).
- **Pitch** variable (ex. impact plus aigu si vitesse élevée).

### Exemple : utilitaire `playOneShot`
```javascript
function playOneShot(buffer, outputNode, { when = 0, gain = 1, playbackRate = 1 } = {}) {
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = playbackRate;

  const g = audioCtx.createGain();
  g.gain.value = gain;

  src.connect(g);
  g.connect(outputNode);
  src.start(audioCtx.currentTime + when);
  // nettoyage automatique quand la source termine
}
```

---

## 5) Boucle moteur (loop) + variation de pitch (playbackRate)

### Définition
Le **son moteur** est une **boucle** courte **sans clic** (loop seamless). On **modifie le pitch** via `playbackRate` selon la vitesse ou le régime.

### Formule (exemple arcade)
```javascript
// v : vitesse (px/s), vMax : vitesse max, base : pitch de base
// k : facteur de montée de pitch
const t = Math.min(1, Math.abs(v) / vMax);
const playbackRate = base + k * t; // clampé
```

### Mise en place
```javascript
function startEngineLoop(engineBuffer, engineBus) {
  const src = audioCtx.createBufferSource();
  src.buffer = engineBuffer;
  src.loop = true;

  // Filtre léger pour un son plus rond
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 6000;

  src.connect(filter);
  filter.connect(engineBus);
  src.start();

  return { src, filter };
}

// Dans la boucle de jeu : adapter le pitch
function updateEnginePitch(loop, v, vMax) {
  const base = 0.8; const k = 1.2;
  const t = Math.min(1, Math.abs(v) / vMax);
  const rate = base + k * t;
  loop.src.playbackRate.setTargetAtTime(rate, audioCtx.currentTime, 0.05); // lissage
}
```

**Astuce anti-clic :** utiliser des boucles **préparées** (point de boucle propre) ou un léger **crossfade** entre deux buffers.

---

## 6) Freinage, dérapage (skid) et collisions

### Définition
- **Freinage** : sifflement/craquement (volume dépendant de la **intensité de frein**).
- **Dérapage** : son lié à la **glissance latérale** (chap. Physique). On peut moduler **volume** et **filtre**.
- **Collision** : impact court; **volume/pitch** selon la **vitesse relative**.

### Formules
```javascript
// brake : 0..1 ; lateralSlip : 0..1
const brakeVol = brake; // proportionnel
const skidVol = Math.max(0, lateralSlip - 0.2) / 0.8; // seuil puis normalisation

// collision : vitesse relative vr (px/s)
const impactGain = Math.min(1, vr / 600);
const impactRate = 1 + Math.min(0.5, vr / 1200); // pitch légèrement plus aigu à grande vitesse
```

### Mise en œuvre
```javascript
function playBrakeSqueal(buffer, sfxBus, brake) {
  const vol = brake; // simple
  if (vol < 0.05) return;
  playOneShot(buffer, sfxBus, { gain: vol, playbackRate: 1 });
}

function playCollision(buffer, sfxBus, vr) {
  const gain = Math.min(1, vr / 600);
  const rate = 1 + Math.min(0.5, vr / 1200);
  playOneShot(buffer, sfxBus, { gain, playbackRate: rate });
}
```

---

## 7) UI et feedback visuel/sonore combiné

### Définition
Le **feedback** doit être **multimodal** : sonore **et** visuel (flash, particules, texte). Les sons **UI** (confirmation, erreur, sélection) doivent être **discrets** et **distinguables**.

### Pourquoi ?
- Renforce la **compréhension** des événements (checkpoint, tour terminé).
- Donne du **ressenti** (accélération/freinage) au-delà du visuel.

### Exemple : son de checkpoint + flash
```javascript
function onCheckpointHit(buffer, sfxBus) {
  // Son
  playOneShot(buffer, sfxBus, { gain: 0.8, playbackRate: 1 });
  // Visuel (Canvas) : flash bref
  flashScreen(0.2); // implémentation : dessiner un overlay semi-transparent pendant t secondes
}
```

---

## 8) SoundManager (class) – orchestration complète

### Définition
Un **SoundManager** coordonne chargement, bus, loops et one-shots. Il expose des **méthodes** simples reliées au gameplay.

### Implémentation
```javascript
class SoundManager {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.mixer = createMixer(this.audioCtx);
    this.buffers = new Map();
    this.engineLoop = null;
  }
  async load(manifest) {
    const entries = Object.entries(manifest);
    for (const [key, path] of entries) {
      const buf = await loadAudioBuffer(path);
      this.buffers.set(key, buf);
    }
  }
  play(name, bus = 'sfx', opts = {}) {
    const buf = this.buffers.get(name);
    if (!buf) return;
    const output = this.mixer[bus] || this.mixer.sfx;
    playOneShot(buf, output, opts);
  }
  startEngine(name = 'engine') {
    const buf = this.buffers.get(name);
    if (!buf) return;
    this.engineLoop = startEngineLoop(buf, this.mixer.engine);
  }
  updateEngine(v, vMax) {
    if (this.engineLoop) updateEnginePitch(this.engineLoop, v, vMax);
  }
  setBusVolume(bus, vol, timeConst = 0.08) {
    const g = this.mixer[bus]; if (!g) return;
    g.gain.setTargetAtTime(vol, this.audioCtx.currentTime, timeConst);
  }
  suspend() { return this.audioCtx.suspend(); }
  resume() { return this.audioCtx.resume(); }
}
```

### Usage
```javascript
const sm = new SoundManager();
await sm.load({
  engine: 'assets/audio/engine_loop.ogg',
  brake: 'assets/audio/brake_squeal.ogg',
  skid: 'assets/audio/skid.ogg',
  collision: 'assets/audio/hit.ogg',
  uiClick: 'assets/audio/ui_click.ogg',
  checkpoint: 'assets/audio/checkpoint.ogg',
});

// Débloquer l’audio sur le premier geste
window.addEventListener('pointerdown', () => sm.resume(), { once: true });

// Démarrer la boucle moteur
sm.startEngine('engine');

// Dans la boucle de jeu
sm.updateEngine(v, vMax);
if (brake > 0.2) sm.play('brake', 'sfx', { gain: brake });
if (collisionVR > 80) sm.play('collision', 'sfx', { gain: Math.min(1, collisionVR/600), playbackRate: 1 + Math.min(0.5, collisionVR/1200) });
```

---

## 9) Effets utiles : filtres, compresseur, panoramique

### Filtres (`BiquadFilterNode`)
- **lowpass** : atténuer les aigus (moteur feutré)
- **highpass** : atténuer les graves (réduire le « bourdonnement »)

```javascript
const filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.setValueAtTime(6000, audioCtx.currentTime);
```

### Compresseur (`DynamicsCompressorNode`)
- Limiter les **pics** et stabiliser le mix.
```javascript
const comp = audioCtx.createDynamicsCompressor();
comp.threshold.value = -24; // dB
comp.knee.value = 30;
comp.ratio.value = 12;
comp.attack.value = 0.003;
comp.release.value = 0.25;
// Placer comp avant master → destination
```

### Panoramique (`StereoPannerNode`)
- Déplacer gauche/droite (ex. voiture voisine sur la gauche).
```javascript
const pan = audioCtx.createStereoPanner();
pan.pan.value = -0.5; // gauche
```

---

## 10) Scheduling temporel et latence

### Définition
Les événements audio se programment avec **précision** via `audioCtx.currentTime`.

### Pourquoi ?
- Synchroniser **frame** et **son** (ex. collision pile au contact).
- Réduire le **jitter** : planifier légèrement **dans le futur** (ex. +10 ms).

### Exemple
```javascript
function scheduleImpact(buffer, whenSeconds, sfxBus) {
  const now = audioCtx.currentTime;
  const delta = Math.max(0, whenSeconds - now);
  playOneShot(buffer, sfxBus, { when: delta, gain: 0.9 });
}
```

---

## 11) Pièges courants et bonnes pratiques

- **Déblocage audio** : toujours **resume** après un **geste** utilisateur.
- **Boucles propres** : éviter les clics en préparant des **points de boucle**.
- **Contrôle des volumes** : utiliser des **rampes** (`setTargetAtTime`, `linearRampToValueAtTime`) plutôt que des sauts.
- **Budget CPU** : limiter le nombre de nœuds simultanés; réutiliser des nœuds si possible.
- **Formats** : prévoir **fallback** (`.ogg`, `.mp3`, éventuellement `.wav`) selon navigateurs.
- **Balance mix** : compresseur léger sur le **master**, bus séparés pour lisibilité.

---

## ✅ Résumé des points essentiels
- **Web Audio API** → latence faible, mixage modulaire, scheduling précis.
- **Autoplay** : déverrouiller avec un **geste** (resume AudioContext).
- **Bus** (master/sfx/engine/ui) pour volumes et mixage.
- **Boucle moteur** : `playbackRate` ~ vitesse, filtre lowpass, rampes lissées.
- **SFX** (frein, skid, collisions) : volumes/pitch dépendants du gameplay.
- **Feedback** multimodal (son + visuel) : améliore la clarté et le ressenti.
- **Effets** (filtres, compresseur, panner) : qualité et spatialisation.
- **Scheduling** : `currentTime` pour déclenchements précis.

