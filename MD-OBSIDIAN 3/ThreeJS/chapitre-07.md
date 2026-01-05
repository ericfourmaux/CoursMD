
# 🖱️ **Chapitre 7 — Contrôles et Interaction**

> 👨‍🏫 *Objectif :* apprendre à **naviguer** dans la scène (🧭 OrbitControls), **interagir** avec les objets (🎯 raycasting : clic, survol, drag), gérer les **événements** (clavier/souris/tactile), concevoir une **architecture d'interaction** robuste (input → logique → rendu), et mettre en œuvre des **exemples complets** ainsi que des **exercices**. Vous verrez aussi des **bonnes pratiques** de performance et d’accessibilité.

---

## 🧩 1. Vocabulaire et principes d’interaction

- **📘 Définition**
  - **Contrôle de caméra** : outils permettant de **orbit**, **zoom**, **pan** autour de la scène sans modifier les objets (ex. `OrbitControls`).
  - **Raycasting** : projection d’un **rayon** depuis la caméra vers le plan de l’écran pour **détecter** l’objet visé (sélection, survol, drag).
  - **Événements d’entrée** : **pointer** (souris/tactile/stylet), **keyboard** (clavier), **wheel** (molette/zoom).

- **❓ Pourquoi ?**
  - Une scène 3D **vivante** exige navigation fluide et **réactions** aux intentions de l’utilisateur (pointer, cliquer, déplacer).

- **🔶 Analogie**
  - Imaginez un **laser** tenu à bout de bras : vous pointez (raycasting), choisissez (clic), déplacez les choses (drag). La caméra est votre **position/angle de vue** dans la pièce.

---

## 🧭 2. OrbitControls : piloter la caméra

- **📘 Définition** : `OrbitControls` est un module (exemples Three.js) qui gère **rotation autour d’une cible**, **zoom** (dollying), et **pan**.
- **❓ Pourquoi ?** Démarrer rapidement une **navigation** cohérente sans recoder les gestes souris/touch.

### 2.1 ES Modules (recommandé)
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { OrbitControls } from 'https://esm.run/three@latest/examples/jsm/controls/OrbitControls.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);   // point autour duquel on orbite
  controls.enableDamping = true;   // inertie
  controls.dampingFactor = 0.05;   // friction
  controls.minDistance = 1;        // zoom mini
  controls.maxDistance = 20;       // zoom maxi
  controls.maxPolarAngle = Math.PI * 0.49; // limite d’inclinaison

  function animate(){
    controls.update(); // requis quand damping=true
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
</script>
```

### 2.2 CDN (script) — alternative simple
> ℹ️ `OrbitControls` n’existe pas en UMD natif dans `three.min.js`; il faut charger le module depuis les exemples (via `type="module"`).

---

## 🎯 3. Raycasting : sélectionner et survoler des objets

- **📘 Définition** : `THREE.Raycaster` calcule les **intersections** entre un **rayon** (de la caméra vers le point écran) et un ensemble d’objets.
- **❓ Pourquoi ?** Découvrir **quel objet** est visé pour **réagir** (changer couleur, afficher info, déplacer, etc.).

### 3.1 NDC (Normalized Device Coordinates)
> 🧮 *Formules JS* — conversion **pixel → NDC** :
```js
function toNDC(mouseX, mouseY, width, height){
  const x =  (mouseX / width)  * 2 - 1;  // -1..+1
  const y = -(mouseY / height) * 2 + 1; // -1..+1 (inversé)
  return new THREE.Vector2(x, y);
}
```

### 3.2 Raycaster minimal (survol + surbrillance)
```js
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hovered = null;

function onPointerMove(e){
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
}

function checkIntersections(){
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true); // true = descend children
  if (intersects.length){
    const first = intersects[0].object;
    if (hovered !== first){
      if (hovered) hovered.material.emissive?.setHex(hovered.userData.prevEmissive ?? 0x000000);
      hovered = first;
      hovered.userData.prevEmissive = hovered.material.emissive?.getHex();
      hovered.material.emissive?.setHex(0x333333); // surbrillance
    }
  } else {
    if (hovered) hovered.material.emissive?.setHex(hovered.userData.prevEmissive ?? 0x000000);
    hovered = null;
  }
}

