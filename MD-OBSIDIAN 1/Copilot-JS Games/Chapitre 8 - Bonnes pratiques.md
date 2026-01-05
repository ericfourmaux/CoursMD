
# Chapitre 8 (version débutant) : Optimisation et bonnes pratiques (Canvas 2D, Vanilla JavaScript)

> **Objectif :** te montrer, **pas à pas**, comment rendre ton jeu **fluide** (viser 60 images par seconde), comment **mesurer** vraiment ce qui ralentit, et quoi **changer** concrètement (boucle de jeu, dessin Canvas, mémoire, collisions, audio). On reste **Vanilla JavaScript**.

---

## 0) Avant de commencer : déconstruire 3 idées reçues

1. **« Il suffit d’optimiser le code au hasard »** → faux. Sans **mesure**, tu peux perdre du temps et même **empirer** les choses.
2. **« 60 FPS = beaucoup de magie »** → non. 60 FPS signifie qu’une **frame** doit prendre **≤ 16.6 ms**. Si ta frame prend 25 ms, tu seras autour de **40 FPS**.
3. **« Les performances, c’est impossible »** → non plus. Avec une **méthode** simple (mesurer → comprendre → corriger), même un débutant peut y arriver.

**Analogie :** pense à un **circuit**. Pour améliorer ton **temps au tour**, tu **chronomètres** chaque **portion** (mesure), tu repères les **virages lents** (comprendre) et tu **corriges** ta trajectoire là où ça compte (agir).

---

## 1) Comprendre FPS et temps de frame (avec chiffres)

- **FPS** = *Frames Per Second* = **images par seconde**. 60 FPS veut dire **60 images** affichées en **1 seconde**.
- **Temps de frame** ≈ `1000 / FPS`. À 60 FPS, c’est **≈ 16.6 ms**.

### Exemple simple
Si ta **physique** prend 4 ms, ton **rendu Canvas** 10 ms et ton **audio** 1 ms, alors :
```text
Temps total ≈ 4 ms (update) + 10 ms (render) + 1 ms (audio) = 15 ms
```
15 ms < 16.6 ms → tu es **dans le budget**. Si tu dépasses ce budget, la frame **glisse** à la suivante → FPS **baisse**.

---

## 2) Mesurer (Chrome DevTools), étape par étape

**But :** trouver les parties **lentes** de ton jeu.

1. **Ouvre** le jeu dans Chrome.
2. **DevTools** : clic-droit → `Inspect` (ou `F12`).
3. Va dans l’onglet **Performance**.
4. Clique sur **Record**, joue **10–20 s**.
5. Clique **Stop**. Tu vois une **timeline** avec des couleurs :
   - **Script** (JS) : temps passé dans ton code.
   - **Rendering** : temps d’affichage (Canvas).
   - **GC** : *Garbage Collector* (nettoyage mémoire).
6. Ouvre le **Flame chart** (grande vue en flammes). Les **barres larges** indiquent des **fonctions chaudes** (qui coûtent).
7. Note les **noms de fonctions** et **temps** (ex. `renderTrack: 7 ms`, `drawCar: 5 ms`).

**Astuce simple** : ajoute des mini-chronos dans ton code pour affiner :
```javascript
console.time('update');
update(dt);
console.timeEnd('update');

console.time('render');
render(ctx);
console.timeEnd('render');
```
Tu verras dans la console des lignes comme :
```
update: 3.12ms
render: 11.48ms
```
→ **Priorité** : réduire le **render**.

---

## 3) Boucle de jeu propre (et l’option « pas fixe »)

Ta boucle doit **séparer** la **logique** (`update`) du **dessin** (`render`) :
```javascript
let last = 0;
function loop(ts) {
  const dt = (ts - last) / 1000 || 0; // secondes
  last = ts;
  update(dt);   // calculs, physique, entrées
  render(ctx);  // dessin Canvas
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

### Pourquoi séparer ?
- Tu **mesures** chacune facilement (`console.time`).
- Tu peux activer une **physique à pas fixe** (option) pour la **stabilité**.

### Option « pas fixe » (débutant-friendly)
Parfois, le `dt` varie (PC lent → `dt` plus grand), ce qui peut **déstabiliser** la physique. On peut intégrer la physique avec un **pas constant** (ex. 1/120 s ≈ 8.3 ms) et **interpoler** l’affichage :
```javascript
let acc = 0; const FIXED = 1/120; // 120 Hz
function loop(ts) {
  const dt = (ts - last) / 1000 || 0;
  last = ts;
  acc += dt;
  while (acc >= FIXED) {
    updatePhysics(FIXED);
    acc -= FIXED;
  }
  const alpha = acc / FIXED; // 0..1
  renderInterpolated(ctx, alpha); // lerp positions
  requestAnimationFrame(loop);
}
```
**Analogie :** la **physique** avance à petits **pas réguliers**; l’**image** se cale **entre** deux pas pour un mouvement **fluide**.

---

## 4) Accélérer le dessin Canvas (les bases utiles)

**Idée clé :** **moins** de travail par frame = jeu **plus fluide**.

### 4.1 Séparer **statique** et **dynamique**
- **Statique** : tout ce qui *change peu* (la **piste**). Tu peux le **dessiner une fois** dans un **buffer** (autre canvas) et le **réutiliser**.
- **Dynamique** : objets qui **bougent** (voiture, HUD, particules). Tu les dessines **à chaque frame**.

**Code : pré-rendu de la piste**
```javascript
const trackBuffer = document.createElement('canvas');
trackBuffer.width = canvas.width;
trackBuffer.height = canvas.height;
const tctx = trackBuffer.getContext('2d');

