
# Chapitre 3 : Gestion des entrées (Clavier, Souris, Tactile)

> Objectif : maîtriser la capture et l’exploitation des entrées utilisateur (clavier, souris, tactile) en **Vanilla JavaScript**, de manière robuste et performante, pour des jeux 2D basés sur **Canvas**.

---

## 1) Principes généraux

### Définition
La **gestion des entrées** est l’ensemble des techniques permettant d’**observer** les actions de l’utilisateur (presses de touches, clics, mouvements, gestes tactiles) et de les **convertir** en commandes de jeu (se déplacer, accélérer, freiner, tourner, tirer, etc.).

### Pourquoi c’est crucial ?
- Le jeu est **réactif** : toute latence ou erreur de capture nuit à l’expérience.
- Les entrées sont **asynchrones** (événements) et doivent être **intégrées** correctement à la boucle de jeu.
- Les commandes doivent être **robustes** (touches simultanées, perte de focus, prévention des comportements par défaut du navigateur).

### Architecture : Événements → État → Logique
- **Événements** (ex. `keydown`, `mousemove`, `touchstart`) mettent à jour un **état d’entrées** (structure en mémoire).
- La **boucle de jeu** lit cet état à chaque frame et applique la logique correspondante.

Analogie : imagine une **boîte aux lettres**. Les lettres (événements) y arrivent tout le temps; tu ouvres la boîte (boucle de jeu) et lis l’état consolidé pour décider quoi faire.

---

## 2) Clavier

### 2.1 Événements de base
- `keydown` : une touche passe à l’état **enfoncé** (peut se répéter).
- `keyup` : une touche revient à l’état **relâché**.

**Recommandation :** utiliser `event.code` (ex. `KeyW`, `ArrowLeft`) plutôt que `event.key` pour des mappages **indépendants de la disposition** du clavier.

### 2.2 Gestion de touches simultanées
On conserve un **Set** ou un **objet** des touches actuellement enfoncées.

```javascript
class Keyboard {
  constructor() {
    this.down = new Set();      // touches actuellement enfoncées
    this.justPressed = new Set();   // touches pressées ce frame
    this.justReleased = new Set();  // touches relâchées ce frame
    this._framePressed = new Set(); // buffer interne pour la frame en cours
    this._frameReleased = new Set();

    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.down.has(code)) {
        this._framePressed.add(code);
      }
      this.down.add(code);
      // Empêcher le scroll des flèches/ESPACE si nécessaire
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(code)) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (this.down.has(code)) {
        this._frameReleased.add(code);
      }
      this.down.delete(code);
    });

    // Sécurité : si la fenêtre perd le focus, on nettoie l’état
    window.addEventListener('blur', () => {
      this.down.clear();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') {
        this.down.clear();
      }
    });
  }

  // À appeler au début de chaque frame de la boucle de jeu
  beginFrame() {
    this.justPressed = this._framePressed;
    this.justReleased = this._frameReleased;
    this._framePressed = new Set();
    this._frameReleased = new Set();
  }

  isDown(code) { return this.down.has(code); }
  pressed(code) { return this.justPressed.has(code); }
  released(code) { return this.justReleased.has(code); }
}
```

**Pourquoi `beginFrame()` ?** Pour **figer** ce qui a été pressé/relâché depuis la frame précédente et disposer de signaux **discrets** (déclenchement une seule fois), tout en gardant `isDown` pour les états **continus**.

### 2.3 Formules et normalisation du mouvement
Supposons un mouvement basé sur `WASD` :

```javascript
// Entrées brutes (axes numériques)
let ix = 0, iy = 0;
if (kb.isDown('KeyA') || kb.isDown('ArrowLeft'))  ix -= 1;
if (kb.isDown('KeyD') || kb.isDown('ArrowRight')) ix += 1;
if (kb.isDown('KeyW') || kb.isDown('ArrowUp'))    iy -= 1; // Y vers le haut
if (kb.isDown('KeyS') || kb.isDown('ArrowDown'))  iy += 1; // Y vers le bas

// Normaliser pour éviter l’effet de diagonale plus rapide
const len = Math.hypot(ix, iy); // Math.hypot = sqrt(ix*ix + iy*iy)
if (len > 0) { ix /= len; iy /= len; }

// Vitesse et intégration
// vx, vy sont les vitesses; speed = pixels/seconde; dt = deltaTime
vx = ix * speed;
vy = iy * speed;
x = x + vx * dt;
y = y + vy * dt;
```

**Pourquoi normaliser ?** Sans normalisation, diagonale ⇒ vitesse = `speed * √2`. Avec normalisation, **vitesse constante** quelle que soit la direction.

---

## 3) Souris (et Pointer Events)

### 3.1 Concepts
- **Position curseur** (dans le repère du canvas).
- **Boutons** : gauche (0), milieu (1), droit (2).
- **Wheel** : molette (zoom, défilement).

