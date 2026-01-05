
Jusqu'à présent, nous avons utilisé `ctx.fillRect` pour dessiner nos entités. C'est rapide et utile pour le prototypage, mais un vrai jeu utilise des images. En développement 2D, ces images sont appelées des **Sprites**.

Le défi technique de ce chapitre est double :

1. Gérer le chargement **asynchrone** des images sur le web.
    
2. Comprendre comment découper et afficher une partie seulement d'une image pour créer une animation.
    

## 1. Le Défi du Chargement Asynchrone

En JavaScript, contrairement à d'autres langages de bureau (C++, C#), le chargement d'une image n'est pas instantané. Le navigateur doit envoyer une requête au serveur, télécharger le fichier, puis le décoder.

### Le Problème

Si vous écrivez ce code dans votre fonction d'initialisation :

```
const heroImage = new Image();
heroImage.src = 'hero.png';
ctx.drawImage(heroImage, 0, 0); // ERREUR POTENTIELLE !
```

...il y a 99% de chances que rien ne s'affiche. Pourquoi ? Parce que le code JavaScript continue de s'exécuter sans attendre que l'image soit téléchargée. Au moment où `drawImage` est appelé, l'image est encore vide.

### La Solution : L'événement `onload`

Nous devons attendre que le navigateur nous signale que l'image est prête avant de tenter de la dessiner.

```
const heroImage = new Image();
// On définit ce qui doit se passer QUAND l'image sera prête
heroImage.onload = function() {
    console.log("Image chargée !");
    // C'est seulement maintenant qu'on peut lancer la boucle de jeu en toute sécurité
    requestAnimationFrame(gameLoop);
};
// On lance le téléchargement
heroImage.src = 'assets/hero.png';
```

> **Note Technique :** Pour un jeu complet avec des dizaines d'images, on utilise un "Asset Manager" qui compte le nombre d'images à charger et ne démarre le jeu que lorsque le compteur atteint 100%. (Nous aborderons cela brièvement au Chapitre 8).

---

## 2. L'outil suprême : `ctx.drawImage()`

