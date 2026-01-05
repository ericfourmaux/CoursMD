
Le défi technique de la gestion des entrées en JavaScript réside dans une différence de rythme : les événements du navigateur sont **asynchrones** (ils surviennent n'importe quand), alors que votre boucle de jeu est **synchrone** (elle bat à un rythme fixe).

## 1. Événements vs État (State)

En JavaScript classique, on utilise des "Event Listeners" (écouteurs d'événements). Cependant, utiliser directement un événement pour déplacer un personnage pose deux problèmes majeurs :

1. **Le délai de répétition :** Si vous restez appuyé sur une touche, le système d'exploitation attend une fraction de seconde avant de répéter le caractère (comme quand vous tapez une lettre dans Word). Cela créerait un mouvement saccadé et frustrant.
    
2. **La simultanéité :** Les événements classiques ont du mal à gérer deux touches enfoncées en même temps (ex: Diagonale + Saut).
    

### La Solution : Le "Input Buffer" (ou Map d'état)

Au lieu de réagir à l'événement, nous allons simplement utiliser l'événement pour mettre à jour un **dictionnaire d'état**. La boucle de jeu consultera ensuite ce dictionnaire 60 fois par seconde pour savoir ce qu'elle doit faire.

### L'Analogie

> Imaginez un standardiste (l'Event Listener) qui note les messages sur des post-its ("La touche Gauche est enfoncée"). Le pilote (la Game Loop), lui, ne regarde pas le standardiste ; il regarde simplement le tableau des post-its à chaque fois qu'il doit prendre une décision de pilotage.

---

## 2. Capturer le Clavier

Nous utilisons les événements `keydown` et `keyup` pour remplir notre "tableau de bord".

### Implémentation technique

On utilise souvent un objet ou un `Set` pour stocker les touches actives.

```
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true; // On marque la touche comme pressée
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false; // On la libère
});
```

- **`e.code` :** On préfère `.code` (ex: `KeyW`) à `.key` (ex: `z`) car `.code` représente la position physique de la touche, ce qui évite les problèmes entre les claviers AZERTY et QWERTY.
    

---

## 3. Lier les Inputs à la Physique du Joueur

C'est dans la méthode `update()` de votre classe `Player` (vue au Chapitre 4) que la magie opère. Nous allons transformer les booléens du dictionnaire en vecteurs de mouvement.

### Exemple de logique

```
update(dt, keys) {
    this.vx = 0;
    this.vy = 0;

    if (keys['ArrowUp'])    this.vy = -this.speed;
    if (keys['ArrowDown'])  this.vy = this.speed;
    if (keys['ArrowLeft'])  this.vx = -this.speed;
    if (keys['ArrowRight']) this.vx = this.speed;

    // Application de la formule du Chapitre 2 & 3
    this.x += this.vx * dt;
    this.y += this.vy * dt;
}
```

## 4. La Souris et les Coordonnées Relatives

La gestion de la souris introduit une complexité supplémentaire : les coordonnées de l'événement (`clientX`, `clientY`) sont relatives à la **fenêtre du navigateur**, pas à votre **Canvas**.

### Théorie de la conversion

Si votre canvas est décalé par une marge ou un titre, le clic à (0,0) ne correspondra pas au coin du jeu. Il faut soustraire la position du canvas (Bounding Box).

**Formule de conversion :**

Xcanvas​=Xevent​−Canvas.offsetLeft

Ycanvas​=Yevent​−Canvas.offsetTop

---

## Résumé des points essentiels

1. **Ne jamais déplacer** un objet directement dans un `EventListener`.
    
2. Utiliser un **objet d'état** (`keys`) pour mémoriser quelles touches sont enfoncées.
    
3. Utiliser `e.code` pour assurer la compatibilité **AZERTY/QWERTY**.
    
4. Pour la souris, toujours convertir les coordonnées globales en **coordonnées locales** au Canvas.

## 3. Intégration dans la Boucle de Jeu

La logique de mouvement doit interroger l'état de l'Input Handler à chaque frame.

```
function update(dt) {
    if (input.isPressed('KeyW')) player.y -= player.speed * dt;
    if (input.isPressed('KeyS')) player.y += player.speed * dt;
    if (input.isPressed('KeyA')) player.x -= player.speed * dt;
    if (input.isPressed('KeyD')) player.x += player.speed * dt;
}
```

> [!TIP] Rappel Mathématique (Chapitre 3) N'oubliez pas de **normaliser** le vecteur de mouvement si le joueur appuie sur deux touches (ex: W + D) pour éviter qu'il n'aille Math.sqrt(2) fois plus vite en diagonale.

## 4. Gestion de la Souris (Mouse)

La souris nécessite de transformer les coordonnées de la page en coordonnées internes au Canvas.

### Calcul de la position locale

```
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    console.log(`Clic au point : ${mouseX}, ${mouseY}`);
});
```

## 5. Le "Action Mapping" (Avancé)

Au lieu de tester explicitement `KeyW`, les développeurs professionnels utilisent un mappage d'actions :

- `Action.UP` = `['KeyW', 'ArrowUp', 'GamepadButton0']`
    

Cela permet au joueur de changer ses touches dans les options sans modifier le code de mouvement de la classe `Player`.