renderer.domElement.addEventListener('pointermove', onPointerMove);

function animate(){
  checkIntersections();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

> 💡 Utilisez `emissive` des matériaux PBR pour une **surbrillance non destructive**.

### 3.3 Clic pour sélectionner et afficher des infos
```js
renderer.domElement.addEventListener('pointerdown', (e)=>{
  raycaster.setFromCamera(mouse, camera);
  const ix = raycaster.intersectObjects(scene.children, true);
  if (ix.length){
    const obj = ix[0].object;
    console.log('Sélection :', obj.name || obj.uuid);
    // Exemple : ouvrir un panneau d’info
    const panel = document.getElementById('info');
    panel.textContent = obj.userData?.label ?? 'Objet sans label';
  }
});
```

---

## 🧲 4. Drag (glisser) d’objets : principes et variantes

- **📘 Définition** : déplacer un objet selon un **plan** (écran ou monde) en fonction du **pointer**.
- **❓ Pourquoi ?** Manipulations directes (éditer, placer, organiser).

### 4.1 DragControls (module des exemples)
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { OrbitControls } from 'https://esm.run/three@latest/examples/jsm/controls/OrbitControls.js';
  import { DragControls } from 'https://esm.run/three@latest/examples/jsm/controls/DragControls.js';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  const objects = [];
  for (let i=0;i<3;i++){
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshStandardMaterial({ color: 0x2194f3 }));
    mesh.position.set(i*1.2-1.2, 0, 0);
    scene.add(mesh); objects.push(mesh);
  }

  const drag = new DragControls(objects, camera, renderer.domElement);
  drag.addEventListener('dragstart', ()=> controls.enabled = false);
  drag.addEventListener('dragend',   ()=> controls.enabled = true);

  function animate(){ renderer.render(scene, camera); requestAnimationFrame(animate); }
  animate();
</script>
```

### 4.2 Drag personnalisé sur un **plan monde**
```js
// Déplacement sur le plan XZ (y=const)
const planeY = new THREE.Plane(new THREE.Vector3(0,1,0), 0); // y=0
let dragging = null;

renderer.domElement.addEventListener('pointerdown', (e)=>{
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(scene.children, true)[0];
  if (hit) dragging = hit.object;
});

renderer.domElement.addEventListener('pointermove', (e)=>{
  if (!dragging) return;
  raycaster.setFromCamera(mouse, camera);
  const point = new THREE.Vector3();
  raycaster.ray.intersectPlane(planeY, point);
  dragging.position.set(point.x, dragging.position.y, point.z);
});

renderer.domElement.addEventListener('pointerup', ()=> dragging = null);
```

---

## ⌨️ 5. Événements clavier/souris/tactile : gestion unifiée

- **📘 Définition** : les *Pointer Events* unifient souris/tactile/stylet (`pointerdown`, `pointermove`, `pointerup`).
- **❓ Pourquoi ?** Éviter la duplication de logique, gérer multi-input.

### 5.1 Mapper les actions clavier
```js
const input = { forward:false, back:false, left:false, right:false };
const keymap = { 'KeyW':'forward', 'ArrowUp':'forward', 'KeyS':'back', 'ArrowDown':'back', 'KeyA':'left', 'ArrowLeft':'left', 'KeyD':'right', 'ArrowRight':'right' };

addEventListener('keydown', (e)=>{ const k = keymap[e.code]; if (k) input[k] = true; });
addEventListener('keyup',   (e)=>{ const k = keymap[e.code]; if (k) input[k] = false; });

