
# 📘 Chapitre 13 — Modules, bundling & organisation du code (Vite/Webpack)

> 🎯 **Objectifs** : organiser un projet orienté objet, build & distribution.

---

## 🧠 Concepts
- **ESM** : modules natifs, import/export.
- **Tree‑shaking** : élimination du code non utilisé.
- **Public API** : surface d’export stable.

---

## 🧩 Exemple : packaging d’une librairie OO
```
src/
  index.js (export public)
  domain/
    Money.js
    Account.js
  services/
    OrderService.js
```

```js
// src/index.js
export { Money } from './domain/Money.js';
export { Account } from './domain/Account.js';
```

---

## 🔗 Références
- Vite: https://vitejs.dev/guide/
- Webpack: https://webpack.js.org/concepts/

---

## 🧭 Exercices
1. Créez un bundle de votre librairie avec Vite.
2. Définissez une **API publique** minimale.

---

## ✅ Résumé
- Structurez par **domaines** et **services**.
- Exposez une **API** claire et utilisez un **bundler** si nécessaire.
