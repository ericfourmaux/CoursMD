# Chapitre 1 : Bases du développement de jeux en JavaScript

## 1. Qu’est-ce qu’un jeu vidéo ?
Un **jeu vidéo** est un programme interactif qui combine **logique**, **graphismes**, **sons** et **entrées utilisateur** pour créer une expérience ludique.

Composants essentiels :
- **Boucle de jeu (Game Loop)** : cœur du jeu, qui met à jour l’état et affiche le rendu en continu.
- **Logique** : règles du jeu (score, collisions, conditions de victoire).
- **Rendu** : affichage visuel (Canvas, WebGL).
- **Entrées** : clavier, souris, tactile.

Pourquoi une boucle ?
- Lire les entrées
- Mettre à jour la logique
- Redessiner la scène

---

## 2. Architecture d’un jeu simple
Cycle :
```
Initialisation → Boucle de jeu → Fin
```

### Boucle principale (Game Loop)
Elle exécute en continu :
1. **Update** : mise à jour des positions, états.
2. **Render** : dessin des éléments à l’écran.

Exemple minimal :
```javascript
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();
```

---

## 3. Gestion du temps (FPS et deltaTime)
- **FPS (Frames Per Second)** : nombre d’images par seconde.
- **deltaTime** : temps écoulé entre deux frames (en secondes).

Formule :
```javascript
position += vitesse * deltaTime;
```

Calcul de deltaTime :
```javascript
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // en secondes
    lastTime = timestamp;
    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

---

## 4. Canvas API
Le **Canvas** est une zone de dessin en 2D dans le navigateur.

Créer un Canvas :
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
```

Dessiner avec JavaScript :
```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Rectangle rouge
ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 100, 100);

// Cercle bleu
ctx.beginPath();
ctx.arc(300, 150, 50, 0, Math.PI * 2);
ctx.fillStyle = 'blue';
ctx.fill();
```

---

## Analogie
Imagine un **dessinateur** qui :
- Efface la feuille
- Redessine la scène avec les nouvelles positions
- Répète 60 fois par seconde

---

## Résumé des points essentiels
- Un jeu = boucle + logique + rendu + entrées.
- La **boucle de jeu** utilise `requestAnimationFrame`.
- **deltaTime** garantit des mouvements cohérents.
- **Canvas** = outil principal pour dessiner en 2D.
