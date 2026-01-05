
# 📘 **Chapitre 1 — Les Fondamentaux de la 3D**

> 👨‍🏫 *Objectif :* établir des bases solides pour manipuler l’espace 3D avec Three.js. Vous allez comprendre la triade **Scène–Caméra–Renderer**, le **repère 3D** (X, Y, Z), les **meshes** (géométrie + matériau), ainsi que l’idée des **lumières** et **ombres**. Nous finirons par **coder une première scène** avec un cube.

---

## 🧩 1. Vue d’ensemble : la triade *Scène–Caméra–Renderer*

- **📘 Définition**
  - **Scène (`THREE.Scene`)** : conteneur de tous les éléments (objets, lumières, brouillard, etc.).
  - **Caméra (`THREE.PerspectiveCamera`/`THREE.OrthographicCamera`)** : point de vue à partir duquel on observe la scène.
  - **Renderer (`THREE.WebGLRenderer`)** : moteur de rendu qui transforme la scène et la caméra en pixels (via WebGL).

- **❓ Pourquoi ?**
  - Trois piliers indissociables : *où sont les objets ?* (scène), *comment on les regarde ?* (caméra), *qui dessine ?* (renderer).

- **🔶 Analogie**
  - Imaginez un **théâtre** : la **scène** = le plateau et les décors ; la **caméra** = vos yeux ou une caméra de cinéma ; le **renderer** = l’équipe technique qui projette l’image à l’écran.

- **🧪 Exemple conceptuel (pseudo-code)**
  ```js
  // 1) Créer la scène
  const scene = new THREE.Scene();

  // 2) Créer la caméra (perspective)
  const camera = new THREE.PerspectiveCamera(
    60,         // FOV (angle de vue vertical en degrés)
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1,        // near (plan de coupe proche)
    100         // far (plan de coupe lointain)
  );
  camera.position.set(0, 1.5, 4);

  // 3) Créer le renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 4) Rendu
  renderer.render(scene, camera);
  ```

---

## 📐 2. Le repère 3D : axes X, Y, Z

- **📘 Définition**
  - **Axe X** : horizontal (droite = +X, gauche = −X)
  - **Axe Y** : vertical (haut = +Y, bas = −Y)
  - **Axe Z** : profondeur (vers vous = +Z, vers le fond = −Z)
  - Par convention dans Three.js : **système à main droite**, **Y vers le haut** ; la **caméra de perspective regarde par défaut vers −Z**.

- **❓ Pourquoi ?**
  - Un repère cohérent permet de **positionner** et **orienter** les objets sans ambiguïté et de raisonner sur les transformations (translation, rotation, échelle).

- **🔶 Analogie**
  - Comme un **GPS 3D** : longitude = X, altitude = Y, profondeur = Z.

- **🧪 Schéma (Mermaid)**
  ```mermaid
  graph LR
    A[X : droite (+) / gauche (-)]
    B[Y : haut (+) / bas (-)]
    C[Z : vers vous (+) / vers le fond (-)]
    A --> Repere
    B --> Repere
    C --> Repere
    Repere[Repère 3D (main droite, Y up)]
  ```

- **🧪 Exemple de positionnement**
  ```js
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(1.5, 0.5, -2); // x, y, z
  scene.add(mesh);
  ```

---

## 🧠 3. Mesh, Géométrie, Matériau

- **📘 Définition**
  - **Géométrie** : ensemble des **vertices** (sommets) et **faces** qui définissent la forme (ex. `BoxGeometry`, `SphereGeometry`).
  - **Matériau** : règles d’**apparence** (couleur, texture, brillance, réactions à la lumière), ex. `MeshBasicMaterial`, `MeshStandardMaterial`.
  - **Mesh** : **assemblage géométrie + matériau** → objet **affichable** dans la scène.

- **❓ Pourquoi ?**
  - Séparer **forme** et **apparence** facilite la réutilisation et l’optimisation.

- **🔶 Analogie**
  - Un **mannequin** (géométrie) habillé avec un **tissu** (matériau). Le couple forme+tissu = **mannequin habillé** (mesh).

