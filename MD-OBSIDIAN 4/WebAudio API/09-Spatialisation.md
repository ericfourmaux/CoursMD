---
title: "09 — Spatialisation et panorama (2D/3D)"
tags: ["Web Audio API", "StereoPannerNode", "PannerNode", "HRTF", "equalpower", "AudioListener", "distanceModel", "rolloff", "refDistance", "maxDistance", "coneInnerAngle", "coneOuterAngle", "coneOuterGain", "pan", "xy-controller"]
icon: "📘"
created: "2025-12-21"
---

# 📘 09 — Spatialisation et panorama (2D/3D)

> 🎯 **Objectif du chapitre** : Apprendre à placer et déplacer des sources dans l’espace **stéréo** et **3D** avec `StereoPannerNode` et `PannerNode`, comprendre les **modèles de distance** (inverse, linéaire, exponentiel), la **résonance de cône** (directivité), la **HRTF** et les paramètres de l’`AudioListener`. Tu réaliseras un **contrôleur XY** pour déplacer une source et des **démos** au casque.

---

## 🧠 Panorama vs spatialisation : définitions et pourquoi

- **Panorama (Stereo)** : régler la **balance** d’une source entre **gauche** et **droite** (valeur −1..+1). Idéal pour **mix stéréo**.
- **Spatialisation (3D)** : simuler la **position** et **direction** d’une source dans un espace; inclut la **distance**, l’**atténuation**, la **directivité** (cône) et, avec **HRTF**, des indices **binauraux** (filtrage dépendant de la direction, plis du pavillon).
- **Pourquoi** : rendre un **mix** plus intelligible, créer des **scènes** (jeux, VR/audio immersif), donner de la **profondeur** et du **mouvement**.

---

## 🧠 `StereoPannerNode` (pan stéréo)

- **Définition** : `StereoPannerNode` applique un **pan** de −1 (gauche) à +1 (droite).
- **Usage** :
```js
const ctx = new AudioContext();
const osc = ctx.createOscillator(); osc.frequency.value = 220;
const pan = ctx.createStereoPanner();
pan.pan.value = -0.6; // penché à gauche
osc.connect(pan).connect(ctx.destination);
// Sur geste: ctx.resume(); osc.start();
```
- **Automatisation** :
```js
// Balayage pan gauche->droite en 4 s
const now = ctx.currentTime;
pan.pan.setValueAtTime(-1, now);
pan.pan.linearRampToValueAtTime(+1, now + 4);
```

> 💡 **Astuce** : pour un **auto-pan**, connecte un **LFO** (oscillateur basse fréquence) sur `pan.pan`.

---

## 🧠 `PannerNode` (position 3D, HRTF)

- **Définition** : `PannerNode` spatialise une source dans un espace **3D**. Paramètres clé : `panningModel`, `distanceModel`, `positionX/Y/Z`, `orientationX/Y/Z`, `refDistance`, `maxDistance`, `rolloffFactor`, `coneInnerAngle`, `coneOuterAngle`, `coneOuterGain`.
- **Initialisation** :
```js
const panner = new PannerNode(ctx, {
  panningModel: 'HRTF',            // 'HRTF' ou 'equalpower'
  distanceModel: 'inverse',        // 'inverse' | 'linear' | 'exponential'
  refDistance: 1,
  maxDistance: 1000,
  rolloffFactor: 1,
  coneInnerAngle: 60,
  coneOuterAngle: 90,
  coneOuterGain: 0.25,
});
```
- **Placement** :
```js
// Position de la source (mètres arbitraires)
panner.positionX.value = 0;  // gauche(-)/droite(+)
panner.positionY.value = 0;  // bas/haut
panner.positionZ.value = -2; // profondeur (devant = négatif)

// Orientation (vecteur direction de la source)
panner.orientationX.value = 0;
panner.orientationY.value = 0;
panner.orientationZ.value = 1; // regarde vers l’auditeur
```

### 🧠 `AudioListener` (position & orientation de l’auditeur)

```js
const listener = ctx.listener;
// Position de l’auditeur
listener.positionX.value = 0;
listener.positionY.value = 0;
listener.positionZ.value = 0;
// Orientation: forward et up
listener.forwardX.value = 0; listener.forwardY.value = 0; listener.forwardZ.value = -1; // regarde vers -Z
listener.upX.value = 0;      listener.upY.value = 1;      listener.upZ.value = 0;      // up = +Y
```

