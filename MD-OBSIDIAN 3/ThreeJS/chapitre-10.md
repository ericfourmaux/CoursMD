
# ⚙️ **Chapitre 10 — Optimisation et Bonnes Pratiques**

> 👨‍🏫 *Objectif :* apprendre à **optimiser les performances** d’une scène Three.js : réduire les **draw calls**, maîtriser **textures** et **ombres**, utiliser **InstancedMesh**, **LOD**, **culling**, régler le **renderer**, profiler (🧪 `renderer.info`, DevTools, Spector.js), gérer la **mémoire** (`dispose()`), et structurer un **code maintenable**. Ce chapitre propose des **formules JS**, des **schémas Mermaid**, des **exemples complets**, des **exercices** et un **résumé**.

---

## 🧩 1. Principes clés de performance

- **📘 Définition**
  - Un **frame** doit être rendu en **≤ 16.67 ms** pour du **60 FPS** (≈ 33.33 ms pour 30 FPS).
  - Les coûts principaux : **draw calls** (changements d’état GPU), **géométrie** (triangles), **textures** (taille, filtres), **ombres**, **post-traitement**.

- **❓ Pourquoi ?**
  - Un framerate stable assure une **expérience fluide** ; la latence d’interaction diminue.

- **🔶 Analogie**
  - Pensez au **service d’un restaurant** : plus il y a de plats (objets) et de changements de recette (matériaux), plus le service ralentit. Les **draw calls** sont les **bons** passés à la cuisine — limitez-les.

**Formules JS utiles**
```js
const msPerFrame = 1000 / 60; // ~16.67 ms
const fpsFromMs = (ms) => 1000 / ms;
const budget = 16.67; // cible 60 FPS
```

---

## 🔻 2. Réduire les draw calls

### 2.1 Réutiliser matériaux & géométries
- Éviter de créer de nouveaux **matériaux** à chaque objet si l’apparence est identique.
- **Réutiliser** la même **géométrie** pour des objets clones.

```js
const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const mat = new THREE.MeshStandardMaterial({ color: 0x66bb6a });
for (let i=0;i<200;i++){
  const m = new THREE.Mesh(geo, mat);
  m.position.set(Math.random()*10-5, Math.random(), Math.random()*10-5);
  scene.add(m);
}
```

### 2.2 Fusionner des géométries (même matériau)
> ℹ️ Utiliser `BufferGeometryUtils.mergeGeometries` (module des exemples) pour **un seul draw call**.
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { BufferGeometryUtils } from 'https://esm.run/three@latest/examples/jsm/utils/BufferGeometryUtils.js';

  const g1 = new THREE.BoxGeometry(1,1,1);
  const g2 = new THREE.SphereGeometry(0.6, 16, 12);
  const merged = BufferGeometryUtils.mergeGeometries([g1, g2]);
  const mesh = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ color: 0x2194f3 }));
  scene.add(mesh);
