
# 🔄 **Chapitre 8 — Animation et Physique**

> 👨‍🏫 *Objectif :* maîtriser les **animations** dans Three.js (boucle, delta `dt`, interpolation, easing, **GSAP**), et poser les bases de la **physique** (intégration temporelle, gravité, frottements, collisions simples, ressort amorti). Vous apprendrez à bâtir une **boucle de mise à jour** robuste, **indépendante du framerate**, et à structurer proprement votre code.

---

## 🧩 1. Animation : principes fondamentaux

- **📘 Définition**
  - Une **animation** est la mise à jour **continue** de propriétés (position, rotation, couleur…) en fonction du **temps**.
  - Dans Three.js, on utilise la **boucle de rendu** (`requestAnimationFrame`) et/ou des **librairies d’easing** (ex. GSAP) pour interpoler.

- **❓ Pourquoi ?**
  - Donner de la **vie** à la scène, expliquer des concepts, guider l’utilisateur.

- **🔶 Analogie**
  - Pensez à la **seconde main** d’une montre : chaque tick avance d’un **delta de temps**. Une animation fait évoluer un état selon des **pas de temps**.

---

## 🕒 2. Boucle d’animation & gestion du temps

### 2.1 Boucle classique (avec `THREE.Clock`)
```js
const clock = new THREE.Clock();

function animate(){
  const dt = Math.min(clock.getDelta(), 0.05); // clamp pour éviter grands sauts

  // 1) Mettre à jour l'état (animations, physiques)
  cube.rotation.y += 1.0 * dt;  // rad/s
  cube.rotation.x += 0.5 * dt;

  // 2) Rendu
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
animate();
```

### 2.2 Boucle à pas **fixe** (physique stable)
> 🧠 *Idée :* accumuler le temps et avancer la **simulation** par **pas constant** (ex. 60 Hz = `dtFixe = 1/60`).
```js
const clock = new THREE.Clock();
let acc = 0;
const dtFixe = 1/60; // ~16.67 ms

function animate(){
  acc += clock.getDelta();
  while (acc >= dtFixe){
    stepPhysics(dtFixe); // avance la simulation (positions, vitesses)
    acc -= dtFixe;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

---

## 🎚️ 3. Interpolation & easing (JS pur)

- **📘 Définition**
  - **Interpolation linéaire** (*lerp*) : `lerp(a,b,t) = a*(1-t) + b*t`, où `t∈[0,1]`.
  - **Easing** : modifier la courbe de progression pour des mouvements **naturels** (*ease-in, ease-out, elastic*…).

**Fonctions utiles (JS)**
```js
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = x => Math.min(1, Math.max(0, x));

// Easing courants
const easeInQuad  = t => t*t;
const easeOutQuad = t => t*(2-t);
const easeInOutQuad = t => t<0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
const easeOutElastic = t => {
  const c4 = (2 * Math.PI) / 3;
  return t===0 ? 0 : t===1 ? 1 : Math.pow(2, -10*t) * Math.sin((t*10 - 0.75)*c4) + 1;
};
```

**Exemple : animer la couleur (HSL → JS)**
```js
// Interpoler une teinte sur 3s
let t = 0; const T = 3;
function animateColor(dt){
  t = Math.min(T, t + dt);
  const k = easeInOutQuad(t/T);
  const hue = lerp(200, 20, k); // 200° -> 20°
  cube.material.color.setHSL(hue/360, 0.6, 0.5);
}
```

---

## 🪄 4. GSAP : animations déclaratives

- **📘 Définition**
  - **GSAP** est une librairie d’animation qui interpolate **propriétés** d’objets JS (dont Three.js) avec **timelines**, **easings**, **callbacks**.

- **❓ Pourquoi ?**
  - Écrire des animations **expressives** (enchaînements, synchronisation), sans gérer manuellement le temps.

### 4.1 Import (Modules)
```html
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { gsap } from 'https://esm.run/gsap@latest';

  // ... init scene/camera/renderer
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color:0x2194f3 }));
  scene.add(cube);

  // Animation GSAP : aller-retour
  gsap.to(cube.position, { x: 2, duration: 2, ease: 'power2.inOut', yoyo: true, repeat: -1 });
  gsap.to(cube.rotation, { y: Math.PI*2, duration: 5, ease: 'none', repeat: -1 });

  // Timeline : séquence coordonnée
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(cube.scale, { x:1.5, y:1.5, z:1.5, duration: 1, ease: 'back.out(1.4)' })
    .to(cube.material, { metalness: 0.6, roughness: 0.2, duration: 1 }, '<');
