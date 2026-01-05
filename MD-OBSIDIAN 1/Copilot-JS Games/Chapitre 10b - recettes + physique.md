
# Chapitre 10 : Scrolling, plateformes, shoot'em up & arcades (recettes & physique)

> **Objectif :** te donner des **recettes** prêtes à l'emploi pour les jeux **à scrolling** (vertical, horizontal, multidirectionnel), les **plateformers**, les **shoot'em up** et les **arcades**, avec une **physique** simple, une **gestion d'objets** claire, et des **patterns** reproductibles.

---

## 0) Repères fondamentaux (monde vs écran)

- **Coordonnées monde** : position des objets **dans le niveau** (pouvant être plus grand que l’écran).
- **Caméra** : fenêtre qui **observe** une zone du monde.
- **Coordonnées écran** : ce qui est **dessiné** en pixels **sur le Canvas**.

Formule de base (dessin dans un monde avec caméra):
```javascript
function renderWorld(ctx, camera, drawFn) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y); // décaler tout le monde
  drawFn(ctx);                          // dessiner le monde (tiles, entités)
  ctx.restore();
}
```

---

## 1) Scrolling (vertical, horizontal, multidirectionnel)

### 1.1 Caméra qui suit le joueur (deadzone)
**Idée :** la caméra ne **bouge** que si le joueur sort d’une **zone de confort** (deadzone) centrée.
```javascript
function updateCamera(camera, player, viewW, viewH) {
  const dz = { // deadzone centré
    x: camera.x + viewW * 0.3,
    y: camera.y + viewH * 0.3,
    w: viewW * 0.4,
    h: viewH * 0.4,
  };
  // Si le joueur sort, on recentre progressivement
  if (player.x < dz.x) camera.x = player.x - viewW * 0.3;
  if (player.x > dz.x + dz.w) camera.x = player.x - viewW * 0.7;
  if (player.y < dz.y) camera.y = player.y - viewH * 0.3;
  if (player.y > dz.y + dz.h) camera.y = player.y - viewH * 0.7;
}
```
**Conseil :** **clamp** la caméra aux **limites** du niveau.

### 1.2 Parallax (couches à vitesses différentes)
**Idée :** le décor éloigné bouge **moins** vite que l’avant‑plan.
```javascript
function renderParallax(ctx, camera, layers) {
  for (const layer of layers) {
    const parallaxX = camera.x * layer.factorX; // ex: 0.2, 0.5...
    const parallaxY = camera.y * layer.factorY; // ex: 0.0 pour side-scroller
    ctx.drawImage(layer.image, -parallaxX, -parallaxY);
  }
}
```
**Astuce :** boucler/gréer les couches pour un scrolling **infini** (modulo largeur/hauteur).

### 1.3 Culling (dessiner moins)
**Idée :** ne dessiner que les **tiles/objets** visibles dans la **fenêtre caméra**.
```javascript
function visibleTiles(camera, tileSize, mapW, mapH) {
  const c0 = Math.floor(camera.x / tileSize);
  const r0 = Math.floor(camera.y / tileSize);
  const c1 = Math.ceil((camera.x + camera.w) / tileSize);
  const r1 = Math.ceil((camera.y + camera.h) / tileSize);
  return { c0, r0, c1: Math.min(c1, mapW), r1: Math.min(r1, mapH) };
}
```

---

## 2) Plateformers (physique & collisions)

### 2.1 Physique simple (gravité, sauts, friction)
- **Position** `(x,y)`, **vitesse** `(vx,vy)`, **accélération** `(ax,ay)`.
- **Gravité** `ay = g` (ex: `g = 2000 px/s²`).
- **Saut** : donner une **impulsion** verticale initiale (ex: `vy = -jumpV`).
- **Friction** au sol (ramener `vx` vers 0 doucement).

Intégration (par frame) :
```javascript
function updateKinematics(entity, dt) {
  entity.vx += entity.ax * dt; entity.vy += entity.ay * dt; // accélérations
  entity.x += entity.vx * dt; entity.y += entity.vy * dt;   // vitesses
}
```

### 2.2 Saut « agréable » (coyote time, buffer)
- **Coyote time** : autoriser un saut court **après** avoir quitté le sol (ex: 0.1 s).
- **Jump buffer** : si le joueur a pressé saut **juste avant** d’atterrir, déclencher à l’atterrissage.