// Exemple d’utilisation
function update(dt){
  const speed = 2.0;
  if (input.forward) camera.position.z -= speed * dt;
  if (input.back)    camera.position.z += speed * dt;
}
```

### 5.2 Wheel (zoom fin ou paramètres)
```js
renderer.domElement.addEventListener('wheel', (e)=>{
  e.preventDefault();
  // Exemple : changer l’exposition (Chap. 3)
  renderer.toneMappingExposure = Math.max(0.1, Math.min(2.0, renderer.toneMappingExposure + (e.deltaY<0? 0.05 : -0.05)));
}, { passive:false });
```

### 5.3 Tactile (gestes)
> ℹ️ `OrbitControls` gère déjà **pinch**, **pan** et **rotate** en pointer/touch; sinon, implémentez vos **gestes** (double-tap, long-press) via timers et delta.

---

## 🏗️ 6. Architecture d’interaction : séparer responsabilités

- **📘 Définition** : séparer **Input → Logique → Rendu** pour un code **maintenable**.
- **❓ Pourquoi ?** Facilite tests, évolutions et performance (moins de couplage).

**Schéma (Mermaid)**
```mermaid
flowchart LR
  A[Input (pointer, keyboard, wheel)] --> B[Contrôleurs (Orbit, Drag)]
  B --> C[Logique d'UI (sélection, état, panneaux)]
  C --> D[Mise à jour scène (matériaux, positions)]
  D --> E[Renderer]
```

**Exemple (pseudo-structure)**
```js
class InputLayer {
  constructor(canvas){ /* registre events */ }
  getState(){ /* renvoie état pointer/clavier */ }
}
class InteractionLayer {
  constructor(scene, camera){ /* raycast, sélection, drag */ }
  update(input){ /* applique logique selon l’état */ }
}
function loop(){
  const state = input.getState();
  interaction.update(state);
  controls.update(); renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
```

---

## 👀 7. Feedback visuel & accessibilité

- **Surbrillance** : `emissive` ou `outline` via post-traitement.
- **Curseur** : changer le **cursor CSS** (`grab`, `grabbing`, `pointer`).
- **Panneaux d’info** : overlay HTML avec **contraste** et **ARIA** (`role="status"`).
- **Clavier** : offrir **raccourcis** (ex. `R` = rotation, `G` = déplacement) et **focus** géré.

**Snippet**
```css
canvas { cursor: pointer; }
.hover { outline: 2px solid #66bb6a; }
```

---

## 🧪 8. Exemples complets

### 8.1 Modules : Orbit + Raycast + Surbrillance + Panneau
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Interaction</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } #info { position:fixed; top:8px; left:8px; padding:8px 12px; background:#222; color:#fff; border-radius:6px; font-family:system-ui; }</style>
</head>
<body>
<div id="info">Survolez/Cliquez un objet</div>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { OrbitControls } from 'https://esm.run/three@latest/examples/jsm/controls/OrbitControls.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121218);
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1.1); light.position.set(2,3,2); scene.add(light);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 }));
  plane.rotation.x = -Math.PI/2; plane.position.y = -0.6; scene.add(plane);

  const items = [];
  const colors = [0x2194f3, 0xff7043, 0x66bb6a];
  for (let i=0;i<3;i++){
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.9), new THREE.MeshStandardMaterial({ color: colors[i], roughness:0.5, metalness:0.2 }));
    m.position.set(i*1.4-1.4, 0.45, 0);
    m.userData.label = `Cube ${i+1}`;
    scene.add(m); items.push(m);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;

  function onPointerMove(e){
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  }
  renderer.domElement.addEventListener('pointermove', onPointerMove);

  const panel = document.getElementById('info');
  renderer.domElement.addEventListener('pointerdown', ()=>{
    raycaster.setFromCamera(mouse, camera);
    const ix = raycaster.intersectObjects(items, true);
    if (ix.length){ panel.textContent = ix[0].object.userData.label; }
  });

  function highlight(){
    raycaster.setFromCamera(mouse, camera);
    const ix = raycaster.intersectObjects(items, true);
    if (ix.length){
      const obj = ix[0].object;
      if (hovered !== obj){
        if (hovered) hovered.material.emissive?.setHex(0x000000);
        hovered = obj;
        obj.material.emissive?.setHex(0x222222);
        panel.textContent = `Survol : ${obj.userData.label}`;
      }
    } else {
      if (hovered) hovered.material.emissive?.setHex(0x000000);
      hovered = null; panel.textContent = 'Survolez/Cliquez un objet';
    }
  }

  function animate(){
    highlight();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
</script>
</body>
</html>
```

### 8.2 Drag sur plan XZ (Modules) + OrbitControls
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Drag</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { OrbitControls } from 'https://esm.run/three@latest/examples/jsm/controls/OrbitControls.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);
  const controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1.1); light.position.set(2,3,2); scene.add(light);
  const g = new THREE.GridHelper(10, 10); scene.add(g);

  const target = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color:0x2194f3 }));
  scene.add(target);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const planeY = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
  let dragging = false;

  function setMouse(e){
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left)/r.width)*2-1;
    mouse.y = -((e.clientY - r.top)/r.height)*2+1;
  }

  renderer.domElement.addEventListener('pointerdown', (e)=>{
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObject(target)[0];
    dragging = !!hit;
    if (dragging) controls.enabled = false;
  });
  renderer.domElement.addEventListener('pointermove', (e)=>{
    setMouse(e);
    if (!dragging) return;
    raycaster.setFromCamera(mouse, camera);
    const p = new THREE.Vector3(); raycaster.ray.intersectPlane(planeY, p);
    target.position.set(p.x, 0.5, p.z);
  });
  renderer.domElement.addEventListener('pointerup', ()=>{ dragging = false; controls.enabled = true; });

  function animate(){ controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate); }
  animate();
