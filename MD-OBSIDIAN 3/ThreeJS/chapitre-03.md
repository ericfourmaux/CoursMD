
# 🖥️ **Chapitre 3 — Le Rendu avec WebGLRenderer**

> 👨‍🏫 *Objectif :* maîtriser le **renderer** de Three.js — comprendre ce qu’il fait, comment le configurer finement (taille, pixel ratio, colorimétrie, ombres, tonemapping), et mettre en place une **boucle d’animation** stable et performante. Nous verrons aussi la gestion du **redimensionnement**, l’**alpha/transparence**, et des notions avancées (render targets, post-traitement).

---

## 🧩 1. WebGL vs Three.js : pourquoi un renderer ?

- **📘 Définition**
  - **WebGL** est l’API bas niveau du navigateur qui permet d’accéder au GPU pour dessiner en 2D/3D.
  - **Three.js** offre des **abstractions** haut niveau (scène, caméra, matériaux, lumières) et délègue le dessin à un **`THREE.WebGLRenderer`**.

- **❓ Pourquoi ?**
  - Écrire du code WebGL pur (shaders, buffers, états GPU) est complexe. Three.js **simplifie** la plupart des tâches et vous permet de vous concentrer sur la scène et les interactions.

- **🔶 Analogie**
  - WebGL est la **cuisine professionnelle** (plaques, fours, ustensiles) ; Three.js est le **chef** qui orchestre la recette. Le **renderer** est l’**équipe en service** qui dresse et envoie les plats (pixels) à l’écran.

---

## 🛠️ 2. Initialiser et configurer `WebGLRenderer`

### 2.1 Création du renderer

```js
// Création standard avec antialiasing
const renderer = new THREE.WebGLRenderer({
  antialias: true,          // lissage des bords (MSAA sur le canvas)
  alpha: true,              // canal alpha pour rendre sur fond transparent si besoin
  depth: true,              // buffer de profondeur
  stencil: false,           // buffer stencil (désactiver si non utilisé)
  powerPreference: 'high-performance' // hint au navigateur/driver GPU
});

// Taille initiale (en pixels logiques)
renderer.setSize(window.innerWidth, window.innerHeight);

// Ratio de pixels (DPR) — cap pour éviter un coût GPU excessif sur mobiles très haute densité
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Insertion du <canvas> dans la page
document.body.appendChild(renderer.domElement);
```

> ℹ️ `renderer.domElement` est le **canvas** WebGL géré par Three.js. Vous pouvez aussi fournir un canvas existant via `{ canvas: monCanvas }`.

### 2.2 Couleur de fond, nettoyage, transparence

```js
renderer.setClearColor(0x202025, 1); // (couleur, alpha)
renderer.autoClear = true;           // efface automatiquement color/depth avant chaque frame
// Si vous dessinez plusieurs passes manuelles, vous pouvez contrôler les clear :
// renderer.clear();
```

- **Fond transparent**
  ```js
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0x000000, 0); // alpha = 0 => canvas transparent
  ```

### 2.3 Colorimétrie & Tone Mapping

> 🎨 Les écrans s’attendent à des couleurs **sRGB**. La plupart des calculs physiques se font en **linéaire**. Le renderer gère cette conversion.

```js
// Color space de sortie (affichage)
renderer.outputColorSpace = THREE.SRGBColorSpace; // sRGB conseillé

// Tone mapping (mappage HDR -> LDR)
renderer.toneMapping = THREE.ACESFilmicToneMapping; // rendu cinéma crédible
renderer.toneMappingExposure = 1.0;                 // exposer plus/moins de lumière
```

**Formule JS utile (linéaire -> sRGB)**
```js
function linearToSRGB(x) {
  // x dans [0,1]
  return (x <= 0.0031308)
    ? 12.92 * x
    : 1.055 * Math.pow(x, 1/2.4) - 0.055;
}
```

### 2.4 Ombres (shadow map)

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // compromis qualité/perf

// Ex. objets/lumières
light.castShadow = true;
cube.castShadow = true;
plane.receiveShadow = true;
```

> 💡 Les ombres nécessitent une lumière supportant les shadows (Directional, Spot, Point), des **objets** autorisés à projeter/recevoir, et parfois un **ajustement** de la shadow camera (taille, near/far) pour la netteté.

---

## 🔄 3. La boucle d’animation : `requestAnimationFrame` vs `setAnimationLoop`

### 3.1 Boucle classique (RAF)

```js
const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05); // clamp dt à ~50 ms pour éviter les sauts
  // Mettre à jour vos objets, animations, physiques
  cube.rotation.y += 1.0 * dt; // rad/s

  // Rendu
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
animate();
```

### 3.2 Boucle pour XR/VR/AR (`setAnimationLoop`)

```js
renderer.setAnimationLoop((time) => {
  // time = temps en ms fourni par le système
  cube.rotation.x += 0.01;
  renderer.render(scene, camera);
});
```

> 🧠 `setAnimationLoop` est **requis** pour WebXR et gère le rythme de rafraîchissement XR. Pour une app non XR, `requestAnimationFrame` suffit largement.

**Formules JS utiles (cadence)**
```js
// Conversion frame time -> FPS
const frameTimeMs = 16.67; // ~60 Hz
const fps = 1000 / frameTimeMs; // ~60 FPS

