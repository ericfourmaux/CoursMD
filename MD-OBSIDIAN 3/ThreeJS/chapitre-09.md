
# 📦 **Chapitre 9 — Chargement de modèles 3D**

> 👨‍🏫 *Objectif :* apprendre à **importer** des modèles 3D dans Three.js (GLTF/GLB recommandé, OBJ/MTL, STL), gérer les **matériaux PBR**, les **animations** (skeletal, morph), l’**éclairage d’environnement**, et mettre en place une **pipeline d’assets** performante (Draco, Meshopt, KTX2). Vous verrez aussi l’**organisation** des fichiers, les **unités/axes**, le **progress** de chargement, et des **exemples complets**.

---

## 🧩 1. Formats de modèles

- **📘 Définition**
  - **GLTF/GLB** : format moderne (PBR, animations, caméras, lights), **GLB** = binaire monofichier.
  - **OBJ/MTL** : géométrie + matériaux simples (sans PBR), pas d’animations.
  - **STL** : maillage brut (triangles), sans matériaux.

- **❓ Pourquoi GLTF/GLB ?**
  - Standard **web** performant, inclut **textures PBR**, **animations**, **nœuds**, **extensions** (Draco/Meshopt/KTX2). Simplifie l’intégration.

- **🔶 Analogie**
  - Pensez à **GLB** comme à un **conteneur ZIP** autoportant (modèle + textures + animations). OBJ est plutôt un **lot de fichiers** séparés.

---

## 🛠️ 2. Chargement avec `GLTFLoader`

