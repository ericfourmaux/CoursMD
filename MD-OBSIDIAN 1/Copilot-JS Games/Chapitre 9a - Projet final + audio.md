
# Chapitre 9.1 : **Course JS+** — Audio intégré + IA Bot simple

> **Objectif :** enrichir le MVP du Chapitre 9 avec **audio** (boucle moteur + SFX checkpoint/collision) et une **IA minimaliste** (bots qui suivent des **waypoints**), tout en restant **Vanilla JS** et simple à lire.

---

## 1) Audio : SoundManager minimal et intégration

### 1.1 SoundManager (simplifié)
Crée `src/audio/sound-manager.js` :
```javascript
export class SoundManager {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.audioCtx.createGain(); this.master.gain.value = 1.0;
    this.engineBus = this.audioCtx.createGain(); this.engineBus.gain.value = 0.8;
    this.sfxBus = this.audioCtx.createGain(); this.sfxBus.gain.value = 0.9;
    this.engineBus.connect(this.master); this.sfxBus.connect(this.master); this.master.connect(this.audioCtx.destination);
    this.buffers = new Map(); this.engineLoop = null;
  }
  async load(manifest) {
    const entries = Object.entries(manifest);
    for (const [key, url] of entries) {
      const arr = await (await fetch(url)).arrayBuffer();
      const buf = await this.audioCtx.decodeAudioData(arr);
      this.buffers.set(key, buf);
    }
  }
  resume() { return this.audioCtx.resume(); }
  playOneShot(name, { gain=1, playbackRate=1 }={}) {
    const buf = this.buffers.get(name); if (!buf) return;
    const src = this.audioCtx.createBufferSource(); src.buffer = buf; src.playbackRate.value = playbackRate;
    const g = this.audioCtx.createGain(); g.gain.value = gain; src.connect(g); g.connect(this.sfxBus); src.start();
  }
  startEngine(name='engine') {
    const buf = this.buffers.get(name); if (!buf) return;
    const src = this.audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = this.audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000;
    src.connect(lp); lp.connect(this.engineBus); src.start(); this.engineLoop = { src, lp };
  }
  updateEngine(v, vMax) {
    if (!this.engineLoop) return; const base=0.8, k=1.2; const t = Math.min(1, Math.abs(v)/vMax);
    const rate = base + k * t; this.engineLoop.src.playbackRate.setTargetAtTime(rate, this.audioCtx.currentTime, 0.05);
  }
}
```

### 1.2 Wiring dans `main.js`
```javascript
import { Game } from './game.js';
import { RaceScene } from './scenes/race-scene.js';
import { SoundManager } from './audio/sound-manager.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sounds = new SoundManager();

(async () => {
  await sounds.load({
    engine: 'assets/audio/engine_loop.ogg',
    checkpoint: 'assets/audio/checkpoint.ogg',
    collision: 'assets/audio/hit.ogg'
  });
  window.addEventListener('pointerdown', () => sounds.resume(), { once:true });
  const game = Game.getInstance({ canvas, ctx, sounds });
  game.setScene(new RaceScene(game));
  game.start();
})();
```

### 1.3 Utilisation dans `race-scene.js`
- **Démarrer** la boucle **moteur** en `enter()`.
- **Adapter** le **pitch** (`updateEngine`) selon la **vitesse**.
- Jouer **SFX** au **checkpoint** et en **collision**.

```javascript
enter() {
  this.game.sounds?.startEngine('engine');
}
update(dt) {
  // ... physics
  this.game.sounds?.updateEngine(this.car.v, 800);
  // checkpoint franchi
  if (crossedSegment(...)) {
    this.game.sounds?.playOneShot('checkpoint', { gain: 0.8 });
  }
  // collision simple (player vs bot) → voir section IA pour le test et SFX
}
```

---

## 2) IA bot minimaliste — suivi de waypoints

### 2.1 Idée
Un **bot** suit une **liste de `waypoints`** : il calcule la **direction** vers le **prochain** point, ajuste `steer` pour s’orienter, met `throttle` selon la **courbure** (ralentit dans les virages), **brake** si hors-piste.

