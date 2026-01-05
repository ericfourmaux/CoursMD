
# Chapitre 5 : Graphismes et animations (Canvas 2D, Vanilla JavaScript)

> **Objectif :** savoir **charger** des images, **dessiner** avec `CanvasRenderingContext2D`, **animer** des sprites (spritesheets, cadence, ping-pong), utiliser les **transformations** (rotation/translation/scale), l’**opacité**, les **ombres**, et adopter des **pratiques de performance**. Le tout en **Vanilla JavaScript** avec `deltaTime`.

---

## 1) Dessin d’images avec Canvas 2D

### Définition
Le **rendu** d’images en Canvas s’effectue via `ctx.drawImage()`. Trois surcharges principales :

1. `drawImage(image, dx, dy)` → dessine l’image **à taille native** à la position **destination** `(dx, dy)`
2. `drawImage(image, dx, dy, dWidth, dHeight)` → dessine l’image **redimensionnée**
3. `drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)` → dessine le **sous-rectangle source** `(sx, sy, sWidth, sHeight)` de l’image **dans** le rectangle destination `(dx, dy, dWidth, dHeight)`

### Pourquoi ces variantes ?
- **Découper** des sprites dans une **spritesheet** (variante 3)
- **Redimensionner** selon le zoom (variante 2)
- **Rapide** pour une image entière (variante 1)

### Exemple minimal
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'assets/car.png';
img.onload = () => {
  ctx.drawImage(img, 100, 100);                   // image entière
  ctx.drawImage(img, 300, 100, 128, 64);          // redimensionnée
  ctx.drawImage(img, 0, 0, 64, 32, 500, 100, 64, 32); // sous-rect source → rect dest
};
</script>
```

**Astuce :** `ctx.imageSmoothingEnabled = false;` (pixel art) pour éviter les flous en redimensionnant.

---

## 2) Chargement d’images (préchargement, promesses)

### Définition
Le **préchargement** garantit que toutes les images sont **disponibles** avant le rendu. On utilise `Image()` avec `onload/onerror` ou des **Promesses**.

### Pourquoi précharger ?
- Éviter les **blancs** ou **clignotements**.
- **Synchroniser** le démarrage du jeu.

### Loader simple basé sur Promises
```javascript
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

async function loadAssets(manifest) {
  // manifest: { key: 'path/to/img.png', ... }
  const entries = Object.entries(manifest);
  const promises = entries.map(([key, path]) => loadImage(path).then(img => [key, img]));
  const list = await Promise.all(promises);
  const assets = Object.fromEntries(list);
  return assets; // { key: HTMLImageElement }
}

