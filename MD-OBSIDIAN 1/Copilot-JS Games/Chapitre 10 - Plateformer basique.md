
# Chapitre 10.1 : Démos pratiques – Plateformer basique + Shoot'em up basique

> **Objectif :** te fournir deux **démos minimales** (100% Vanilla JS, Canvas 2D) avec **code prêt à copier**, **assets placeholders**, et des **schémas** pour visualiser le workflow et l'architecture.

---

## A) Plateformer basique (one-way, caméra, parallax)

### 1) Arborescence
```
plateformer/
├─ index.html
└─ src/
   ├─ main.js
   ├─ game.js
   ├─ input/keyboard.js
   ├─ world/tilemap.js
   ├─ physics/kinematics.js
   ├─ physics/collide.js
   ├─ ui/hud.js
   └─ scenes/level-scene.js
```

### 2) `index.html`
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Plateformer JS</title>
  <style>html,body{height:100%;margin:0;background:#101418}#game{display:block;margin:0 auto;background:#151a22}</style>
</head>
<body>
  <canvas id="game" width="960" height="540"></canvas>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### 3) `src/main.js`
```javascript
import { Game } from './game.js';
import { LevelScene } from './scenes/level-scene.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = Game.getInstance({ canvas, ctx });
game.setScene(new LevelScene(game));
game.start();
```

### 4) `src/game.js` (boucle)
```javascript
import { Keyboard } from './input/keyboard.js';
export class Game {
  static #inst=null; static getInstance(s){ return this.#inst||(this.#inst=new Game(s)); }
  constructor({canvas,ctx}){ this.canvas=canvas; this.ctx=ctx; this.kb=new Keyboard(); this.scene=null; this._last=0; this._run=false; }
  setScene(s){ if(this.scene?.exit) this.scene.exit(); this.scene=s; this.scene?.enter(); }
  start(){ this._run=true; requestAnimationFrame(this._loop.bind(this)); }
  _loop(ts){ if(!this._run) return; const dt=(ts-this._last)/1000||0; this._last=ts; this.kb.beginFrame(); this.scene?.update(dt); this.scene?.render(this.ctx); requestAnimationFrame(this._loop.bind(this)); }
}
```

### 5) `src/input/keyboard.js`
```javascript
export class Keyboard {
  constructor(){ this.down=new Set(); this._p=new Set(); this._r=new Set(); this.justPressed=new Set(); this.justReleased=new Set();
    addEventListener('keydown',e=>{ if(!this.down.has(e.code)) this._p.add(e.code); this.down.add(e.code); },{passive:true});
    addEventListener('keyup',e=>{ if(this.down.has(e.code)) this._r.add(e.code); this.down.delete(e.code); },{passive:true});
    addEventListener('blur',()=>this.down.clear()); }
  beginFrame(){ this.justPressed=this._p; this.justReleased=this._r; this._p=new Set(); this._r=new Set(); }
  isDown(code){ return this.down.has(code); }
}
```

### 6) `src/world/tilemap.js` (placeholder)
```javascript
export const TILE = 32;
// 0=vide, 1=solide, 2=plateforme one-way
export const MAP = [
  // 30 colonnes × 17 lignes env.
  // ... décor vide ...
  ...Array(14).fill(Array(30).fill(0)),
  // rangées solides + one-way pour le test
  Array(30).fill(0).map((_,i)=> i>3 && i<25 ? 1 : 0),
  Array(30).fill(0).map((_,i)=> i>10 && i<20 ? 2 : 0),
  Array(30).fill(1),
];
export function tileAt(x,y){ const c=Math.floor(x/TILE), r=Math.floor(y/TILE); if(r<0||c<0||r>=MAP.length||c>=MAP[0].length) return 0; return MAP[r][c]; }
```

### 7) `src/physics/kinematics.js`
```javascript
export function updateKinematics(e, dt){ e.vx+=e.ax*dt; e.vy+=e.ay*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; }
export const G = 2000; // gravité px/s²
```

### 8) `src/physics/collide.js` (X puis Y + one-way)
```javascript
import { TILE, tileAt } from '../world/tilemap.js';
function solidAt(x,y){ return tileAt(x,y)===1; }
function platformAt(x,y){ return tileAt(x,y)===2; }
export function collideX(p){ // AABB X
  const nextL = p.x, nextR = p.x + p.w;
  const top = p.y + 2, bot = p.y + p.h - 2;
  const tilesX = [Math.floor(nextL/TILE), Math.floor(nextR/TILE)];
  const rows = [Math.floor(top/TILE), Math.floor(bot/TILE)];
  for(const c of tilesX){ for(const r of rows){ if(solidAt(c*TILE, r*TILE)){ if(p.vx>0) { p.x = c*TILE - p.w; } else { p.x = (c+1)*TILE; } p.vx=0; return; } } }
}
export function collideY(p){ // AABB Y + one-way
  const nextT = p.y, nextB = p.y + p.h;
  const left = p.x + 4, right = p.x + p.w - 4;
  const cols = [Math.floor(left/TILE), Math.floor(right/TILE)];
  for(const r of [Math.floor(nextT/TILE), Math.floor(nextB/TILE)]){
    for(const c of cols){ const tile = tileAt(c*TILE, r*TILE);
      if(tile===1){ // solide
        if(p.vy>0){ p.y = r*TILE - p.h; p.vy=0; p.onGround=true; } else { p.y = (r+1)*TILE; p.vy=0; }
        return; }
      if(tile===2){ // one-way: seulement si on descend et qu'on franchit le bord
        const platY = r*TILE;
        if(p.vy>0 && p.prevBottom<=platY && nextB>=platY){ p.y = platY - p.h; p.vy=0; p.onGround=true; return; }
      }
    }
  }
}
```

### 9) `src/scenes/level-scene.js`
```javascript
import { updateKinematics, G } from '../physics/kinematics.js';
import { collideX, collideY } from '../physics/collide.js';
import { TILE, MAP } from '../world/tilemap.js';

export class LevelScene {
  constructor(game){ this.game=game; this.cam={x:0,y:0,w:game.canvas.width,h:game.canvas.height};
    this.p={x: 200, y: 100, w: 28, h: 40, vx:0,vy:0, ax:0,ay:G, onGround:false, prevBottom:0}; }
  enter(){}
  readInputs(){ const kb=this.game.kb; let ax=0; if(kb.isDown('ArrowLeft')||kb.isDown('KeyA')) ax-=900; if(kb.isDown('ArrowRight')||kb.isDown('KeyD')) ax+=900; if((kb.isDown('ArrowUp')||kb.isDown('KeyW')) && this.p.onGround){ this.p.vy=-700; this.p.onGround=false; }
    return { ax }; }
  update(dt){ const inp=this.readInputs(); this.p.ax=inp.ax; this.p.prevBottom=this.p.y+this.p.h; updateKinematics(this.p, dt);
    // collisions X puis Y
    collideX(this.p); collideY(this.p);
    // friction au sol
    if(this.p.onGround){ this.p.vx *= 0.85; }
    // caméra deadzone
    const dz={ x:this.cam.x+this.cam.w*0.3, y:this.cam.y+this.cam.h*0.3, w:this.cam.w*0.4, h:this.cam.h*0.4 };
    if(this.p.x<dz.x) this.cam.x=this.p.x-this.cam.w*0.3; if(this.p.x>dz.x+dz.w) this.cam.x=this.p.x-this.cam.w*0.7;
    if(this.p.y<dz.y) this.cam.y=this.p.y-this.cam.h*0.3; if(this.p.y>dz.y+dz.h) this.cam.y=this.p.y-this.cam.h*0.7;
    // clamp caméra
    this.cam.x = Math.max(0, Math.min(this.cam.x, MAP[0].length*TILE - this.cam.w));
    this.cam.y = Math.max(0, Math.min(this.cam.y, MAP.length*TILE - this.cam.h));
  }
  render(ctx){ ctx.save(); ctx.translate(-this.cam.x, -this.cam.y);
    // fond parallax simple (rectangles)
    ctx.fillStyle='#0f1318'; ctx.fillRect(this.cam.x, this.cam.y, this.cam.w, this.cam.h);
    // tiles
    for(let r=0;r<MAP.length;r++) for(let c=0;c<MAP[0].length;c++){
      const t=MAP[r][c]; if(!t) continue; ctx.fillStyle= t===1? '#303a4b' : '#4a5a73'; ctx.fillRect(c*TILE, r*TILE, TILE, TILE);
    }
    // player
    ctx.fillStyle='#1e90ff'; ctx.fillRect(this.p.x, this.p.y, this.p.w, this.p.h);
    ctx.restore();
    // HUD
    ctx.fillStyle='#e0e3e8'; ctx.font='14px sans-serif'; ctx.fillText(`vx:${Math.round(this.p.vx)} vy:${Math.round(this.p.vy)} onGround:${this.p.onGround}`, 20, 24);
  }
}
```

---

## B) Shoot'em up basique (parallax, bullet pool, grille)

### 1) Arborescence
```
shmup/
├─ index.html
└─ src/
   ├─ main.js
   ├─ game.js
   ├─ input/keyboard.js
   ├─ core/grid.js
   ├─ world/parallax.js
   ├─ entities/player.js
   ├─ entities/bullets.js
   ├─ entities/enemy.js
   └─ scenes/shmup-scene.js
```

### 2) `index.html`
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shmup JS</title>
  <style>html,body{height:100%;margin:0;background:#101418}#game{display:block;margin:0 auto;background:#151a22}</style>
</head>
<body>
  <canvas id="game" width="640" height="480"></canvas>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### 3) `src/core/grid.js` (grille uniforme)
```javascript
export class Grid { constructor(s){ this.s=s; this.map=new Map(); }
  clear(){ this.map.clear(); }
  key(cx,cy){ return cx+','+cy; }
  insert(id,x,y){ const cx=(x/this.s)|0, cy=(y/this.s)|0; const k=this.key(cx,cy); if(!this.map.has(k)) this.map.set(k,[]); this.map.get(k).push(id); }
  query(x,y){ const cx=(x/this.s)|0, cy=(y/this.s)|0; return this.map.get(this.key(cx,cy))||[]; }
}
```

### 4) `src/entities/bullets.js` (pool)
```javascript
export class BulletPool { constructor(n){ this.items=Array.from({length:n},()=>({x:0,y:0,vx:0,vy:0,active:false})); }
  spawn(x,y,vx,vy){ const b=this.items.find(i=>!i.active); if(!b) return; Object.assign(b,{x,y,vx,vy,active:true}); }
  update(dt, bounds){ for(const b of this.items) if(b.active){ b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.x<0||b.x>bounds.w||b.y<0||b.y>bounds.h) b.active=false; } }
  render(ctx){ for(const b of this.items) if(b.active){ ctx.fillStyle='#ffb300'; ctx.fillRect(b.x-2,b.y-2,4,4); } }
}
```

### 5) `src/entities/player.js`
```javascript
export class Player { constructor(x,y){ this.x=x; this.y=y; this.speed=280; this.cool=0; }
  update(dt,kb,bullets,bounds){ const dx=(kb.isDown('ArrowRight')||kb.isDown('KeyD'))-(kb.isDown('ArrowLeft')||kb.isDown('KeyA'));
    const dy=(kb.isDown('ArrowDown')||kb.isDown('KeyS'))-(kb.isDown('ArrowUp')||kb.isDown('KeyW'));
    this.x = Math.max(20, Math.min(bounds.w-20, this.x + dx*this.speed*dt));
    this.y = Math.max(20, Math.min(bounds.h-20, this.y + dy*this.speed*dt));
    this.cool -= dt; if((kb.isDown('Space')||kb.isDown('KeyJ')) && this.cool<=0){ bullets.spawn(this.x, this.y-12, 0, -480); this.cool=0.12; }
  }
  render(ctx){ ctx.fillStyle='#1e90ff'; ctx.fillRect(this.x-10, this.y-10, 20, 20); }
}
```

### 6) `src/entities/enemy.js`
```javascript
export class Enemy { constructor(x,y){ this.x=x; this.y=y; this.vy=100; this.t=0; this.alive=true; }
  update(dt){ this.t+=dt; this.y+=this.vy*dt; this.x+=Math.sin(this.t*3.0)*60*dt; if(this.y>480+30) this.alive=false; }
  render(ctx){ ctx.fillStyle='#8bc34a'; ctx.beginPath(); ctx.arc(this.x,this.y,10,0,Math.PI*2); ctx.fill(); }
}
```

### 7) `src/world/parallax.js`
```javascript
export function renderParallax(ctx, offset){ // offset.y augmente pour scroller
  ctx.save(); ctx.fillStyle='#0f1318'; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  // layer 1 (lointain)
  ctx.fillStyle='#263238'; for(let i=-2;i<6;i++){ const y=((offset.y*0.2)|0)%160; ctx.fillRect(i*160, y+60, 140, 40); }
  // layer 2 (proche)
  ctx.fillStyle='#37474f'; for(let i=-2;i<6;i'){ const y=((offset.y*0.5)|0)%120; ctx.fillRect(i*160+40, y+220, 120, 50); }
  ctx.restore();
}
```

### 8) `src/scenes/shmup-scene.js`
```javascript
import { Player } from '../entities/player.js';
import { BulletPool } from '../entities/bullets.js';
import { Enemy } from '../entities/enemy.js';
import { Grid } from '../core/grid.js';
import { renderParallax } from '../world/parallax.js';

export class ShmupScene {
  constructor(game){ this.game=game; this.bounds={ w:game.canvas.width, h:game.canvas.height }; this.player=new Player(this.bounds.w/2, this.bounds.h-60);
    this.bullets=new BulletPool(128); this.enemies=[]; this.grid=new Grid(64); this.offset={y:0}; this.spawnT=0; }
  enter(){}
  update(dt){ const kb=this.game.kb; this.player.update(dt,kb,this.bullets,this.bounds); this.bullets.update(dt,this.bounds);
    // spawn ennemis
    this.spawnT+=dt; if(this.spawnT>0.6){ this.spawnT=0; this.enemies.push(new Enemy(Math.random()*this.bounds.w, -20)); }
    // update ennemis
    for(const e of this.enemies) e.update(dt); this.enemies = this.enemies.filter(e=>e.alive);
    // collisions bullets vs enemies (grille)
    this.grid.clear(); let id=0; for(const e of this.enemies) this.grid.insert(`E${id++}`, e.x, e.y);
    for(const b of this.bullets.items){ if(!b.active) continue; const cand=this.grid.query(b.x,b.y); // simple test cercle
      for(const k of cand){ const idx=parseInt(k.slice(1),10); const e=this.enemies[idx]; if(!e) continue; const dx=e.x-b.x, dy=e.y-b.y; if(dx*dx+dy*dy<12*12){ e.alive=false; b.active=false; break; } }
    }
    // scroll
    this.offset.y += 60*dt;
  }
  render(ctx){ renderParallax(ctx, this.offset); this.player.render(ctx); this.bullets.render(ctx); for(const e of this.enemies) e.render(ctx);
    ctx.fillStyle='#e0e3e8'; ctx.font='14px sans-serif'; ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 20);
  }
}
```

### 9) `src/main.js` et `src/game.js` (identiques au plateformer)
```javascript
// main.js
import { Game } from './game.js';
import { ShmupScene } from './scenes/shmup-scene.js';
const canvas=document.getElementById('game'); const ctx=canvas.getContext('2d');
const game=Game.getInstance({canvas,ctx}); game.setScene(new ShmupScene(game)); game.start();
```
```javascript
// game.js (voir section plateformer)
```

---

## Conseils pour lancer
- **Serveur local** requis (ES Modules) : `python -m http.server` puis `http://localhost:8000`.
- Place les dossiers `plateformer/` et `shmup/` à la racine, chacun avec leur `index.html` et `src/`.
- Ajuste les **constantes** (gravité, vitesse, cadence tir) pour le **feel**.
- Profilage : **DevTools → Performance/Memory** (cf. Chapitre 8).

---

## À étendre ensuite
- Plateformer : **coyote time** + **jump buffer** plus robuste, **animations**, **collectibles**.
- Shmup : **patterns** variés, **power‑ups**, **boss**, **score/combo** (Chapitre Arcade).