### 2.2 BotCar (contrôleurs)
Crée `src/physics/bot.js` :
```javascript
import { Car, clamp } from './vehicle.js';

export class BotCar extends Car {
  constructor(x, y, waypoints) { super(x,y); this.wps = waypoints; this.i = 0; }
  computeInputs(track) {
    const target = this.wps[this.i]; const dx = target.x - this.x; const dy = target.y - this.y;
    const angTo = Math.atan2(dy, dx); let d = normalizeAngle(angTo - this.heading);
    const steer = clamp(d / 0.6, -1, 1); // cible une direction ; 0.6 ≈ tolérance
    const dist = Math.hypot(dx,dy);
    if (dist < 24) this.i = (this.i + 1) % this.wps.length; // prochain WP
    const throttle = clamp(1 - Math.abs(d), 0.2, 1); // ralentit si virage serré
    const off = (!track) ? false : (!isInsideRect(this.x, this.y, track.outer) || isInsideRect(this.x, this.y, track.inner));
    const brake = off ? 0.6 : 0.0;
    return { throttle, brake, steer };
  }
  updateBot(dt, track) { const inp = this.computeInputs(track); super.update(dt, inp); }
}

function normalizeAngle(a){ while(a> Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; }
function isInsideRect(x,y,r){ return x>=r.x && x<=r.x+r.w && y>=r.y && y<=r.y+r.h; }
```

### 2.3 Wiring dans `race-scene.js`
- Déclare quelques **waypoints** (coins du couloir). 
- Crée 1–3 **bots**.
- Mets à jour et rends les bots.

```javascript
// dans constructor
this.wps = [
  { x: this.track.outer.x + this.track.outer.w - 80, y: this.track.outer.y + 80 },
  { x: this.track.outer.x + this.track.outer.w - 80, y: this.track.outer.y + this.track.outer.h - 80 },
  { x: this.track.outer.x + 80, y: this.track.outer.y + this.track.outer.h - 80 },
  { x: this.track.outer.x + 80, y: this.track.outer.y + 80 },
];
this.bots = [ new BotCar(this.track.outer.x+this.track.outer.w*0.3, this.track.outer.y+this.track.outer.h*0.7, this.wps) ];

// dans update(dt)
for (const b of this.bots) b.updateBot(dt, this.track);

// dans render(ctx)
for (const b of this.bots) { ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.heading); ctx.fillStyle='#ffca28'; ctx.fillRect(-22,-10,44,20); ctx.restore(); }
```

### 2.4 Collision simple Player vs Bot (cercle–cercle)
Joue un **SFX** si impact significatif.
```javascript
function collideCircles(a, b) {
  const dx=b.x-a.x, dy=b.y-a.y; const d2=dx*dx+dy*dy; const r=a.radius+b.radius;
  if (d2>r*r) return false; const d = Math.sqrt(d2)||1e-6; const nx=dx/d, ny=dy/d;
  // Séparation minimale
  const overlap = r - d; a.x -= nx*overlap*0.5; a.y -= ny*overlap*0.5; b.x += nx*overlap*0.5; b.y += ny*overlap*0.5;
  // Impulsion simplifiée
  const rvx = a.v*Math.cos(a.heading) - b.v*Math.cos(b.heading);
  const rvy = a.v*Math.sin(a.heading) - b.v*Math.sin(b.heading);
  const relDot = rvx*nx + rvy*ny; if (relDot > 0) return true; // s'éloignent
  const j = -(1 + 0.4) * relDot; // e≈0.4
  const jx = j*nx, jy=j*ny;
  // applique sur les vitesses directionnelles
  a.v += (jx*Math.cos(a.heading) + jy*Math.sin(a.heading))*0.5;
  b.v -= (jx*Math.cos(b.heading) + jy*Math.sin(b.heading))*0.5;
  return true;
}

// dans update(dt) après avoir mis à jour car et bots
for (const b of this.bots) {
  if (collideCircles(this.car, b)) {
    const vx = Math.abs(this.car.v - b.v);
    if (vx > 80) this.game.sounds?.playOneShot('collision', { gain: Math.min(1, vx/600), playbackRate: 1 + Math.min(0.5, vx/1200) });
  }
}
```

---

## 3) Encarts pédagogiques (liés aux schémas)

### Audio — engine loop + SFX

**Ce qu’il montre :** la **chaîne audio** (source → filtre → bus → destination) pour la boucle **moteur**, et le bus **SFX** pour **checkpoint/collision**. **À retenir :** réutilise les **nœuds**, ajuste **playbackRate** selon la **vitesse**.

### IA bot — waypoints

**Ce qu’il montre :** un **bot** aligné vers le **prochain waypoint** (steer), avec un **throttle** réduit dans les **virages**. **À retenir :** garde des **règles simples** (tolérance d’angle, cible suivante à `dist < seuil`).

---

## ✅ Résumé
- **Audio intégré** (boucle moteur + SFX) avec un **SoundManager** minimal.
- **IA bot** : suivi de **waypoints**, réglage de `steer/throttle/brake`, et **collision** avec SFX.
- Tout reste **Vanilla JS** et lisible, prêt à être **étendu** (plus de bots, drift, ghost, mini‑map, audio avancé).
