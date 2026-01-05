
# 📚 **Cours Three.js — Index (Syllabus)**

> 👨‍🏫 *Ce cours est conçu pour les débutants et vise une compréhension claire et rigoureuse de Three.js. Chaque chapitre est accompagné d'exemples, d'analogies, de schémas (Mermaid), de code JavaScript et d'un résumé des points essentiels.*

---

## 🗂️ **Plan détaillé du cours**

1. **📘 Chapitre 1 — Les Fondamentaux de la 3D**  
   - Scène, Caméra, Renderer ; Système de coordonnées (X, Y, Z) ; Mesh, Géométrie, Matériau ; Lumières et ombres ; Première scène avec un cube.
   - **Résumé essentiel :** Comprendre la triade *scène–caméra–renderer*, le repère 3D, et savoir afficher un mesh simple.

2. **🎥 Chapitre 2 — La Scène et la Caméra**  
   - `THREE.Scene`, `THREE.PerspectiveCamera` vs `THREE.OrthographicCamera`, paramètres (FOV, aspect, near/far), positionnement et orientation.
   - **Résumé essentiel :** Choisir la caméra adaptée, régler son frustum et la placer intelligemment dans la scène.

3. **🖥️ Chapitre 3 — Le Rendu avec WebGLRenderer**  
   - WebGL, configuration du renderer, taille, pixel ratio, couleur de fond, boucle d’animation (`requestAnimationFrame`).
   - **Résumé essentiel :** Savoir initialiser et piloter le rendu, optimiser le ratio pixel et la boucle d’animation.

4. **🧱 Chapitre 4 — Les Objets 3D**  
   - Géométries de base (Box, Sphere, Plane), matériaux (Basic, Standard, Phong), création et gestion des meshes.
   - **Résumé essentiel :** Maîtriser la composition *géométrie + matériau = mesh* et manipuler plusieurs objets.

5. **💡 Chapitre 5 — Lumières et Ombres**  
   - Ambient, Directional, Point, Spot ; activer et régler les ombres (`castShadow`, `receiveShadow`).
   - **Résumé essentiel :** Éclairer de manière crédible et obtenir des ombres propres.

6. **🖼️ Chapitre 6 — Textures et Mapping**  
   - `TextureLoader`, UV mapping, types (diffuse, normal, bump, roughness, metalness), réglages et répétitions.
   - **Résumé essentiel :** Charger et appliquer des textures adaptées, comprendre les UV et les maps courantes.

7. **🖱️ Chapitre 7 — Contrôles et Interaction**  
   - `OrbitControls` (zoom, rotation, pan), raycasting pour la sélection ; gestion des événements souris/clavier.
   - **Résumé essentiel :** Permettre l’exploration et l’interaction utilisateur basique.

8. **🔄 Chapitre 8 — Animation et Physique**  
   - Animations manuelles (rotation, translation), timeline avec GSAP ; notions de base de physique (intégration simple).
   - **Résumé essentiel :** Animer de manière fluide et orchestrer des transitions.

9. **📦 Chapitre 9 — Chargement de modèles 3D**  
   - Formats (GLTF/GLB, OBJ), `GLTFLoader`, matériaux PBR ; organisation et optimisation des assets.
   - **Résumé essentiel :** Importer des modèles réalistes et gérer leurs dépendances.

10. **⚙️ Chapitre 10 — Optimisation et Bonnes Pratiques**  
   - Performance (draw calls, textures, géométries), structure du code (modules, architecture), profiling.
   - **Résumé essentiel :** Construire des scènes performantes et du code maintenable.

11. **🌍 Chapitre 11 — Projet Final**  
   - Mini-scène interactive : planète texturée, lumière, caméra contrôlable, interaction contextuelle.
   - **Résumé essentiel :** Mettre en œuvre l’ensemble des acquis dans un projet cohérent.

---

## 🧭 **Navigation**
- 📘 **Chapitre 1** → `chapitre-01.md`
- Les autres chapitres seront ajoutés au fur et à mesure.

---

## 📝 **Notes**
- Les fichiers sont compatibles **Obsidian** : titres, sous-titres, icônes, code, et schémas Mermaid.
- Chaque chapitre inclut : définitions précises, *pourquoi*, exemples concrets, analogies, exercices, schémas et résumé.