La méthode `drawImage` du contexte 2D est le couteau suisse du rendu graphique. Elle possède trois signatures (façons de l'appeler) différentes, selon le niveau de contrôle souhaité.

### Niveau 1 : Rendu simple (3 arguments)

`drawImage(image, dx, dy)` Dessine l'image entière à la position de destination (dx,dy) sur le canvas. L'image conserve sa taille originale.

### Niveau 2 : Rendu avec redimensionnement (5 arguments)

`drawImage(image, dx, dy, dWidth, dHeight)` Dessine l'image entière, mais l'étire ou la compresse pour qu'elle rentre dans le rectangle de destination défini par dWidth et dHeight.

### Niveau 3 : Le découpage (9 arguments) - Vital pour les Sprites

C'est la version que nous utiliserons pour les animations. Elle permet de ne dessiner qu'un morceau de l'image source.

`drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)`

Il y a beaucoup d'arguments, mais ils sont logiques si on les sépare en deux groupes :

- **Source (s) :** Les 4 arguments commençant par 's' définissent le rectangle de découpe dans le fichier image original. "Où je prends l'image et quelle taille je découpe".
    
- **Destination (d) :** Les 4 arguments commençant par 'd' définissent où ce morceau découpé sera posé sur le canvas et à quelle taille.
    

### Analogie de l'emporte-pièce

> Imaginez que votre image source est une pâte à biscuits étalée. Les arguments **Source (s)** sont votre emporte-pièce : vous choisissez où vous le posez sur la pâte (sx,sy) et sa taille (sWidth,sHeight). Les arguments **Destination (d)** sont votre plaque de cuisson (le canvas) : vous déposez le morceau de pâte découpé à un endroit précis (dx,dy).

---

## 3. Les Sprite Sheets (Feuilles de Sprites)

Pour des raisons de performance, il est très mauvais d'avoir un fichier image séparé pour chaque pose d'un personnage (ex: `hero_run_1.png`, `hero_run_2.png`, etc.). Cela multiplierait les requêtes HTTP.

### Définition

Une **Sprite Sheet** est une seule grande image qui contient toutes les frames (étapes) d'animation d'un personnage, généralement alignées sur une grille.

[Image montrant une sprite sheet classique : un personnage avec plusieurs colonnes pour l'animation de marche, et plusieurs lignes pour les différentes directions]

Si votre personnage fait 64x64 pixels et que son animation de course comporte 6 frames, votre sprite sheet fera 384x64 pixels (6 * 64 de large).

---

## 4. La Logique d'Animation

Animer un sprite revient à utiliser `drawImage` avec 9 arguments, en changeant la coordonnée sx (Source X) au fil du temps pour déplacer notre "emporte-pièce" sur la sprite sheet.

Pour gérer une animation, notre entité a besoin de nouvelles propriétés :

1. `frameIndex` : Quelle image de la séquence on affiche actuellement (ex: 0, 1, 2, 3...).
    
2. `tickCount` : Un compteur de temps (ou de frames de jeu) écoulé depuis le dernier changement d'image.
    
3. `ticksPerFrame` : La vitesse de l'animation. Combien de tours de boucle de jeu doit-on attendre avant de passer à l'image suivante ? (Plus le chiffre est bas, plus l'animation est rapide).
    
4. `numberOfFrames` : Combien d'images contient l'animation au total.
    

### L'algorithme d'update d'animation

À chaque tour de boucle (dans la méthode `update` de l'entité) :

1. On incrémente le compteur de temps : `tickCount++`.
    
2. Si le compteur dépasse la limite (`tickCount > ticksPerFrame`) :
    
    - On remet le compteur à zéro.
        
    - On passe à la frame suivante : `frameIndex++`.
        
    - Si on dépasse la dernière frame (`frameIndex >= numberOfFrames`), on boucle au début : `frameIndex = 0`.
        

### Le calcul de rendu

Dans la méthode `draw`, on calcule la position de découpe sx :

sx=frameIndex×largeurDeLaFrame

```
// Exemple dans la méthode draw(ctx) de l'entité
const frameWidth = 64;
const frameHeight = 64;
// Calcul de la position horizontale dans la sprite sheet
let sx = this.frameIndex * frameWidth; 
// La ligne verticale (si on a plusieurs animations sur la même feuille)
let sy = 0; 

ctx.drawImage(
    this.spriteSheetImage, // L'image source complète
    sx, sy, frameWidth, frameHeight, // Le découpage (Source)
    this.x, this.y, this.width, this.height // L'affichage (Destination)
);
```

## Résumé des points essentiels

- Les images se chargent de manière **asynchrone** ; il faut utiliser `onload`.
    
- `drawImage()` avec **9 arguments** est essentiel pour le découpage de sprites.
    
- Une **Sprite Sheet** regroupe toutes les animations dans une seule image optimisée.
    
- L'animation consiste à déplacer le rectangle de découpe source (sx) sur la sprite sheet à intervalles réguliers.

## 2. La méthode `drawImage` avancée (Découpage)

Pour utiliser des sprite sheets, nous devons utiliser la version la plus complexe de `ctx.drawImage()`, qui prend 9 paramètres.

### Signature

`ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);`

### Explication des paramètres

On distingue deux groupes : la source (le fichier image) et la destination (le canvas).

|Paramètre|Type|Description|
|---|---|---|
|**image**|Image Object|L'objet image chargé (la sprite sheet complète).|
|**sx**|Source X|Coordonnée X du coin haut-gauche de la découpe DANS l'image.|
|**sy**|Source Y|Coordonnée Y du coin haut-gauche de la découpe DANS l'image.|
|**sWidth**|Source Width|Largeur du rectangle à découper.|
|**sHeight**|Source Height|Hauteur du rectangle à découper.|
|**dx**|Destination X|Coordonnée X où placer l'image SUR LE CANVAS.|
|**dy**|Destination Y|Coordonnée Y où placer l'image SUR LE CANVAS.|
|**dWidth**|Dest. Width|Largeur finale sur le canvas (permet le zoom).|
|**dHeight**|Dest. Height|Hauteur finale sur le canvas.|
```
class AnimatedEntity {
    constructor(x, y, imageSheet) {
        this.x = x;
        this.y = y;
        this.image = imageSheet;
        
        // Dimensions d'UNE SEULE frame dans la feuille
        this.frameWidth = 64;
        this.frameHeight = 64;

        // État de l'animation
        this.frameIndex = 0;       // Quelle image on affiche (0, 1, 2...)
        this.tickCount = 0;        // Compteur de temps
        this.ticksPerFrame = 10;   // Vitesse : plus c'est petit, plus c'est rapide
        this.numberOfFrames = 4;   // Combien d'images dans la séquence
    }

    update(dt) {
        // Logique de mouvement standard...
        // this.x += this.vx * dt;

        // Logique d'animation
        this.tickCount++;

        if (this.tickCount > this.ticksPerFrame) {
            // On reset le timer
            this.tickCount = 0;
            
            // On passe à la frame suivante
            if (this.frameIndex < this.numberOfFrames - 1) {
                this.frameIndex++;
            } else {
                // On boucle au début
                this.frameIndex = 0;
            }
        }
    }

    draw(ctx) {
        // Calcul de la position de découpe (Source X)
        // Si frameIndex est 2 et frameWidth est 64, sx = 128.
        let sx = this.frameIndex * this.frameWidth;
        let sy = 0; // On suppose une seule ligne d'animation pour l'instant

        ctx.drawImage(
            this.image,          // Source image
            sx, sy,              // Source position
            this.frameWidth, this.frameHeight, // Source dimensions
            this.x, this.y,      // Dest position
            this.frameWidth, this.frameHeight  // Dest dimensions (pas de zoom ici)
        );
    }
}
```

### Gestion des états (Avancé)

Si votre sprite sheet contient l'animation "Marche" sur la ligne 0 (sy=0) et "Saut" sur la ligne 1 (sy=64), vous pouvez changer la propriété `this.animationRow` en fonction de l'état du joueur (au sol ou en l'air) pour changer instantanément d'animation.
