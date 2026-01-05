
# Chapitre 4 : Physique et collisions (2D, Vanilla JavaScript)

> **Objectif :** comprendre et implémenter une **physique 2D** simple mais solide (forces, intégration), et des **collisions** (AABB, cercle–cercle) avec **réaction** (rebond, friction), le tout compatible avec une **boucle de jeu** à `deltaTime`.

---

## 1) Principes de base de la physique en jeu vidéo

### Définition
Nous modélisons des objets avec :
- **Position** `(x, y)`
- **Vitesse** `(vx, vy)`
- **Accélération** `(ax, ay)` provenant de **forces** (gravité, poussée, frottement).

### Pourquoi ce modèle ?
- Il est **suffisant** pour de nombreux jeux 2D (arcade, course, plateforme).
- Il permet un **contrôle précis** des mouvements et des réactions (rebonds, glissements).

### Intégration (Euler explicite)
Formules par frame (en secondes) :
```javascript
// dt = deltaTime (s)
vx = vx + ax * dt;
vy = vy + ay * dt;

x = x + vx * dt;
y = y + vy * dt;
```

**Note :** Euler explicite est simple mais peut dériver avec des dt élevés. Maintiens un **dt régulier** (via `requestAnimationFrame`) et **clamp** si besoin.

---

## 2) Forces courantes

### 2.1 Gravité
```javascript
// g > 0 (px/s^2) orienté vers le bas (axe Y positif)
ay = ay + g; // par exemple g = 1200 en px/s^2 pour un jeu pixel
```

**Pourquoi ?** Donne une accélération constante vers le bas (effet naturel de chute).

### 2.2 Frottement/traînée (drag linéaire)
```javascript
// c : coefficient de freinage (s^-1)
ax = ax - c * vx;
ay = ay - c * vy;
```

**Pourquoi ?** Stabilise la vitesse (la réduit progressivement) — analogie : **résistance de l’air** ou **friction** des pneus.

### 2.3 Poussée/propulsion (thruster)
```javascript
// thrust : intensité de poussée, angle heading (radians)
ax = ax + Math.cos(heading) * thrust;
ay = ay + Math.sin(heading) * thrust;
```

**Pourquoi ?** Pour traduire une **commande d’accélération** en force dans la direction du véhicule.

### 2.4 Frein
```javascript
// freinage proportionnel à la vitesse (modèle simple)
ax = ax - brake * kBrake * vx;
ay = ay - brake * kBrake * vy;
```

**Pourquoi ?** Simule une **force opposée** au mouvement (analogie : plaquettes qui mordent le disque).

---

## 3) Collision AABB (Axis-Aligned Bounding Box)

### Définition
Un **AABB** est un **rectangle** **aligné** sur les axes, défini par `(x, y, w, h)` ou par ses **bords** `left, right, top, bottom`. C’est la méthode de collision la plus **rapide** et **simple** pour objets non-rotés.

### Pourquoi l’utiliser ?
- **Efficace** : calculs d’intervalle sur X et Y.
- Suffisant pour la majorité des collisions avec **murs**/obstacles **rectangulaires**.

### Détection AABB vs AABB
```javascript
function aabbIntersect(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
```

### Calcul du vecteur de séparation minimal (MTV)
Idée :
1. Calculer les **distances de pénétration** sur X et Y.
2. Séparer selon l’axe de **pénétration minimale**.

```javascript
function aabbMTV(a, b) {
  const dx = (a.left + a.right) * 0.5 - (b.left + b.right) * 0.5; // centres
  const px = (a.right - a.left) * 0.5 + (b.right - b.left) * 0.5 - Math.abs(dx);

  const dy = (a.top + a.bottom) * 0.5 - (b.top + b.bottom) * 0.5;
  const py = (a.bottom - a.top) * 0.5 + (b.bottom - b.top) * 0.5 - Math.abs(dy);

  if (px < py) {
    // séparer sur X
    const sx = dx < 0 ? -px : px; // signe selon relatif
    return { nx: Math.sign(sx), ny: 0, sx, sy: 0 }; // normal ~ (±1,0), séparation sx
  } else {
    // séparer sur Y
    const sy = dy < 0 ? -py : py;
    return { nx: 0, ny: Math.sign(sy), sx: 0, sy };
  }
}
```