- **🧪 Exemples**
  ```js
  // Cube basique
  const box = new THREE.BoxGeometry(1, 1, 1);
  const matBasic = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  const cube = new THREE.Mesh(box, matBasic);
  scene.add(cube);

  // Sphère avec matériau PBR
  const sph = new THREE.SphereGeometry(0.75, 32, 16);
  const matStd = new THREE.MeshStandardMaterial({ color: 0xff8844, roughness: 0.4, metalness: 0.2 });
  const sphere = new THREE.Mesh(sph, matStd);
  sphere.position.set(2, 0, 0);
  scene.add(sphere);
  ```

---

## 💡 4. Lumières et Ombres (aperçu)

- **📘 Définition**
  - **Lumières** : sources d’éclairage qui influencent les matériaux non-"Basic" (`MeshStandardMaterial`, `MeshPhongMaterial`, etc.).
  - Types courants : `AmbientLight` (fond global), `DirectionalLight` (comme le soleil), `PointLight` (ampoule), `SpotLight` (projecteur).

- **❓ Pourquoi ?**
  - Sans lumière, les matériaux réalistes restent **noirs**. Les lumières donnent la **profondeur** et la **crédibilité** visuelle.

- **🔶 Analogie**
  - En photographie, la **qualité de la lumière** change drastiquement la perception (ombres, reflets, contraste).

- **🧪 Exemple minimal**
  ```js
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(3, 5, 2); // position de la source
  scene.add(dirLight);
  ```

> ℹ️ *Les ombres nécessitent une configuration spécifique du renderer et des objets (`castShadow`/`receiveShadow`). Nous les approfondirons au Chapitre 5.*

---

## 🧮 5. Transformations et formules en JavaScript

### 5.1 Translation, rotation, échelle

- **📘 Définition**
  - **Translation** : déplacement (ajout d’un vecteur à la position).
  - **Rotation** : pivot autour d’un axe, exprimée via angles (radians) ou quaternions.
  - **Échelle** : agrandissement/rétrécissement par facteurs `x`, `y`, `z`.

- **🧪 Formules JS (vecteurs et angles)**
  ```js
  // Translation : p' = p + t
  const p = new THREE.Vector3(1, 0, -2);
  const t = new THREE.Vector3(0.5, 0.0, 1.0);
  const pPrime = p.clone().add(t); // (1.5, 0, -1)

  // Rotation autour de Y (angle theta en radians)
  const theta = Math.PI / 4; // 45°
  const cos = Math.cos(theta), sin = Math.sin(theta);
  // Rotation d'un point (x, z) -> (x', z')
  const x = 1.0, z = -2.0;
  const xPrime = x * cos + z * sin;
  const zPrime = -x * sin + z * cos;

  // Échelle : s = (sx, sy, sz)
  const s = new THREE.Vector3(2, 1, 0.5);
  const original = new THREE.Vector3(1, 2, 3);
  const scaled = new THREE.Vector3(original.x * s.x, original.y * s.y, original.z * s.z);
  ```

### 5.2 Perspective et FOV (frustum)

- **📘 Définition**
  - **FOV** (*Field of View*) : angle de vue vertical (en degrés) pour `PerspectiveCamera`.
  - **Frustum** : pyramide tronquée qui délimite la zone visible entre `near` et `far`.

- **❓ Pourquoi ?**
  - Configurer correctement `FOV`, `aspect`, `near`, `far` évite des artefacts et correspond à l’intention (grand angle vs téléobjectif).

- **🧪 Formules JS (projection simplifiée)**
  ```js
  // Conversion degrés -> radians
  const degToRad = deg => deg * Math.PI / 180;

  const fovDeg = 60;
  const fovRad = degToRad(fovDeg);
  // Taille du demi-champ vertical à distance near : h = tan(FOV/2) * near
  const near = 0.1;
  const h = Math.tan(fovRad / 2) * near;

  // L'équivalent "focale" (normalisée) dans le repère NDC
  const focal = 1 / Math.tan(fovRad / 2); // plus FOV est grand, plus focal est petit

  // Aspect ratio et dimensions horizontales
  const aspect = window.innerWidth / window.innerHeight;
  const w = h * aspect; // demi-champ horizontal à near
  ```

---

