
# 💡 **Chapitre 5 — Lumières et Ombres**

> 👨‍🏫 *Objectif :* comprendre et maîtriser l’**éclairage** dans Three.js : les **types de lumières**, les réactions des **matériaux** (Lambert/Phong/PBR), la **configuration des ombres** (shadow maps, bias, normalBias, frustum, mapSize, types), l’**éclairage d’environnement (IBL)**, les **helpers** pour le debug, et un **exemple guidé** complet avec exercices.

---

## 🧩 1. Pourquoi la lumière est essentielle

- **📘 Définition**
  - Une **lumière** détermine comment les surfaces sont **illuminées**. Sans lumière, les matériaux réalistes restent noirs (sauf `MeshBasicMaterial`, qui est non-éclairé).
- **❓ Pourquoi ?**
  - La lumière révèle le **volume** (ombres, reflets), donne de la **profondeur**, et guide le **regard** de l’utilisateur.
- **🔶 Analogie**
  - Comme en **photographie** : modifier une lampe/l’orientation change complètement l’ambiance et la lecture de la scène.

---

## 🔦 2. Types de lumières dans Three.js

### 2.1 `AmbientLight`
- **Usage :** lumière **uniforme** sans direction (remplit les ombres de manière globale).
- **Exemple :**
```js
const ambient = new THREE.AmbientLight(0xffffff, 0.2); // faible remplissage
scene.add(ambient);
```

### 2.2 `HemisphereLight`
- **Usage :** lumière ambiante **bicolore** (ciel/sol), utile pour donner un ton naturel.
```js
const hemi = new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.6); // sky, ground, intensity
scene.add(hemi);
```

### 2.3 `DirectionalLight`
- **Usage :** source **directionnelle** (comme le soleil), produit des ombres **parallèles**.
```js
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(2, 4, 2);
scene.add(dir);
```

### 2.4 `PointLight`
- **Usage :** lumière **ponctuelle** (ampoule), rayonne dans toutes les directions, ombres **radiales**.
```js
const point = new THREE.PointLight(0xffffff, 1.0, 20, 2); // color, intensity, distance, decay
point.position.set(0, 3, 0);
scene.add(point);
```

### 2.5 `SpotLight`
- **Usage :** **projecteur** (cône), direction + **angle** + **pénombre**.
```js
const spot = new THREE.SpotLight(0xffffff, 1.2);
spot.position.set(3, 4, 1);
spot.angle = Math.PI / 6;     // ouverture du cône
spot.penumbra = 0.2;          // adoucit le bord
spot.decay = 2; spot.distance = 30;
scene.add(spot);
```

### 2.6 `RectAreaLight` (avancé)
- **Usage :** panneau lumineux **rectangulaire**, réaliste pour zones émissives (néons, fenêtres). Fonctionne avec **MeshStandard/Physical**.
- **Note :** nécessite l’uniform library des exemples.
```js
// Modules (exemples) : importer puis initialiser la lib
// import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
// RectAreaLightUniformsLib.init();
const rect = new THREE.RectAreaLight(0xffffff, 5.0, 1.5, 0.8); // color, intensity, width, height
rect.position.set(-1, 2, 1);
rect.lookAt(0, 0, 0);
scene.add(rect);
```

---

## 🎨 3. Comment les matériaux réagissent à la lumière

### 3.1 Lambert & Phong (rappels)
- **Lambert (diffus)** : intensité ∝ `max(dot(N, L), 0)`
- **Phong/Blinn-Phong (spéculaire)** : intensité ∝ `pow(max(dot(N, H), 0), shininess)`

**Formules JS pédagogiques**
```js
// N: normale, L: direction lumière, V: direction vue, H: half-vector = normalize(L+V)
function lambert(N, L) {
  return Math.max(N.dot(L), 0.0);
}
function blinnPhong(N, L, V, shininess) {
  const H = new THREE.Vector3().addVectors(L.clone().normalize(), V.clone().normalize()).normalize();
  return Math.pow(Math.max(N.dot(H), 0.0), shininess);
}
```

### 3.2 PBR (MeshStandard/Physical)
- **Idée :** modèle **micro-facettes (Cook–Torrance)** ; paramètres : `roughness` (rugosité) & `metalness` (métallique).
- **Pourquoi ?** Rendu **cohérent** & **réaliste**, s’intègre avec les assets **GLTF** et l’éclairage d’**environnement**.

**Exemple**
```js
const pbr = new THREE.MeshStandardMaterial({
  color: 0xff8855,
  roughness: 0.35,
  metalness: 0.2,
});
```

