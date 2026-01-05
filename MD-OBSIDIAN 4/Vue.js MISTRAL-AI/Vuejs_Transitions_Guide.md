
# Guide Complet : Transitions et Animations dans Vue.js

---

## 1. Introduction aux Transitions
### 1.1 Pourquoi Utiliser des Transitions ?
Les transitions et animations rendent ton application plus **dynamique** et **agréable** à utiliser. Vue.js fournit des outils intégrés pour gérer les transitions entre les états des éléments (apparition, disparition, mise à jour).

### 1.2 Concepts de Base
- **`<Transition>`** : Composant pour animer un seul élément ou composant.
- **`<TransitionGroup>`** : Pour animer une liste d'éléments.
- **Classes CSS** : Vue.js ajoute/retire automatiquement des classes pour déclencher des animations.
- **Hooks JavaScript** : Pour des animations plus complexes (ex : avec GSAP ou Anime.js).

---

## 2. Le Composant `<Transition>`
### 2.1 Utilisation de Base
Le composant `<Transition>` permet d'animer l'apparition et la disparition d'un élément.

**Exemple :**
```html
<Transition name="fade">
  <p v-if="show">Bonjour !</p>
</Transition>
```

### 2.2 Classes CSS Générées
Vue.js ajoute automatiquement les classes suivantes pendant une transition :
- `fade-enter-from` : État initial avant l'entrée.
- `fade-enter-active` : État actif pendant l'entrée.
- `fade-enter-to` : État final après l'entrée.
- `fade-leave-from` : État initial avant la sortie.
- `fade-leave-active` : État actif pendant la sortie.
- `fade-leave-to` : État final après la sortie.

**Exemple de CSS :**
```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
```

### 2.3 Exemple Complet
**HTML :**
```html
<button @click="show = !show">Basculer</button>
<Transition name="fade">
  <p v-if="show">Bonjour !</p>
</Transition>
```

**CSS :**
```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
```

---

## 3. Le Composant `<TransitionGroup>`
### 3.1 Introduction
`<TransitionGroup>` est utilisé pour animer une **liste d'éléments**. Chaque élément de la liste doit avoir une clé unique (`:key`).

**Exemple :**
```html
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</TransitionGroup>
```

### 3.2 Classes CSS pour `<TransitionGroup>`
Les classes sont similaires à `<Transition>`, mais s'appliquent à chaque élément de la liste.

**Exemple de CSS :**
```css
.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
```

---

## 4. Animations CSS
### 4.1 Utilisation d'Animations CSS
Tu peux utiliser des animations CSS (`@keyframes`) avec les transitions Vue.js.

**Exemple :**
```css
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
```

---

## 5. Hooks JavaScript pour des Animations Avancées
### 5.1 Introduction aux Hooks
Vue.js permet d'utiliser des hooks JavaScript pour des animations plus complexes (ex : avec GSAP ou Anime.js).

### 5.2 Hooks Disponibles
- `@before-enter`
- `@enter`
- `@after-enter`
- `@enter-cancelled`
- `@before-leave`
- `@leave`
- `@after-leave`
- `@leave-cancelled`

**Exemple :**
```html
<Transition
  @enter="onEnter"
  @leave="onLeave"
  :css="false"
>
  <div v-if="show">Contenu</div>
</Transition>
```

**JavaScript :**
```javascript
function onEnter(el, done) {
  // Utilise une bibliothèque comme GSAP pour animer `el`
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    onComplete: done
  });
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    y: -20,
    duration: 0.5,
    onComplete: done
  });
}
```

---

## 6. Transitions entre Composants Dynamiques
### 6.1 Introduction
Tu peux animer les transitions entre plusieurs composants dynamiques en utilisant `<component :is="...">`.

**Exemple :**
```html
<component :is="activeComponent" />
```

### 6.2 Utilisation avec `<Transition>`
**Exemple :**
```html
<Transition name="fade" mode="out-in">
  <component :is="activeComponent" />
</Transition>
```

---

## 7. Modes de Transition
### 7.1 Le Mode `out-in`
Le nouveau élément attend que l'ancien ait terminé sa transition avant d'apparaître.

**Exemple :**
```html
<Transition name="fade" mode="out-in">
  <p v-if="show">Premier élément</p>
  <p v-else>Deuxième élément</p>
</Transition>
```

### 7.2 Le Mode `in-out`
Le nouvel élément commence sa transition avant que l'ancien ait terminé.

---

## 8. Bonnes Pratiques
### 8.1 Performance
- **Évite les animations lourdes** : Préfère les transformations CSS (`transform`, `opacity`) qui sont optimisées par le navigateur.
- **Limite la durée** : Des animations trop longues peuvent nuire à l'expérience utilisateur.

### 8.2 Accessibilité
- **Préfère les transitions subtiles** : Les animations trop flashy peuvent être désagréables pour certains utilisateurs.
- **Respecte `prefers-reduced-motion`** : Utilise une media query pour désactiver les animations si l'utilisateur l'a demandé.

**Exemple :**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Exercices Pratiques
### 9.1 Exercice : Animation d'une Liste
Crée une liste d'éléments qui s'animent quand ils sont ajoutés ou supprimés.

**Indice :**
- Utilise `<TransitionGroup>` avec un `v-for`.
- Définis des classes CSS pour les transitions d'entrée et de sortie.

### 9.2 Exercice : Transition entre Composants
Crée une interface avec deux composants qui s'affichent alternativement avec une transition.

**Indice :**
- Utilise `<Transition>` avec `mode="out-in"`.
- Change le composant affiché avec un bouton.

---

## 10. Résumé et Points Clés à Retenir
| Concept                     | Description                                                                 | Cas d’Usage                          |
|-----------------------------|-----------------------------------------------------------------------------|--------------------------------------|
| **`<Transition>`**           | Anime un seul élément ou composant.                                        | Apparition/disparition d'un élément. |
| **`<TransitionGroup>`**      | Anime une liste d'éléments.                                                 | Listes dynamiques.                   |
| **Classes CSS**             | Vue.js ajoute/retire des classes pour déclencher des animations.           | Animations simples.                  |
| **Hooks JavaScript**        | Pour des animations complexes (ex : GSAP).                                 | Animations avancées.                 |
| **Modes de transition**     | Contrôle l'ordre des transitions (`out-in`, `in-out`).                     | Transitions fluides entre éléments.  |

---

## 11. Ressources pour Aller Plus Loin
- **Documentation Officielle** : [Transitions dans Vue 3](https://vuejs.org/guide/built-ins/transition.html)
- **Tutoriel Vidéo** : [Vue.js Transitions & Animations](https://www.youtube.com/watch?v=...) (à rechercher)
- **Bibliothèques d'Animation** : [GSAP](https://greensock.com/gsap/), [Anime.js](https://animejs.com/)
