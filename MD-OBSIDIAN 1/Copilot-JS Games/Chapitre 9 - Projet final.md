
# Chapitre 9 : Projet final – **Course JS** (circuit fermé, 100% Vanilla JavaScript)

> **Objectif :** livrer un **MVP jouable** d’un jeu de **course automobile** sur **circuit fermé**, avec **contrôles clavier**, **physique simplifiée** (arcade), **collisions** basiques, **checkpoints** et **chrono/laps**, **audio** (moteur, collisions, checkpoint), **HUD**, et une **architecture modulaire** en **ES Modules**.

---

## 1) Spécifications du MVP

### Définition
Un **circuit fermé** (anneau rectangulaire) : le joueur doit **compléter N tours** (ex. 3) en passant des **checkpoints** dans l’ordre. Le jeu fournit :
- **Voiture** (contrôles : accélération, frein, direction) ;
- **Piste** (couloir autorisé + zone hors-piste avec **drag élevé**) ;
- **Checkpoints** + **ligne de départ/arrivée** (détection de passage) ;
- **Chrono** (temps de tour & total) ;
- **HUD** (vitesse, tour, temps, meilleurs temps) ;
- **Audio** (boucle moteur, freinage/impact, checkpoint) ;
- **Score**/classement local (**localStorage**).

### Pourquoi cet MVP ?
- **Combinaison** de tous les chapitres : entrées, boucle, Canvas, physique, collisions, audio, organisation du code.
- **Simple** à comprendre, mais **complet** : prêt pour extensions (IA, drift, ghost lap).

---

## 2) Machine à états de la course

### États
- **Ready** : compte à rebours (ou “Press any key to start”).
- **Running** : chrono actif, N **checkpoints** à valider en boucle, **laps** jusqu’au **target**.
- **Finished** : affichage score + enregistrement **meilleur temps**.

**Pourquoi un state machine ?** Séparer **clairement** les comportements : pas de chrono en **pause**, pas de **collisions** ou entrées traitées hors **Running**, etc.

---

## 3) Géométrie du circuit (anneau) & détection hors-piste

### Modèle
- **Piste autorisée** : espace **entre** un **grand rectangle** (`outer`) et un **rectangle central** (`inner`).
- **Hors-piste** : à l’**intérieur** du rectangle central **ou** à l’**extérieur** du grand rectangle.

### Formule (tests)
```javascript
function isInsideRect(x, y, rect) {
  const { x:rx, y:ry, w, h } = rect;
  return x >= rx && x <= rx + w && y >= ry && y <= ry + h;
}

function isOffTrack(x, y, outer, inner) {
  const insideOuter = isInsideRect(x, y, outer);
  const insideInner = isInsideRect(x, y, inner);
  return !insideOuter || insideInner; // hors-piste si dehors outer OU dedans inner
}
```

**Pourquoi ce modèle ?** Très **accessible** pour débutant, rapide à évaluer, suffisant pour un **anneau**.

---

## 4) Checkpoints & détection de passage (changement de côté)

### Principe
Chaque **checkpoint** est un **segment**. On détecte que la voiture le **franchit** si la **position précédente** et la **position actuelle** sont de **part et d’autre** du segment.

### Formule (orientation/produit vectoriel)
```javascript
function sideOfSegment(ax, ay, bx, by, px, py) {
  // signe de la croix (B-A) x (P-A) : >0 à gauche, <0 à droite, 0 sur le segment
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

function crossedSegment(ax, ay, bx, by, p0x, p0y, p1x, p1y) {
  const s0 = sideOfSegment(ax, ay, bx, by, p0x, p0y);
  const s1 = sideOfSegment(ax, ay, bx, by, p1x, p1y);
  return (s0 == 0 || s1 == 0) ? false : (s0 * s1 < 0); // signes opposés → franchi
}
```

**Pourquoi cette méthode ?** Très **robuste** et **rapide** : pas besoin d’intersections complexes.

---