### 2.1 Modules (recommandé)
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { GLTFLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/GLTFLoader.js';
  import { DRACOLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/DRACOLoader.js';
  import { MeshoptDecoder } from 'https://esm.run/three@latest/examples/jsm/libs/meshopt_decoder.module.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 3);

  // IBL de base (voir Chapitre 5 pour PMREM/HDR)
  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.5));
  const dir = new THREE.DirectionalLight(0xffffff, 1); dir.position.set(2,3,2); scene.add(dir);

  const loader = new GLTFLoader();
  // Draco : si le modèle est compressé
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/'); // dossier des décoders
  loader.setDRACOLoader(draco);
  // Meshopt : si le modèle est optimisé Meshopt
  loader.setMeshoptDecoder(MeshoptDecoder);

  loader.load('/assets/models/robot.glb', (gltf) => {
    const root = gltf.scene; // racine glTF
    scene.add(root);

    // Si le fichier contient des animations
    if (gltf.animations && gltf.animations.length){
      const mixer = new THREE.AnimationMixer(root);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      // Boucle d’animation
      const clock = new THREE.Clock();
      function animate(){
        const dt = Math.min(clock.getDelta(), 0.05);
        mixer.update(dt);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    } else {
      // Boucle simple si pas d’animation
      function animate(){
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    }
  });

  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
</script>
```

> ℹ️ Les chemins `/draco/` et `/assets/models/…` dépendent de votre **structure de projet**.

### 2.2 Progression et erreurs (`LoadingManager`)
```js
const manager = new THREE.LoadingManager();
manager.onStart = () => console.log('⏳ Chargement…');
manager.onProgress = (url, loaded, total) => console.log(`📥 ${loaded}/${total} : ${url}`);
manager.onError = (url) => console.error('❌ Erreur :', url);

const loader = new GLTFLoader(manager);
loader.load('/assets/models/scene.glb', (gltf) => { scene.add(gltf.scene); }, undefined, (err) => {
  console.error('Chargement glTF échoué', err);
});
```

---

## 🎨 3. Matériaux PBR & textures dans glTF

- **📘 Définition**
  - glTF utilise des **matériaux PBR** (Metal-Rough workflow). Les textures sont souvent **intégrées** (GLB) ou **référencées**.

- **❓ Pourquoi ?**
  - Assure une **cohérence** visuelle et une compatibilité avec les outils DCC (Blender, Maya…).

**Ajuster un matériau après chargement**
```js
root.traverse((obj)=>{
  if (obj.isMesh && obj.material && obj.material.isMeshStandardMaterial){
    obj.material.envMapIntensity = 1.0; // si scene.environment est défini
    obj.material.roughness = Math.min(0.9, obj.material.roughness);
    obj.material.metalness = obj.material.metalness; // laisser tel quel sauf besoin
  }
});
```

> 💡 *Tip* : pour un rendu PBR **crédible**, définissez `scene.environment` via **PMREM** (Chapitre 5).

---

## 🎞️ 4. Animations glTF : `AnimationMixer`

- **📘 Définition** : glTF peut contenir des **clips d’animation** (skeletal/morph). `THREE.AnimationMixer` joue et mélange ces clips.
- **❓ Pourquoi ?** Orchestrer les **mouvements** d’un personnage/objet : idle, walk, run.

**Exemple : basculer entre deux animations**
```js
const mixer = new THREE.AnimationMixer(gltf.scene);
const idle = mixer.clipAction(gltf.animations.find(a => a.name==='Idle'));
const walk = mixer.clipAction(gltf.animations.find(a => a.name==='Walk'));
idle.play();

// Switch (cross-fade)
function toWalk(){
  walk.reset().play();
  idle.crossFadeTo(walk, 0.6, false);
}
```

**Formule utile (JS) : normaliser un temps**
```js
// Convertir des ms en secondes et clamp 0..1
const msTo01 = (ms, totalMs) => Math.min(1, Math.max(0, (ms/1000) / (totalMs/1000)));
```

---

## 🧭 5. Unités, axes et échelle

- **📘 Principes**
  - glTF recommande **mètre** comme unité ; Three.js n’impose pas d’unité, mais gardez une **cohérence**.
  - Axes : glTF et Three.js sont **Y-up** ; certains DCC/exporters peuvent utiliser **Z-up**.

**Adapter l’échelle/rotation au chargement**
```js
loader.load('/assets/models/tree.glb', (gltf)=>{
  const node = gltf.scene;
  node.scale.setScalar(0.01); // convertir cm -> m, si l’exporteur a utilisé cm
  // Si Z-up :
  node.rotation.x = -Math.PI/2; // bascule Z-up -> Y-up
  scene.add(node);
});
```

**Formule JS : centre et cadrage**
```js
// Récupérer la bbox pour centrer et cadrer
const box3 = new THREE.Box3().setFromObject(node);
const size = new THREE.Vector3();
const center = new THREE.Vector3();
box3.getSize(size); box3.getCenter(center);
node.position.sub(center); // centre à l’origine
// placer la caméra
const fitOffset = 1.2;
const maxDim = Math.max(size.x, size.y, size.z);
const fov = THREE.MathUtils.degToRad(camera.fov);
const dist = (maxDim/2) / Math.tan(fov/2) * fitOffset;
camera.position.set(center.x, center.y + maxDim*0.2, center.z + dist);
camera.lookAt(0,0,0);
```

---

## 🧱 6. Autres chargeurs : OBJ/MTL, STL

### 6.1 OBJ + MTL
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { MTLLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/MTLLoader.js';
  import { OBJLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/OBJLoader.js';

  const mtl = new MTLLoader().load('/assets/models/car.mtl', (materials)=>{
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('/assets/models/car.obj', (obj)=>{ scene.add(obj); });
  });
</script>
```

### 6.2 STL
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { STLLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/STLLoader.js';

  const stlLoader = new STLLoader();
  stlLoader.load('/assets/models/part.stl', (geometry)=>{
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color:0x66bb6a }));
    scene.add(mesh);
  });
</script>
```

> ℹ️ OBJ/STL ne portent **pas** les matériaux PBR modernes et **aucune animation**.

---

## ⚡ 7. Optimisation des assets : Draco, Meshopt, KTX2

- **📘 Définition**
  - **Draco** : compression **géométrie** (positions, indices) → fichiers plus petits.
  - **Meshopt** : compression/optimisation **maillage** (réordonnancement), supportée par glTF.
  - **KTX2** : compression **textures** moderne multi-GPU.

- **❓ Pourquoi ?**
  - Réduit le **temps de téléchargement** et la **mémoire**, accélère le **rendu**.

**KTX2 (aperçu) — textures PBR compressées**
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { KTX2Loader } from 'https://esm.run/three@latest/examples/jsm/loaders/KTX2Loader.js';

  const renderer = new THREE.WebGLRenderer();
  const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
  const baseColor = await ktx2.loadAsync('/assets/wood_basecolor.ktx2');
  baseColor.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: baseColor });
```

**Draco/Meshopt dans glTF** : déjà couvert dans la config `GLTFLoader`.

---

## 🧭 8. Pipeline d’assets & organisation