Pour unifier souris et tactile, on privilégie **Pointer Events** (`pointerdown`, `pointermove`, `pointerup`), qui fonctionnent avec la souris, le stylet et le doigt.

### 3.2 Calcul de la position relative au Canvas

```javascript
function getCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}
```

### 3.3 Gestionnaire de pointeur

```javascript
class Pointer {
  constructor(canvas) {
    this.canvas = canvas;
    this.pos = { x: 0, y: 0 };
    this.down = false;
    this.button = -1;
    this.justPressed = false;
    this.justReleased = false;
    this.wheelDelta = 0; // cumul sur la frame

    canvas.addEventListener('pointerdown', (e) => {
      const p = getCanvasPoint(canvas, e.clientX, e.clientY);
      this.pos = p;
      this.down = true;
      this.button = e.button;
      this.justPressed = true;
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      const p = getCanvasPoint(canvas, e.clientX, e.clientY);
      this.pos = p;
      this.down = false;
      this.justReleased = true;
      this.button = -1;
    });

    window.addEventListener('pointermove', (e) => {
      const p = getCanvasPoint(canvas, e.clientX, e.clientY);
      this.pos = p;
    });

    canvas.addEventListener('wheel', (e) => {
      this.wheelDelta += e.deltaY; // positif vers le bas
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('blur', () => {
      this.down = false;
    });
  }

  beginFrame() {
    this.justPressed = false;
    this.justReleased = false;
    this.wheelDelta = 0;
  }
}
```

### 3.4 Pointer Lock (optionnel)
Utile pour des contrôles type « volant » ou caméra libre :

```javascript
// Demander le verrouillage du pointeur sur clic
canvas.addEventListener('click', () => {
  canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (locked) {
    document.addEventListener('mousemove', onLockedMove);
  } else {
    document.removeEventListener('mousemove', onLockedMove);
  }
});

function onLockedMove(e) {
  const dx = e.movementX; // déplacement relatif
  const dy = e.movementY;
  // Exemple : appliquer dx, dy à un angle de direction
}
```

---

## 4) Tactile (Touch Events) et zones interactives

### 4.1 Événements
- `touchstart`, `touchmove`, `touchend`, `touchcancel`.
- Un `TouchList` peut contenir **plusieurs doigts**.

### 4.2 Lecture de la position

```javascript
function getCanvasTouch(canvas, touch) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY
  };
}
```

### 4.3 Exemple : deux zones tactiles (accélérer / tourner)

```javascript
class TouchZones {
  constructor(canvas) {
    this.canvas = canvas;
    this.accel = 0;  // 0..1
    this.steer = 0;  // -1..1

    canvas.addEventListener('touchstart', (e) => this.onTouch(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.onTouch(e), { passive: false });
    window.addEventListener('touchend', (e) => this.onTouch(e));
    window.addEventListener('touchcancel', (e) => this.onTouch(e));
  }

  onTouch(e) {
    e.preventDefault(); // éviter le scroll/zoom
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Reset
    this.accel = 0;
    this.steer = 0;

    for (const t of e.touches) {
      const p = getCanvasTouch(this.canvas, t);
      if (p.x < this.canvas.width * 0.4) {
        // Zone gauche : direction
        const centerY = this.canvas.height * 0.5;
        const dy = p.y - centerY;
        // Normaliser en [-1,1]
        this.steer = Math.max(-1, Math.min(1, -dy / (this.canvas.height * 0.5)));
      } else {
        // Zone droite : accélération (haut) / frein (bas)
        const midY = this.canvas.height * 0.5;
        if (p.y < midY) this.accel = 1; // accélérer
        else this.accel = -1;           // freiner
      }
    }
  }
}
```

---

## 5) Conversion Entrées → Commandes (Car Racing)

Pour un **jeu de course sur circuit fermé**, on convertit les entrées en **actions analogiques** :
- **Accélération** (`throttle`): 0..1
- **Frein** (`brake`): 0..1
- **Direction** (`steer`): -1..1 (gauche/droite)

### 5.1 Mapping clavier (WASD / flèches)

```javascript
function readRacingInputs(kb) {
  let throttle = 0;
  let brake = 0;
  let steer = 0;

  // Accélérer / freiner
  if (kb.isDown('KeyW') || kb.isDown('ArrowUp'))    throttle = 1;
  if (kb.isDown('KeyS') || kb.isDown('ArrowDown'))  brake = 1;

  // Direction
  if (kb.isDown('KeyA') || kb.isDown('ArrowLeft'))  steer -= 1;
  if (kb.isDown('KeyD') || kb.isDown('ArrowRight')) steer += 1;

  // Normaliser steer en [-1,1]
  steer = Math.max(-1, Math.min(1, steer));
  return { throttle, brake, steer };
}
```

### 5.2 Lissage et inertie de la direction
On évite les changements brusques :

