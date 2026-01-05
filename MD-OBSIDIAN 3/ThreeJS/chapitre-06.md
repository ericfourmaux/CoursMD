
# 🖼️ **Chapitre 6 — Textures et Mapping**

> 👨‍🏫 *Objectif :* maîtriser le **chargement** et l’**utilisation** des **textures** dans Three.js : UV mapping, types de maps (diffuse/couleur, normal, bump, roughness, metalness, ao, displacement, alpha), **répétition** & **rotation**, **filtrage** (min/mag filter, mipmaps), **anisotropie**, **color space** (sRGB vs linéaire), **compression** (KTX2), **Canvas/Video** textures, **Cube/Environment map**, et un **exemple guidé** complet avec exercices.

---

## 🧩 1. Qu’est-ce qu’une texture ?

- **📘 Définition**
  - Une **texture** est une **image** (ou un flux vidéo/données) **projetée** sur une surface via des **coordonnées UV** (`u` horizontal, `v` vertical) appartenant généralement à **[0,1]**.
- **❓ Pourquoi ?**
  - Les textures ajoutent **détails** et **réalisme** (couleurs, reliefs, rugosité, transparence) sans augmenter excessivement le nombre de triangles.
- **🔶 Analogie**
  - Imaginez **coller un autocollant** (l’image) sur un **objet** : la manière dont vous le collez est le **mapping UV**.

---

## 📐 2. UV Mapping : coordonnées et transformations

- **📘 Définition**
  - Les **UV** sont stockés dans la géométrie (`geometry.attributes.uv`). Chaque sommet reçoit un `(u,v)` qui indique **où** prélever la couleur dans l’image.
- **❓ Pourquoi ?**
  - Sans UV, le moteur ne sait pas **comment dérouler** la texture sur la surface.

### 2.1 Répéter, miroiter, borner
```js
texture.wrapS = THREE.RepeatWrapping;        // direction U
texture.wrapT = THREE.RepeatWrapping;        // direction V
texture.repeat.set(4, 2);                    // tuile 4x en U, 2x en V
// Autres modes : MirroredRepeatWrapping, ClampToEdgeWrapping
```

### 2.2 Décalage, centre, rotation
```js
texture.offset.set(0.1, 0.0);                // décale le prélèvement
texture.center.set(0.5, 0.5);                // centre de rotation au milieu
texture.rotation = Math.PI / 6;              // 30° dans le sens horaire
```

> 🧮 *Formule (conceptuelle) :* `uv' = R(uv - center) + center + offset`, où `R` est une **rotation 2D**.

### 2.3 UV secondaires (AO, lightmap)
```js
// Certaines maps (ex: aoMap, lightMap) utilisent uv2
geometry.setAttribute('uv2', geometry.attributes.uv.clone());
material.aoMap = aoTexture;
material.aoMapIntensity = 1.0;
```

---

## 🛠️ 3. Charger une texture : `TextureLoader`, `LoadingManager`

```js
// Manager pour suivre la progression
const manager = new THREE.LoadingManager();
manager.onStart = () => console.log('Chargement démarré');
manager.onProgress = (url, loaded, total) => console.log(`Progress: ${loaded}/${total}`);
manager.onError = (url) => console.error('Erreur:', url);

// Loader
const loader = new THREE.TextureLoader(manager);
const colorTexture = loader.load('/assets/textures/brick_color.jpg', () => {
  colorTexture.colorSpace = THREE.SRGBColorSpace; // couleurs "artistiques" => sRGB
});
```

> ℹ️ **CORS/chemins** : servez vos assets depuis un **serveur local** (ex. `http://localhost`) pour éviter les restrictions du navigateur.

### 3.1 Data/Canvas/Video textures
```js
// DataTexture (ex: bruit procédural)
const size = 128;
const data = new Uint8Array(size * size * 3);
for (let i = 0; i < data.length; i++) data[i] = Math.random() * 255;
const dataTex = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
dataTex.needsUpdate = true;

// CanvasTexture
const canvas = document.createElement('canvas');
canvas.width = 256; canvas.height = 256;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#222'; ctx.fillRect(0,0,256,256);
ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
ctx.fillText('CanvasTexture', 40, 130);
const canvasTex = new THREE.CanvasTexture(canvas);

// VideoTexture
const video = document.createElement('video');
video.src = '/assets/video.mp4';
video.loop = true; video.muted = true; video.play();
const videoTex = new THREE.VideoTexture(video);
```

