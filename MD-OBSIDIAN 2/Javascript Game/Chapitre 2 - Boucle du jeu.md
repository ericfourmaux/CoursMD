

La **Game Loop** est le battement de cœur de tout jeu vidéo. C'est elle qui donne l'illusion du mouvement et de la vie. Sans elle, un jeu n'est qu'une image fixe.

## 1. Le concept de "Frame Rate" et d'illusion visuelle

Un jeu vidéo fonctionne exactement comme un dessin animé ou un film au cinéma : il s'agit d'une succession d'images fixes (appelées **Frames**) affichées si rapidement que le cerveau humain les perçoit comme un mouvement continu.

### Définition

- **Frame (Cadre/Image) :** Un état complet du monde à un instant T.
    
- **FPS (Frames Per Second) :** Le nombre d'images affichées en une seconde. Le standard fluide est de **60 FPS**.
    

### Pourquoi une boucle ?

Contrairement à une application classique (comme un formulaire) qui attend une action de l'utilisateur pour réagir, un jeu est **proactif**. Même si vous ne touchez à rien, l'herbe bouge, les ennemis patrouillent et le temps s'écoule. Le programme doit donc tourner en permanence.

---

## 2. L'anatomie d'une Boucle de Jeu

Une boucle de jeu efficace se divise systématiquement en trois étapes logiques qui s'exécutent en cycle infini :

1. **Process Input (Entrées) :** Récupérer les actions de l'utilisateur (clavier, souris, manette).
    
2. **Update (Mise à jour) :** Calculer la nouvelle position des objets, gérer la physique, les collisions et l'intelligence artificielle.
    
3. **Render / Draw (Rendu) :** Effacer l'écran précédent et dessiner le nouvel état calculé sur le Canvas.
    

### L'Analogie du Flipbook

> Imaginez un carnet de notes où chaque page représente une position légèrement différente d'un personnage. La Game Loop est le pouce qui fait défiler les pages. Si le pouce va trop lentement, le mouvement saccade. S'il s'arrête, l'histoire s'arrête.

---

## 3. L'outil technique : `requestAnimationFrame`

En JavaScript, il existe plusieurs façons de créer une boucle (comme `setInterval`), mais pour le jeu vidéo, une seule est rigoureuse : `window.requestAnimationFrame()`.

### Pourquoi ne pas utiliser `setInterval` ?

`setInterval` s'exécute à un intervalle fixe sans se soucier du taux de rafraîchissement du moniteur ou de la charge du processeur. Cela provoque des saccades visuelles (tearing).

### Les avantages de `requestAnimationFrame` :

1. **Synchronisation :** Elle s'aligne sur le taux de rafraîchissement de l'écran (généralement 60Hz).
    
2. **Économie d'énergie :** Elle s'arrête automatiquement si l'utilisateur change d'onglet, évitant de faire chauffer le processeur inutilement.
    
3. **Précision :** Elle fournit un horodatage (timestamp) extrêmement précis en millisecondes.
    

---

## 4. La Théorie du Delta Time (Δt)

C'est ici que nous entrons dans le développement professionnel. Un problème majeur survient si vous développez votre jeu sur un ordinateur puissant (144 FPS) et qu'un ami y joue sur un vieil ordinateur (30 FPS).

- **Sans Delta Time :** Votre personnage se déplacera 4 fois plus vite sur l'écran à 144 FPS. Le jeu est lié à la puissance de la machine.
    
- **Avec Delta Time :** Le mouvement est lié au **temps réel**.
    

### La Formule

Le Delta Time est le temps écoulé entre l'image précédente et l'image actuelle.

Δt=1000CurrentTime−LastTime​

_(On divise par 1000 pour convertir les millisecondes en secondes)._

### Application au mouvement

Au lieu de dire : `position.x += 5` (pixels par image), On dit : `position.x += 200 * dt` (pixels par seconde). Ainsi, peu importe le nombre de FPS, le personnage parcourra 200 pixels en une seconde réelle.

---

## Résumé des points essentiels

1. La **Game Loop** est une boucle infinie : **Input -> Update -> Draw**.
    
2. On utilise **`requestAnimationFrame`** pour une fluidité parfaite et une synchronisation avec l'écran.
    
3. Il faut toujours **effacer le Canvas** (`clearRect`) au début de chaque frame de dessin.
    
4. Le **Delta Time** est indispensable pour que le jeu tourne à la même vitesse sur tous les ordinateurs (Frame Independence).

---
course: Développement de Jeux JS
chapter: 2
topic: La Game Loop & Delta Time
level: Débutant
status: 🟢 Terminé
---

# Chapitre 2 : La "Game Loop" (Boucle de Jeu)

## 1. La structure fondamentale
Tout moteur de jeu repose sur un cycle de vie en trois étapes :

1. **Input** : Écouter l'utilisateur.
2. **Update** : Calculer la logique (Mathématiques).
3. **Draw** : Afficher les résultats (Graphismes).

## 2. Implémentation avec requestAnimationFrame

La fonction `requestAnimationFrame` est la méthode standard. Elle demande au navigateur d'exécuter une fonction spécifique avant le prochain rafraîchissement de l'écran.

### Exemple de structure minimale
```javascript
let lastTime = 0;

function gameLoop(timestamp) {
    // 1. Calcul du Delta Time
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // 2. Mise à jour de la logique
    update(deltaTime);

    // 3. Rendu
    draw();

    // 4. Rappel de la boucle
    requestAnimationFrame(gameLoop);
}

// Lancement initial
requestAnimationFrame(gameLoop);

```

## 3. Théorie du Delta Time (Δt)

### Le Problème : La vitesse dépendante du matériel

Si vous déplacez un objet de 10 pixels à chaque frame :

- Sur un écran 60Hz : l'objet bouge de 600px/s.
    
- Sur un écran 144Hz : l'objet bouge de 1440px/s. Le jeu est injouable ou trop facile selon l'écran.
    

### La Solution : Frame Independence

On exprime les vitesses en **unités par seconde** et on multiplie par le Delta Time.

**Formule de mouvement linéaire :**

Pnouvelle​=Pactuelle​+(Vitesse×Δt)

```
function update(dt) { 
   // Le personnage bouge de 100 pixels par seconde, peu importe les FPS     player.x += 100 * dt; 
}
```

## 4. Le Pipeline de Rendu (Draw)

Dans la partie `draw()` de la boucle, l'ordre des opérations est crucial en raison du **mode immédiat** du Canvas :

1. **Effacement :** `ctx.clearRect(0, 0, canvas.width, canvas.height)`. Sans cela, les images se superposent et créent une "traînée".
    
2. **Sauvegarde du contexte :** (Optionnel) `ctx.save()`.
    
3. **Dessin des objets :** On boucle sur nos entités et on appelle leurs méthodes de dessin.
    
4. **Restauration :** (Optionnel) `ctx.restore()`.
    

> [!TIP] Optimisation `requestAnimationFrame` s'arrête quand l'onglet est inactif. C'est une sécurité native contre la surconsommation de batterie et de CPU sur mobile et laptop.