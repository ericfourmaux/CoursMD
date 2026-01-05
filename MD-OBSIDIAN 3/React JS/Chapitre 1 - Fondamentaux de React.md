---
title: "⚛️ Chapitre 1 — Fondamentaux de React"
author: "Eric Fourmaux"
description: "Définition de React, philosophie, composants, JSX, Virtual DOM, pipeline de rendu, exemples et analogies"
tags: [React, JavaScript, Frontend, Fondamentaux]
---

# ⚛️ **Chapitre 1 — Fondamentaux de React**

> 🎯 **Objectif** : Poser des bases solides pour comprendre **ce qu’est React**, **pourquoi il fonctionne ainsi**, et **comment écrire vos premiers composants** avec **JSX** et la logique de **rendu déclaratif**.

---

## 🧠 1) Qu’est-ce que **React** ?

### 📚 Définition précise
**React** est une **bibliothèque JavaScript** pour construire des **interfaces utilisateur** (UI) en **mode déclaratif**, organisée autour de **composants**. On **décrit** l’UI en fonction d’un état, et **React** se charge de **mettre à jour le DOM** de façon performante.

### 🤔 Pourquoi React ?
- **Déclaratif** : vous décrivez *ce que* l’UI doit afficher pour un état donné, React gère *comment* l’afficher.
- **Composants** : l’UI est découpée en blocs réutilisables, testables et composables.
- **Écosystème** riche : React Router, Redux, Testing Library, etc.

### 🧩 Analogie
Imaginez un **chef d’orchestre** : vous lui donnez la partition (déclaration de l’UI), il coordonne les musiciens (DOM, événements) pour produire la musique (rendu) sans que vous gériez chaque instrument.

---

## 🧩 2) **Composants** : blocs de construction de l’UI

### 📚 Définition
Un **composant** est une **fonction** (ou anciennement une classe) qui **reçoit des entrées** (*props*) et **retourne** des **éléments** (via **JSX**) décrivant **la structure** de l’UI.

### ⚙️ Pourquoi des composants ?
- **Réutilisabilité** : factoriser, partager, maintenir facilement.
- **Composition** : composer des petits blocs pour des interfaces complexes.
- **Isolation** : chaque composant a sa **responsabilité** et ses **données locales**.

### 🔧 Exemple minimal (fonctionnel)
```jsx
// src/components/Hello.jsx
export default function Hello({ name }) {
  return <h1>Bonjour, {name} !</h1>;
}
```

### 🧪 Exemple avec composition
```jsx
function Title({ children }) {
  return <h2 className="title">{children}</h2>;
}

function Card({ title, children }) {
  return (
    <section className="card">
      <Title>{title}</Title>
      <div className="content">{children}</div>
    </section>
  );
}

export default function App() {
  return (
    <Card title="Bienvenue">
      <p>Cette carte est un composant réutilisable.</p>
    </Card>
  );
}
```

### 🧩 Classe (héritage historique)
> ⚠️ Aujourd’hui, on privilégie les **composants fonctionnels + hooks**. Les classes restent utiles pour lire du code legacy.
```jsx
import React from 'react';
class LegacyHello extends React.Component {
  render() {
    return <h1>Bonjour, {this.props.name}</h1>;
  }
}
```

---

## 🧮 3) **Virtual DOM** : rendre efficacement

### 📚 Définition
Le **Virtual DOM** est une **représentation en mémoire** (arbre d’objets JavaScript) du **DOM réel**. Lorsqu’un **état change**, React **compare** l’ancien et le nouvel arbre (processus de **reconciliation**) puis **applique** au **DOM réel** uniquement les **différences nécessaires**.

### 🤔 Pourquoi un Virtual DOM ?
- **Performances** : réduire les écritures coûteuses dans le DOM réel.
- **Prédictibilité** : centraliser la logique de comparaison.
- **Lisibilité** : conserver un style déclaratif (on décrit l’UI pour un état).

### 🧩 Analogie
Pensez à un **plan de rénovation** : vous comparez le plan actuel et le plan cible, puis **vous n’intervenez que là où il y a des écarts** (par ex., changer une porte sans reconstruire la maison).

### 🧪 Mini-simulation de diff (JS)
> ℹ️ **Simplification pédagogique** : React utilise des heuristiques optimisées. Ci-dessous, une **idée** du calcul des modifications.
```js
// Représentation simplifiée d'un arbre
const oldTree = { type: 'ul', children: [
  { type: 'li', key: 'a', children: ['Alice'] },
  { type: 'li', key: 'b', children: ['Bob'] },
]};

const newTree = { type: 'ul', children: [
  { type: 'li', key: 'b', children: ['Bob'] },
  { type: 'li', key: 'c', children: ['Chloé'] },
]};

function reconcile(oldChildren, newChildren) {
  const ops = [];
  const oldMap = new Map(oldChildren.map(n => [n.key, n]));
  const newKeys = newChildren.map(n => n.key);

  // Suppressions
  for (const [k, v] of oldMap) {
    if (!newKeys.includes(k)) ops.push({ type: 'REMOVE', key: k });
  }
  // Insertions/retours
  newChildren.forEach((n, idx) => {
    const old = oldMap.get(n.key);
    if (!old) ops.push({ type: 'INSERT', key: n.key, at: idx });
    else if (old.children[0] !== n.children[0]) {
      ops.push({ type: 'UPDATE_TEXT', key: n.key });
    }
  });
  return ops;
}

console.log(reconcile(oldTree.children, newTree.children));
// Résultat attendu (approximatif): [ {REMOVE:'a'}, {INSERT:'c',at:1} ]
```

