# Chapitre 2 : Programmation orientée jeu

## 1. Sprites et entités
### Définition
Un **sprite** est une image ou un élément graphique représentant un objet dans le jeu (personnage, ennemi, décor).
Une **entité** est un objet logique qui possède des propriétés (position, vitesse, état) et éventuellement un sprite pour l’affichage.

Pourquoi séparer logique et rendu ?
- La logique gère **ce que fait** l’objet (mouvement, collisions).
- Le rendu gère **comment il apparaît** (image, couleur).

### Exemple : créer une entité joueur
```javascript
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 200; // pixels par seconde
    }

    update(deltaTime) {
        this.x += this.speed * deltaTime; // mouvement horizontal
    }

    render(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, 50, 50);
    }
}
```

---

## 2. Système de coordonnées
### Définition
Le Canvas utilise un système de coordonnées **cartésien** :
- Origine (0,0) en **haut à gauche**.
- Axe X → vers la droite.
- Axe Y → vers le bas.

Analogie :
Imagine une feuille de papier posée sur une table :
- Le coin supérieur gauche = (0,0).
- Déplacer à droite = augmenter X.
- Descendre = augmenter Y.

### Formules utiles
Position après déplacement :
```javascript
x = x + vitesseX * deltaTime;
y = y + vitesseY * deltaTime;
```

Distance entre deux points :
```javascript
const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
```

---

## 3. Boucle de jeu en détail
### requestAnimationFrame vs setInterval
- **setInterval(fn, 16)** : exécute toutes les 16 ms (≈ 60 FPS), mais **ne s’adapte pas** si le navigateur ralentit.
- **requestAnimationFrame(fn)** : synchronisé avec le rafraîchissement de l’écran → animations fluides.

Exemple complet avec entité :
```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = new Player(50, 50);
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Update
    player.update(deltaTime);

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.render(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

---

## Résumé des points essentiels
- **Sprite** = image, **entité** = objet logique avec propriétés.
- Système de coordonnées : origine en haut à gauche.
- Utiliser **deltaTime** pour des mouvements cohérents.
- **requestAnimationFrame** > setInterval pour la fluidité.