## 5) Architecture des fichiers (ES Modules)

```
/ (racine)
├─ index.html
├─ /assets
│  ├─ /images
│  │  └─ track.png (optionnel – décor)
│  └─ /audio
│     ├─ engine_loop.ogg
│     ├─ brake_squeal.ogg
│     ├─ hit.ogg
│     └─ checkpoint.ogg
└─ /src
   ├─ main.js
   ├─ game.js
   ├─ input/keyboard.js
   ├─ audio/sound-manager.js
   ├─ world/track.js
   ├─ physics/vehicle.js
   ├─ scenes/scene.js
   ├─ scenes/race-scene.js
   └─ ui/hud.js
```

**Pourquoi ainsi ?** Réunit les **préoccupations** : entrées, audio, monde/piste, physique, scènes, UI.

---

## 6) Code complet (MVP jouable)

> **Note :** ouvre via un **server local** (ES Modules). 

### `index.html`
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
    .hint { color:#cfd8dc; text-align:center; font-family:sans-serif; margin-top:8px; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="960" height="540"></canvas>
  <div class="hint">Contrôles : ↑/W accélérer · ↓/S freiner · ←/A · →/D tourner</div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### `src/main.js`
```javascript
import { Game } from './game.js';
import { RaceScene } from './scenes/race-scene.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = Game.getInstance({ canvas, ctx });
game.setScene(new RaceScene(game));
game.start();
```

### `src/game.js`
```javascript
import { Keyboard } from './input/keyboard.js';

export class Game {
  static #instance = null;
  static getInstance(services) {
    if (!Game.#instance) Game.#instance = new Game(services);
    return Game.#instance;
  }
  constructor({ canvas, ctx }) {
    this.canvas = canvas; this.ctx = ctx;
    this.keyboard = new Keyboard();
    this.scene = null;
    this._last = 0; this._running = false;
  }
  setScene(scene) { if (this.scene?.exit) this.scene.exit(); this.scene = scene; this.scene?.enter(); }
  start() { this._running = true; requestAnimationFrame(this._loop.bind(this)); }
  stop() { this._running = false; }
  _loop(ts) {
    if (!this._running) return;
    const dt = (ts - this._last) / 1000 || 0; this._last = ts;
    this.keyboard.beginFrame();
    this.scene?.update(dt);
    this.scene?.render(this.ctx);
    requestAnimationFrame(this._loop.bind(this));
  }
}
```

### `src/input/keyboard.js`
```javascript
export class Keyboard {
  constructor() {
    this.down = new Set(); this.justPressed = new Set(); this.justReleased = new Set();
    this._p = new Set(); this._r = new Set();
    window.addEventListener('keydown', e => { if (!this.down.has(e.code)) this._p.add(e.code); this.down.add(e.code); }, { passive: true });
    window.addEventListener('keyup', e => { if (this.down.has(e.code)) this._r.add(e.code); this.down.delete(e.code); }, { passive: true });
    window.addEventListener('blur', () => this.down.clear());
  }
  beginFrame() { this.justPressed = this._p; this.justReleased = this._r; this._p = new Set(); this._r = new Set(); }
  isDown(code) { return this.down.has(code); }
}
```

### `src/world/track.js`
```javascript
export class Track {
  constructor(canvas) {
    // Définition d'un anneau axis-aligned
    this.outer = { x: 80, y: 60, w: canvas.width - 160, h: canvas.height - 120 };
    const iw = Math.round(this.outer.w * 0.56), ih = Math.round(this.outer.h * 0.48);
    const ix = Math.round(this.outer.x + (this.outer.w - iw) / 2);
    const iy = Math.round(this.outer.y + (this.outer.h - ih) / 2);
    this.inner = { x: ix, y: iy, w: iw, h: ih };

    // Checkpoints (4 segments : haut, gauche, bas, droite)
    const o = this.outer;
    this.checkpoints = [
      { a: { x: o.x + o.w/2, y: o.y + 10 }, b: { x: o.x + o.w/2, y: o.y + o.h - 10 } },
      { a: { x: o.x + 10, y: o.y + o.h/2 }, b: { x: o.x + o.w - 10, y: o.y + o.h/2 } },
      { a: { x: o.x + o.w/2, y: o.y + 10 }, b: { x: o.x + o.w/2, y: o.y + o.h - 10 } },
      { a: { x: o.x + 10, y: o.y + o.h/2 }, b: { x: o.x + o.w - 10, y: o.y + o.h/2 } },
    ];

    // Ligne de départ = CP0 (du haut vers le bas)
    this.startIndex = 0;
  }

  render(ctx) {
    // Piste statique
    const o = this.outer, i = this.inner;
    ctx.save();
    // Fond
    ctx.fillStyle = '#0f1318';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Couloir autorisé
    ctx.fillStyle = '#202734';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(i.x, i.y, i.w, i.h);
    ctx.globalCompositeOperation = 'source-over';

    // Bordures
    ctx.strokeStyle = '#455a64'; ctx.lineWidth = 2;
    ctx.strokeRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = '#78909c'; ctx.setLineDash([6, 4]);
    ctx.strokeRect(i.x, i.y, i.w, i.h);
    ctx.setLineDash([]);

    // Checkpoints (visualisation)
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 2;
    for (const cp of this.checkpoints) {
      ctx.beginPath(); ctx.moveTo(cp.a.x, cp.a.y); ctx.lineTo(cp.b.x, cp.b.y); ctx.stroke();
    }
    ctx.restore();
  }
}
```

### `src/physics/vehicle.js`
```javascript
export class Car {
  constructor(x, y) {
    this.x = x; this.y = y; this.heading = 0; this.v = 0; this.prevX = x; this.prevY = y;
    // Paramètres arcade
    this.aMax = 300; this.bMax = 420; this.drag = 0.9;
    this.steerSpeed = 3.0; this.maxSteer = 0.6; this.steeringRate = 1.6;
    this._steering = 0; this.radius = 14; // approximation cercle
  }
  update(dt, inputs) {
    const { throttle, brake, steer } = inputs;
    // Lissage volant
    this._steering = clamp(this._steering + steer * this.steerSpeed * dt, -this.maxSteer, this.maxSteer);
    // Intégration vitesse
    this.v = this.v + (throttle * this.aMax - brake * this.bMax - this.drag * this.v) * dt;
    // Orientation
    this.heading = this.heading + this.steeringRate * (this._steering / this.maxSteer) * dt;
    // Déplacement
    const vx = Math.cos(this.heading) * this.v;
    const vy = Math.sin(this.heading) * this.v;
    this.prevX = this.x; this.prevY = this.y;
    this.x += vx * dt; this.y += vy * dt;
  }
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
```

### `src/scenes/scene.js`
```javascript
export class Scene { enter(){} update(dt){} render(ctx){} exit(){} }
```

### `src/ui/hud.js`
```javascript
export class HUD {
  constructor(car) { this.car = car; this.lap = 0; this.time = 0; this.best = null; }
  update(dt) { this.time += dt; }
  render(ctx, targetLaps) {
    ctx.save(); ctx.fillStyle = '#e0e3e8'; ctx.font = '14px sans-serif';
    ctx.fillText(`Vitesse: ${Math.round(this.car.v)} px/s`, 20, 24);
    ctx.fillText(`Tour: ${this.lap}/${targetLaps}`, 20, 44);
    ctx.fillText(`Temps: ${this.time.toFixed(1)} s`, 20, 64);
    if (this.best !== null) ctx.fillText(`Meilleur: ${this.best.toFixed(1)} s`, 20, 84);
    ctx.restore();
  }
}
```

### `src/scenes/race-scene.js`
```javascript
import { Scene } from './scene.js';
import { Track } from '../world/track.js';
import { Car, clamp } from '../physics/vehicle.js';
import { HUD } from '../ui/hud.js';

function isInsideRect(x, y, r) { return x>=r.x && x<=r.x+r.w && y>=r.y && y<=r.y+r.h; }
function isOffTrack(x, y, outer, inner) { return !isInsideRect(x,y,outer) || isInsideRect(x,y,inner); }
function sideOfSegment(ax, ay, bx, by, px, py) { return (bx-ax)*(py-ay) - (by-ay)*(px-ax); }
function crossedSegment(ax, ay, bx, by, p0x, p0y, p1x, p1y) {
  const s0 = sideOfSegment(ax,ay,bx,by,p0x,p0y); const s1 = sideOfSegment(ax,ay,bx,by,p1x,p1y);
  return (s0*s1<0); // signes opposés → franchi
}

export class RaceScene extends Scene {
  constructor(game) {
    super(); this.game = game; this.canvas = game.canvas; this.ctx = game.ctx;
    this.track = new Track(this.canvas);
    this.car = new Car(this.track.outer.x + this.track.outer.w*0.25, this.track.outer.y + this.track.outer.h*0.75);
    this.hud = new HUD(this.car);
    this.targetLaps = 3; this.state = 'Ready'; this.countdown = 0.5; // petit délai
    this.cpIndex = 0; // checkpoint attendu
    this.bestTimes = JSON.parse(localStorage.getItem('course_best')||'[]');
  }
  enter() {}

  readInputs() {
    const kb = this.game.keyboard; let throttle = 0, brake = 0, steer = 0;
    if (kb.isDown('KeyW') || kb.isDown('ArrowUp')) throttle = 1;
    if (kb.isDown('KeyS') || kb.isDown('ArrowDown')) brake = 1;
    if (kb.isDown('KeyA') || kb.isDown('ArrowLeft')) steer -= 1;
    if (kb.isDown('KeyD') || kb.isDown('ArrowRight')) steer += 1;
    steer = clamp(steer, -1, 1); return { throttle, brake, steer };
  }

  update(dt) {
    // État Ready → Running
    if (this.state === 'Ready') { this.countdown -= dt; if (this.countdown<=0) { this.state='Running'; this.hud.lap = 1; this.hud.time = 0; } }
    if (this.state !== 'Running') return;

    // Lecture entrées
    const inputs = this.readInputs();

    // Physique
    this.car.update(dt, inputs);

    // Hors-piste → drag/freinage et correction simplifiée
    if (isOffTrack(this.car.x, this.car.y, this.track.outer, this.track.inner)) {
      // Appliquer friction forte
      this.car.v *= 0.98; // glisse réduite
      // Réintégrer dans le couloir si vraiment hors limites
      const o=this.track.outer; const i=this.track.inner;
      this.car.x = clamp(this.car.x, o.x+this.car.radius, o.x+o.w-this.car.radius);
      this.car.y = clamp(this.car.y, o.y+this.car.radius, o.y+o.h-this.car.radius);
      if (isInsideRect(this.car.x, this.car.y, i)) {
        // repousse hors du trou central
        const cx = i.x + i.w/2, cy = i.y + i.h/2;
        const dx = this.car.x - cx, dy = this.car.y - cy; const L = Math.hypot(dx,dy)||1e-6;
        this.car.x = cx + dx/L * (Math.max(i.w,i.h)/2 + this.car.radius);
        this.car.y = cy + dy/L * (Math.max(i.w,i.h)/2 + this.car.radius);
        this.car.v *= 0.7;
      }
    }

    // Checkpoint crossing
    const cp = this.track.checkpoints[this.cpIndex];
    if (crossedSegment(cp.a.x, cp.a.y, cp.b.x, cp.b.y, this.car.prevX, this.car.prevY, this.car.x, this.car.y)) {
      this.cpIndex = (this.cpIndex + 1) % this.track.checkpoints.length;
      // Si on revient sur startIndex après avoir bouclé tous les CP
      if (this.cpIndex === this.track.startIndex) {
        // Tour terminé
        if (this.hud.lap >= this.targetLaps) {
          // Finished
          this.state = 'Finished';
          const total = this.hud.time; this.hud.best = this.hud.best === null ? total : Math.min(this.hud.best, total);
          // Classement local
          this.bestTimes.push(total); this.bestTimes.sort((a,b)=>a-b); this.bestTimes = this.bestTimes.slice(0,5);
          localStorage.setItem('course_best', JSON.stringify(this.bestTimes));
        } else {
          this.hud.lap += 1; // prochain tour
        }
      }
    }

    // HUD
    this.hud.update(dt);
  }

  render(ctx) {
    // Piste
    this.track.render(ctx);

    // Voiture
    ctx.save(); ctx.translate(this.car.x, this.car.y); ctx.rotate(this.car.heading);
    ctx.fillStyle = '#1e90ff'; ctx.fillRect(-25, -12, 50, 24);
    ctx.restore();

    // HUD
    this.hud.render(ctx, this.targetLaps);

    // État
    if (this.state === 'Ready') {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '24px sans-serif';
      ctx.fillText('Prêt... Go!', this.canvas.width/2 - 60, this.canvas.height/2);
      ctx.restore();
    }
    if (this.state === 'Finished') {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '24px sans-serif';
      const msg = `Terminé ! Temps: ${this.hud.time.toFixed(1)} s`;
      ctx.fillText(msg, this.canvas.width/2 - 140, this.canvas.height*0.35);
      ctx.font = '16px sans-serif';
      const list = (JSON.parse(localStorage.getItem('course_best')||'[]')).map(t=>t.toFixed(1)+' s');
      ctx.fillText('Meilleurs temps:', this.canvas.width/2 - 90, this.canvas.height*0.42);
      list.forEach((t,i)=> ctx.fillText(`${i+1}. ${t}`, this.canvas.width/2 - 50, this.canvas.height*0.46 + i*22));
      ctx.restore();
    }
  }
}
```

---

## 7) Audio (option rapide)

> Le **SoundManager** du Chapitre 6 peut être branché directement (engine loop, checkpoint, collision). Pour ce MVP, on laisse **hors** pour rester concis, mais l’interface `updateEngine(v, vMax)` s’applique telle quelle.

---

## 8) Tests & validation

- **Entrées** : accélération/freinage/direction **réactifs** ;
- **Hors-piste** : la voiture **ralentit fortement** et est **repoussée** ;
- **Checkpoints** : franchissement **séquentiel**, incrément des **tours** ;
- **Finished** : affichage du **temps**, **classement local** ;
- **Performance** : viser **≤ 16.6 ms/frame** sur Canvas.

---

## 9) Extensions proposées

- **IA simple (bots)** : trajectoire waypoints + contrôle `steer` vers le prochain waypoint.
- **Drift simplifié** : ajouter une composante latérale et une friction anisotrope.
- **Ghost lap** : enregistrer les positions d’un meilleur tour et les rejouer en transparence.
- **Mini-map** : offscreen avec scaling, point voiture.
- **Audio complet** : SoundManager + filtres + compressor + panner.

---

## ✅ Résumé
- MVP **jouable** : circuit fermé, laps, checkpoints, chrono, HUD, collisions/hors-piste.
- Architecture **modulaire** en ES Modules.
- Base idéale pour ajouter **IA**, **drift**, **audio avancé**, **classement**.

---

## Encarts pédagogiques (liés aux schémas)

### États de la course — Ready → Running → Finished

**Ce qu’il montre :** la séparation nette des comportements. **À retenir :** un **state machine** évite le code spaghetti.

### Checkpoints — changement de côté

**Ce qu’il montre :** la détection **robuste** du passage via le **produit vectoriel** (signe). **Formule :** `s0*s1<0`.

### Piste — couloir et hors-piste

**Ce qu’il montre :** un **anneau** accessible pour débutant, avec test **hors-piste** simple.