</script>
```

### 4.2 Contrôler caméra avec GSAP
```js
// Focus caméra sur un objet
function focusCamera(obj, dur=1.2){
  const target = obj.position.clone();
  gsap.to(camera.position, { x: target.x + 2, y: target.y + 1.2, z: target.z + 3, duration: dur, ease: 'power3.inOut' });
  // Astuce : si vous utilisez OrbitControls, mettez à jour controls.target aussi
  gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: dur, onUpdate: ()=> controls.update() });
}
```

---

## 🧮 5. Physique : bases & intégration

### 5.1 Lois de Newton (rappel rapide)
- **Force → accélération** : `F = m * a`, donc `a = F / m`.
- **Intégration (semi-implicite Euler)** :
```js
// v(t+dt) = v(t) + a*dt
// x(t+dt) = x(t) + v(t+dt)*dt
function stepParticle(p, dt){
  // p = { pos:Vector3, vel:Vector3, mass:number, force:Vector3 }
  const a = p.force.clone().multiplyScalar(1/p.mass);
  p.vel.addScaledVector(a, dt);
  p.pos.addScaledVector(p.vel, dt);
}
```

### 5.2 Gravité, frottements, traînée
```js
const G = new THREE.Vector3(0, -9.81, 0); // m/s^2
const dragK = 0.8; // coefficient de traînée linéaire (simple)
function accumulateForces(p){
  // Gravité
  p.force.copy(G.clone().multiplyScalar(p.mass));
  // Traînée proportionnelle à la vitesse
  p.force.add(p.vel.clone().multiplyScalar(-dragK));
}
```

### 5.3 Collision simple : sol (y=0) avec restitution
```js
function collideFloor(p, restitution=0.6){
  if (p.pos.y < 0){
    p.pos.y = 0;                 // reposition sur le sol
    if (p.vel.y < 0) p.vel.y = -p.vel.y * restitution; // rebond
  }
}
```

### 5.4 Ressort amorti (harmonique)
```js
// Force ressort : F = -k * (x - x0) - c * v
function springForce(x, v, x0, k=20, c=3){
  return (x - x0) * -k + v * -c; // 1D pour pédagogie
}
```

**Schéma (Mermaid) — pipeline physique**
```mermaid
flowchart LR
  A[Accumuler forces (gravité, frottements)] --> B[Intégrer vitesses]
  B --> C[Intégrer positions]
  C --> D[Résoudre collisions]
  D --> E[Mise à jour objets Three.js]
```

---

## 🧪 6. Exemple pratique : balle qui rebondit (physique simple)

### Variante CDN
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Balle rebondissante</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script src="https://unpkg.com/three@latest/build/three.min.js"></script>
<script>
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 }));
  ground.rotation.x = -Math.PI/2; scene.add(ground);
  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.7));

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), new THREE.MeshStandardMaterial({ color:0x2194f3, roughness:0.4, metalness:0.1 }));
  ball.position.set(0, 2, 0); scene.add(ball);

  const p = { pos: ball.position, vel: new THREE.Vector3(0, 0, 0), mass: 1, force: new THREE.Vector3() };
  const clock = new THREE.Clock(); const dragK = 0.5; const G = new THREE.Vector3(0,-9.81,0);

  function step(dt){
    // forces
    p.force.copy(G.clone().multiplyScalar(p.mass));
    p.force.add(p.vel.clone().multiplyScalar(-dragK));
    // semi-implicite Euler
    const a = p.force.clone().multiplyScalar(1/p.mass);
    p.vel.addScaledVector(a, dt);
    p.pos.addScaledVector(p.vel, dt);
    // collision sol
    if (p.pos.y < 0){ p.pos.y = 0; if (p.vel.y < 0) p.vel.y = -p.vel.y * 0.65; }
  }

  function animate(){
    const dt = Math.min(clock.getDelta(), 0.05);
    step(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } animate();

  addEventListener('resize', ()=>{ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
</script>
</body>
</html>
```