> 💡 **Repère** : convention courante **Web Audio** → l’auditeur au **(0,0,0)**, regarde vers **−Z**. Une source devant aura `Z < 0`.

---

## 🧠 Modèles d’atténuation (JS)

> ℹ️ **Atténuation** = diminution du gain en fonction de la distance `d`.

### 🔢 Modèle **inverse**
```js
function gainInverse(d, ref=1, roll=1){
  if (d <= ref) return 1;
  return ref / (ref + roll * (d - ref));
}
```

### 🔢 Modèle **linéaire** (borné à 0)
```js
function gainLinear(d, ref=1, max=100, roll=1){
  const g = 1 - roll * (d - ref) / (max - ref);
  return Math.max(0, Math.min(1, g));
}
```

### 🔢 Modèle **exponentiel**
```js
function gainExponential(d, ref=1, roll=1){
  if (d <= ref) return 1;
  return Math.pow(d / ref, -roll);
}
```

> 💡 **Choix** : `inverse` est souvent **naturel**; `linear` utile pour zones **bornées**; `exponential` donne une **chute rapide**.

---

## 🧠 Cône de directivité (angle & gain)

- **Concept** : une source orientée (ex. haut‑parleur) peut rayonner plus fort **devant** que **derrière**.
- **Paramètres** :
  - `coneInnerAngle` : angle (°) **plein niveau**.
  - `coneOuterAngle` : au‑delà, le niveau tombe vers `coneOuterGain`.
  - `coneOuterGain` : gain hors cône (0..1).

```js
panner.coneInnerAngle = 60;
panner.coneOuterAngle = 120;
panner.coneOuterGain = 0.2;
```

---

## 🧪 Chaîne complète : source mono → panner → master

```js
const ctx = new AudioContext();
const src = ctx.createOscillator(); src.frequency.value = 330;
const panner = new PannerNode(ctx, { panningModel: 'HRTF', distanceModel: 'inverse' });
const master = ctx.createGain(); master.gain.value = 0.8;

// Graphe
src.connect(panner).connect(master).connect(ctx.destination);

// Position/Orientation
panner.positionX.value = -1.5;
panner.positionY.value = 0.5;
panner.positionZ.value = -2.5;
panner.orientationZ.value = 1;

// Listener (par défaut (0,0,0), forward -Z)
// Sur geste: ctx.resume(); src.start();
```

### 🧩 Schéma (Mermaid)
```mermaid
graph LR
  Src[Source mono] --> Pan[PannerNode (HRTF)]
  Pan --> Master[Gain]
  Master --> Out[Destination]
```

---

## 🧪 Contrôleur **XY** (Canvas) pour déplacer la source

```js
function attachXYController(canvas, panner, scale = 3){
  const w = canvas.width, h = canvas.height;
  const ctx2d = canvas.getContext('2d');
  let x = 0, y = 0; // -1..+1

  function draw(){
    ctx2d.clearRect(0,0,w,h);
    ctx2d.strokeStyle = '#ccc';
    ctx2d.strokeRect(0,0,w,h);
    const px = (x*0.5 + 0.5) * w;
    const py = (y*0.5 + 0.5) * h;
    ctx2d.fillStyle = '#1f77b4';
    ctx2d.beginPath(); ctx2d.arc(px, py, 8, 0, Math.PI*2); ctx2d.fill();
    requestAnimationFrame(draw);
  }

  function setFromEvent(ev){
    const rect = canvas.getBoundingClientRect();
    const mx = (ev.clientX - rect.left) / rect.width; // 0..1
    const my = (ev.clientY - rect.top) / rect.height; // 0..1
    x = mx*2 - 1;     // -1..+1 (gauche..droite)
    y = my*2 - 1;     // -1..+1 (bas..haut)
    panner.positionX.value = x * scale;
    panner.positionY.value = (1 - y) * scale * 0.0; // si tu veux ignorer Y pour 2D, mets 0
    panner.positionZ.value = -Math.max(0.5, (1 - Math.abs(x)) * scale); // profondeur
  }

  canvas.addEventListener('mousemove', setFromEvent);
  canvas.addEventListener('mousedown', setFromEvent);
  requestAnimationFrame(draw);
}
```