function prerenderTrack(trackImage) {
  tctx.clearRect(0, 0, trackBuffer.width, trackBuffer.height);
  tctx.drawImage(trackImage, 0, 0);
}

function render(ctx) {
  // 1 seul drawImage pour la piste par frame
  ctx.drawImage(trackBuffer, 0, 0);
  // puis dessiner la voiture, HUD, etc.
}
```
**Pourquoi ça aide ?** Tu **évites** de redessiner la **grande image** du circuit **à chaque frame**.

### 4.2 « Dirty rectangles » : effacer **juste** la zone nécessaire
Au lieu de `clearRect` **tout l’écran**, efface et redessine **la zone** où la voiture a bougé.
```javascript
function unionRect(a, b) {
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return { left, top, right, bottom, width: right-left, height: bottom-top };
}

const prevRect = { left: prevX-30, top: prevY-20, right: prevX+30, bottom: prevY+20 };
const currRect = { left: x-30, top: y-20, right: x+30, bottom: y+20 };
const dirty = unionRect(prevRect, currRect);

ctx.clearRect(dirty.left, dirty.top, dirty.width, dirty.height);
ctx.drawImage(
  trackBuffer,
  dirty.left, dirty.top, dirty.width, dirty.height,
  dirty.left, dirty.top, dirty.width, dirty.height
);
// dessine la voiture si elle est dans la zone dirty
```
**Analogie :** au lieu de **repeindre** toute la chambre, tu **retouches** seulement la **partie** où il y a une trace.

### 4.3 Éviter les changements d’état fréquents
- Regroupe les objets avec le **même style** (`fillStyle`, `globalAlpha`, `shadow*`, `globalCompositeOperation`).
- Utilise `ctx.save()/ctx.restore()` **uniquement** quand nécessaire (transformations).

### 4.4 Textes et ombres = plus **lents**
- Le **texte** et les **ombres** coûtent cher. **Cache** les textes (HUD) autant que possible et **réinitialise** `shadow*` après usage.

---

## 5) Mémoire : comprendre le **GC** (Garbage Collector) et l’éviter

### 5.1 Qu’est-ce que le GC ?
Le **GC** récupère la **mémoire** que ton code **n’utilise plus**. S’il doit passer trop souvent, il peut **faire des pauses** (petits « gels » de quelques ms).

### 5.2 Règle simple
> **Évite de créer de nouveaux objets à chaque frame**.

**Exemple de piège**
```javascript
function render() {
  // Mauvais : crée un nouvel objet à chaque frame
  const pos = { x: car.x, y: car.y };
  // ...
}
```
**Mieux : réutilise**
```javascript
const pos = { x:0, y:0 }; // créé une fois
function render() {
  pos.x = car.x; pos.y = car.y;
  // ...
}
```

### 5.3 Pool d’objets (particules de fumée)
```javascript
class ParticlePool {
  constructor(n) {
    this.items = Array.from({length:n}, () => ({ x:0,y:0,vx:0,vy:0,life:0,active:false }));
    this.next = 0;
  }
  spawn(x,y,vx,vy,life) {
    const p = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    Object.assign(p, { x,y,vx,vy,life,active:true });
  }
  update(dt) {
    for (const p of this.items) if (p.active) {
      p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }
  render(ctx) {
    for (const p of this.items) if (p.active) {
      ctx.globalAlpha = Math.max(0, p.life*0.5);
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1.0;
  }
}
```
**Pourquoi ?** On **réutilise** les mêmes objets au lieu d’en **créer/détruire** (moins de GC).

### 5.4 Typed Arrays (option)
Pour beaucoup de positions (ex. particules), utiliser `Float32Array` (données **contiguës**) peut être **plus rapide** que des dizaines d’objets JS.

---

## 6) JavaScript : garder les « autoroutes » fluides

### 6.1 Formes d’objets stables (hidden classes)
Initialise **toutes** les propriétés dans le **constructeur** :
```javascript
function Car() {
  this.x = 0; this.y = 0;
  this.v = 0; this.heading = 0;
}
```
Évite d’ajouter une propriété **après** coup (`car.foo = 123`) : ça peut **désoptimiser**.

### 6.2 Tableaux « packés »
Évite les **trous** (indices manquants). Préfère `push/pop` à `shift/unshift` qui bougent tous les éléments.

### 6.3 Micro-optimisations utiles
- **Sortir** les constantes des **boucles** (ne pas les recalculer).
- Éviter de **créer des fonctions** (closures) **dans** des boucles chaudes.
- Limiter `try/catch` sur les chemins très utilisés.

**Analogie :** pense à une **autoroute** sans **dos d’âne** : tout circule mieux.

---

## 7) Collisions quand il y a **beaucoup** d’objets

### 7.1 Broadphase (grande échelle) → Narrowphase (détail)
Ne teste pas **tout contre tout** (coût en `N²`). Commence par une **approximation** : qui est **proche** de qui ?

### 7.2 Grille uniforme (facile à comprendre)
On découpe la carte en **cases** (ex. 64×64 px). On place chaque objet dans sa **case** et on ne teste que les objets de la **même case**.
```javascript
class UniformGrid {
  constructor(cellSize) { this.s = cellSize; this.map = new Map(); }
  key(cx, cy) { return cx+','+cy; }
  insert(id, x, y) {
    const cx = (x / this.s)|0, cy = (y / this.s)|0;
    const k = this.key(cx, cy);
    if (!this.map.has(k)) this.map.set(k, []);
    this.map.get(k).push(id);
  }
  query(x, y) {
    const cx = (x / this.s)|0, cy = (y / this.s)|0;
    const k = this.key(cx, cy);
    return this.map.get(k) || [];
  }
  clear() { this.map.clear(); }
}
```
**Usage :**
```javascript
// À chaque frame
grid.clear();
for (const obj of objects) grid.insert(obj.id, obj.x, obj.y);

// Pour une voiture à (x,y), tester seulement :
const candidates = grid.query(x, y);
for (const id of candidates) {
  // AABB ou cercle-cercle (Chap. 4)
}
```
**Analogie :** au lieu de chercher une voiture **sur tout le circuit**, tu cherches seulement dans la **case** où tu te trouves.

---

## 8) Audio et performance (sans se compliquer)

- **Réutilise** les **nœuds** audio (bus, filtres). Évite d’en **créer** à chaque frame.
- **Planifie** les sons (quelques millisecondes **dans le futur**) pour éviter le **décalage**.
- **Throttle** les impacts (éviter le *spam* sonore).

```javascript
let lastImpactAt = 0;
function playImpactThrottled(buffer, bus, now, minGap=0.08) {
  if (now - lastImpactAt < minGap) return;
  lastImpactAt = now;
  playOneShot(buffer, bus, { gain: 0.9 });
}
```

---

## 9) Plan d’action **Course JS** (recette simple)

1. **Mesure** d’abord (DevTools Performance). Note `update` vs `render`.
2. **Piste** : **buffer** offscreen (pré-rendu). Dans `render()`, fais `ctx.drawImage(buffer, 0, 0)`.
3. **Voiture/HUD** : dessine après la piste. **Évite** les **ombres**/texte **inutiles**.
4. **Effacement local** : « **dirty rectangles** » autour de la voiture (voir code plus haut).
5. **Particules** (fumée) : **pool** de **512** max.
6. **Collisions** : **grille uniforme** (64 px), puis **AABB/cercle**.
7. **Physique** : si instable, passe en **pas fixe** (120 Hz) + **interpolation**.
8. **Audio** : boucle moteur (`playbackRate` selon vitesse), **throttle** des impacts mineurs.
9. **Re-mesure** : vise **≤ 12 ms** `render` et **≤ 4 ms` update` (total **≤ 16.6 ms**).

---

## 10) Checklist (à cocher)

- [ ] Profilage **Performance** + **Memory** effectué (hotspots listés).
- [ ] **Piste** pré-rendue (buffer offscreen).
- [ ] **Dirty rectangles** en place (clear/redraw localisés).
- [ ] Dessins **groupés** (moins de changements d’état).
- [ ] **Pools** (particules, objets temporaires).
- [ ] **Typed Arrays** (si masse de données).
- [ ] Objets : **formes stables**, pas d’ajouts tardifs.
- [ ] Tableaux : **packés** (pas de trous), `push/pop`.
- [ ] **Grille uniforme** pour broadphase.
- [ ] Audio : **réutilisation** des nœuds, **throttle** SFX.
- [ ] Post-optimisation : **FPS ≥ 60**, **frame ≤ 16.6 ms**.

---

## ✅ Résumé des points essentiels
- **Vise 60 FPS** → **16.6 ms** par frame. **Mesure** avant d’optimiser.
- **Boucle** propre : `update` séparé de `render`. Option **pas fixe** + **interpolation** pour la stabilité.
- **Canvas** : pré-rendu de la **piste**, **dirty rectangles**, **regrouper** styles et limiter `save/restore`.
- **Mémoire** : éviter **allocations par frame**, préférer **réutilisation** et **pools**.
- **JS** : objets **stables**, tableaux **packés**, petites micro-optimisations.
- **Collisions** : **grille uniforme** puis **AABB/cercle**.
- **Audio** : réutiliser les nœuds, **planifier**, **throttle**.
- **Course JS** : applique la **recette** et la **checklist**, mesure à nouveau.



---

## 📈 Schémas pédagogiques

### Timeline d'une frame
![Timeline d'une frame](schema_timeline_frame.png)

### Concept de "dirty rectangles"
![Dirty rectangles](schema_dirty_rectangles.png)

### Grille uniforme (broadphase des collisions)
![Grille uniforme](schema_grille_uniforme.png)