</script>
```

### 2.3 Instancing (`THREE.InstancedMesh`)
- **📘** Dessiner **N** instances **avec 1 draw call** si la **géométrie** et le **matériau** sont identiques.
- **Exemple** : champ d’arbres.
```js
const count = 2000;
const trunkGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
const forest = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
const dummy = new THREE.Object3D();
for (let i=0;i<count;i++){
  dummy.position.set((Math.random()-0.5)*50, 0, (Math.random()-0.5)*50);
  dummy.rotation.y = Math.random()*Math.PI*2;
  dummy.updateMatrix();
  forest.setMatrixAt(i, dummy.matrix);
}
forest.instanceMatrix.needsUpdate = true;
scene.add(forest);
```

> 💡 On peut utiliser `setColorAt(i, color)` pour des **variations** par instance.

---

## 🧱 3. Géométrie : polygones & LOD

- **Réduire les segments** des primitives éloignées.
- **LOD (`THREE.LOD`)** : différents niveaux **simple → détaillé** selon la distance caméra.
```js
const lod = new THREE.LOD();
lod.addLevel(new THREE.Mesh(new THREE.BoxGeometry(1,1,1, 2,2,2), mat), 50);
lod.addLevel(new THREE.Mesh(new THREE.BoxGeometry(1,1,1, 8,8,8), mat), 15);
lod.addLevel(new THREE.Mesh(new THREE.BoxGeometry(1,1,1, 32,32,32), mat), 0);
scene.add(lod);
```

- **`drawRange`** : dessiner une partie de la géométrie.
```js
geometry.setDrawRange(0, someCount); // indices
```

---

## 🎨 4. Textures : taille, filtres, color space

- **Power-of-two** (512, 1024) pour mipmaps & wrap.
- **Filtrage** : `LinearMipmapLinearFilter` en minification, `LinearFilter` en magnification.
- **Anisotropie** : valeurs raisonnables (4–8).
- **Compression KTX2** : réduire VRAM & bande passante.
- **Color space** : `texture.colorSpace = THREE.SRGBColorSpace` pour **couleurs** ; linéaire pour **données**.

```js
texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
```

---

## 💡 5. Lumières & ombres : coût et réglages

- Limiter le **nombre de lumières** coûteuses (shadows).
- **DirectionalLight** avec shadow souvent **suffisant**.
- **mapSize** raisonnable (1024) ; ajuster **frustum** pour la netteté.
- Désactiver `castShadow`/`receiveShadow` là où inutile.
- **ShadowMaterial** pour sol d’ombres semi-transparent.

```js
renderer.shadowMap.enabled = true;
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
Object.assign(light.shadow.camera, { left:-3, right:3, top:3, bottom:-3, near:0.5, far:20 });
```

---

## 🧭 6. Culling : ne pas dessiner ce qui ne se voit pas

- **Frustum culling** (automatique via bounding sphere/box).
- **Occlusion** : non géré nativement ; simuler via **portails**, **zones** ou règles (ex. cacher les objets derrière murs).
- Attention aux objets dont la **bbox** ne suit pas la géométrie (géométrie dynamique → recalculer).
```js
mesh.frustumCulled = true; // (par défaut)
geometry.computeBoundingSphere();
```

---

## 🖥️ 7. Réglages du renderer

- **Pixel ratio** : `Math.min(devicePixelRatio, 2)`.
- **Antialias** : `antialias:true` au **canvas** (MSAA) — coût modéré.
- **powerPreference** : `'high-performance'`.
- **toneMapping** : ACES Filmic ; **exposure** raisonnable.

```js
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

---

## 🧪 8. Profiler : mesurer pour améliorer

### 8.1 `renderer.info`
```js
console.table(renderer.info);
// renderer.info.render.calls (draw calls), triangles, points, lines
```

### 8.2 DevTools Performance
- **Enregistrer** une session, inspecter **Main Thread**, **GPU**, **Layout**.

### 8.3 Spector.js (inspection WebGL)
- Capture **draw calls**, **textures**, **programmes**.

**Overlay FPS (JS)**
```js
let last = performance.now();
let fps = 0;
function loop(){
  const now = performance.now();
  const dt = now - last; last = now;
  fps = 1000 / dt; // approx.
  // render...
  requestAnimationFrame(loop);
}
loop();
```

---

## 🧼 9. Mémoire : créer peu, disposer bien

- **Dispose** : `geometry.dispose()`, `material.dispose()`, `texture.dispose()`.
- **Retirer** listeners & `remove(object)` côté scène.
- Réutiliser **Vector3**, **Box3** (éviter allocations en boucle).

```js
function clearObject(obj){
  obj.traverse((o)=>{
    if (o.geometry) o.geometry.dispose();
    if (o.material){
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material.dispose();
    }
    if (o.texture) o.texture.dispose?.();
  });
  scene.remove(obj);
}
```

---

## 🏗️ 10. Architecture : séparer & modulariser