// Exemple d’utilisation
const manifest = {
  car: 'assets/car.png',
  wheel: 'assets/wheel.png',
  track: 'assets/track.png',
};
loadAssets(manifest).then(assets => {
  // assets.car, assets.wheel, assets.track disponibles
});
```

**Option :** `await img.decode()` après `img.src` pour s’assurer que les pixels sont décodés **avant** le dessin (support moderne). 

---

## 3) Spritesheets et animations

### Définition
Une **spritesheet** est une image qui **regroupe** plusieurs **frames** d’animation. Chaque frame est un **sous-rectangle** à échantillonner.

### Pourquoi ?
- **Réduit** le nombre de fichiers 
- **Améliore** la performance (moins de changements d’images)

### Paramètres d’une spritesheet
- `frameWidth`, `frameHeight` : dimensions d’une frame
- `columns`, `rows` : disposition
- `frames` : nombre total ou **liste** d’indices
- `fps` ou `frameDuration` (seconds per frame)

### Calcul d’un rectangle de frame
```javascript
function getFrameRect(index, frameWidth, frameHeight, columns) {
  const col = index % columns;
  const row = Math.floor(index / columns);
  const sx = col * frameWidth;
  const sy = row * frameHeight;
  return { sx, sy, sw: frameWidth, sh: frameHeight };
}
```

### Avancement d’animation (accumulateur `deltaTime`)
```javascript
class SpriteAnim {
  constructor({ image, frameWidth, frameHeight, columns, frames, fps = 10, loop = true, pingpong = false }) {
    this.image = image;
    this.fw = frameWidth;
    this.fh = frameHeight;
    this.columns = columns;
    this.frames = frames; // ex: [0,1,2,3] ou 0..N-1
    this.fps = fps;
    this.loop = loop;
    this.pingpong = pingpong;
    this.acc = 0;               // accumulateur de temps
    this.i = 0;                 // index dans frames
    this.dir = 1;               // 1 ou -1 pour ping-pong
  }
  update(dt) {
    this.acc += dt;
    const frameDuration = 1 / this.fps;
    while (this.acc >= frameDuration) {
      this.acc -= frameDuration;
      this.i += this.dir;
      if (this.pingpong) {
        if (this.i >= this.frames.length) { this.i = this.frames.length - 2; this.dir = -1; }
        if (this.i < 0) { this.i = 1; this.dir = 1; }
      } else if (this.loop) {
        this.i = (this.i + this.frames.length) % this.frames.length;
      } else {
        this.i = Math.min(this.i, this.frames.length - 1);
      }
    }
  }
  render(ctx, x, y, scale = 1, flipX = false, rotation = 0) {
    const index = this.frames[this.i];
    const { sx, sy, sw, sh } = getFrameRect(index, this.fw, this.fh, this.columns);
    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(this.image, sx, sy, sw, sh, Math.round(-sw * 0.5 * scale), Math.round(-sh * 0.5 * scale), Math.round(sw * scale), Math.round(sh * scale));
    ctx.restore();
  }
}
```

**Formule alternative (sans accumulateur)** : index direct par temps global `t` :
```javascript
// frameIndex = Math.floor(t * fps) % frames.length
```
**Pourquoi l’accumulateur ?** Contrôle **fin** de la cadence et **robustesse** aux variations de `dt`.

---

## 4) Transformations Canvas (translation, rotation, scale)

### Définition
Les **transformations** s’appliquent à l’**espace** du Canvas via `translate`, `rotate`, `scale`.

### Pourquoi ?
- **Positionner** précisément
- **Orienter** (rotation) la voiture selon son **heading**
- **Flip** horizontal (miroir) pour inverser un sprite

### Ordre des opérations
L’ordre est **critique** : `translate → rotate → scale → draw`. Utilise `ctx.save()` / `ctx.restore()` pour éviter de **polluer** l’état.

### Dessiner une image **centrée** et **rotée**
```javascript
function drawImageCenteredRotated(ctx, img, x, y, angleRad, scale = 1) {
  const w = img.width, h = img.height;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.drawImage(img, -w * 0.5 * scale, -h * 0.5 * scale, w * scale, h * scale);
  ctx.restore();
}
```

**Analogie :** pense à poser l’image sur une **toupie** : on **déplace** la toupie au bon endroit (`translate`), on **tourne** (`rotate`), puis on **dépose** l’image dessus (draw).

### Flip horizontal
```javascript
function drawFlippedX(ctx, img, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img, -img.width * 0.5, -img.height * 0.5);
  ctx.restore();
}
```

---

## 5) Opacité, ombres et compositing

### Opacité
```javascript
ctx.globalAlpha = 0.6;     // 60% opacité
ctx.drawImage(img, 100, 100);
ctx.globalAlpha = 1.0;     // réinitialiser
```

### Ombres
```javascript
ctx.shadowColor = 'rgba(0,0,0,0.35)';
ctx.shadowBlur = 8;
ctx.shadowOffsetX = 6;
ctx.shadowOffsetY = 4;
ctx.drawImage(img, 300, 120);
// Conseil : réinitialiser après usage
ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
```

### Compositing (effets de fusion)
```javascript
ctx.globalCompositeOperation = 'lighter'; // add
// ...dessins...
ctx.globalCompositeOperation = 'source-over'; // par défaut
```

### Anti-crénelage / pixel art
```javascript
ctx.imageSmoothingEnabled = false; // utile pour pixel art net
```

---

## 6) Performance et bonnes pratiques

- **Regrouper** les dessins : minimiser les changements fréquents d’état (`fillStyle`, `globalAlpha`, `globalCompositeOperation`).
- **Réduire** les passes inutiles : `ctx.clearRect` uniquement sur la zone nécessaire si possible.
- **Spritesheet unique** : limite les changements d’`image` (cache GPU/CPU).
- **OffscreenCanvas** (si disponible) pour pré-rasteriser certains éléments.
- **Mesurer** avec DevTools (timeline, FPS) et ajuster.

**Analogie :** comme un **atelier** : si tu changes d’outil à chaque pièce, tu perds du temps. Regroupe les pièces similaires.

---

## 7) Exemple complet : voiture top-down avec rotation et roues animées

**But :** utiliser `heading` pour tourner la voiture, et **animer les roues** selon la vitesse `v`.

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const manifest = {
  car: 'assets/car_body.png',
  wheel: 'assets/wheel_sheet.png', // spritesheet de roues (frames autour de la roue)
};

let assets = null;
let last = 0;
let x = 400, y = 300;     // position
let heading = 0;          // rad
let v = 0;                // px/s (déjà gérée chapitre 3)

loadAssets(manifest).then(a => {
  assets = a;
  // Spritesheet des roues
  const wheelAnim = new SpriteAnim({
    image: assets.wheel,
    frameWidth: 32,
    frameHeight: 32,
    columns: 8,
    frames: Array.from({ length: 16 }, (_, i) => i),
    fps: 12,
    loop: true,
  });

  function gameLoop(ts) {
    const dt = (ts - last) / 1000 || 0; last = ts;

    // Mise à jour (ex: roue tourne plus vite avec v)
    wheelAnim.fps = clamp(4 + Math.abs(v) * 0.05, 4, 24); // cadence liée à la vitesse
    wheelAnim.update(dt);

    // Rendu
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessin voiture
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);
    // Ombre légère
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(assets.car, -assets.car.width * 0.5, -assets.car.height * 0.5);
    // Réinitialiser ombre
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

    // Dessin des roues (positions locales approximatives)
    const wheelPositions = [
      { x: -22, y: -14 }, // avant gauche
      { x:  22, y: -14 }, // avant droite
      { x: -22, y:  14 }, // arrière gauche
      { x:  22, y:  14 }, // arrière droite
    ];
    for (const wp of wheelPositions) {
      wheelAnim.render(ctx, wp.x, wp.y, 1, false, 0); // rotation visuelle par frames
    }
    ctx.restore();

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
});

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
```