---

## 🎨 4. Types de maps et propriétés matériaux

> 🧠 Les **maps** modulent des **propriétés** du matériau. Certaines doivent être en **linéaire** (données), d’autres en **sRGB** (images de couleur).

```js
const loader = new THREE.TextureLoader();

// Couleur (albedo/diffuse) — sRGB
const map = loader.load('/assets/wood_basecolor.jpg');
map.colorSpace = THREE.SRGBColorSpace;

// Normal map (tangent space) — linéaire
const normalMap = loader.load('/assets/wood_normal.jpg');
// normalMap.colorSpace = THREE.NoColorSpace; // par défaut, il est linéaire

// Roughness + Metalness — linéaires
const roughnessMap = loader.load('/assets/wood_roughness.jpg');
const metalnessMap = loader.load('/assets/metal_metalness.jpg');

// Ambient Occlusion (ao) — linéaire + uv2
const aoMap = loader.load('/assets/wood_ao.jpg');

// Height/Displacement (pour géométries suffisantes en segments)
const displacementMap = loader.load('/assets/stone_height.png');

// Alpha map (transparence)
const alphaMap = loader.load('/assets/decal_alpha.png');

const mat = new THREE.MeshStandardMaterial({
  map,
  normalMap,
  roughnessMap,
  metalnessMap,
  aoMap,
  displacementMap,
  displacementScale: 0.05,
  alphaMap,
  transparent: true,
  roughness: 0.6,
  metalness: 0.0,
});
```

> ℹ️ **Bump vs Normal** : `bumpMap` simule le relief via **différences d’intensité** (pas de direction), alors que `normalMap` encode les **orientations** locales — plus **convaincant**.

---

## 🔎 5. Filtrage, mipmaps et anisotropie

### 5.1 Minification & Magnification
```js
// Magnification (zoom avant): Nearest vs Linear
texture.magFilter = THREE.LinearFilter; // plus doux
// Minification (texture éloignée): LinearMipmapLinearFilter (par défaut pour textures avec mipmaps)
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

### 5.2 Mipmaps
- **📘 Définition** : pyramide de versions réduites de l’image pour éviter aliasing scintillant à distance.
- **❓ Pourquoi ?**
  - Améliore la **qualité** et la **stabilité** visuelle tout en réduisant le coût GPU à distance.

### 5.3 Anisotropie
```js
// Améliore la netteté des textures vues en oblique
texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
```

> 🧠 Trop d’anisotropie = **coût** supplémentaire ; choisissez une valeur raisonnable (4–8).

---

## 🎛️ 6. Color Space (sRGB vs linéaire) : bien configurer

- **📘 Principes**
  - **Textures de couleur** → **sRGB** (`texture.colorSpace = THREE.SRGBColorSpace`).
  - **Textures de données** (normal, roughness, metalness, ao, height) → **linéaire**.
  - **Renderer** → `renderer.outputColorSpace = THREE.SRGBColorSpace`.

**Rappel utile (JS)**
```js
function srgbToLinear(x){
  return (x <= 0.04045) ? x/12.92 : Math.pow((x + 0.055)/1.055, 2.4);
}
function linearToSRGB(x){
  return (x <= 0.0031308) ? 12.92*x : 1.055*Math.pow(x, 1/2.4) - 0.055;
}
```

---

## 📦 7. Compression de textures (KTX2/Basis) — aperçu

> ⚡ Les textures **non compressées** peuvent être lourdes en mémoire. Le **KTX2** (Basis Universal) compresse de façon multi-plateforme.

```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { KTX2Loader } from 'https://esm.run/three@latest/examples/jsm/loaders/KTX2Loader.js';

  const renderer = new THREE.WebGLRenderer();
  const ktx2 = new KTX2Loader()
    .setTranscoderPath('/basis/')      // dossier des wasm/JS du transcoder
    .detectSupport(renderer);

  const map = await ktx2.loadAsync('/assets/wood_basecolor.ktx2');
  map.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map });
