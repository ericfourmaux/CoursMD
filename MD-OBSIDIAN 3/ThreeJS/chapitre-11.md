
# 🌍 **Chapitre 11 — Projet Final : Mini‑scène interactive**

> 👨‍🏫 *Objectif :* assembler tout ce que vous avez appris pour créer une **mini‑scène interactive** : une **planète** (textures PBR), une **couche de nuages**, un **fond d’étoiles**, une **caméra contrôlable** (OrbitControls), et des **marqueurs cliquables** (raycasting) qui affichent des **informations** dans un panneau UI. Nous mettrons l’accent sur la **structure de projet**, la **performance** et la **qualité visuelle**.

---

## 🎯 1. Cahier des charges

- **Planète** (sphère) texturée en PBR : `map` (base color), `normalMap`, `roughnessMap` (non métallique → `metalness=0`).
- **Nuages** : sphère légèrement plus grande, matériau **transparent** (`alphaMap`).
- **Fond d’étoiles** : grande sphère **inversée** (`side: THREE.BackSide`).
- **Contrôles caméra** : `OrbitControls` avec **damping** et limites d’inclinaison.
- **Marqueurs cliquables** : données `{name, lat, lon}`, conversion **lat/lon → XYZ**.
- **Panneau d’info** (overlay HTML) : affiche le nom du marqueur et des détails.
- **Animation** : rotation lente de la planète et des nuages.
- **Performance** : DPR plafonné, textures sRGB/linéaires, anisotropie raisonnable.

---

## 🧱 2. Assets & arborescence

```
public/
  assets/
    textures/
      earth_basecolor.jpg
      earth_normal.jpg
      earth_roughness.jpg
      clouds_alpha.png
      stars.jpg
```

> 💡 Vous pouvez remplacer `.jpg` par **KTX2** si vous avez mis en place la compression (cf. Chapitre 6).

---

## 🧭 3. Architecture du projet (vue d’ensemble)

**Schéma (Mermaid)**
```mermaid
flowchart TD
  A[Renderer] --> B[Scene]
  B --> C[Planet Mesh]
  B --> D[Clouds Mesh]
  B --> E[Starfield]
  F[OrbitControls] --> A
  G[Raycaster] --> B
  H[Markers (lat/lon)] --> C
  I[UI Panel] --> User
```

**Fichiers conseillés**
- `index.html` (bootstrap du projet)
- `main.js` (init, boucle, resize)
- `controls.js` (OrbitControls)
- `planet.js` (création planète + nuages + stars)
- `markers.js` (Lat/Lon → XYZ, raycasting, UI panel)

---

## 🧮 4. Formules utiles (JavaScript)

### 4.1 Degrés ↔ radians
```js
const degToRad = d => d * Math.PI / 180;
const radToDeg = r => r * 180 / Math.PI;
```

### 4.2 Conversion **Lat/Lon → XYZ** (rayon R)
> Latitude `lat` en degrés (Nord +), Longitude `lon` en degrés (Est +). Convention **Y‑up**.
```js
function latLonToCartesian(latDeg, lonDeg, R){
  const lat = degToRad(latDeg);
  const lon = degToRad(lonDeg);
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  return new THREE.Vector3(x, y, z);
}
```

### 4.3 Rotation uniforme à vitesse angulaire ω (rad/s)
```js
function rotateUniform(object, dt, omegaY=0.1){
  object.rotation.y += omegaY * dt; // rad/s autour de Y
}
```

---

## 🧪 5. Exemple complet — **CDN** (script)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Projet Final — Planète interactive</title>
  <style>
    html, body { margin:0; height:100%; }
    canvas { display:block; }
    #panel { position:fixed; top:12px; left:12px; padding:10px 14px; background:#222; color:#fff; border-radius:8px; font-family:system-ui; }
  </style>