> 💡 **Astuce** : pour un **pan 2D** simple, remplace `PannerNode` par `StereoPannerNode` et mappe `x → pan.pan.value`.

---

## 🧠 HRTF vs equalpower

- **`HRTF`** : filtrage dépendant de la direction (**Head‑Related Transfer Function**) → indices **binauraux** réalistes au **casque**.
- **`equalpower`** : simple distribution stéréo (comme un pan avancé) → moins réaliste en 3D.
- **Conseils** : utiliser `HRTF` pour **casque**; `equalpower` peut suffire pour **haut‑parleurs**.

---

## 🧠 Compatibilité & recommandations

- **Mono vs Stéréo** : `PannerNode` fonctionne **mieux** avec des **sources mono**; une source déjà stéréo peut donner des résultats **moins prévisibles**.
- **Niveaux** : surveiller le **clipping**; une source très proche (petit `Z`) peut devenir **trop forte** → gérer `master.gain`.
- **Performances** : `HRTF` coûte davantage que `equalpower`; limiter le nombre de sources 3D simultanées.

---

## 🧩 Schémas Mermaid supplémentaires

### Panner + cône de directivité
```mermaid
graph LR
  Src --> Pan[PannerNode]\nconeInner=60°\nconeOuter=120°\nouterGain=0.2
  Pan --> Out
```

### Scène 2D (plusieurs sources)
```mermaid
graph LR
  S1[Src1 @(-2,0,-2)] --> P1[Panner]
  S2[Src2 @(+1,0,-1)] --> P2[Panner]
  P1 --> Mix[Master]
  P2 --> Mix
  Mix --> Out
```

---

## 🔧 Exercices (progressifs)

1. **Pan stéréo** : fais un **auto‑pan** avec un LFO et compare `linearRamp` vs modulation audio‑rate.
2. **Placement 3D** : place 3 sources autour de l’auditeur (avant, gauche, droite) et bascule `panningModel` entre `HRTF` et `equalpower`.
3. **Distance** : implémente les trois **modèles** (`inverse`, `linear`, `exponential`) et écoute la différence en bougeant `Z`.
4. **Cône** : règle `coneInner/Outer` et `coneOuterGain`; tourne la source et note l’impact.
5. **XY Controller** : connecte le contrôleur Canvas et déplace la source en temps réel.
6. **Casque vs enceintes** : compare le réalisme de `HRTF` au **casque** et sur **enceintes**.

---

## 💡 Astuces & bonnes pratiques

- **Calibrer l’échelle** des positions (mètres virtuels) pour obtenir une **plage** réaliste.
- **Limiter les extrêmes** (`maxDistance`, `rolloffFactor`) pour éviter les transitions **brutales**.
- **Sources mono** pour `PannerNode`; convertir si nécessaire (down‑mix).
- **UI** : propose un **bouton casque** qui force `panningModel='HRTF'`.

---

## ⚠️ Pièges fréquents

- **Oublier** que `PannerNode` additionne plusieurs contrôles (modulations + valeurs `.value`).
- **Positions irréalistes** : très grands `Z` ⇒ inaudible; très petits `Z` ⇒ clipping.
- **Stéréo déjà spatialisé** : `PannerNode` sur une source **stéréo** peut produire une image **instable**.

---

## 🧾 Résumé du chapitre (points clés)

- **`StereoPannerNode`** : pan −1..+1 (balance stéréo), automatisable.
- **`PannerNode`** : spatialisation 3D avec `HRTF`/`equalpower`, distance, cône, orientation.
- **Modèles de distance** : **inverse** (naturel), **linéaire** (borné), **exponentiel** (rapide).
- **`AudioListener`** : position & orientation de l’auditeur (forward, up).
- **Bonnes pratiques** : sources mono, niveaux maîtrisés, limiter le nombre de sources HRTF.

---

> ✅ **Prochaines étapes** : **Chapitre 10 — Effets (Delay, Reverb, Distorsion, Compresseur)** : chaînage d’effets et construction d’un pedalboard virtuel.