</script>
</body>
</html>
```

---

## 🧪 9. Exercices

1. **Changer les limites** d’`OrbitControls` (`minDistance`, `maxDistance`, `maxPolarAngle`) et expliquer l’effet.
2. **Créer un mode sélection** : clic pour **retenir** l’objet, seconde pression pour **libérer**.
3. **Implémenter un drag** sur un **plan incliné** (ex. normal `(0, 1, 1)` normalisée).
4. **Raycast par couches** : utilisez `object.layers.set(n)` et `raycaster.layers.set(n)` pour **filtrer**.
5. **Afficher un overlay** (HTML) avec **nom**, **position** et **distance caméra** de l’objet survolé.
6. **Ajouter un raccourci clavier** (ex. `Delete`) pour supprimer l’objet sélectionné.
7. **Throttle** le raycasting à **30 Hz** pour économiser CPU/GPU sur grandes scènes.

---

## 🧰 10. Bonnes pratiques

- **Une seule source d’état** (input) et une **mise à jour** par frame.
- **Limiter** les raycasts (ex. liste d’objets interactifs plutôt que `scene.children`).
- **Utiliser `emissive`** pour surbrillance, éviter de cloner matériau à chaque survol.
- **Réglages d’OrbitControls** : `enableDamping` pour confort; limiter angles/distances.
- **Accessibilité** : offrir **clavier** et **indicateurs visuels**; gérer focus.
- **Performance** : regrouper les objets interactifs, activer **culling**, **instancing** si pertinent.

---

## ✅ 11. Résumé des points essentiels (Chapitre 7)

- **OrbitControls** donne une **navigation** prête à l’emploi (orbite/zoom/pan) avec **damping**.
- **Raycaster** transforme le **pointer** en rayon (via **NDC**) pour détecter **intersections**.
- Les **Pointer Events** unifient souris/tactile/stylet; **wheel** et **keyboard** complètent l’input.
- Le **drag** peut s’appuyer sur `DragControls` ou un **plan** d’intersection personnalisé.
- Une **architecture Input → Logique → Rendu** simplifie la **maintenance** et les **tests**.
- **Feedback** (emissive/overlay/cursor) + **accessibilité** = meilleure UX; pensez **performance** (moins de raycasts, couches).

---

## 🔭 12. Prochaines étapes

- **Chapitre 8 : Animation et Physique** — créer des animations (boucle, timelines GSAP) et introduire des notions physiques (intégration simple, forces).