</head>
<body>
<div id="panel">Cliquez un marqueur</div>
<script src="https://unpkg.com/three@latest/build/three.min.js"></script>
<script>
  // 1) Renderer/Scene/Camera
  const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0f13);

  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 1.2, 4.5);

  // 2) Lumières
  const hemi = new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.5);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(2.5, 3.5, 2);
  scene.add(hemi, dir);

  // 3) Textures
  const loader = new THREE.TextureLoader();
  const texColor = loader.load('/assets/textures/earth_basecolor.jpg'); texColor.colorSpace = THREE.SRGBColorSpace;
  const texNormal = loader.load('/assets/textures/earth_normal.jpg');
  const texRough = loader.load('/assets/textures/earth_roughness.jpg');
  const texCloudsAlpha = loader.load('/assets/textures/clouds_alpha.png');
  const texStars = loader.load('/assets/textures/stars.jpg'); texStars.colorSpace = THREE.SRGBColorSpace; texStars.wrapS = texStars.wrapT = THREE.RepeatWrapping; texStars.repeat.set(2,2);

  // 4) Planète
  const R = 1.0;
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 32),
    new THREE.MeshStandardMaterial({ map: texColor, normalMap: texNormal, roughnessMap: texRough, roughness: 0.7, metalness: 0.0 })
  );
  scene.add(planet);

  // 5) Nuages
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(R*1.01, 64, 32),
    new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, alphaMap: texCloudsAlpha, roughness: 1.0, metalness: 0.0 })
  );
  scene.add(clouds);

  // 6) Fond d’étoiles
  const stars = new THREE.Mesh(
    new THREE.SphereGeometry(60, 64, 32),
    new THREE.MeshBasicMaterial({ map: texStars, side: THREE.BackSide })
  );
  scene.add(stars);

  // 7) OrbitControls (chargement via module recommandé; ici, version minimale custom)
  // Pour la version CDN simple, omis; utilisez la variante Modules ci-dessous pour OrbitControls complet.

  // 8) Marqueurs
  const markersData = [
    { name:'Montréal', lat:45.5017, lon:-73.5673 },
    { name:'Paris', lat:48.8566, lon:2.3522 },
    { name:'Tokyo', lat:35.6762, lon:139.6503 }
  ];
  const markerMat = new THREE.MeshStandardMaterial({ color:0xff7043, emissive:0x111111 });
  const markers = [];
  function degToRad(d){ return d*Math.PI/180; }
  function latLonToCartesian(latDeg, lonDeg, R){
    const lat = degToRad(latDeg), lon = degToRad(lonDeg);
    return new THREE.Vector3(
      R*Math.cos(lat)*Math.cos(lon),
      R*Math.sin(lat),
      R*Math.cos(lat)*Math.sin(lon)
    );
  }
  markersData.forEach(d=>{
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), markerMat.clone());
    m.userData.label = d.name;
    const p = latLonToCartesian(d.lat, d.lon, R*1.001);
    m.position.copy(p);
    planet.add(m); // enfant de la planète → suit la rotation
    markers.push(m);
  });

  // 9) Raycasting
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const panel = document.getElementById('panel');

  renderer.domElement.addEventListener('pointermove', (e)=>{
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2 - 1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2 + 1;
  });
  renderer.domElement.addEventListener('pointerdown', ()=>{
    raycaster.setFromCamera(mouse, camera);
    const ix = raycaster.intersectObjects(markers, true);
    if (ix.length){ panel.textContent = '📍 ' + ix[0].object.userData.label; }
  });

  // 10) Boucle
  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    planet.rotation.y += 0.1 * dt;
    clouds.rotation.y += 0.15 * dt;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // 11) Resize
  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
</script>
</body>
</html>
```

> ℹ️ Pour des **contrôles caméra** complets, privilégiez la **variante Modules** ci‑dessous (avec `OrbitControls`).

---

## 🧪 6. Exemple complet — **Modules** (ESM + OrbitControls + GSAP optionnel)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Projet Final — Modules</title>
  <style>
    html, body { margin:0; height:100%; } canvas { display:block; }
    #panel { position:fixed; top:12px; left:12px; padding:10px 14px; background:#222; color:#fff; border-radius:8px; font-family:system-ui; }
  </style>
</head>
<body>
<div id="panel">Cliquez un marqueur</div>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { OrbitControls } from 'https://esm.run/three@latest/examples/jsm/controls/OrbitControls.js';
  import { gsap } from 'https://esm.run/gsap@latest';

  const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121218);

  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 1.3, 4.8);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI*0.49; controls.minDistance = 1.8; controls.maxDistance = 10;

  const hemi = new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.55);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(2.5,3.5,2);
  scene.add(hemi, dir);

  const texLoader = new THREE.TextureLoader();
  const texColor = texLoader.load('/assets/textures/earth_basecolor.jpg'); texColor.colorSpace = THREE.SRGBColorSpace;
  const texNormal = texLoader.load('/assets/textures/earth_normal.jpg');
  const texRough = texLoader.load('/assets/textures/earth_roughness.jpg');
  const texCloudsAlpha = texLoader.load('/assets/textures/clouds_alpha.png');
  const texStars = texLoader.load('/assets/textures/stars.jpg'); texStars.colorSpace = THREE.SRGBColorSpace; texStars.wrapS = texStars.wrapT = THREE.RepeatWrapping; texStars.repeat.set(2,2);

  const R = 1.0;
  const planet = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), new THREE.MeshStandardMaterial({ map: texColor, normalMap: texNormal, roughnessMap: texRough, roughness: 0.7, metalness: 0.0 }));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R*1.01, 64, 32), new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, alphaMap: texCloudsAlpha }));
  const stars = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), new THREE.MeshBasicMaterial({ map: texStars, side: THREE.BackSide }));
  scene.add(planet, clouds, stars);

  // Helpers (optionnels)
  // scene.add(new THREE.AxesHelper(1.5));

  // Marqueurs
  const markersData = [
    { name:'Montréal', lat:45.5017, lon:-73.5673 },
    { name:'Paris', lat:48.8566, lon:2.3522 },
    { name:'Tokyo', lat:35.6762, lon:139.6503 },
    { name:'São Paulo', lat:-23.5558, lon:-46.6396 }
  ];
  const markers = [];
  const markerGeom = new THREE.SphereGeometry(0.025, 16, 12);
  const markerMat = new THREE.MeshStandardMaterial({ color:0xff7043, emissive:0x111111 });

  const degToRad = d => d*Math.PI/180;
  const latLonToCartesian = (latDeg, lonDeg, R) => {
    const lat = degToRad(latDeg), lon = degToRad(lonDeg);
    return new THREE.Vector3(
      R*Math.cos(lat)*Math.cos(lon),
      R*Math.sin(lat),
      R*Math.cos(lat)*Math.sin(lon)
    );
  };

  for (const d of markersData){
    const m = new THREE.Mesh(markerGeom, markerMat.clone());
    m.userData.label = d.name;
    m.position.copy(latLonToCartesian(d.lat, d.lon, R*1.001));
    planet.add(m);
    markers.push(m);
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const panel = document.getElementById('panel');

  function setMouse(e){ const r = renderer.domElement.getBoundingClientRect(); mouse.x = ((e.clientX-r.left)/r.width)*2-1; mouse.y = -((e.clientY-r.top)/r.height)*2+1; }

  renderer.domElement.addEventListener('pointermove', setMouse);
  renderer.domElement.addEventListener('pointerdown', ()=>{
    raycaster.setFromCamera(mouse, camera);
    const ix = raycaster.intersectObjects(markers, true);
    if (ix.length){
      const obj = ix[0].object;
      panel.textContent = '📍 ' + obj.userData.label;
      gsap.to(camera.position, { z: camera.position.z-0.4, duration: 0.4, ease:'power2.out' });
      obj.material.emissive?.setHex(0x222222);
      setTimeout(()=> obj.material.emissive?.setHex(0x111111), 400);
    }
  });

  const clock = new THREE.Clock();
  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    planet.rotation.y += 0.1 * dt;
    clouds.rotation.y += 0.15 * dt;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });
</script>
</body>
</html>
```

