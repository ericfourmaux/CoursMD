---
title: "🧱 Chapitre 5 — Organisation et Architecture"
author: "Eric Fourmaux"
description: "Structurer un projet React, organiser les composants, gérer la réutilisabilité, éviter le props drilling, introduire Context API, bonnes pratiques et schémas"
tags: [React, JavaScript, Frontend, Architecture, Context]
---

# 🧱 **Chapitre 5 — Organisation et Architecture**

> 🎯 **Objectif** : Apprendre à **structurer un projet React**, organiser les **composants**, gérer la **réutilisabilité**, éviter le **props drilling**, et introduire **Context API** pour un état global.

---

## 🗂️ 1) Structure d’un projet React

### 📚 Organisation recommandée
```
my-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── UI/
│   │       └── Button.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── hooks/
│   │   └── useFetch.js
│   ├── context/
│   │   └── UserContext.jsx
│   ├── App.jsx
│   └── index.js
└── package.json
```

### ✅ Bonnes pratiques
- **Séparer** les composants par rôle (UI, pages, layout).
- Créer des **dossiers dédiés** pour hooks, context, assets.
- Utiliser des **noms explicites** et cohérents.

---

## 🧩 2) Composants réutilisables

### 📚 Définition
Un composant réutilisable est **indépendant**, **paramétrable** via des **props**, et **sans dépendance forte** à un contexte spécifique.

### 🔧 Exemple : Bouton générique
```jsx
export default function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### ✅ Avantages
- Réduction de la duplication.
- Cohérence visuelle et fonctionnelle.

---

## 🔗 3) Props drilling : problème et solutions

### 📚 Définition
Le **props drilling** survient quand on **passe des props à travers plusieurs niveaux** de composants juste pour atteindre un enfant profond.

### ❗ Inconvénients
- Complexité accrue.
- Maintenance difficile.

### 🧩 Exemple
```
<App>
  <Layout>
    <Sidebar>
      <UserProfile user={user} />
    </Sidebar>
  </Layout>
</App>
```
Ici, `user` traverse plusieurs couches.

---

## 🧠 4) Solution : Context API

### 📚 Définition
Le **Context API** permet de **partager des données globales** sans passer par des props intermédiaires.

### 🔧 Exemple : créer un contexte utilisateur
```jsx
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Eric' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
```

### 🔧 Utilisation
```jsx
function Profile() {
  const { user } = useUser();
  return <p>Bienvenue, {user.name}</p>;
}
```

---

## 🧭 5) Schéma : flux avec Context

```mermaid
flowchart LR
  A[Provider] --> B[Composant enfant]
  B --> C[useContext]
  C --> D[Accès aux données globales]
```

---

## 🧪 6) Exercices

1. Créez un **Provider** pour un thème (clair/sombre) et utilisez-le dans un bouton.
2. Refactorez un exemple avec **props drilling** pour utiliser **Context**.

---

## ✅ Bonnes pratiques
- Limiter le nombre de **contexts** pour éviter la complexité.
- Ne pas abuser du **global state** : garder local quand possible.
- Découper les composants pour **lisibilité** et **testabilité**.

---

## 🧾 **Résumé des points essentiels (Chapitre 5)**

- Organiser le projet en **dossiers logiques** (components, pages, hooks, context).
- Créer des **composants réutilisables** et paramétrables.
- Éviter le **props drilling** avec **Context API**.
- Respecter la **responsabilité unique** pour chaque composant.

---

## ✅ **Checklist de fin de chapitre**

- [ ] Je sais structurer un projet React.
- [ ] Je sais créer un composant réutilisable.
- [ ] Je comprends le problème du **props drilling**.
- [ ] Je sais utiliser **Context API** pour partager des données globales.

---

> ⏭️ **Prochain chapitre** : [[Chapitre 6 - Navigation avec React Router]]
