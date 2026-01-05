
# 🎥 **Chapitre 2 — La Scène et la Caméra**

> 👨‍🏫 *Objectif :* approfondir la configuration de la **scène** et des **caméras** dans Three.js. Vous apprendrez à créer une scène, choisir entre **PerspectiveCamera** et **OrthographicCamera**, comprendre leurs paramètres (FOV, aspect, near/far), positionner et orienter la caméra, et mettre en pratique avec un exemple guidé.

---

## 🧩 1. La scène (`THREE.Scene`)

- **📘 Définition**
  - Une **scène** est le conteneur global qui regroupe tous les éléments 3D : objets, lumières, brouillard, arrière-plan.

- **❓ Pourquoi ?**
  - Sans scène, il n’y a pas de contexte pour placer vos objets. Elle agit comme un **univers** dans lequel tout existe.

- **🔶 Analogie**
  - Imaginez un **plateau de cinéma** : la scène est l’espace où vous disposez les décors et acteurs.

- **🧪 Exemple minimal**
  ```js
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222); // couleur de fond
  ```

---

## 🎥 2. Les caméras : Perspective vs Orthographique

### 2.1 `THREE.PerspectiveCamera`

- **📘 Définition**
  - Caméra avec **projection en perspective** : les objets éloignés paraissent plus petits.

- **Paramètres :**
  - `fov` : champ de vision vertical (en degrés).
  - `aspect` : ratio largeur/hauteur.
  - `near` : distance minimale visible.
  - `far` : distance maximale visible.

- **🧪 Exemple**
  ```js
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  ```

### 2.2 `THREE.OrthographicCamera`

- **📘 Définition**
  - Caméra avec **projection orthographique** : pas de perspective, taille constante quel que soit l’éloignement.

- **Paramètres :**
  - `left`, `right`, `top`, `bottom` : limites du volume visible.
  - `near`, `far` : distances de coupe.

- **🧪 Exemple**
  ```js
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 5;
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100
  );
  ```

- **❓ Pourquoi choisir l’un ou l’autre ?**
  - Perspective : réaliste pour la plupart des scènes.
  - Orthographique : utile pour des vues techniques (plans, jeux 2D, CAD).

---

## 📐 3. Paramètres clés et formules JS

- **Conversion FOV degrés → radians**
  ```js
  const degToRad = deg => deg * Math.PI / 180;
  const fovRad = degToRad(60);
  ```

- **Calcul du demi-champ à distance near**
  ```js
  const near = 0.1;
  const h = Math.tan(fovRad / 2) * near;
  ```

- **Aspect ratio**
  ```js
  const aspect = window.innerWidth / window.innerHeight;
  ```

---

## 🧭 4. Positionner et orienter la caméra

- **📘 Définition**
  - `camera.position.set(x, y, z)` : définit la position.
  - `camera.lookAt(x, y, z)` : oriente la caméra vers un point.

- **🧪 Exemple**
  ```js
  camera.position.set(2, 2, 5);
  camera.lookAt(0, 0, 0);
  ```

- **🔶 Analogie**
  - Comme un **photographe** qui se déplace et ajuste son objectif pour cadrer la scène.

---

## 🧪 5. Exemple pratique guidé

> 🎯 *But :* créer une scène avec deux caméras (perspective et orthographique) et basculer entre elles.

```html
<!DOCTYPE html>
<html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Three.js — Chapitre 2</title>
  <style>
    html, body { margin: 0; height: 100%; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src=\"https://unpkg.com/three@latest/build/three.min.js\"></script>
  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    const aspect = window.innerWidth / window.innerHeight;

    const cameraPerspective = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    cameraPerspective.position.set(3, 2, 5);

    const frustumSize = 5;
    const cameraOrtho = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100
    );
    cameraOrtho.position.set(3, 2, 5);

    let activeCamera = cameraPerspective;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x2194f3 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 3, 2);
    scene.add(light);

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      renderer.render(scene, activeCamera);
    }
    animate();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'o') activeCamera = cameraOrtho;
      if (e.key === 'p') activeCamera = cameraPerspective;
    });

    window.addEventListener('resize', () => {
      const aspect = window.innerWidth / window.innerHeight;
      cameraPerspective.aspect = aspect;
      cameraPerspective.updateProjectionMatrix();

      cameraOrtho.left = frustumSize * aspect / -2;
      cameraOrtho.right = frustumSize * aspect / 2;
      cameraOrtho.top = frustumSize / 2;
      cameraOrtho.bottom = frustumSize / -2;
      cameraOrtho.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
```

---

## 🧪 6. Exercices

1. **Changer le FOV** de la caméra perspective et observer l’effet.
2. **Modifier le frustum** de la caméra orthographique pour zoomer/dézoomer.
3. **Ajouter une deuxième forme** (ex. sphère) et tester le cadrage.
4. **Créer un bouton HTML** pour basculer entre les deux caméras.

---

## 🧰 7. Bonnes pratiques

- Toujours mettre à jour la **projection** après modification des paramètres (`camera.updateProjectionMatrix()`).
- Ajuster le **aspect ratio** lors du redimensionnement.
- Choisir la caméra en fonction du **contexte visuel** (réalisme vs technique).

---

## ✅ 8. Résumé des points essentiels

- La **scène** est le conteneur global.
- Deux types principaux de caméras : **Perspective** (réaliste) et **Orthographique** (technique).
- Paramètres clés : `fov`, `aspect`, `near`, `far` (perspective) ; `left`, `right`, `top`, `bottom` (orthographique).
- Positionner la caméra avec `position.set()` et orienter avec `lookAt()`.
- Exemple pratique : basculer entre deux caméras avec un simple événement clavier.

---

## 🔭 Prochain chapitre

- **Chapitre 3 : Le Rendu avec WebGLRenderer** — configuration avancée, boucle d’animation optimisée.