```javascript
// steering : valeur courante; steerInput : -1..1; steerSpeed : rad/s
// dt = deltaTime
function updateSteering(steering, steerInput, steerSpeed, dt, maxSteer) {
  // Intégration avec saturation (clamp)
  steering = steering + steerInput * steerSpeed * dt;
  steering = Math.max(-maxSteer, Math.min(maxSteer, steering));
  return steering;
}
```

**Analogie :** tourner un **volant** avec une résistance : l’angle ne saute pas instantanément; il **évolue** progressivement.

### 5.3 Application aux vitesses du véhicule

```javascript
// Modèle simplifié (chapitres Physique détaillés plus tard)
// v : vitesse scalaire (m/s ou px/s), a : accélération, dt : deltaTime
// throttle/brake : 0..1
// a = throttle * aMax - brake * bMax - drag * v
v = v + (throttle * aMax - brake * bMax - drag * v) * dt;

// Orientation et déplacement 2D (angle heading)
// heading en radians; steer influe sur le taux de rotation
heading = heading + steeringRate * steer * dt; // steeringRate = rad/s

vx = Math.cos(heading) * v;
vy = Math.sin(heading) * v;

x = x + vx * dt;
y = y + vy * dt;
```

---

## 6) Intégration dans la boucle de jeu

```javascript
// Initialisation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const kb = new Keyboard();
const pointer = new Pointer(canvas);
const touch = new TouchZones(canvas);

let lastTime = 0;
let x = 400, y = 300;       // position du véhicule
let heading = 0;            // orientation
let v = 0;                  // vitesse
let steering = 0;           // angle de direction intermédiaire
const aMax = 300;           // accel max (px/s^2)
const bMax = 400;           // frein max (px/s^2)
const drag = 0.8;           // frottement
const steeringRate = 1.6;   // rad/s
const steerSpeed = 3.0;     // rad/s (réactivité du volant)
const maxSteer = 0.6;       // rad (limite d’angle)

function gameLoop(ts) {
  const dt = (ts - lastTime) / 1000 || 0; // en secondes
  lastTime = ts;

  // Début de frame : figer les événements discrets
  kb.beginFrame();
  pointer.beginFrame();

  // Lire les commandes (fusion clavier + tactile)
  const k = readRacingInputs(kb);
  const throttle = Math.max(k.throttle, Math.max(0, touch.accel));
  const brake    = Math.max(k.brake,    Math.max(0, -touch.accel));

  let steerInput = k.steer;
  // Exemple : ajouter une composante souris (pointer.x relative au centre)
  const centerX = canvas.width * 0.5;
  const dx = (pointer.pos.x - centerX) / (canvas.width * 0.5);
  steerInput = Math.max(-1, Math.min(1, steerInput + dx * 0.4));

  // Lissage de la direction
  steering = updateSteering(steering, steerInput, steerSpeed, dt, maxSteer);

  // Mise à jour des vitesses et position
  v = v + (throttle * aMax - brake * bMax - drag * v) * dt;
  heading = heading + steeringRate * (steering / maxSteer) * dt;
  const vx = Math.cos(heading) * v;
  const vy = Math.sin(heading) * v;
  x = x + vx * dt;
  y = y + vy * dt;

  // Rendu
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.fillStyle = '#1e90ff';
  ctx.fillRect(-25, -12, 50, 24); // voiture simplifiée
  ctx.restore();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

---

## 7) Bonnes pratiques et pièges courants

- **Prévenir les comportements par défaut** (`e.preventDefault()` avec `{ passive: false }`) pour éviter le scroll des flèches et du tactile.
- **Nettoyer l’état** à la **perte de focus** (`blur`, `visibilitychange`) pour éviter les touches « coincées ».
- **Éviter les dépendances à la disposition du clavier** : utiliser `event.code`.
- **Séparer** : un **InputManager** (état) et la **logique** du jeu.
- **Limiter le travail en handlers** : actualiser l’état, pas la physique; celle-ci se fait dans la boucle.
- **Tester simultanéité** : `W + D`, `A + S`, etc. et normaliser les axes.

---

## 8) Utilitaires

```javascript
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; } // interpolation linéaire
```

Exemple : lisser une valeur d’entrée vers une cible :
```javascript
value = lerp(value, target, Math.min(1, smoothing * dt));
```

---

## Résumé des points essentiels
- **Clavier** : suivre `isDown`, `pressed`, `released`; utiliser `event.code`; normaliser les axes.
- **Souris/Pointer** : positions relatives au Canvas, boutons, molette; possibilité de **Pointer Lock**.
- **Tactile** : plusieurs doigts; zones interactives; toujours `preventDefault`.
- **Racing** : entrées numériques converties en **analogiques** (throttle, brake, steer) avec **lissage** et **saturation**.
- Intégration propre : **événements → état → logique** dans la **boucle**.