### Réaction au contact (rebond + friction)
Soit `v = (vx, vy)` la vitesse; `n = (nx, ny)` la **normale** de collision (±1,0 ou 0,±1), `e` le **coefficient de restitution** (0 = inélastique, 1 = parfaitement élastique).

```javascript
function resolveAABBCollision(movable, solid, e = 0.2, friction = 0.9) {
  if (!aabbIntersect(movable, solid)) return;
  const mtv = aabbMTV(movable, solid);

  // Séparation : on pousse l’objet hors du solide
  movable.left   += mtv.sx; movable.right  += mtv.sx;
  movable.top    += mtv.sy; movable.bottom += mtv.sy;

  // Réaction de vitesse : réflexion sur la normale
  // v_n = (v · n) n ; v_t = v - v_n ; v' = -e * v_n + friction * v_t
  const dot = movable.vx * mtv.nx + movable.vy * mtv.ny;
  const vnX = dot * mtv.nx;
  const vnY = dot * mtv.ny;
  const vtX = movable.vx - vnX;
  const vtY = movable.vy - vnY;

  movable.vx = -e * vnX + friction * vtX;
  movable.vy = -e * vnY + friction * vtY;
}
```

**Analogie :** pense à une **balle** qui frappe un **mur** : la composante **normale** rebondit (inversion avec `e`), la composante **tangentielle** glisse/est freinée (multipliée par `friction`).

---

## 4) Collision cercle–cercle

### Définition
Deux **cercles** de centres `p1=(x1,y1)` et `p2=(x2,y2)` et rayons `r1`, `r2` se **chevauchent** si :
```javascript
const dx = x2 - x1;
const dy = y2 - y1;
const dist2 = dx*dx + dy*dy;
const r = r1 + r2;
const intersects = dist2 <= r*r;
```

### MTV et normal
```javascript
function circleMTV(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy) || 1e-6;
  const overlap = r1 + r2 - d;
  // normale du point de vue du cercle 1 (direction vers le cercle 2)
  const nx = dx / d;
  const ny = dy / d;
  // on repousse le cercle 1 en sens opposé
  return { nx, ny, sx: -nx * overlap, sy: -ny * overlap };
}
```

### Réaction (rebond sur la normale)
```javascript
function resolveCircleCollision(c1, c2, e = 0.6, friction = 0.95) {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const d2 = dx*dx + dy*dy;
  const r = c1.r + c2.r;
  if (d2 > r*r) return;

  const d = Math.sqrt(d2) || 1e-6;
  const nx = dx / d;
  const ny = dy / d;
  const overlap = r - d;

  // Séparation proportionnelle (on repousse c1 et c2 à parts égales)
  const sx = nx * (overlap * 0.5);
  const sy = ny * (overlap * 0.5);
  c1.x -= sx; c1.y -= sy;
  c2.x += sx; c2.y += sy;

  // Réaction des vitesses (modèle simplifié avec restitution)
  // On projette la vitesse relative sur la normale
  const rvx = c1.vx - c2.vx;
  const rvy = c1.vy - c2.vy;
  const relDot = rvx * nx + rvy * ny; // composante relative sur n
  if (relDot > 0) return; // ils s'éloignent déjà

  const j = -(1 + e) * relDot; // impulsion scalaire simplifiée (masse=1)
  const jx = j * nx;
  const jy = j * ny;

  c1.vx += jx; c1.vy += jy;
  c2.vx -= jx; c2.vy -= jy;

  // Friction (tangent) simplifiée
  c1.vx *= friction; c1.vy *= friction;
  c2.vx *= friction; c2.vy *= friction;
}
```

**Pourquoi projeter sur la normale ?** Le rebond affecte la **composante perpendiculaire** au contact. La **tangente** subit surtout du **glissement** (friction).

---

## 5) Continu vs discret (éviter le tunneling)

### Problème
À grande vitesse, un objet peut **traverser** un mur entre deux frames (tunneling). 

### Idée (simple) : balayage (swept AABB/cercle)
On teste l’**intervalle de temps** où la trajectoire **croise** le mur en **projetant** le mouvement sur l’axe de la normale.