</script>
```

---

## 🌍 8. Environment/Cube Map (rappels rapides)

- **CubeTextureLoader** pour des cubemaps 6 faces (`px, nx, py, ny, pz, nz`).
- **PMREM** pour les HDR equirectangulaires (vu au Chapitre 5). Ici, on montre l’assignation à un matériau :
```js
material.envMap = scene.environment; // si déjà défini via PMREM
material.envMapIntensity = 1.2;
```

---

## 🧪 9. Exemple guidé : appliquer un set PBR complet

### Variante CDN
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Textures & Mapping</title>
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
  document.body.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.6);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(2,3,2); dir.castShadow = true; renderer.shadowMap.enabled = true; scene.add(hemi, dir);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 }));
  plane.rotation.x = -Math.PI/2; plane.position.y = -0.6; plane.receiveShadow = true; scene.add(plane);

  const loader = new THREE.TextureLoader();
  const baseColor = loader.load('/assets/wood_basecolor.jpg'); baseColor.colorSpace = THREE.SRGBColorSpace;
  const normal = loader.load('/assets/wood_normal.jpg');
  const rough = loader.load('/assets/wood_roughness.jpg');
  const metal = loader.load('/assets/wood_metalness.jpg');
  const ao = loader.load('/assets/wood_ao.jpg');

  const boxGeo = new THREE.BoxGeometry(1,1,1, 64,64,64); // segments pour displacement
  boxGeo.setAttribute('uv2', boxGeo.attributes.uv.clone());

  const height = loader.load('/assets/wood_height.png');

  const mat = new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: normal,
    roughnessMap: rough,
    metalnessMap: metal,
    aoMap: ao,
    displacementMap: height,
    displacementScale: 0.02,
    roughness: 0.6,
    metalness: 0.0,
  });

  const box = new THREE.Mesh(boxGeo, mat); box.castShadow = true; scene.add(box);

  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    box.rotation.y += 0.9*dt; box.rotation.x += 0.4*dt;
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

### Variante Modules (avec rotation UV)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Textures (Modules)</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.6));

  const loader = new THREE.TextureLoader();
  const tex = loader.load('/assets/tile_basecolor.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.repeat.set(3, 3);
  tex.center.set(0.5, 0.5); tex.rotation = Math.PI / 8;

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.0 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3, 1, 1), mat);
  scene.add(plane);

  function animate(){ renderer.render(scene, camera); requestAnimationFrame(animate); }
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

## 🧪 10. Exercices

1. **Changer les wrap modes** (`Repeat`, `MirroredRepeat`, `ClampToEdge`) et constater l’effet sur les bords.
2. **Tourner la texture** autour d’un **centre différent** (`texture.center`) et expliquer le résultat.
3. **Activer `uv2`** et ajouter une **aoMap** ; mesurer l’impact visuel.
4. **Comparer `bumpMap` vs `normalMap`** sur une même géométrie.
5. **Moduler `anisotropy`** (2, 4, 8) et observer la netteté en oblique.
6. **Essayer `VideoTexture`** : pause/lecture, et afficher un bandeau en overlay.
7. **Charger KTX2** pour la base color et comparer la mémoire (via DevTools).

---

## 🧰 11. Bonnes pratiques

- Réglez correctement le **color space** : `sRGB` pour **couleur**, linéaire pour **données**.
- **Réutilisez** vos textures (caching) et évitez les rechargements.
- Limitez **anisotropy** à une valeur **raisonnable**.
- Choisissez des **dimensions puissance de 2** (512, 1024) pour des mipmaps optimales.
- Pour **displacement**, augmentez les **segments** de la géométrie, sinon l’effet sera minimal.
- Préférez **KTX2** pour réduire la **VRAM** et améliorer les **temps de chargement**.

---

## ✅ 12. Résumé des points essentiels (Chapitre 6)

- Les **UV** déterminent **où** l’image est prélevée sur l’objet ; on peut **répéter**, **miroiter**, **décaler** et **tourner**.
- Les **maps PBR** courantes : `map` (albedo), `normalMap`, `roughnessMap`, `metalnessMap`, `aoMap`, `displacementMap`, `alphaMap`.
- **Color space** : **sRGB** pour les **couleurs** ; **linéaire** pour les **données** (normal/roughness/metalness/ao/height).
- **Filtrage** (min/mag), **mipmaps** et **anisotropie** influencent netteté/coût.
- **Canvas/Data/Video** textures permettent des contenus **dynamiques**.
- **Compression KTX2** diminue **VRAM** et **temps de chargement** ; **envMap** et **PMREM** améliorent les reflets PBR.

---

## 🔭 13. Prochaines étapes

- **Chapitre 7 : Contrôles et Interaction** — `OrbitControls`, raycasting, événements souris/clavier, feedback visuel.