**Remarques :**
- Le **corps** de la voiture est tourné avec le `heading` (transformations Canvas).
- Les **roues** utilisent une **spritesheet** (cadence liée à la vitesse `v`).
- Tu peux aussi simuler la rotation des roues via `ctx.rotate(angle)` plutôt qu’une spritesheet.

---

## 8) Pipeline d’assets minimal

### Définition
Un **AssetManager** stocke les images chargées et fournit des utilitaires (accès, préchargement, gestion d’erreurs).

### Implémentation simple
```javascript
class AssetManager {
  constructor() { this.images = new Map(); }
  async load(manifest) {
    const entries = Object.entries(manifest);
    const promises = entries.map(([key, path]) => loadImage(path).then(img => this.images.set(key, img)));
    await Promise.all(promises);
  }
  get(key) { return this.images.get(key); }
}

// Utilisation
const assets = new AssetManager();
await assets.load({ car: 'assets/car_body.png', wheel: 'assets/wheel_sheet.png' });
const carImg = assets.get('car');
```

**Pourquoi utile ?** Centralise le **chargement** et simplifie le **code** du jeu (lisible, testable).

---

## 9) Pièges courants & bonnes pratiques

- **Toujours `save()/restore()`** autour des transformations.
- **Réinitialiser** `globalAlpha`, `shadow*`, `globalCompositeOperation` après usage.
- **Spritesheets** : vérifier **alignement** des frames (pas de hors-bord).
- **Perf** : évite de recalculer constamment des grandes transformations; regroupe les dessins par image/réglages.
- **Pixel art** : `imageSmoothingEnabled = false` pour un rendu net.

---

## ✅ Résumé
- `drawImage` (3 variantes) pour **source/destination** et sous-rectangles.
- **Préchargement** avec Promises pour démarrer proprement.
- **Spritesheets** : index de frame, `fps`, accumulateur `dt`, options loop/ping-pong.
- **Transformations** : `translate/rotate/scale` + `save/restore` ; dessin centré.
- **Opacité/ombres/compositing** pour le **feedback visuel**.
- **Performance** : regrouper, limiter les changements d’état, éventuellement **OffscreenCanvas**.
- **Exemple voiture** : rotation par `heading` + roues animées.

