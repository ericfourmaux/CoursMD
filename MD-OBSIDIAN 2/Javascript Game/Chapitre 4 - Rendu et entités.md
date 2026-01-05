
Dans un jeu vidéo, presque tout ce que vous voyez à l'écran est une **Entité**. Un joueur, un monstre, un bonus ou même une particule de fumée partagent des propriétés communes (position, vitesse, apparence).

## 1. Qu'est-ce qu'une Entité ? (Définition et POO)

### Définition

En développement de jeux, une **Entité** est un objet logique qui possède un état (données) et un comportement (fonctions).

En JavaScript, nous utilisons les **Classes** pour créer des "moules" à entités.

- **Les Propriétés (L'état) :** `x`, `y`, `width`, `height`, `color`.
    
- **Les Méthodes (Le comportement) :** `update()` pour la logique et `draw()` pour l'affichage.
    

### Pourquoi la POO ?

Imaginez créer 10 ennemis en déclarant manuellement `enemy1_x`, `enemy2_x`, etc. C'est impossible à maintenir. La POO permet d'encapsuler la logique : chaque ennemi sait lui-même comment il doit se déplacer et se dessiner.

### L'Analogie

> Considérez une **Classe** comme une **recette de cuisine** (le plan) et un **Objet** comme le **plat cuisiné** (l'instance). Avec une seule recette "Crêpe", vous pouvez cuisiner 100 crêpes individuelles. Si vous modifiez la recette pour ajouter du sucre, toutes les prochaines crêpes en auront.

---

## 2. La structure "Sainte Trinité" d'une Classe de Jeu

Toute entité bien conçue dans un moteur de jeu JS doit suivre une structure interne rigoureuse composée de trois parties :

### A. Le Constructor (La naissance)

C'est ici que l'on initialise les données de l'objet au moment de sa création.

```
constructor(x, y, color) { 
	this.x = x; 
	this.y = y; 
	this.color = color; 
	this.width = 50; 
	this.height = 50; 
}
```

### B. La méthode Update (Le cerveau)

Appelée à chaque itération de la _Game Loop_. Elle gère la logique de mouvement et les calculs mathématiques (vus au Chapitre 3). Elle reçoit souvent le `deltaTime` en paramètre.

### C. La méthode Draw (Le corps)

Appelée juste après `update`. Elle contient exclusivement les instructions de dessin liées au `context` du Canvas.

---

## 3. Le Pipeline de Rendu Global

Maintenant que nos objets sont encapsulés, comment les intégrer dans la boucle de jeu ? On utilise un **Tableau d'Entités**.

### Théorie de la gestion de liste

Au lieu de gérer chaque variable, on crée un tableau : `const entities = []`.

1. On ajoute les objets dedans : `entities.push(new Enemy(100, 200))`.
    
2. Dans la boucle principale, on parcourt le tableau pour mettre à jour et dessiner chaque élément.
    

**Avantage technique :** Cela permet de gérer dynamiquement l'apparition (spawn) et la disparition (mort) des objets simplement en ajoutant ou retirant des éléments du tableau.

---

## 4. Exemple Concret : La classe `Player`

Voici comment nous appliquons la théorie pour créer un joueur capable de se déplacer.

```
class Player { 
	constructor(canvasWidth, canvasHeight) { 
		this.width = 50; 
		this.height = 50; 
		// Positionnement au centre via la formule du Chapitre 1 
		this.x = canvasWidth / 2 - this.width / 2; 
		this.y = canvasHeight / 2 - this.height / 2; 
		this.speed = 200; 
		// Pixels par seconde 
	} 
	
	update(dt) { 
		// Logique de mouvement simple (ici automatique vers la droite)
		this.x += this.speed * dt; 
	} 
	
	draw(ctx) { 
		ctx.fillStyle = "blue"; 
		ctx.fillRect(this.x, this.y, this.width, this.height); 
	} 
}
```

## Résumé des points essentiels

1. **L'Entité** est l'unité de base d'un jeu (objet + logique).
    
2. La **POO (Classes)** permet de réutiliser le code et de gérer des centaines d'objets facilement.
    
3. Une classe de jeu doit toujours avoir un `constructor`, un `update(dt)` et un `draw(ctx)`.
    
4. On centralise les objets dans un **tableau** pour les traiter en masse dans la Game Loop.

## 3. Gestion de masse : Le Tableau d'Entités

Pour gérer un monde dynamique, nous stockons toutes nos instances dans un tableau.

```
const entities = [];

// Initialisation
entities.push(new Player(0, 0, 'blue'));
entities.push(new Enemy(200, 100, 'red'));

// Dans la Game Loop
function gameLoop(timestamp) {
    let dt = calculateDeltaTime(timestamp);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    entities.forEach(entity => {
        entity.update(dt);
        entity.draw(ctx);
    });

    requestAnimationFrame(gameLoop);
}
```

## 4. Concepts Avancés : L'Héritage

L'héritage permet de créer une classe de base `Entity` et des classes spécialisées `Player` ou `Enemy` qui héritent des propriétés de base.

**Avantage :** Si vous décidez que toutes les entités doivent subir la gravité, vous ne modifiez que la classe parente `Entity`.

```
class Bullet extends Entity {
    constructor(x, y) {
        super(x, y, 'yellow'); // Appelle le constructeur de Entity
        this.vx = 500; // Les balles vont vite
    }
}
```

## 5. Mathématiques appliquées : Le "Z-Index" manuel

Puisque le Canvas est en **mode immédiat**, l'ordre de dessin est crucial.

- Les premiers objets dessinés seront au "fond" (arrière-plan).
    
- Les derniers objets dessinés seront au "dessus" (premier-plan).
    

> [!TIP] Organisation Pour gérer la profondeur, triez votre tableau d'entités avant le dessin : `entities.sort((a, b) => a.y - b.y);` (Cela permet de faire passer un personnage derrière un arbre si son Y est plus petit).