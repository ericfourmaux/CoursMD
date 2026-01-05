
Dans ce chapitre, nous allons apprendre à créer un **Asset Manager** (Gestionnaire de ressources) pour centraliser le chargement et à utiliser l'**API Audio** pour donner une ambiance sonore à votre univers.

## 1. Le "Preloader" (Asset Manager)

Comme nous l'avons vu au Chapitre 7, le chargement est asynchrone. Si vous lancez le jeu alors que seulement 3 images sur 10 sont chargées, le joueur verra des objets clignoter ou être invisibles.

### Le concept du Preloader

Un Preloader est un script centralisé qui :

1. Prend une liste de fichiers (images/sons).
    
2. Lance tous les téléchargements en parallèle.
    
3. Compte combien de fichiers ont terminé de charger.
    
4. Affiche éventuellement une barre de progression.
    
5. Ne déclenche l'événement `StartGame` que lorsque le compteur est complet.
    

### Pourquoi est-ce vital ?

Cela garantit une expérience utilisateur fluide. Personne ne veut commencer un combat de boss sans entendre la musique épique parce qu'elle est encore en train de télécharger !

---

## 2. Intégrer l'Audio dans le Jeu

Le son est responsable de 50% de l'immersion. En JavaScript, il existe deux manières principales de gérer le son :

### A. L'objet `Audio` simple (Pour les bruitages et musiques)

C'est la méthode la plus simple, idéale pour débuter. Elle fonctionne comme une balise `<audio>` mais en code.

```
const jumpSound = new Audio('assets/sounds/jump.mp3');
jumpSound.play();
```

### B. L'API Web Audio (Avancé)

Pour les jeux complexes, cette API permet de manipuler le son en temps réel (effets d'écho, spatialisation 3D, filtres de basse quand le joueur est sous l'eau). _Nous resterons sur l'objet Audio simple pour ce cours._

### Contrainte technique : L'interaction utilisateur

Les navigateurs modernes (Chrome, Firefox) **interdisent** la lecture automatique de sons (Autoplay) pour éviter de surprendre l'utilisateur.

- **La règle :** Un son ne peut être joué que **après** que l'utilisateur a cliqué au moins une fois sur la page. C'est pour cela que la plupart des jeux Web commencent par un bouton "Play" ou "Cliquer pour démarrer".
    

---

## 3. Musique d'ambiance vs Bruitages (SFX)

Il faut différencier deux types d'usage :

- **SFX (Sound Effects) :** Sons courts (tir, saut, mort). Ils doivent être joués instantanément. On en joue souvent plusieurs en même temps.
    
- **Musique (BGM) :** Fichiers plus longs qui doivent tourner en boucle (`loop = true`). On ne veut généralement qu'une seule musique de fond à la fois.
    

---

## Résumé des points essentiels

- **Asset Manager :** Centralise le chargement pour éviter les bugs visuels et sonores.
    
- **Progression :** On calcule le pourcentage de chargement : (chargeˊs/total)∗100.
    
- **Audio :** Utiliser `new Audio()` pour les besoins simples.
    
- **Interaction :** Le son nécessite un premier clic de l'utilisateur sur la page.

## 2. Utilisation de l'Audio

### Lecture de bruitages (SFX)

Pour les sons rapides, on peut vouloir "reset" le son s'il est déjà en cours de lecture (ex: tirs rapides).

```
function playSFX(audio) {
    audio.currentTime = 0; // Revient au début
    audio.play();
}
```

Musique en boucle (BGM)

```
const bgm = assetManager.sounds['main_theme'];
bgm.loop = true;
bgm.volume = 0.5; // Entre 0.0 et 1.0
bgm.play();
```

## 3. La limitation de l'Autoplay

> [!CAUTION] Important Le navigateur bloquera `audio.play()` si l'utilisateur n'a pas encore cliqué sur la page. **Erreur type :** `Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first.`

**Solution :** Créer un écran de démarrage "Start Game". La musique ne se lance que dans le callback du bouton.

## 4. Organisation des dossiers (Best Practices)

Pour garder un projet propre :

- `/assets/sprites/` : Images des entités.
    
- `/assets/maps/` : Tilesets et données de niveaux.
    
- `/assets/sounds/sfx/` : Bruitages.
    
- `/assets/sounds/music/` : Musiques.
