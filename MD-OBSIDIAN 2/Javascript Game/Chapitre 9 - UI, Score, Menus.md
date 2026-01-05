
En développement de jeux, l'UI est souvent appelée **HUD** (_Heads-Up Display_). Le défi technique est de dessiner des informations statiques par-dessus un monde en mouvement permanent.

## 1. Dessiner du texte sur le Canvas

Contrairement au HTML classique où l'on utilise des balises `<h1>` ou `<p>`, dans le Canvas, le texte est "dessiné" comme s'il s'agissait d'une image. Une fois écrit, il n'est plus modifiable ; il doit être effacé et réécrit à chaque frame pour être mis à jour.

### Propriétés du Contexte pour le Texte

Le `context` possède des propriétés spécifiques pour configurer l'apparence :

- `ctx.font` : Définit la taille et la police (ex: `"24px Arial"`).
    
- `ctx.textAlign` : Définit l'alignement horizontal (`"left"`, `"center"`, `"right"`).
    
- `ctx.textBaseline` : Définit l'alignement vertical (`"top"`, `"middle"`, `"bottom"`).
    

### Les méthodes de dessin

- `ctx.fillText(text, x, y)` : Dessine le texte plein.
    
- `ctx.strokeText(text, x, y)` : Dessine uniquement le contour des lettres.
    

---

## 2. Théorie de l'Alignement et du Centrage

Placer du texte au centre exact de l'écran ne se résume pas à lui donner les coordonnées W/2 et H/2. Si vous faites cela avec un alignement par défaut (gauche), le texte commencera au centre mais s'étendra vers la droite.

### La mesure du texte

Pour centrer parfaitement un texte manuellement, ou pour dessiner un bouton autour d'un texte, vous devez connaître sa largeur réelle en pixels. On utilise la méthode : `ctx.measureText(votreTexte).width`.

### Formule de centrage horizontal (si textAlign = "left")

Pour que le texte soit au milieu :

X=2Canvas.width−ctx.measureText(text).width​

### La solution élégante

Le plus simple reste d'utiliser les propriétés natives :

```
ctx.textAlign = "center";
ctx.fillText("MON SCORE", canvas.width / 2, 50);
```

## 3. La Machine à États (Game States)

Un jeu n'est pas qu'une simple boucle de "jeu en cours". Il possède différents états : **Menu Principal, Jeu, Pause, Game Over**.

### Pourquoi une Machine à États ?

Vous ne voulez pas que les ennemis bougent ou que le score augmente pendant que l'utilisateur est dans le menu principal. Nous utilisons une variable globale (souvent une chaîne de caractères ou un entier) pour filtrer ce qui doit être mis à jour et dessiné.

### Structure logique dans la Game Loop

```
function draw() {
    ctx.clearRect(0, 0, w, h);

    if (gameState === "MENU") {
        drawMenu();
    } else if (gameState === "PLAYING") {
        drawWorld();
        drawUI();
    } else if (gameState === "GAMEOVER") {
        drawGameOverScreen();
    }
}
```

## 4. Gestion du Score et Persistance

Le score est une variable numérique simple. Cependant, l'afficher nécessite une conversion en chaîne de caractères (String).

### Feedback Visuel

Une bonne UI ne se contente pas d'afficher un chiffre. Elle utilise des **Juicy Effects** :

- Quand le score augmente, le texte pourrait grossir brièvement (interpolation de la taille de police).
    
- Utiliser des `0` de remplissage pour un look arcade : `score.toString().padStart(6, '0')` (ex: `000120`).
    

---

## Résumé des points essentiels

1. Le texte sur Canvas est **immuable** : il faut l'effacer et le redessiner pour le mettre à jour.
    
2. `ctx.textAlign` et `ctx.textBaseline` sont vos meilleurs alliés pour le placement.
    
3. La **Machine à États** orchestre ce qui doit s'afficher à l'écran selon la phase du jeu.
    
4. Utilisez `ctx.measureText()` pour créer des éléments d'interface dynamiques (comme des cadres de boutons).

### Méthodes d'affichage

- `fillText(string, x, y)` : Remplissage solide.
    
- `strokeText(string, x, y)` : Contour uniquement (utile pour la lisibilité sur fonds complexes).
    

## 2. Mathématiques de l'UI : Centrage et Mesure

Pour créer des interfaces réactives, on utilise `measureText()`.

**Formule de centrage d'un rectangle de sélection autour d'un texte :** Soit un texte T et une marge P.

- Wrect​=ctx.measureText(T).width+(P×2)
    
- Hrect​=TaillePolice+(P×2)

```
const text = "CLIQUEZ POUR JOUER";
const textWidth = ctx.measureText(text).width;
const padding = 20;

// Dessin du fond du bouton
ctx.fillRect(x - padding, y - padding, textWidth + padding * 2, 40 + padding * 2);
// Dessin du texte
ctx.fillText(text, x, y);
```

## 3. Gestion des États du Jeu (Game States)

La gestion des menus repose sur une structure de contrôle appelée **Machine à États finis**.

### Logique d'implémentation

```
const STATES = {
    MENU: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAMEOVER: 3
};

let currentState = STATES.MENU;

function update(dt) {
    switch(currentState) {
        case STATES.MENU:
            if (input.isPressed('Enter')) currentState = STATES.PLAYING;
            break;
        case STATES.PLAYING:
            updateGameLogic(dt);
            if (player.health <= 0) currentState = STATES.GAMEOVER;
            break;
    }
}
```

## 4. Layering : HUD vs Monde

L'UI doit toujours être dessinée **après** le monde du jeu (Layering).

1. **Background** (Décors lointains)
    
2. **Game World** (Joueur, Ennemis, Particules)
    
3. **ForeGround** (Arbres au premier plan)
    
4. **HUD / UI** (Score, Barre de vie, Boussole)
    

> [!TIP] Optimisation Pour les interfaces très complexes qui ne changent pas souvent (ex: un inventaire), il est plus performant d'utiliser des **éléments HTML/CSS** positionnés en `absolute` par-dessus le canvas plutôt que de tout dessiner manuellement.

## 5. Le Score et la Persistance (LocalStorage)

Pour sauvegarder le "High Score" même après la fermeture de l'onglet, on utilise l'API `localStorage`.

```
// Sauvegarder
localStorage.setItem('bestScore', 15000);

// Récupérer
const best = localStorage.getItem('bestScore') || 0;
```