> ℹ️ Avec PBR, les **textures** (normal/roughness/metalness/ao) et l’**environment map** jouent un grand rôle.

---

## 🌑 4. Ombrage (shadows) : configuration complète

### 4.1 Activer les ombres
```js
renderer.shadowMap.enabled = true;                            // activer le système
renderer.shadowMap.type = THREE.PCFSoftShadowMap;            // type de filtrage

light.castShadow = true;                                     // lumières séléctionnées
mesh.castShadow = true;                                      // objets qui projettent
receiver.receiveShadow = true;                               // objets qui reçoivent
```

### 4.2 Taille & caméra de l’ombre
- **mapSize** : résolution du shadow map (puissance de 2 : 512, 1024, 2048…)
- **shadow camera** (Directionnelle/Spot) : ajuster le **frustum** pour cadrer les zones utiles et augmenter la **netteté**.

```js
// DirectionalLight : caméra d'ombre orthographique
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.castShadow = true;
dir.shadow.mapSize.set(1024, 1024);
// Frustum de la shadow camera
const s = 4; // demi-largeur/hauteur utile
Object.assign(dir.shadow.camera, {
  left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 20,
});
// Aide visuelle
const helper = new THREE.CameraHelper(dir.shadow.camera);
scene.add(helper);
```

```js
// SpotLight : caméra d'ombre perspective
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
spot.shadow.camera.near = 0.5;
spot.shadow.camera.far = 50;
```

### 4.3 Éviter l’acné & les "peter-panning"
- **Shadow acne** : artefacts mouchetés ; corriger avec **`bias`** ou **`normalBias`**.
```js
// Petite marge pour éloigner l'ombre de la surface
light.shadow.bias = -0.0001;        // décalage constant
light.shadow.normalBias = 0.02;     // dépend de la normale (efficace sur PBR)
```
- **Peter-panning** : ombre "décollée" — diminuer `bias/normalBias` ou affiner le frustum.

### 4.4 Types de shadowMap
- `BasicShadowMap` : rapide, qualité faible.
- `PCFShadowMap` : filtre PCF (plus doux).
- `PCFSoftShadowMap` : PCF adouci (souvent un bon compromis).
- `VSMShadowMap` : **Variance Shadow Maps** (plus doux, peut nécessiter réglages) — selon la version de Three.js.

### 4.5 Receveur d’ombre transparent
```js
// Recevoir une ombre sur un "sol" semi-transparent
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10,10), shadowMat);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);
```

---

## 🧭 5. Helpers & Debug

```js
// Visualiser la direction/position
scene.add(new THREE.DirectionalLightHelper(dir, 0.5));
scene.add(new THREE.PointLightHelper(point, 0.3));
scene.add(new THREE.SpotLightHelper(spot));
scene.add(new THREE.HemisphereLightHelper(hemi, 0.5));

// Frustum de la shadow camera
scene.add(new THREE.CameraHelper(dir.shadow.camera));
```

**Schéma (Mermaid) — pipeline de l’ombre**
```mermaid
flowchart LR
  A[Objet (castShadow)] --> B[Shadow Map (vue depuis la lumière)]
  C[Receveur (receiveShadow)] --> D[Compositing en écran]
  B --> D
```

---

## 🌍 6. Éclairage d’environnement (IBL) — HDR & PMREM

- **📘 Définition** : l’**Image-Based Lighting** utilise une **cubemap/HDR** pour éclairer la scène (reflets/diffus réalistes).
- **❓ Pourquoi ?**
  - Donne un **contexte lumineux** cohérent (ex : intérieur studio, extérieur nuageux) et améliore nettement le rendu PBR.