```javascript
class Jumper {
  constructor(){ this.onGround=false; this.coyote=0; this.buffer=0; }
  update(dt, inputJump){
    if (this.onGround) this.coyote = 0.1; else this.coyote -= dt;
    if (inputJump) this.buffer = 0.1; else this.buffer -= dt;
    if ((this.coyote > 0 || this.onGround) && this.buffer > 0) {
      this.vy = -this.jumpV; this.onGround = false; this.coyote = 0; this.buffer = 0;
    }
  }
}
```

### 2.3 Collisions avec tiles (AABB), plateformes unidirectionnelles
- **AABB** contre **tiles solides** :
  1) Mouvements séparés en **X** puis **Y**.
  2) En X, si collision, **repousse** et **annule** `vx`.
  3) En Y, si collision **depuis le haut**, pose sur le sol (`onGround = true`, `vy=0`).
- **Plateformes unidirectionnelles** (one‑way) :
  - Ne résoudre **que si** l’entité **tombe** (`vy > 0`) et son **pied** est **au-dessus** de la plateforme.

Extrait (résolution Y) :
```javascript
function resolveY(player, platforms) {
  // descente
  if (player.vy > 0) {
    for (const p of platforms) {
      const foot = player.y + player.h; // pied
      // Condition one-way: pied au-dessus et intersecte verticalement
      if (foot >= p.y && player.prevFoot <= p.y && player.x + player.w > p.x && player.x < p.x + p.w) {
        player.y = p.y - player.h; player.vy = 0; player.onGround = true;
      }
    }
  }
}
```

### 2.4 Pentes (option débutant : éviter pour l’instant)
- Commence avec des **plates** (rectangles). Les pentes demandent une collision **normalisée**.

---

## 3) Shoot'em up (vertical/horizontal)

### 3.1 Scroller (niveau infini)
- **Défilement** du fond (parallax ou tilemap), `scrollOffset += speed * dt`.
- **Boucle** des sprites de fond (modulo images).

### 3.2 Système de tirs (pool de projectiles)
**Idée :** ne **crée** pas un objet par tir. **Réutilise** (pool).
```javascript
class BulletPool {
  constructor(n){ this.items = Array.from({length:n}, ()=>({x:0,y:0,vx:0,vy:0,active:false})); }
  spawn(x,y,vx,vy){ const b = this.items.find(i=>!i.active); if (!b) return; Object.assign(b,{x,y,vx,vy,active:true}); }
  update(dt){ for (const b of this.items) if (b.active){ b.x+=b.vx*dt; b.y+=b.vy*dt; if (offscreen(b)) b.active=false; } }
  render(ctx){ for (const b of this.items) if (b.active){ ctx.fillRect(b.x-2,b.y-2,4,4); } }
}
```

### 3.3 Patterns d’ennemis
- **Ligne droite** : `vx,vy` constants.
- **Sine** (horizontal) : `x = x0 + A * sin(ωt)`.
- **Radial** (bullets) : angle qui **tourne**.

Exemple : sinus horizontal
```javascript
function updateEnemySine(e, dt){ e.t+=dt; e.x = e.x0 + e.A * Math.sin(e.w * e.t); e.y += e.vy * dt; }
```

### 3.4 Collisions (bullets vs enemies)
- **Broadphase** : grille uniforme (cf. chap. 8), **culling** par écran.
- **Narrowphase** : AABB **ou** cercle–cercle.

---

## 4) Jeux d’arcade (boucles, états, scoring)

- **États** : Title → Playing → Pause → GameOver → HighScore.
- **Scoring** : points, **multiplicateur**, **combo**, **bonus**.
- **Vies** & **continues** (option).
- **Timer** & **vagues** (spawn scheduler) pour rythmer.

Exemple scheduler **simple** :
```javascript
class Scheduler {
  constructor(){ this.events=[]; this.t=0; }
  add(at, fn){ this.events.push({at, fn, done:false}); }
  update(dt){ this.t+=dt; for(const e of this.events){ if(!e.done && this.t>=e.at){ e.fn(); e.done=true; } } }
}
```

---

## 5) Gestion d’objets (entités, couches, partition)

- **Entités** : objets avec `update(dt)` / `render(ctx)`.
- **Couches** (layers) : fond, décor, ennemis, player, HUD (ordre de dessin).
- **Partition spatiale** : grille pour collisions (**performances**).

Patron minimal :
```javascript
class Entity { update(dt){} render(ctx){} }
class World {
  constructor(){ this.entities=[]; }
  update(dt){ for(const e of this.entities) e.update(dt); }
  render(ctx){ for(const e of this.entities) e.render(ctx); }
}
```

---

## 6) Recettes par type de jeu