**Schéma (Mermaid)**
```mermaid
flowchart LR
  A[Outil DCC (Blender/Maya)] --> B[Export glTF/GLB]
  B --> C[Compression (Draco/Meshopt, KTX2)]
  C --> D[CDN / /assets]
  D --> E[Chargement via GLTFLoader]
  E --> F[Post-traitement (materials, envMap, scale)]
  F --> G[AnimationMixer / Scene]
```

**Arborescence conseillée**
```
project/
  public/
    assets/
      models/
        robot.glb
        tree.glb
      textures/
        wood_basecolor.ktx2
        wood_normal.ktx2
      hdr/
        studio.hdr
      draco/
        draco_decoder.js
        draco_wasm_wrapper.js
        draco_decoder.wasm
```

---

## 🧪 9. Exemple guidé : charger un modèle PBR animé avec IBL

### Modules
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — GLTF animé + IBL</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { GLTFLoader } from 'https://esm.run/three@latest/examples/jsm/loaders/GLTFLoader.js';
  import { RGBELoader } from 'https://esm.run/three@latest/examples/jsm/loaders/RGBELoader.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.3, 3.2);

  // PMREM IBL
  const pmrem = new THREE.PMREMGenerator(renderer);
  new RGBELoader().load('/assets/hdr/studio.hdr', (hdr)=>{
    const envMap = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = envMap;
    hdr.dispose(); pmrem.dispose();
  });

  let mixer; const clock = new THREE.Clock();
  const loader = new GLTFLoader();
  loader.load('/assets/models/robot.glb', (gltf)=>{
    const root = gltf.scene;
    scene.add(root);
    // Animation
    mixer = new THREE.AnimationMixer(root);
    gltf.animations.forEach((clip, i)=>{
      const action = mixer.clipAction(clip);
      if (i===0) action.play();
    });
    // Centrage
    const box = new THREE.Box3().setFromObject(root);
    const c = box.getCenter(new THREE.Vector3());
    root.position.sub(c);
  });

  function animate(){ const dt = Math.min(clock.getDelta(), 0.05); mixer?.update(dt); renderer.render(scene, camera); requestAnimationFrame(animate); }
  animate();

  addEventListener('resize', ()=>{ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
</script>
</body>
</html>
```

---

## 🧪 10. Exercices

1. **Activer Draco** : compresser un GLB (via Blender + glTF-Draco) et mesurer la différence de taille/temps de chargement.
2. **Meshopt** : exporter un GLB optimisé et comparer le nombre de triangles/draw calls.
3. **KTX2** : convertir les textures du modèle en KTX2 et vérifier la **VRAM** utilisée.
4. **Mixer** : charger un modèle avec **2 animations** (Idle/Walk) et implementer un **cross-fade**.
5. **Cadrage automatique** : écrire une fonction `frameObject(object, camera)` qui positionne la caméra pour **encadrer** le modèle.
6. **Changer d’unités** : simuler une conversion **cm → m** en ajustant `scale`.
7. **Z-up → Y-up** : si le modèle est inversé, appliquer la **rotation** adéquate.

---

## 🧰 11. Bonnes pratiques

- Préférez **GLTF/GLB** pour le web ; évitez OBJ/STL pour scènes interactives réalistes.
- Servez les assets via un **serveur** local/CDN ; gérez **CORS**.
- Utilisez **PMREM** pour des **reflets PBR** crédibles.
- Intégrez **Draco/Meshopt/KTX2** pour réduire latence et VRAM.
- **Traversez** la scène (`scene.traverse`) pour ajuster matériaux, frustum, `castShadow/receiveShadow`.
- Évitez d’allouer dans la boucle ; pré-créez `Box3`, `Vector3` pour le cadrage.

---

## ✅ 12. Résumé des points essentiels (Chapitre 9)

- **GLTF/GLB** est le format recommandé (PBR, animations, ext. de compression).
- `GLTFLoader` + **Draco/Meshopt** chargent efficacement des modèles **compressés**.
- Les **matériaux PBR** s’intègrent avec **IBL/PMREM** pour un rendu réaliste.
- `AnimationMixer` joue les **clips glTF** et permet **cross-fades**.
- Soignez **unités/axes/échelle** et faites un **cadrage auto** via **bbox**.
- **KTX2** compresse les textures ; structurez une **pipeline d’assets** propre.

---

## 🔭 13. Prochaines étapes

- **Chapitre 10 : Optimisation et Bonnes Pratiques** — draw calls, instancing, batching, profiling, architecture.