---

## 🧪 7. Étapes guidées (checklist)

1. **Initialiser** renderer/scene/camera ; fixer `outputColorSpace = SRGB` et plafonner **DPR** à `≤ 2`.
2. **Ajouter** lumières (`Hemisphere + Directional`) ; régler intensités/modèles.
3. **Charger** les textures : **base color (sRGB)**, **normal (linéaire)**, **roughness (linéaire)**, **clouds alpha**.
4. **Créer** la **planète** (`MeshStandardMaterial`) ; **nuages** transparents ; **fond d’étoiles** back side.
5. **Placer** les **marqueurs** via **lat/lon → XYZ** ; les attacher à la **planète** (hiérarchie).
6. **Mettre en place** `OrbitControls` (damping, limites) ; **raycaster** pour la sélection.
7. **Animer** la rotation (planète/nuages) ; mettre en place la **boucle** stable (`dt` clampé).
8. **Gérer** le **resize** et l’**UI panel**.

---

## 🧰 8. Performance & qualité

- **Textures** : utilisez **dimensions POT** (512/1024), **mipmaps**, **LinearMipmapLinearFilter** en minification.
- **Anisotropie** : `texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())`.
- **DPR** : `setPixelRatio(Math.min(devicePixelRatio, 2))`.
- **Material** : **metalness=0** pour la Terre ; ajustez **roughness** via map.
- **Renderer** : `powerPreference:'high-performance'`, **tone mapping** ACES si besoin (cf. Chapitre 3).

---

## 🧪 9. Exercices (pour aller plus loin)

1. **Ajouter des info‑bulles** (panneau flottant) qui suivent le marqueur (HTML/CSS positionné via projection `Vector3 → screen`).
2. **Caméra “focus”** : utiliser **GSAP** pour animer la **position caméra** et `controls.target` vers le marqueur.
3. **Nuages animés** : faire tourner la **texture** des nuages (`rotation`) en plus de la sphère pour un effet subtil.
4. **Terminator jour/nuit** (option avancée) : ajouter un second **DirectionalLight** opposé et jouer sur `envMapIntensity`/`emissive`.
5. **Compression KTX2** des textures et mesurer la **VRAM** avec DevTools.
6. **Marqueurs par catégories** (couches/raycasting) : `object.layers.set(n)`, `raycaster.layers.set(n)`.
7. **Profiling** : afficher `renderer.info.render.calls` et réduire les draw calls en regroupant les marqueurs (ex. `InstancedMesh`).

---

## ✅ 10. Résumé des points essentiels (Chapitre 11)

- Vous avez intégré **textures PBR**, **contrôles caméra**, **raycasting**, **UI panel** et **animation** dans une scène cohérente.
- Les **marqueurs** sont placés via **lat/lon → XYZ** et **rattachés** à la planète (hiérarchie).
- La **boucle d’animation** est **stable** (clamp `dt`) ; la **performance** est gérée (DPR, filtres, anisotropie).
- Vous disposez d’une **base de projet** extensible (modules) pour ajouter des **fonctionnalités** et **assets**.

---

## 🔭 11. Livrables & suite

- Un **index.md** (syllabus) et le **chapitre** au format Obsidian.
- Code des **deux variantes** (CDN & Modules) prêt à être lancé.
- Prochaine itération : **publier** la scène (GitHub Pages/Vercel) et **connecter** des données (statique) pour enrichir les marqueurs.

