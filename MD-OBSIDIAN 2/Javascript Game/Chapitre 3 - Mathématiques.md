
## 1. La notion de Vecteur 2D

En programmation de jeux, on n'utilise presque jamais des variables `x` et `y` isolées. On les regroupe dans un objet appelé **Vecteur**.

### Définition

Un vecteur est un outil mathématique qui possède deux caractéristiques : une **direction** et une **norme** (sa longueur). En 2D, il est représenté par un couple (x,y).

### Pourquoi utiliser des vecteurs ?

Si vous voulez déplacer un joueur, vous avez besoin de savoir vers où il va et à quelle force. Le vecteur permet de manipuler ces deux informations d'un coup. On utilise les vecteurs pour :

- **La Position :** Où est l'objet ?
    
- **La Vélocité :** Dans quelle direction et à quelle vitesse se déplace-t-il ?
    
- **L'Accélération :** Comment la vitesse change-t-elle avec le temps ?
    

### Analogie

> Imaginez que vous donnez des instructions à un ami : "Marche 3 pas vers l'Est et 4 pas vers le Nord". Le vecteur, c'est la flèche qui part de ses pieds et qui arrive à sa destination finale.

---

## 2. La Norme et la Normalisation

C'est ici que survient le premier problème technique majeur des jeux 2D : **le problème de la diagonale**.

### Le Problème

Si votre personnage avance de 1 pixel vers la droite (x=1,y=0) et que vous appuyez aussi sur "Haut" (x=0,y=1), le personnage se déplace en diagonale (x=1,y=1). En utilisant le théorème de Pythagore, la distance parcourue est :

	   Math.sqrt(1.pow(2) + 1.pow(2)) = Math.sqrt(2) = (environ) 1.41

Le joueur se déplace donc **41% plus vite** en diagonale qu'en ligne droite ! Pour corriger cela, on doit **normaliser** le vecteur.

### La Normalisation (Unit Vector)

Normaliser un vecteur, c'est le ramener à une longueur de **1**, tout en gardant sa direction.

1. On calcule la longueur (norme) : L = Math.sqrt(x.pow(2) + y.pow(2))
     
2. On divise x et y par cette longueur :
    
	    x^ = x/L ​, y^ ​= y/L
    

Désormais, peu importe la direction, la vitesse sera toujours constante.

---

## 3. Trigonométrie : Sinus et Cosinus

Dans un canvas, tout est carré. Mais que se passe-t-il si vous voulez faire tourner un vaisseau spatial ou faire osciller un fantôme de haut en bas ?

### Sinus et Cosinus

Ces deux fonctions permettent de convertir un **angle** en **coordonnées**.

- **Cosinus (cos) :** Donne la composante X (gauche/droite).
    
- **Sinus (sin) :** Donne la composante Y (haut/bas).
    

### Exemple concret : Le mouvement oscillatoire

Si vous voulez qu'un ennemi flotte doucement de haut en bas (comme dans un jeu de plateforme) :

```
// 'time' augmente à chaque frame 
enemy.y = basePosition + Math.sin(time) * amplitude;
```

La fonction `sin` renvoie une valeur qui ondule entre −1 et 1. C'est l'outil parfait pour tout ce qui est périodique (vagues, battements de cœur, clignotement).

---

## Résumé des points essentiels

1. **Vecteur (x, y) :** Regroupe la position ou la vitesse.
    
2. **Pythagore :** Sert à calculer la distance entre deux objets ou la norme d'un vecteur.
    
3. **Normalisation :** Indispensable pour éviter que les déplacements diagonaux ne soient trop rapides.
    
4. **Trigonométrie :** Permet de transformer un angle en direction de mouvement.


### Addition de vecteurs

Pour déplacer un objet, on ajoute son vecteur **vélocité** à son vecteur **position** à chaque frame : Pos(new) = (Pos)old​ + Velocity

## 2. La Norme (Magnitude)

La longueur d'un vecteur se calcule avec le théorème de Pythagore. **Formule :**

	∣∣V∣∣ = Math.sqrt(x.pow(2) + y.pow(2))

```
function getLength(v) { 
	return Math.sqrt(v.x * v.x + v.y * v.y); 
}
```

## 3. La Normalisation

C'est l'action de transformer un vecteur pour que sa longueur soit égale à 1. C'est crucial pour la gestion des vitesses multidirectionnelles.

### Algorithme :

1. Calculer la longueur L.
    
2. Si L>0 :
    
    - x=x/L
        
    - y=y/L

```
function normalize(v) { 
	const L = getLength(v); 
	if (L > 0) { 
		return { 
			x: v.x / L, y: v.y / L 
		}; 
	} 
	return { x: 0, y: 0 }; 
}
```

## 4. Trigonométrie Circulaire

Le Canvas utilise les **Radians** et non les degrés.

- 180°=π radians.
    
- Formule : rad=deg×(π/180).
    

### Rotation et Direction

Si un objet a un angle θ, son vecteur de direction D est :

- D.x=cos(θ)
    
- D.y=sin(θ)
    

> [!TIP] Astuce Code Pour faire une oscillation fluide (ex: un bonus qui flotte) : `y = y_initial + Math.sin(Date.now() * 0.005) * 10;`

## 5. Distance entre deux points

Pour savoir si un joueur est proche d'un ennemi (avant même de parler de collision) :

	dist = Math.sqrt( (x2 - x1 )2 + (y2 - y1)2 ) )

