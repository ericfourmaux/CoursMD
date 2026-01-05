
# Chapitre 7 : Organisation du code (Vanilla JavaScript, ES Modules)

> **Objectif :** structurer un projet de jeu 2D (Canvas) pour un **développement lisible, testable et extensible**. Nous allons définir une **architecture modulaire**, des **interfaces claires** (`update(dt)`, `render(ctx)`), un **Game Manager** (Singleton), un **système de scènes** (State), un **Event Bus** (Observer), et des **Factories** pour les entités, le tout orienté vers notre **jeu de course sur circuit fermé**.

---

## 1) Principes d’architecture

### Définition
L’**organisation du code** est l’ensemble des décisions qui **séparent** les responsabilités (entrées, logique, physique, rendu, audio, ressources) en **modules indépendants** qui coopèrent via **interfaces**.

### Pourquoi ?
- **Lisibilité** : savoir où implémenter/chercher une fonctionnalité.
- **Testabilité** : modules indépendants plus faciles à tester.
- **Évolutivité** : on peut **remplacer** un module sans tout casser.

### Règles d’or
- **Séparer** données (état) et représentation (rendu).
- Utiliser des **protocoles communs** : `update(dt)`, `render(ctx)`.
- **Minimiser** les couplages : préférer des **événements** ou des **interfaces** plutôt que des appels directs croisés.

**Analogie :** un **garage** bien organisé : outils rangés (modules), tâches séparées (responsabilités), planning (lifecycle). Tout le monde gagne du temps.

---

## 2) Arborescence de projet (squelette)

```
/ (racine)
├─ index.html
├─ /assets
│  ├─ /images
│  │  ├─ car_body.png
│  │  ├─ wheel_sheet.png
│  │  └─ track.png
│  └─ /audio
│     ├─ engine_loop.ogg
│     ├─ brake_squeal.ogg
│     ├─ skid.ogg
│     ├─ hit.ogg
│     └─ checkpoint.ogg
├─ /src
│  ├─ main.js                // point d’entrée (bootstrap)
│  ├─ game.js                // Game Manager (Singleton)
│  ├─ input/keyboard.js      // gestion clavier
│  ├─ input/pointer.js       // souris/tactile
│  ├─ audio/sound-manager.js // orchestration audio
│  ├─ assets/asset-manager.js// loader d’images
│  ├─ core/event-bus.js      // Observer (pub/sub)
│  ├─ core/math.js           // utilitaires (clamp, lerp...)
│  ├─ core/time.js           // time utils (fixed-step option)
│  ├─ physics/collision.js   // AABB, cercle-cercle, MTV
│  ├─ physics/vehicle.js     // cinématique simplifiée voiture
│  ├─ render/draw.js         // helpers pour Canvas
│  ├─ scenes/scene.js        // interface scène
│  ├─ scenes/menu-scene.js   // menu principal
│  ├─ scenes/race-scene.js   // course
│  ├─ world/track.js         // piste et checkpoints
│  ├─ world/factory.js       // createCar(), createNPC(), etc.
│  └─ ui/hud.js              // affichage vitesse, tours, chrono
└─ /docs
   └─ (notes, md Obsidian)
```

**Pourquoi cette structure ?** Chaque dossier représente une **préoccupation** : `input`, `audio`, `assets`, `core`, `physics`, `render`, `scenes`, `world`, `ui`. Évite le **tout-en-un**.

---

## 3) ES Modules et point d’entrée

### Définition
Les **ES Modules** (imports/exports) sont nativement supportés par le navigateur via `<script type="module">`. Ils permettent une **portée** claire, des **dépendances explicites**.