### 6.1 **Plateformer** (recette)
1. **Tilemap** (solides + plateformes one‑way).
2. **Physique** avec `g`, **coyote time**, **buffer** de saut, friction.
3. **Collisions** AABB (X puis Y) + **one‑way** (uniquement en descente).
4. **Caméra** (deadzone + clamp) + **parallax**.
5. **Culling** des tiles/objets hors écran.
6. **HUD** (score, vies, timer).
7. **Audio** (saut, atterrissage, collectibles).

**Paramètres à tuner** : `g`, `jumpV`, friction X, taille deadzone, vitesse parallax.

### 6.2 **Shoot’em up** (recette)
1. **Scroller** (vertical/horizontal) avec **parallax**.
2. **Player ship** (vitesses, limites écran).
3. **Bullet pool** (tirs + patterns).
4. **Enemies** (trajectoires : ligne, sine, radial).
5. **Spawn scheduler** (vagues, boss).
6. **Collisions** (grille + AABB/cercle), **explosions**.
7. **HUD** (score, vies), **power‑ups**.
8. **Audio** (tir, explosion, power‑up).

**Paramètres à tuner** : vitesse scroll, cadence tir, A (amplitude), ω (fréquence), HP ennemis.

### 6.3 **Arcade (runner/top‑down)** (recette)
1. **État** : Title → Playing → GameOver → HighScore.
2. **Boucle principale** (update/render) + **scheduler** pour événements.
3. **Objets** (collectibles, obstacles, ennemis) + **partition**.
4. **Scoring** (multiplicateurs, combos), **HUD**.
5. **Audio** (musique, SFX clairs).

**Paramètres à tuner** : vitesse globale, densité obstacles, règles de combo.

---

## 7) Conseils « feel » & performance

- **Feel** : commence avec des valeurs **douces** (ex. `g` pas trop grand), ajuste **progressivement**.
- **Inputs** : lisser la **direction** (éviter les changements brusques).
- **Render** : regrouper les **styles**, limiter `save/restore` (cf. chap. 8).
- **Collisions** : toujours **broadphase** (grille) avant **narrowphase**.
- **Audio** : volumes par **bus**, **playbackRate** lissé.

---

## ✅ Résumé
- **Scrolling** : caméra, deadzone, parallax, culling.
- **Plateformer** : gravité, sauts (coyote/buffer), collisions AABB + one‑way.
- **Shoot’em up** : scroller, **pool** de bullets, **patterns**, collisions grille.
- **Arcade** : états, scoring, scheduler.
- **Recettes** : étapes concrètes + **paramètres** à ajuster pour le **game feel**.



---

## Schémas pédagogiques

### Caméra avec deadzone (scrolling multi-directionnel)
![Caméra avec deadzone](schema_ch10_camera_deadzone.png)

### Plateformes one-way (collision en descente)
![Plateformes one-way](schema_ch10_platform_oneway.png)

### Bullet Pool + Grille uniforme (shoot'em up)
![Bullet Pool + Grille](schema_ch10_bulletpool_grid.png)

### Parallax infini (layers répétées)
![Parallax infini](schema_ch10_parallax_infinite.png)


## Encarts pédagogiques (liés aux schémas)

### Caméra + deadzone
Ce qu'il montre : la caméra suit le joueur seulement hors de la deadzone pour éviter des mouvements brusques. À retenir : clamp aux limites du niveau, lissage si besoin.

**Code :**

```javascript
function updateCamera(cam, p, w, h){
  const dz={x:cam.x+w*0.3,y:cam.y+h*0.3,w:w*0.4,h:h*0.4};
  if(p.x<dz.x) cam.x=p.x-w*0.3; if(p.x>dz.x+dz.w) cam.x=p.x-w*0.7;
  if(p.y<dz.y) cam.y=p.y-h*0.3; if(p.y>dz.y+dz.h) cam.y=p.y-h*0.7;
}
```

### Plateformes one-way
Ce qu'il montre : on ne résout la collision que en descente (pied qui franchit la plateforme). À retenir : pose (onGround=true) et vy=0.

**Code :**

```javascript
if(player.vy>0 && foot>=plat.y && prevFoot<=plat.y){
  player.y=plat.y-player.h; player.vy=0; player.onGround=true;
}
```

### Bullet Pool + Grille
Ce qu'il montre : réutilisation des projectiles et broadphase via grille pour limiter les paires. À retenir : query(cell) puis AABB/cercle.

### Parallax infini
Ce qu'il montre : répétition modulo de blocs pour un fond infini, avec facteur de défilement par couche. À retenir : couches lointaines bougent moins vite.

