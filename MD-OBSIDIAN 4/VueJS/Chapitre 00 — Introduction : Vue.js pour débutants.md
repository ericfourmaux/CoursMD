---
title: Chapitre 00 — Introduction : Vue.js pour débutants
tags: [Vue.js, Vue 3, Formation, Débutant]
---


# 📘 Chapitre 00 — Introduction : Vue.js pour débutants

🎯 **Objectifs**
- Comprendre ce qu’est **Vue.js (Vue 3)**, sa philosophie et ses bénéfices.
- Découvrir la **programmation déclarative** et la **réactivité**.
- Faire un premier tour rapide des notions : **directives**, **composants**, **router**, **store**, **SSR**.

🧠 **Concepts clés**
- **SPA (Single Page Application)** : une application web qui **navigue sans recharger** la page entière ; le routeur manipule l’état et le DOM.
- **MVVM** : séparation entre **Modèle** (données), **Vue** (affichage) et **ViewModel** (liaison réactive).
- **Déclaratif vs Impératif** : on **déclare** "ce que l’UI doit montrer" selon l’état, plutôt que **manipuler** le DOM étape par étape.
- **Système réactif** : Vue suit les **dépendances** et met à jour l’UI quand les **sources** changent.

🔍 **Pourquoi ?**
- Réduire la complexité : moins d’**étapes impératives**, plus d’**intention**.
- Maintenir : composants **testables**, **réutilisables**, **composables**.
- Performance : rendu **granulaire** (Vue reconcilie où c’est nécessaire).

💡 **Analogie (feuille de calcul)**
- Comme dans un tableur : vous définissez la **formule** d’une cellule (ex. `C = A + B`). Quand **A** ou **B** change, **C** se met à jour automatiquement. Vue fait pareil avec l’UI.

🧪 **Exemples rapides**
- Mustaches `{{ message }}` pour interpoler une donnée.
- `v-if` / `v-show` pour conditionner l’affichage.
- `v-for` pour lister des éléments ; `:key` pour aider au rendu efficace.
- `v-bind` (`:`) pour lier des attributs ; `v-on` (`@`) pour écouter des événements.

📐 **Schéma (simplifié)**
```
Utilisateur ──► Événements (@click, @input)
   │                 │
   ▼                 ▼
 Composant (état) ─► Réactivité (dépendances)
   │                 │
   ▼                 ▼
  Template ──► DOM rendu (patch granulaire)
```

🧭 **Architecture d’une app Vue (vue d’ensemble)**
```
src/
├─ main.ts          # bootstrap de l’app (createApp)
├─ App.vue          # racine (layout global)
├─ router/          # Vue Router (pages, guards)
├─ stores/          # Pinia (état global)
├─ composables/     # logique réactive réutilisable (useX)
├─ components/      # UI réutilisable
└─ assets/          # images, styles
```

⚠️ **Pièges courants**
- Manipuler le **DOM directement** (ex. `document.querySelector`) au lieu de laisser Vue le gérer.
- Oublier `:key` dans les listes.
- Mélanger **état global** et **état local** sans raison.

✅ **Bonnes pratiques**
- Découper en **petits composants** qui ont une **responsabilité claire**.
- Documenter les **props** et **events** (emits).
- Encapsuler la logique dans des **composables** (fonctions `useX`).

🧩 **Exercice (conceptuel)**
- Écrire en pseudo‑code un composant qui affiche le total d’un panier :
  - Entrée : tableau d’articles `{ price, qty }`.
  - Sortie : `total = Σ(price * qty)`.
  - **Formule en JavaScript** :
```js
const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)
```

📝 **Résumé essentiel**
- Vue 3 favorise une **UI déclarative** pilotée par un **système réactif**.
- Les **composants SFC** structurent l’app ; la navigation et l’état global sont gérés par **Router** et **Pinia**.
- Pensez **formules** plutôt que manipulations : **déclarez** les dépendances, Vue fait le reste.


## 🧭 Légende des icônes
- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 🔍 **Pourquoi ?**
- 🧪 **Exemple**
- 💡 **Analogie**
- ⚠️ **Pièges**
- ✅ **Bonnes pratiques**
- 🛠️ **Mise en pratique**
- 🧩 **Exercice**
- 📝 **Récap**
- 🔗 **Ressources**
- 🧰 **Outils**
- 🔒 **Sécurité**
- 🚀 **Déploiement**
- 🧪🧰 **Tests & Qualité**
- 🌐 **i18n**
- 🧭 **Architecture**
- ⚙️ **Tooling**
- 📊 **Performance**
- 🧱 **Interop**