**Exemple (Modules) : charger un HDR et l’utiliser comme environnement**
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { RGBELoader } from 'https://esm.run/three@latest/examples/jsm/loaders/RGBELoader.js';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0,1.2,3);

  // PMREM pour préfiltrer l'environnement (roughness)
  const pmrem = new THREE.PMREMGenerator(renderer);

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .load('path/to/studio.hdr', (hdr) => {
      const envMap = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = envMap;     // IBL pour matériaux PBR
      scene.background = envMap;      // Optionnel : utiliser aussi en fond
      hdr.dispose(); pmrem.dispose();
    });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 64, 32),
    new THREE.MeshStandardMaterial({ metalness: 1.0, roughness: 0.2, color: 0xffffff })
  );
  scene.add(mesh);

  function animate(){
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
</script>
```

> ℹ️ Sans PMREM, les reflets peuvent paraître **bruts**. PMREM génère des versions **pré-filtrées** pour les différents niveaux de rugosité.

---

## 🧪 7. Exemple guidé : lumière directionnelle + ombres nettes

### Variante CDN
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Lumières & Ombres</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script src="https://unpkg.com/three@latest/build/three.min.js"></script>
<script>
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0f13);

  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Sol recevant l'ombre
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 })
  );
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.6; ground.receiveShadow = true; scene.add(ground);

  // Objet qui projette
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({ color:0x2194f3, roughness:0.4, metalness:0.2 })
  );
  cube.position.set(0,0,0); cube.castShadow = true; scene.add(cube);

  // Lumière directionnelle réglée
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(2, 4, 2);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  const s = 3;
  Object.assign(dir.shadow.camera, { left:-s, right:s, top:s, bottom:-s, near:0.5, far:20 });
  dir.shadow.bias = -0.0001;
  dir.shadow.normalBias = 0.02;
  scene.add(dir);

  const helper = new THREE.CameraHelper(dir.shadow.camera);
  scene.add(helper);

  const ambient = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambient);

  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    cube.rotation.y += 0.8*dt;
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

### Variante Modules (avec helpers de lumières)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Lumières & Ombres (Modules)</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121218);
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 }));
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.6; ground.receiveShadow = true; scene.add(ground);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 16), new THREE.MeshStandardMaterial({ color:0x00c853, roughness:0.35, metalness:0.2 }));
  sphere.position.set(-1.2, 0.6, 0); sphere.castShadow = true; scene.add(sphere);

  const box = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshStandardMaterial({ color:0xff7043, roughness:0.5, metalness:0.1 }));
  box.position.set(1.2, 0.4, 0); box.castShadow = true; scene.add(box);

  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(2, 4, 2);
  dir.castShadow = true; dir.shadow.mapSize.set(1024,1024);
  const s = 3; Object.assign(dir.shadow.camera, { left:-s, right:s, top:s, bottom:-s, near:0.5, far:20 });
  dir.shadow.bias = -0.0001; dir.shadow.normalBias = 0.02;
  scene.add(dir);

  scene.add(new THREE.DirectionalLightHelper(dir, 0.5));
  scene.add(new THREE.CameraHelper(dir.shadow.camera));
  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.3));

  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    sphere.rotation.y += 0.6*dt; box.rotation.y += 0.8*dt;
    renderer.render(scene, camera); requestAnimationFrame(animate);
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

## 🧪 8. Exercices

1. **Varier `shadowMap.type`** et mesurer l’impact visuel/performance.
2. **Ajuster le frustum** de la shadow camera et comparer la netteté.
3. **Introduire un SpotLight** avec `penumbra` et visualiser son helper.
4. **Créer un sol transparent d’ombre** avec `ShadowMaterial` et un objet coloré au-dessus.
5. **Ajouter un HDR** via `RGBELoader` + `PMREMGenerator` et observer les reflets sur une sphère métallique.

---

## 🧰 9. Bonnes pratiques

- **Limiter `mapSize`** (ex. 1024) et ajuster le **frustum** pour cibler la zone utile.
- Utiliser **`normalBias`** plutôt que des `bias` trop grands pour éviter le "peter-panning".
- **Équilibrer** les lumières : éviter de cumuler Ambient trop fort avec Directional (scène "lavée").
- Préférer **PBR** (`MeshStandard/Physical`) pour scènes réalistes et compatible IBL.
- **PMREM** obligatoire pour un IBL de qualité (sinon reflets non filtrés).
- **Helpers** (LightHelper/CameraHelper) pour déboguer rapidement l’orientation et le frustum d’ombre.

---

## ✅ 10. Résumé des points essentiels (Chapitre 5)

- Les lumières clés : **Ambient/Hemisphere** (fond), **Directional** (soleil), **Point** (ampoule), **Spot** (projecteur), **RectArea** (panneau).
- Les matériaux réagissent différemment : **Lambert/Phong** (classiques) vs **PBR** (MeshStandard/Physical).
- Les **ombres** exigent : `renderer.shadowMap.enabled`, `castShadow/receiveShadow`, **type** (PCF Soft souvent), **mapSize**, **frustum**, **bias/normalBias**.
- L’**IBL** via **HDR + PMREM** améliore grandement le réalisme des matériaux PBR.
- Les **helpers** et `CameraHelper` sont vos alliés pour **ajuster** et **déboguer** rapidement.

---

## 🔭 11. Prochaines étapes

- **Chapitre 6 : Textures et Mapping** — chargement avec `TextureLoader`, UV, normal/bump/roughness/metalness, répétition et filtrage.