### Variante Modules + GSAP (rebond + zoom caméra)
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js — Physique + GSAP</title>
  <style> html, body { margin:0; height:100%; } canvas { display:block; } </style>
</head>
<body>
<script type="module">
  import * as THREE from 'https://esm.run/three@latest';
  import { gsap } from 'https://esm.run/gsap@latest';

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);

  scene.add(new THREE.HemisphereLight(0x88c0d0, 0x2e3440, 0.7));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshStandardMaterial({ color:0x1b1b29, roughness:0.9 })); ground.rotation.x = -Math.PI/2; scene.add(ground);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), new THREE.MeshStandardMaterial({ color:0xff7043, roughness:0.4, metalness:0.1 })); ball.position.set(0, 2, 0); scene.add(ball);

  const p = { pos: ball.position, vel: new THREE.Vector3(0, 0, 0), mass: 1, force: new THREE.Vector3() };
  const clock = new THREE.Clock(); const G = new THREE.Vector3(0,-9.81,0), dragK = 0.5;

  function step(dt){
    p.force.copy(G.clone().multiplyScalar(p.mass));
    p.force.add(p.vel.clone().multiplyScalar(-dragK));
    const a = p.force.clone().multiplyScalar(1/p.mass);
    p.vel.addScaledVector(a, dt);
    p.pos.addScaledVector(p.vel, dt);
    if (p.pos.y < 0){ p.pos.y = 0; if (p.vel.y < 0) p.vel.y = -p.vel.y * 0.7; bounceFX(); }
  }

  // Petit FX : zoom caméra au moment du rebond
  function bounceFX(){ gsap.fromTo(camera.position, { z: 4.6 }, { z: 5.0, duration: 0.25, ease: 'power2.out' }); }

  function animate(){ const dt = Math.min(clock.getDelta(), 0.05); step(dt); renderer.render(scene, camera); requestAnimationFrame(animate); } animate();
  addEventListener('resize', ()=>{ camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
</script>
</body>
</html>
```

---

## 🧪 7. Exercices

1. **Créer une timeline GSAP** pour animer un **logo 3D** : scale → rotation → couleur, avec `yoyo` et `repeat`.
2. **Implémenter une traînée** non-linéaire : `F_drag = -k * |v| * v` et comparer au drag linéaire.
3. **Ajouter un ressort** entre deux objets : calculer la **force** et animez l’oscillation avec **amortissement**.
4. **Collision sphère-sphère** : détecter l’intersection (`distance < r1 + r2`) et **séparer** + **répondre** (restitution simple).
5. **Pas fixe** : intégrer une **accumulation** du temps puis avancez la physique à `dtFixe=1/60`.
6. **Easing personnalisé** : implémentez une fonction **`easeInOutCubic`** et utilisez-la pour interpoler une couleur.
7. **Mesurer FPS** : calculez `fps = 1/dt` et affichez-le dans un overlay HTML.

---

## 🧰 8. Bonnes pratiques

- **Indépendance framerate** : utilisez `dt` et/ou le **pas fixe** pour la simulation.
- **Clampez `dt`** pour éviter des sauts (ex. onglet inactif → grand `dt`).
- **Séparez** la **simulation** (update) du **rendu** (draw) pour testabilité.
- **Mutualisez** vos objets (`Object3D`) et évitez d’allouer dans la boucle.
- **Profiling** : observez le **coût** de GSAP vs mise à jour manuelle selon la charge.
- **Stabilité physique** : préférez **semi-implicite Euler** à l’Euler explicite ; utilisez des **petits `dt`**.

---

## ✅ 9. Résumé des points essentiels (Chapitre 8)

- Une **animation** se pilote via une **boucle** et/ou une **librairie** (GSAP) pour l’easing/timeline.
- Le **delta `dt`** ou le **pas fixe** garantissent des mouvements **cohérents** quel que soit le **framerate**.
- **Physique** : forces → accélération → vitesses → positions (**semi-implicite Euler**), avec gravité/frottements/collisions.
- Les **ressorts amortis** modélisent des retours élastiques crédibles.
- **GSAP** simplifie les enchaînements et le contrôle de caméra ; combinez **physique + effets** pour enrichir l’UX.

---

## 🔭 10. Prochaines étapes

- **Chapitre 9 : Chargement de modèles 3D** — formats GLTF/GLB, `GLTFLoader`, matériaux PBR, organisation des assets.