- **Input → Logique → Rendu** (cf. Chapitre 7).
- **Fichiers** : `renderer.js`, `scene.js`, `controls.js`, `assets.js`.
- **ES Modules** : imports explicites.
- **Patrons** : `SceneManager`, `AssetManager`, `Systems` (*update* par frame).

**Schéma (Mermaid)**
```mermaid
flowchart TD
  A[AssetManager] -->|load glTF/textures| B[Scene]
  C[InputLayer] --> D[Interaction]
  D --> E[Systems (Animation/Physics)]
  E --> F[Renderer]
```

---

## 🧪 11. Exemple complet : forêt instanciée + LOD + culling

### Modules
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Optimisation</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { LOD } from 'https://esm.run/three@latest/src/objects/LOD.js';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 2, 8);

  const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1.0); light.position.set(2,4,2); light.castShadow = false; scene.add(light);
  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.5));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 }));
  ground.rotation.x = -Math.PI/2; scene.add(ground);

  // LOD : billboard (plane) loin, mesh simple proche
  const matTree = new THREE.MeshStandardMaterial({ color:0x66bb6a });
  const leafLow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), matTree);
  const leafMid = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 8), matTree);
  const trunkGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color:0x8d6e63 });

  const treeCount = 2000;
  const instTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const dummy = new THREE.Object3D();
  for (let i=0; i<treeCount; i++){
    const x = (Math.random()-0.5)*120;
    const z = (Math.random()-0.5)*120;
    dummy.position.set(x, 0, z);
    dummy.updateMatrix();
    instTrunk.setMatrixAt(i, dummy.matrix);
  }
  scene.add(instTrunk);

  // LOD objets (non instanciés ici, démo ponctuelle)
  const treeLOD = new LOD();
  treeLOD.addLevel(leafMid, 40); // moyen
  treeLOD.addLevel(leafLow, 100); // loin
  scene.add(treeLOD);

  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    treeLOD.update(camera);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
</script>
</body>
</html>
```

---

## 🧪 12. Exercices

1. **Comparer InstancedMesh vs Mesh** (2000 objets) et mesurer `renderer.info.render.calls`.
2. **Ajouter LOD** à des bâtiments (cube détaillé proche, cube simple loin).
3. **Limiter `anisotropy`** et observer la netteté/performances.
4. **Réduire `shadow.mapSize`** (2048 → 1024) et ajuster le frustum pour garder une **ombre nette**.
5. **Compresser les textures** en **KTX2** et mesurer le gain de **VRAM**.
6. **Profiler avec Spector.js** : identifier les draw calls dominants et regrouper par matériau.
7. **Mettre en place `dispose()`** sur un changement de scène et vérifier l’absence de fuites.

---

## 🧰 13. Bonnes pratiques

- **Minimiser les draw calls** : réutilisation, fusion, instancing.
- **Textures** : **POT**, mipmaps, filtre **Linear**, anisotropie modérée, **KTX2**.
- **Ombres** : une source principale, frustum serré, `mapSize` raisonnable.
- **Renderer** : DPR plafonné, `powerPreference:'high-performance'`.
- **Culling/LOD** : cacher hors champ, niveau de détail adaptatif.
- **Profiling** : mesurer avant d’optimiser.
- **Mémoire** : `dispose()` systématique, pas d’allocations en boucle.
- **Architecture** : modules, séparation des responsabilités.

---

## ✅ 14. Résumé des points essentiels (Chapitre 10)

- La performance se gagne surtout sur les **draw calls** et la **gestion des textures/shadows**.
- **InstancedMesh** et **fusion** réduisent fortement le coût GPU.
- **LOD**, **culling**, **DPR** plafonné et **renderer** bien réglé = scènes **fluides**.
- **Profiler** (renderer.info/DevTools/Spector) pour cibler les vrais **goulots**.
- **Dispose** et **architecture modulaire** assurent un projet **durable**.

---

## 🔭 15. Prochaines étapes

- **Chapitre 11 : Projet Final** — assembler une mini‑scène interactive complète : textures PBR, contrôles, modèles glTF, optimisations et interactions.