// Intégration simple du mouvement à dt
position.x += velocity.x * dt;
position.y += velocity.y * dt;
```

---

## 📐 4. Gérer le redimensionnement & le pixel ratio

- **Pourquoi ?** Pour conserver un rendu net, cohérent et performant sur tous les écrans.

```js
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  camera.aspect = aspect;              // pour PerspectiveCamera
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onResize);
onResize(); // appel initial
```

**Astuce :** sur mobile à très haute densité (DPR > 2), limitez le DPR pour éviter un coût GPU disproportionné.

---

## 🗺️ 5. Schéma de la frame de rendu

```mermaid
flowchart LR
  A[Mettre à jour l'état (animations, interactions)] --> B[renderer.clear() (autoClear)]
  B --> C[renderer.render(scene, camera)]
  C --> D[Pixels sur l'écran]
```

---

## 🧪 6. Exemple pratique : cube tournant avec réglages de rendu

> 🎯 *But :* assembler une scène complète et expérimenter avec **pixel ratio**, **tonemapping** et **ombres**.

### Variante CDN (`<script src>`)
```html
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Three.js — Rendu</title>
  <style>
    html, body { margin: 0; height: 100%; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src=\"https://unpkg.com/three@latest/build/three.min.js\"></script>
  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101014);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    // Sol
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x232331, roughness: 0.9 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    // Cube
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x2194f3, roughness: 0.4, metalness: 0.1 })
    );
    cube.castShadow = true;
    scene.add(cube);

    // Lumière directionnelle + ombres
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(2, 3, 2);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);

    const clock = new THREE.Clock();
    function animate() {
      const dt = Math.min(clock.getDelta(), 0.05);
      cube.rotation.y += 1.0 * dt;
      cube.rotation.x += 0.5 * dt;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  </script>
</body>
</html>
```

### Variante ES Modules (`type="module"`)
```html
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Three.js — Rendu (Modules)</title>
  <style>
    html, body { margin: 0; height: 100%; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type=\"module\">
    import * as THREE from 'https://esm.run/three@latest';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f13);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x1b1b29, roughness: 0.9 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.45, metalness: 0.2 })
    );
    cube.castShadow = true;
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(2, 3, 2);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);

    const clock = new THREE.Clock();
    function animate() {
      const dt = Math.min(clock.getDelta(), 0.05);
      cube.rotation.y += 1.2 * dt;
      cube.rotation.x += 0.6 * dt;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  </script>
</body>
</html>
```

---

## 🧪 7. Notions avancées : render targets & post-traitement

### 7.1 Rendu vers une texture (`WebGLRenderTarget`)

```js
// Créer un render target (offscreen)
const rt = new THREE.WebGLRenderTarget(512, 512, {
  depthBuffer: true,
  stencilBuffer: false,
});

// Rendu dans la texture
renderer.setRenderTarget(rt);
renderer.render(scene, camera);
renderer.setRenderTarget(null); // revenir au canvas principal

// Utiliser la texture dans un matériau
const quad = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ map: rt.texture })
);
scene.add(quad);
```

> 🔍 Utile pour **mini-maps**, **miroirs**, **post-traitements** personnalisés.

### 7.2 Post-traitement (aperçu)

> Le pipeline classique passe par un **EffectComposer** et des **passes** (Bloom, FXAA, SSAO, etc.). Nous le détaillerons plus tard.

---

## 🧮 8. Petites formules JS pratiques

```js
// Exposition relative (tonemapping) — multiplier l'énergie lumineuse perçue
renderer.toneMappingExposure = Math.pow(2, EV); // EV = stops (+1 => x2, -1 => /2)

// Détection de perte de contexte WebGL (rare mais utile)
renderer.domElement.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  console.warn('Contexte WebGL perdu — tenter une récupération.');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  console.info('Contexte WebGL restauré');
});
```

---

## 🧰 9. Bonnes pratiques de rendu

- **Limiter le DPR** (`setPixelRatio`) à 2 sur mobile pour garder une bonne perf.
- **Invalider** et **mettre à jour** la projection caméra après chaque changement d’aspect.
- **Réutiliser** les géométries et matériaux ; éviter de recréer à chaque frame.
- **Activer les shadows** seulement si nécessaires ; ajuster `mapSize` avec parcimonie.
- **Profiling** : utilisez les outils du navigateur (Timeline) et des compteurs (draw calls, triangles) pour diagnostiquer.
- **Éviter les clears multiples** si `autoClear` est actif ; sinon, maîtriser l’ordre des passes.

---

## 🧪 10. Exercices

1. **Modifier `toneMappingExposure`** avec les touches `+`/`-` et observer l’effet.
2. **Basculer le `shadowMap.type`** entre `BasicShadowMap`, `PCFShadowMap`, `PCFSoftShadowMap` et comparer la netteté/coût.
3. **Limiter le DPR à 1** puis à 2 et mesurer la différence de FPS.
4. **Réaliser un petit post-traitement** : rendre la scène dans un `WebGLRenderTarget`, puis afficher la texture sur un quad plein écran.

---

## ✅ 11. Résumé des points essentiels (Chapitre 3)

- Le **renderer** convertit **scène + caméra** en **pixels** via WebGL.
- Configurez correctement la **taille** et le **pixel ratio** pour la netteté et la performance.
- Gérez la **colorimétrie** (sRGB) et le **tone mapping** (ex. ACES Filmic) pour un rendu crédible.
- Les **ombres** exigent `renderer.shadowMap.enabled` et des objets/lumières configurés.
- La **boucle d’animation** se fait avec `requestAnimationFrame` (ou `setAnimationLoop` pour XR).
- Gérez le **resize** : mettez à jour la projection et la taille/ratio du renderer.
- Les **render targets** permettent des effets avancés et du post-traitement.

---

## 🔭 12. Prochaines étapes

- **Chapitre 4 : Les Objets 3D** — géométries, matériaux et composition en meshes ; approfondir l’apparence et l’éclairage.