## 🗺️ 6. Pipeline rendu : schéma

```mermaid
flowchart LR
  A[Scène (objets, lumières)] --> B[Caméra (point de vue)]
  B --> C[Renderer (WebGL)]
  C --> D[Pixel affiché sur l'écran]
```

---

## 🛠️ 7. Mise en place : deux approches (CDN et ES Modules)

### 7.1 Via `<script>` (CDN UMD)

> ✅ Simple pour démarrer rapidement sans bundler.

```html
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Three.js — Chapitre 1</title>
  <style>
    html, body { margin: 0; height: 100%; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src=\"https://unpkg.com/three@latest/build/three.min.js\"></script>
  <script>
    // Scène
    const scene = new THREE.Scene();

    // Caméra
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Objet : cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x2194f3, roughness: 0.6, metalness: 0.1 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lumière directionnelle
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 3, 2);
    scene.add(light);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.005;
      renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```

### 7.2 Via ES Modules (npm ou CDN module-friendly)

> ✅ Recommandé pour projets modernes (imports explicites, bundlers). Exemple avec import depuis *esm.run*.

```html
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Three.js — Modules</title>
  <style>
    html, body { margin: 0; height: 100%; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type=\"module\">
    import * as THREE from 'https://esm.run/three@latest';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.5, metalness: 0.2 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 3, 2);
    scene.add(light);

    const clock = new THREE.Clock();

    function animate() {
      const dt = clock.getDelta(); // temps écoulé depuis le dernier frame
      cube.rotation.y += 1.0 * dt; // rad/s
      cube.rotation.x += 0.5 * dt;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```

---

## 🧪 8. Exemple pratique guidé : scène vide + caméra + cube

> 🎯 *But :* assembler tous les concepts pour produire un rendu avec un **cube en rotation**.

**Étapes :**
1. Créer la scène.
2. Créer et positionner la caméra.
3. Initialiser le renderer et ajouter le `canvas` au document.
4. Créer un cube (géométrie + matériau → mesh) et l’ajouter à la scène.
5. Ajouter une lumière directionnelle.
6. Mettre en place une boucle d’animation qui met à jour la rotation du cube.
7. Gérer le redimensionnement de la fenêtre.

> ℹ️ Voir les deux variantes de code (CDN et Modules) ci-dessus.

---

## 🧪 9. Exercices (pratique autonome)

1. **Changer la couleur du cube** en fonction du temps (ex. interpolation HSL → RGB).
2. **Déplacer la caméra** pour tester différents points de vue (ex. `camera.position.set(2, 2, 2)`).
3. **Ajouter une sphère** avec un autre matériau (`MeshPhongMaterial`) et comparer l’éclairage.
4. **Activer les ombres** (aperçu) : `renderer.shadowMap.enabled = true;`, `light.castShadow = true;`, `cube.castShadow = true;`, `plane.receiveShadow = true;`.

---

## 🧰 10. Bonnes pratiques (dès le début)

- Utilisez `requestAnimationFrame` pour la boucle d’animation ; évitez `setInterval`.
- Mettez à jour la projection de la caméra après un changement d’aspect (`camera.updateProjectionMatrix()`).
- Gérez le *resize* pour conserver un rendu net.
- Commencez avec des **objets simples** et ajoutez de la complexité progressivement.

---

## ✅ 11. Résumé des points essentiels (Chapitre 1)

- La 3D dans Three.js repose sur **Scene + Camera + Renderer**.
- Le **repère** est **main droite**, **Y vers le haut**, la **caméra** regarde par défaut **vers −Z**.
- Un **mesh** = **géométrie** (forme) + **matériau** (apparence).
- Les **lumières** sont nécessaires pour les matériaux réalistes (non-basics).
- Le **FOV** et le **frustum** déterminent ce qui est visible ; utilisez les **formules en JS** pour raisonner (ex. `Math.tan(FOV/2)`).
- Vous savez afficher un **cube** et le **faire tourner** dans une boucle d’animation.

---

## 🔭 12. Prochaines étapes

- Passer au **Chapitre 2** : approfondir les caméras (perspective vs orthographique), régler précisément le frustum, et manipuler l’orientation.