Exemple très simplifié : cercle vs mur vertical à `x = wallX` (mur à gauche si `vx > 0`) :
```javascript
// Détermination d’un temps d’impact (TOI) grossier
function timeOfImpactCircleWall(x, r, vx, wallX) {
  if (vx <= 0) return Infinity; // s'éloigne du mur
  const dist = wallX - (x + r); // distance actuelle au point de contact
  if (dist < 0) return 0; // déjà en contact
  return dist / vx; // temps pour atteindre le contact
}
```
Dans la boucle, si `toi < dt`, on **avance** l’objet jusqu’à l’impact, on **réagit**, puis on **consomme** le temps restant. C’est une approche **débutant** suffisante pour éviter certains traversées.

---

## 6) Exemple : balle qui rebondit sur les murs du Canvas

```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = 120, y = 80;
let vx = 220, vy = 180;
const r = 20;
const e = 0.9; // restitution (rebond)
const drag = 0.02; // traînée légère
let last = 0;

function gameLoop(ts) {
  const dt = (ts - last) / 1000 || 0; last = ts;

  // Accélérations (ici, juste la traînée)
  const ax = -drag * vx;
  const ay = -drag * vy;
  vx += ax * dt; vy += ay * dt;

  x += vx * dt; y += vy * dt;

  // Collisions murs (AABB du canvas)
  if (x - r < 0) { x = r; vx = -vx * e; }
  if (x + r > canvas.width) { x = canvas.width - r; vx = -vx * e; }
  if (y - r < 0) { y = r; vy = -vy * e; }
  if (y + r > canvas.height) { y = canvas.height - r; vy = -vy * e; }

  // Rendu
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b6b';
  ctx.fill();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

**Pourquoi ça marche ?** On **clamp** la position sur le bord et on **inverse** la vitesse perpendiculaire (`vx` ou `vy`) en appliquant `e`.

---

## 7) Application au jeu de course

### 7.1 Bord de piste (murs) 
Modélise les **bords** de piste avec des **AABB** (segments rectangulaires) ou des **cylindres** (cercles). Le véhicule (AABB ou cercle) :
- **Détection** via AABB/AABB ou cercle/mur.
- **Réaction** : séparer via MTV et **réfléchir** la composante de vitesse normale avec une **restitution faible** (`e ≈ 0.1–0.3`) et une **friction élevée** (le choc ralentit et empêche de « glisser » trop).

### 7.2 Obstacles et checkpoints
- **Obstacles circulaires** (plots, poteaux) → collisions cercle–cercle.
- **Checkpoints** : AABB sans réaction (on ne réfléchit pas), seulement **détection** pour le score/temps.

### 7.3 Hors-piste
En cas de sortie hors-piste, augmente le **drag** et réduis l’**accélération** pour simuler un **revêtement lent** :
```javascript
if (isOffTrack(x, y)) {
  drag = 2.0; aMax = 120; // herbe/graviers
} else {
  drag = 0.8; aMax = 300; // asphalte
}
```

**Analogie :** rouler sur **gravier** freine fortement et réduit la manœuvrabilité.

---

## 8) Utilitaires mathématiques

```javascript
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dot(ax, ay, bx, by) { return ax*bx + ay*by; }
function length(ax, ay) { return Math.hypot(ax, ay); }
function normalize(ax, ay) {
  const l = Math.hypot(ax, ay) || 1e-6;
  return { x: ax / l, y: ay / l };
}
```

---

## 9) Pièges courants et bonnes pratiques

- **deltaTime** : multiplie systématiquement les vitesses/accélérations par `dt`.
- **Séparation avant réaction** : déplace l’objet **hors** du solide, puis ajuste la **vitesse**.
- **Restitution et friction** : ajuste `e` et `friction` selon le **ressenti** (arcade vs simulation).
- **Tunneling** : si les objets sont rapides/petits, considère une **approche continue** (balayage TOI) ou **réduis dt**.
- **Ordre des mises à jour** : forces → intégration → collisions → correction vitesse → rendu.

---

## Résumé des points essentiels
- Physique 2D : intégration **Euler** (`v += a*dt`, `x += v*dt`).
- Forces courantes : **gravité**, **drag**, **poussée**, **frein**.
- Collisions **AABB** et **cercle** : détection, **MTV**, **séparation**, **réaction** (restitution + friction).
- Éviter le **tunneling** : tests **continus** (TOI) basiques si nécessaire.
- Application course : murs, obstacles, hors-piste (drag accru). Ajuste les coefficients pour un **feeling** arcade crédible.

