
Le développement d'un jeu vidéo en JavaScript repose majoritairement sur l'élément HTML5 `<canvas>`. Contrairement au développement web traditionnel, nous n'allons pas manipuler des boutons ou des paragraphes, mais des **pixels bruts**.

## 1. La Philosophie : Mode Immédiat vs Mode Retenu

Pour comprendre le Canvas, il faut d'abord comprendre comment le navigateur affiche d'ordinaire une page.

### Définitions

- **Mode Retenu (Retained Mode) :** C'est le fonctionnement du DOM (HTML/CSS). Le navigateur conserve en mémoire une structure (l'arbre DOM). Si vous créez une `<div>`, le navigateur "sait" qu'elle existe, où elle est, et peut gérer ses événements.
    
- **Mode Immédiat (Immediate Mode) :** C'est le fonctionnement du **Canvas**. Le navigateur ne conserve aucune mémoire des objets dessinés. Une fois qu'une instruction de dessin est exécutée, elle est "imprimée" sur la grille de pixels et l'objet n'existe plus en tant qu'entité pour le système.
    

### Pourquoi le Mode Immédiat pour les jeux ?

Le "Pourquoi" est une question de **performance et de contrôle**. Dans un jeu, nous devons souvent mettre à jour 60 fois par seconde la position de centaines d'objets (projectiles, ennemis, particules). Gérer des centaines d'objets DOM (Mode Retenu) créerait une surcharge mémoire immense. Le Canvas, lui, se contente de colorier des pixels sans se soucier de ce qu'ils représentent. C'est au développeur de maintenir une liste d'objets en JavaScript pour savoir quoi redessiner.

### Analogie

> Imaginez que le Mode Retenu est un **tableau d'affichage à magnets** : vous posez un magnet, vous pouvez le déplacer plus tard, le système "se souvient" que c'est un magnet. Le Mode Immédiat (Canvas) est un **tableau blanc et un feutre** : si vous dessinez un rond, le tableau ne sait pas que c'est un rond. Pour le "déplacer", vous devez effacer la zone avec un chiffon et redessiner le rond ailleurs.

---

## 2. Le Contexte de Rendu (The Context)

Le `<canvas>` est l'élément HTML (le cadre), mais le **Context** est l'interface qui nous permet de donner des ordres de dessin.

### Définition précise

Le contexte est un objet JavaScript qui agit comme une machine à états. Il contient les propriétés actuelles (couleur du pinceau, épaisseur du trait, police d'écriture) et les méthodes de dessin.

```
// Étape 1 : Récupérer l'élément HTML 
const canvas = document.querySelector('#game-canvas'); 
// Étape 2 : Récupérer le "pinceau" (le contexte) 
const ctx = canvas.getContext('2d');
```

## 3. Le Système de Coordonnées 2D

C'est ici que les mathématiques de jeu entrent en jeu. Le système de coordonnées du Canvas diffère du système cartésien standard utilisé en géométrie classique.

### L'Inversion de l'axe Y

Dans un repère mathématique classique, l'axe Y monte vers le haut. En informatique (et dans le Canvas), l'origine (0,0) se situe dans le **coin supérieur gauche**.

- **L'axe X :** Augmente de la gauche vers la droite.
    
- **L'axe Y :** Augmente du **haut vers le bas**.
    

### Pourquoi ?

C'est un héritage des anciens écrans à tubes cathodiques (CRT). Le faisceau d'électrons balayait l'écran de gauche à droite, puis descendait d'une ligne, exactement comme on lit une page de livre.

### Exemple concret

Si votre canvas fait **800** pixels de large et **600** de haut :

- Le point (0,0) est en haut à gauche.
    
- Le point (800,600) est en bas à droite.
    
- Le point (400,300) est le centre exact.


### Formules de base

Pour manipuler des objets dans cet espace :

- **Bas :** y=y+vitesse
    
- **Haut :** y=y−vitesse
    
- **Droite :** x=x+vitesse
    
- **Gauche :** x=x−vitesse

---

## 4. Résolution Interne vs Taille d'Affichage

Un piège technique majeur pour les débutants est la distinction entre les pixels de dessin et les pixels d'affichage.

- **La résolution interne (`width` et `height` du canvas) :** Détermine la taille de la surface de dessin (le nombre de pixels disponibles).
    
- **La taille CSS :** Détermine comment cette surface est étirée à l'écran.
    

### Règle d'or

Pour éviter que votre jeu ne soit flou, vous devez toujours définir les dimensions via les propriétés JavaScript du canvas, et non uniquement via le CSS.

```
// Correct : Définit la grille de pixels 
canvas.width = 800; 
canvas.height = 600; 
// Optionnel : Forcer l'affichage à la même taille via CSS canvas.style.width = "800px"; 
canvas.style.height = "600px";
```

## 5. Primitives de Dessin et État du Contexte

Le dessin dans le Canvas fonctionne par **étapes**. On définit d'abord le style, puis on dessine.

### Théorie du Remplissage

- `ctx.fillStyle` : Définit la couleur ou le motif pour l'intérieur d'une forme.
    
- `ctx.strokeStyle` : Définit la couleur pour le contour.
    
- `ctx.fillRect(x, y, w, h)` : Dessine un rectangle plein immédiatement.
    

### Formule : Centrer un objet

Pour placer une entité (comme un personnage) de largeur w et hauteur h au centre du Canvas, la formule est :

Xpos​=2Canvas.width−w​

Ypos​=2Canvas.height−h​

---

## Résumé des points essentiels

1. Le Canvas utilise le **Mode Immédiat** : rien n'est stocké, tout doit être redessiné.
    
2. L'origine (0,0) est en **haut à gauche**.
    
3. L'axe **Y augmente vers le bas**.
    
4. Le **Context (`ctx`)** est l'outil central de dessin.
    
5. Différenciez toujours la **taille interne** (pixels) de la **taille d'affichage** (CSS) pour garantir la netteté.