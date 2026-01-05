
Nous voici arrivés au dernier chapitre de ce cours fondamental. Un jeu qui fonctionne sur votre ordinateur est une victoire, mais un jeu qui tourne de manière fluide sur tous les appareils et qui est accessible au monde entier est un **produit**.

---

# Chapitre 10 : Optimisation et Déploiement

Ce chapitre traite de la "finition" (le _polish_). Nous allons voir comment traquer les ralentissements et comment mettre votre œuvre en ligne.

## 1. Comprendre la Performance : Le Garbage Collector

Le plus grand ennemi de la fluidité en JavaScript n'est pas souvent la puissance de calcul, mais le **Garbage Collector (GC)**.

### Le Problème

Quand vous créez un objet (`new Bullet()`), JavaScript alloue de la mémoire. Quand cet objet n'est plus utilisé (la balle sort de l'écran), JavaScript doit libérer cette mémoire. Le GC passe de temps en temps pour "nettoyer". S'il y a trop d'objets à nettoyer d'un coup, le jeu s'arrête pendant quelques millisecondes pour faire le ménage. C'est ce qui cause les **micro-saccades** (_stutters_).

### La Solution : L'Object Pooling

Au lieu de détruire une balle et d'en créer une nouvelle, on la "désactive" (on la rend invisible et on la place hors écran). Quand on a besoin de tirer à nouveau, on réutilise cet objet existant.

---

## 2. Optimisations Graphiques

Même si le Canvas 2D est rapide, il y a des limites.

1. **Réduire les appels au Contexte :** Changer `ctx.fillStyle` coûte cher. Essayez de dessiner tous les objets rouges d'un coup, puis tous les bleus.
    
2. **L'arrondi des coordonnées :** Le Canvas essaie de dessiner des sous-pixels si vous lui donnez des coordonnées décimales (ex: x=10.532). Cela force un calcul d'anticrénelage (_anti-aliasing_) gourmand.
    
    - **Astuce :** Utilisez `Math.floor()` ou l'opérateur bitwise `| 0` pour forcer des nombres entiers.
        
3. **Canvas Hors-champ (Offscreen Canvas) :** Pour des décors complexes qui ne changent jamais, dessinez-les une seule fois sur un second canvas invisible, puis utilisez ce canvas comme une simple image avec `drawImage`.
    

---

## 3. Responsive Design et Fullscreen

Votre jeu doit s'adapter à la taille de la fenêtre. On utilise l'événement `resize` pour recalculer les dimensions.

### Formule du Ratio d'Aspect

Pour garder une image qui ne se déforme pas, on calcule un ratio :

Ratio=HauteurLargeur​

Si la fenêtre change, on ajuste la taille du canvas tout en conservant ce ratio, ou on utilise la propriété CSS `object-fit: contain;`.

---

## 4. Déploiement : Mettre son jeu en ligne

Une fois le code prêt, il faut l'héberger. Puisque votre jeu est purement composé de fichiers "statiques" (HTML, JS, CSS, Images), c'est très simple.

- **GitHub Pages :** Gratuit et idéal si votre code est déjà sur GitHub.
    
- **Netlify / Vercel :** Très performants avec déploiement automatique.
    
- **Itch.io :** La plateforme de référence pour les développeurs de jeux indépendants. Vous pouvez y uploader un fichier `.zip` de votre projet.
    

---

## Résumé des points essentiels

1. **Évitez de créer des objets** dans la boucle `update` (utilisez l'Object Pooling).
    
2. **Arrondissez vos coordonnées** de dessin pour gagner en performance.
    
3. **Utilisez `OffscreenCanvas`** pour les éléments statiques lourds.
    
4. **Hébergez votre jeu** sur des plateformes statiques pour une accessibilité mondiale.

## 2. Optimisation du Rendu

### Le rendu entier (Integer coordinates)

Le rendu de pixels flottants (ex: 10.7px) ralentit le CPU car il doit calculer une interpolation. **Solution :** `ctx.drawImage(img, x | 0, y | 0);` (L'opérateur `| 0` est une méthode ultra-rapide pour arrondir à l'entier inférieur).

### Profiling

Utilisez l'onglet **Performance** des outils de développement Chrome (F12) pour identifier quelle fonction prend trop de temps.

- **FPS stables :** Recherchez la ligne "Frames".
    
- **Scripting :** Temps passé dans vos calculs JS.
    
- **Rendering :** Temps passé par le GPU à dessiner.
    

## 3. Adaptation Écran (Scaling)

Pour que le jeu remplisse l'écran sans distorsion :

```
function resize() {
    const scale = Math.min(
        window.innerWidth / GAME_WIDTH,
        window.innerHeight / GAME_HEIGHT
    );
    canvas.style.width = (GAME_WIDTH * scale) + "px";
    canvas.style.height = (GAME_HEIGHT * scale) + "px";
}
window.addEventListener('resize', resize);
```

## 4. Check-list avant Déploiement

- [ ] **Minification :** Utiliser un outil comme Vite ou Terser pour réduire la taille du fichier `.js`.
    
- [ ] **Chargement des ressources :** Vérifier que l'Asset Manager affiche bien une erreur si un fichier manque.
    
- [ ] **Mobile :** Ajouter des boutons tactiles si `ontouchstart` est détecté.
    
- [ ] **Icône :** Ajouter un `favicon.ico` pour que l'onglet soit pro.
    

## 5. Où publier ?

1. **Itch.io** : La plateforme reine pour l'indé. Permet de vendre son jeu ou de recevoir des dons.
    
2. **GitHub Pages** : Idéal pour les portfolios.
    
3. **PWA (Progressive Web App)** : Ajouter un fichier `manifest.json` pour que les joueurs puissent "installer" votre jeu sur leur téléphone comme une application native.


FIN !