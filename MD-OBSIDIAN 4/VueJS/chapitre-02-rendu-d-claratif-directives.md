---
title: Chapitre 02 — Rendu déclaratif & Directives
tags: [Vue.js, Vue 3, Formation, Débutant]
---


# 📘 Chapitre 02 — Rendu déclaratif & Directives

🎯 **Objectifs**
- Apprendre les **interpolations** et **directives** principales.
- Comprendre `v-bind`, `v-on`, `v-if`, `v-show`, `v-for`, et la notion de **clé**.

🧠 **Concepts**
- **Interpolations** : `{{ expr }}` met la valeur dans le DOM.
- **Directives** : attributs spéciaux `v-*` qui **pilotent** le DOM.
- **Clé (`:key`)** : identifiant unique pour stabiliser les éléments en liste.

🔍 **Pourquoi ?**
- Réduire la **logique DOM** au profit d’une **déclaration** claire.
- Aider Vue à **optimiser** les mises à jour.

🧪 **Exemples** (pattern)
```vue
<template>
  <h1>{{ title }}</h1>
  <input :value="query" @input="onInput" />
  <p v-if="items.length === 0">Aucun résultat</p>
  <ul>
    <li v-for="it in items" :key="it.id">{{ it.name }}</li>
  </ul>
</template>
```

💡 **Analogie**
- Les directives sont comme des **instructions** dans une recette : `v-if` = "si l’ingrédient existe, ajoute‑le" ; `v-for` = "répéter pour chaque ingrédient".

⚠️ **Pièges**
- Oublier `:key` → réordonnements inattendus.
- Utiliser `v-if` au lieu de `v-show` pour du **toggle fréquent** → coût inutile.

✅ **Bonnes pratiques**
- **Clés stables** (id métier), pas des index `i`.
- Préférer `v-show` pour bascules fréquentes ; `v-if` pour présence conditionnelle.

🛠️ **Mise en pratique — mini filtre**
```js
function filterByQuery(items, q) {
  const query = q.trim().toLowerCase()
  return items.filter(it => it.name.toLowerCase().includes(query))
}
```

🧩 **Exercice**
- Écrire un template de recherche avec `v-for`, `:key`, `v-if` et `v-on`.

📝 **Résumé essentiel**
- Les **directives** expriment des intentions ; laissez Vue **gérer le DOM**.
- Les **clés** garantissent un **rendu stable** en liste.


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