### index.html
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Course JS</title>
  <style>
    html, body { height: 100%; margin: 0; background:#101418; }
    #gameCanvas { display:block; margin:0 auto; background:#151a22; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="960" height="540"></canvas>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### `main.js` (bootstrap)
```javascript
import { Game } from './game.js';
import { AssetManager } from './assets/asset-manager.js';
import { SoundManager } from './audio/sound-manager.js';
import { RaceScene } from './scenes/race-scene.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const assets = new AssetManager();
const sounds = new SoundManager();

async function boot() {
  await assets.load({
    car: 'assets/images/car_body.png',
    wheel: 'assets/images/wheel_sheet.png',
    track: 'assets/images/track.png',
  });
  await sounds.load({
    engine: 'assets/audio/engine_loop.ogg',
    brake: 'assets/audio/brake_squeal.ogg',
    skid: 'assets/audio/skid.ogg',
    collision: 'assets/audio/hit.ogg',
    checkpoint: 'assets/audio/checkpoint.ogg',
  });

  const game = Game.getInstance({ canvas, ctx, assets, sounds });
  game.setScene(new RaceScene(game));
  game.start();
}
boot();
```

---

## 4) Game Manager (Singleton) : cycle de vie et boucle

### Définition
Le **Game Manager** coordonne la **boucle de jeu** (time), la **scène active**, les **managers** (assets, audio, input), et fournit des **services** communs.

### Pourquoi un Singleton ?
- Il n’y a généralement qu’un **jeu**. Le Singleton offre un **point d’accès unique**.
- Attention toutefois aux **abus** : garder des **interfaces** pour les modules et éviter les références globales partout.

### Implémentation
```javascript
// src/game.js
import { Keyboard } from './input/keyboard.js';
import { Pointer } from './input/pointer.js';

export class Game {
  static #instance = null;
  static getInstance(services) {
    if (!Game.#instance) Game.#instance = new Game(services);
    return Game.#instance;
  }
  constructor({ canvas, ctx, assets, sounds }) {
    this.canvas = canvas; this.ctx = ctx;
    this.assets = assets; this.sounds = sounds;
    this.keyboard = new Keyboard();
    this.pointer = new Pointer(canvas);
    this.scene = null;
    this._last = 0;
    this._running = false;
  }
  setScene(scene) {
    if (this.scene && this.scene.exit) this.scene.exit();
    this.scene = scene;
    if (this.scene.enter) this.scene.enter();
  }
  start() {
    this._running = true;
    requestAnimationFrame(this._loop.bind(this));
  }
  stop() { this._running = false; }
  _loop(ts) {
    if (!this._running) return;
    const dt = (ts - this._last) / 1000 || 0; this._last = ts;
    // figer les entrées pour la frame
    this.keyboard.beginFrame();
    this.pointer.beginFrame();
    // update + render scène
    if (this.scene && this.scene.update) this.scene.update(dt);
    if (this.scene && this.scene.render) this.scene.render(this.ctx);
    requestAnimationFrame(this._loop.bind(this));
  }
}
```

---

## 5) Système de **scènes** (State pattern)

### Définition
Une **scène** encapsule un **état global** (menu, course, pause) avec un **cycle de vie** : `enter()`, `update(dt)`, `render(ctx)`, `exit()`.

### Pourquoi ?
- **Isolation** : le menu n’a pas la physique de la course.
- **Transitions** propres (ex. fade-out, cleanup).

### Interface
```javascript
// src/scenes/scene.js
export class Scene {
  enter() {}
  update(dt) {}
  render(ctx) {}
  exit() {}
}
```

### Scène de course (extrait)
```javascript
// src/scenes/race-scene.js
import { Scene } from './scene.js';
import { createCar } from '../world/factory.js';
import { Track } from '../world/track.js';
import { HUD } from '../ui/hud.js';

export class RaceScene extends Scene {
  constructor(game) {
    super();
    this.game = game;
    this.track = new Track(game.assets.get('track'));
    this.car = createCar({ x: 480, y: 270 });
    this.hud = new HUD(this.car);
    this.vMax = 800; // pour audio pitch
  }
  enter() {
    this.game.sounds.startEngine('engine');
  }
  update(dt) {
    const kb = this.game.keyboard;
    const pointer = this.game.pointer;
    // Lire commandes et mettre à jour la voiture (chap. 3)
    const inputs = readRacingInputs(kb); // import si souhaité
    this.car.update(dt, inputs, this.track);

    // Mise à jour audio moteur
    this.game.sounds.updateEngine(this.car.v, this.vMax);
  }
  render(ctx) {
    ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    this.track.render(ctx);
    this.car.render(ctx, this.game.assets);
    this.hud.render(ctx);
  }
  exit() {}
}
```

---

## 6) **Observer** (Event Bus) : décorréler modules

### Définition
Un **Event Bus** implémente le **pattern Observer** (pub/sub). Les émetteurs **publient** des événements, les auditeurs **s’abonnent**. 

### Pourquoi ?
- **Découpler** : la physique publie `collision` sans connaître l’audio/score.
- **Extensibilité** : ajouter un auditeur (succès, particules) sans modifier l’émetteur.

### Implémentation
```javascript
// src/core/event-bus.js
export class EventBus {
  constructor() { this.map = new Map(); }
  on(type, fn) {
    const list = this.map.get(type) || []; list.push(fn); this.map.set(type, list);
    return () => this.off(type, fn); // unsubscribe
  }
  off(type, fn) {
    const list = this.map.get(type) || []; this.map.set(type, list.filter(f => f !== fn));
  }
  emit(type, payload) {
    const list = this.map.get(type) || []; for (const fn of list) fn(payload);
  }
}
```

### Usage (course)
```javascript
// Exemple : dans vehicle.js
bus.emit('collision', { vr: relativeSpeed, point: {x,y} });

// Abonné audio (dans RaceScene.enter)
this.unsubCollision = this.game.bus.on('collision', ({ vr }) => {
  if (vr > 80) this.game.sounds.play('collision', 'sfx', {
    gain: Math.min(1, vr/600), playbackRate: 1 + Math.min(0.5, vr/1200)
  });
});
```

---

## 7) **Factory** d’entités : créer sans exposer les détails

### Définition
Une **Factory** encapsule la **construction** d’objets complexes (car, NPC) pour **masquer** les dépendances et garantir une **configuration cohérente**.

### Pourquoi ?
- Point unique pour les **paramètres** par défaut.
- **Tests** plus simples (on injecte des mocks).

### Implémentation
```javascript
// src/world/factory.js
import { Car } from '../physics/vehicle.js';
export function createCar({ x = 480, y = 270 } = {}) {
  const car = new Car(x, y);
  // presets arcade
  car.aMax = 300; car.bMax = 400; car.drag = 0.8;
  car.steerSpeed = 3.0; car.maxSteer = 0.6; car.steeringRate = 1.6;
  return car;
}
```

---

## 8) Modules clés (interfaces minimales)

### Vehicle (cinématique simplifiée)
```javascript
// src/physics/vehicle.js
import { clamp } from '../core/math.js';
export class Car {
  constructor(x, y) {
    this.x = x; this.y = y; this.heading = 0; this.v = 0;
    this.aMax = 300; this.bMax = 400; this.drag = 0.8;
    this.steerSpeed = 3.0; this.maxSteer = 0.6; this.steeringRate = 1.6;
    this._steering = 0;
  }
  update(dt, inputs, track) {
    const { throttle, brake, steer } = inputs;
    // Lissage de la direction
    this._steering = clamp(this._steering + steer * this.steerSpeed * dt, -this.maxSteer, this.maxSteer);
    // Vitesse
    this.v = this.v + (throttle * this.aMax - brake * this.bMax - this.drag * this.v) * dt;
    // Orientation
    this.heading = this.heading + this.steeringRate * (this._steering / this.maxSteer) * dt;
    // Déplacement
    const vx = Math.cos(this.heading) * this.v;
    const vy = Math.sin(this.heading) * this.v;
    this.x += vx * dt; this.y += vy * dt;
    // Collisions simples avec la piste
    if (track && track.resolve) track.resolve(this); // MTV + friction faible
  }
  render(ctx, assets) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.heading);
    ctx.drawImage(assets.get('car'), -assets.get('car').width*0.5, -assets.get('car').height*0.5);
    ctx.restore();
  }
}
```

### Track
```javascript
// src/world/track.js
export class Track {
  constructor(image) { this.image = image; }
  render(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
  resolve(car) {
    // Exemple : hors-piste (drag élevé) selon la couleur/masque (placeholder)
    // Idée : un masque (offscreen) pour tester le pixel sous la voiture.
    // Ici, on simule : zone centrale permissive, bords plus drag.
    const offCenter = Math.abs(car.x - 480) + Math.abs(car.y - 270) > 300;
    car.drag = offCenter ? 2.0 : 0.8;
  }
}
```

### HUD
```javascript
// src/ui/hud.js
export class HUD {
  constructor(car) { this.car = car; this.lap = 1; this.time = 0; }
  update(dt) { this.time += dt; }
  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#e0e3e8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Vitesse: ${Math.round(this.car.v)} px/s`, 20, 24);
    ctx.fillText(`Tour: ${this.lap}`, 20, 44);
    ctx.fillText(`Temps: ${this.time.toFixed(1)} s`, 20, 64);
    ctx.restore();
  }
}
```

---

## 9) Gestion des dépendances : DI légère vs Service Locator

### Définition
- **DI (Dependency Injection)** : passer les dépendances via le **constructeur** ou les **paramètres**.
- **Service Locator** : exposer un **registre** (ex. `Game`) permettant d’obtenir des services.

### Pourquoi ?
- **DI** rend les modules **testables** (on injecte des doubles/mocks).
- **Service Locator** est **pratique** mais peut masquer des couplages.

**Conseil** : utiliser **DI pour la logique** (ex. `RaceScene(game)`), et **Service Locator** limité au **Game Manager** (canvas, bus, assets, sounds).

---

## 10) Journalisation et assertions

### Logger simple
```javascript
export const log = {
  info: (...a) => console.log('[INFO]', ...a),
  warn: (...a) => console.warn('[WARN]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};
```

### Assert
```javascript
export function assert(cond, msg = 'Assertion failed') {
  if (!cond) throw new Error(msg);
}
```

**Pourquoi ?** Détecter tôt les **incohérences** et **documenter** les hypothèses.

---

## 11) Option pas-à-pas : pas fixe (Fixed-step) pour la physique

### Définition
Au lieu d’un `dt` variable, on peut intégrer la physique avec un **pas fixe** (ex. `fixed=1/120 s`) en accumulant le temps.

### Pourquoi ?
- **Stabilité** numérique.
- **Déterminisme** utile pour replays/tests.

### Formule
```javascript
acc += dt;
while (acc >= fixed) {
  updatePhysics(fixed);
  acc -= fixed;
}
render(interpolate(acc/fixed));
```

---

## 12) Bonnes pratiques

- **Nommer** clairement fichiers et classes.
- **Limiter** les accès globaux : passer les dépendances.
- **Interfaces** stables (`update`, `render`, `enter`, `exit`).
- **Événements** pour couplage faible (Observer).
- **Factories** pour objets complexes.
- **Mesurer** (DevTools) et ajuster (rendu/audio/physique).
- **Documenter** (README, md Obsidian) chaque module.

---

## ✅ Résumé des points essentiels
- **Architecture modulaire** : `input`, `audio`, `assets`, `physics`, `render`, `scenes`, `world`, `ui`.
- **Game Manager (Singleton)** : boucle + services ; Singleton **raisonné**.
- **Scènes** : `enter/update/render/exit` (State pattern) pour isoler les états.
- **Event Bus (Observer)** : **pub/sub** pour décorréler la logique et les effets.
- **Factories** : centraliser la construction d’entités.
- **DI vs Service Locator** : privilégier DI pour testabilité, limiter le locator.
- **Fixed-step option** : stabilité physique.