---

## 🧾 4) **JSX** : syntaxe pour décrire l’UI

### 📚 Définition
**JSX** est une **extension de syntaxe** pour JavaScript qui permet d’écrire des **éléments** (semblables à HTML) directement dans le code, ensuite **transpilés** (par Babel) en appels à `React.createElement`.

### 🤔 Pourquoi JSX ?
- **Expressivité** : proche du HTML, facile à lire.
- **Sécurité** : expressions JS contrôlées (`{ ... }`).
- **Outillage** : meilleurs messages d’erreur, autocomplétion, linting.

### 🧩 Principales différences avec HTML
- `class` ⟶ `className`
- `for` ⟶ `htmlFor`
- Les **attributs** sont en **camelCase** (`onClick`, `tabIndex`).
- Les **valeurs dynamiques** utilisent `{ expression }`.

### 🔧 Exemples concrets
```jsx
const name = 'Eric';
const items = ['React', 'JSX', 'Hooks'];

export default function ExampleJSX() {
  return (
    <section aria-label="Exemples JSX">
      <h1 className="title">Bonjour, {name.toUpperCase()} !</h1>
      <ul>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
      {/* Conditionnelle */}
      {items.length > 0 ? (
        <p>Vous avez {items.length} sujets.</p>
      ) : (
        <p>Aucun sujet.</p>
      )}
    </section>
  );
}
```

### 🧪 Comment JSX est transformé
```jsx
// Avant (JSX)
const element = <h1 className="title">Hello</h1>;

// Après (approx.)
const element2 = React.createElement(
  'h1',
  { className: 'title' },
  'Hello'
);
```

---

## 🧰 5) Pipeline de rendu (schéma)

```mermaid
flowchart LR
  A[JSX (déclaration)] --> B[Babel (transpilation)]
  B --> C[React.createElement]
  C --> D[Virtual DOM]
  D --> E[Reconciliation]
  E --> F[DOM réel (mise à jour ciblée)]
```

---

## 🧪 6) Exemples guidés et bonnes pratiques de base

### ✅ Clés pour les listes
```jsx
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

export default function List() {
  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### ✅ Composant pur et lisible
- Une fonction courte, un **nom clair**.
- Des **props** nécessaires uniquement.
- Pas d’effet de bord (réservé à `useEffect`).

### ❌ Anti-patterns à éviter dès le départ
- Éviter d’insérer des **données non fiables** directement (valider avant).
- Ne pas muter des **props** (elles sont **immutables**).
- Éviter les **clés instables** (index d’un `map` pour listes dynamiques).

---

## 🧪 7) Mini exercices (autonomes)

1. **Composant Salut** : créez un composant `Salut` qui prend `prenom` en prop et affiche `Bonjour, prenom`. Ajoutez un style via `className`.
2. **Liste Thèmes** : mappez un tableau `themes` pour créer une liste, avec des `key` stables.
3. **JSX conditionnel** : affichez un message différent selon si `themes.length > 0`.

*(Solutions indicatives disponibles au besoin dans un chapitre annexe.)*

---

## 🧮 8) (Optionnel) Petite formule en JavaScript

> 🎓 **But pédagogique** : raisonner sur la **complexité** d’une comparaison naïve d’arbres.
```js
// Complexité approximative d'une comparaison naïve de 2 tableaux (n éléments)
// Ici, on calcule un ordre de grandeur en JS (O(n^2) si on cherche chaque élément à la main)
function naiveDiffComplexity(n) {
  // Nombre d'opérations élémentaires approximatives
  let ops = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ops++;
    }
  }
  return ops; // ~ n*n
}

console.log(naiveDiffComplexity(10)); // 100

// Avec une table de hachage (Map), on peut réduire à ~ O(n)
function hashedDiffComplexity(n) {
  // On simule un coût linéaire
  let ops = 0;
  for (let i = 0; i < n; i++) ops++;
  return ops; // ~ n
}

console.log(hashedDiffComplexity(10)); // 10
```

---

## 🧭 9) Foire aux questions courtes (FAQ)

- **Dois-je apprendre les classes ?** ➜ Non pour commencer. Comprendre les **hooks** suffit. Les classes servent à lire du code legacy.
- **JSX est obligatoire ?** ➜ Techniquement non, mais **fortement recommandé** pour la lisibilité et l’outillage.
- **React est un framework ?** ➜ C’est une **bibliothèque** (vous assemblez les outils dont vous avez besoin).

---

## 🧾 **Résumé des points essentiels (Chapitre 1)**

- React est **déclaratif** et **component-based** : on **décrit** l’UI en fonction d’un **état**.
- Les **composants** sont des **fonctions** recevant des **props** et retournant du **JSX**.
- Le **Virtual DOM** permet de **comparer** et **mettre à jour** le DOM réel de manière ciblée (**reconciliation**).
- **JSX** est une **syntaxe** proche du HTML, transformée en **`React.createElement`**.
- Utilisez des **clés stables** pour les listes, ne **muter** jamais les **props**.

---

## ✅ **Checklist de fin de chapitre**

- [ ] Je peux expliquer la **différence** entre **JSX** et **HTML**.
- [ ] Je sais écrire un **composant fonctionnel** avec **props**.
- [ ] Je comprends ce qu’est le **Virtual DOM** et la **reconciliation**.
- [ ] Je sais **composer** deux composants entre eux.

---

> ⏭️ **Prochain chapitre** : [[Chapitre 2 - Props et État]]
