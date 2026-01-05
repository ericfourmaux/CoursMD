
# 🧭 Index du Cours – Développement Web Front-End (Débutant → Junior)

> Ce fichier **index.md** sert de table des matières (syllabus) pour naviguer l'ensemble du parcours.
> Chaque chapitre aura son propre fichier `.md` (format Obsidian) avec contenu exhaustif, code, schémas et icônes.

---

## 🎯 Objectifs du parcours
- Maîtriser les **bases du web** (HTML sémantique, CSS moderne, JavaScript ES6+).
- Comprendre **l’algorithmique** et les **structures de données** appliquées à JS.
- Pratiquer la **POO en JS**, **MVC**, et les **design patterns** courants.
- Utiliser **TypeScript** de manière rigoureuse dans des projets front.
- Mettre en place un **tooling professionnel** (Node.js, npm, Webpack, Babel, ESLint, Prettier).
- Écrire des **tests unitaires** avec **Jest** (et Testing Library).
- Construire une application complète avec **Vue 3** (Composition API, Router, Pinia, TS).
- Déployer, collaborer avec **Git/GitHub**, et intégrer **CI**.
- Découvrir **Electron** pour empaqueter une app desktop avec technologies web.

---

## 📚 Syllabus (Chapitres)

### 📘 Chapitre 0 — Introduction au parcours & Environnement
- 🌐 Web 101 : clients, serveurs, DNS, HTTP, ressources, navigateur & DevTools.
- 🧰 Outils : VS Code, extensions, Node/npm, nvm, Git, Chrome DevTools.
- 🧪 Atelier : première page HTML + inspection DevTools.

### 📘 Chapitre 1 — HTML Sémantique & Accessibilité (A11y)
- Sémantique (balises structurantes), ARIA, formulaires, images, tables.
- Accessibilité : principes WCAG, clavier, contrastes, roles ARIA, landmarks.
- Livrable : page accessible avec structure sémantique, formulaires, navigation clavier.

### 📘 Chapitre 2 — CSS Moderne: Box Model, Flexbox, Grid, Responsive
- Cascade, spécificité, héritage, box model.
- Flexbox & Grid (layouts), media queries, typographie, variables CSS.
- Organisation : BEM, utilitaire vs composant, animations, transitions.
- Livrable : mini design system + page responsive.

### 📘 Chapitre 3 — JavaScript Fondamentaux (ES6+)
- Types, variables, contrôle de flux, fonctions, portée, closures.
- Prototypes, `this`, classes ES6, modules, destructuring, rest/spread.
- DOM API, événements, `fetch`, JSON, timers.
- Asynchronicité : callback → Promises → `async/await`, event loop.
- Livrable : composants DOM interactifs.

### 📘 Chapitre 4 — Algorithmique & Structures de Données en JavaScript
- Complexité Big‑O.
- Tableaux, pile, file, Map/Set, objets, hashtable, arbre (intro), graphe (intro).
- Algorithmes : recherche, tri, récursion, DP (intro).
- Livrable : bibliothèque d’algos en JS.

### 📘 Chapitre 5 — POO, S.O.L.I.D, MVC & Design Patterns
- POO en JS : classes, héritage, composition, encapsulation.
- S.O.L.I.D, patterns (Observer, Strategy, Factory, Adapter, Decorator, Singleton).
- MVC côté front, EventBus, architecture modulaire.
- Livrable : mini‑framework MVC vanilla JS.

### 📘 Chapitre 6 — TypeScript Fondamentaux & Migration depuis JS
- Types, interfaces, generics, unions, intersections.
- `tsconfig`, strict mode, typage DOM/APIs.
- Migration JS → TS pas à pas.
- Livrable : refactor d’un mini‑projet en TS.

### 📘 Chapitre 7 — Tooling Pro: Node.js, npm, scripts & Webpack
- Node & npm : `package.json`, scripts, dépendances, ESM/CJS.
- Webpack : entry, loaders, plugins, code splitting, tree‑shaking, cache.
- Babel, PostCSS, ESLint, Prettier, Husky.
- Livrable : configuration Webpack de A à Z.

### 📘 Chapitre 8 — Tests Unitaires & Qualité avec Jest
- Jest : runner, assertions, mocks, snapshots, coverage.
- Testing Library pour tests DOM.
- TDD, test pyramid, stratégie de mocks.
- Livrable : suite de tests sur modules algos + composants DOM.

### 📘 Chapitre 9 — Vue 3 (Composition API) – Bases
- Reactivité : `ref`, `reactive`, `computed`, `watch`.
- Composants, props/emits, slots, directives.
- Architecture composants and conventions.
- Livrable : composants UI + état local.

### 📘 Chapitre 10 — Vue Router, Pinia, TypeScript & Tests
- Vue Router : routes, navigation, guards.
- Pinia : stores, actions, getters, persistance.
- TypeScript avec Vue : `defineProps`, `defineEmits`, types.
- Tests de composants.
- Livrable : app multi‑pages avec état global typé + tests.

### 📘 Chapitre 11 — Performance Web, Accessibilité Avancée & SEO
- Core Web Vitals, profils performance.
- Optimisation : images, fonts, caching, lazy‑loading, bundling.
- A11y avancée : audits, focus management, erreurs formulaires.
- SEO front : métadonnées, SPA vs SSR.
- Livrable : audit + plan d’optimisation sur l’app Vue.

### 📘 Chapitre 12 — Git, GitHub, Branching & CI
- Git de base → avancé, stratégies de branches, PRs.
- GitHub Actions : pipeline CI (lint, build, tests), badges.
- Versioning sémantique, CHANGELOG, releases.
- Livrable : workflow Git complet + pipeline CI.

### 📘 Chapitre 13 — Déploiement & Environnements
- Build & déploiement (Netlify/Vercel/GitHub Pages).
- Variables d’environnement, secrets, feature flags, monitoring.
- Stratégies de déploiement & rollback.
- Livrable : app Vue déployée avec CI/CD.

### 📘 Chapitre 14 — Electron (Desktop avec Tech Web)
- Processus Main vs Renderer, IPC, sécurité.
- Packaging (Electron Builder), auto‑update (aperçu).
- Intégration Webpack/TS, gestion fichiers système.
- Livrable : mini app desktop Vue + TS + Electron.

### 📘 Chapitre 15 — Projet Fil Rouge (Capstone)
- Application Kanban complète (Vue 3 + TS + Pinia + Router + Webpack + Jest + CI + déploiement).
- CRUD, drag & drop, recherche/filtre, persistance locale/API, auth (mock), i18n (bonus).
- Livrables : repo GitHub public, doc technique, pipeline CI, démo déployée.

---

## 🧷 Résumé des points essentiels par chapitre

- **Chapitre 0**: Comprendre le web (client/serveur, HTTP) et installer l’environnement (VS Code, Node, Git). Objectif: être prêt à coder.
- **Chapitre 1**: HTML sémantique et accessibilité (WCAG, ARIA, clavier, contrastes) pour des interfaces utilisables par tous. Objectif: structurer et rendre accessible.
- **Chapitre 2**: CSS moderne (Flexbox, Grid, responsive, variables) et méthodologies (BEM). Objectif: mises en page robustes et maintenables.
- **Chapitre 3**: JS ES6+ (portée, modules, classes, asynchronicité) et DOM. Objectif: interactivité fiable.
- **Chapitre 4**: Algorithmique (Big‑O) et structures de données (pile, file, map, arbre). Objectif: solutions efficaces.
- **Chapitre 5**: POO et design patterns (S.O.L.I.D, MVC, Observer…). Objectif: architecture claire.
- **Chapitre 6**: TypeScript (types, generics, config) et migration. Objectif: typage strict.
- **Chapitre 7**: Tooling (npm, Webpack, Babel, ESLint/Prettier). Objectif: pipeline pro.
- **Chapitre 8**: Tests (Jest, Testing Library, TDD, mocks). Objectif: qualité et confiance.
- **Chapitre 9**: Vue 3 (Composition API, composants). Objectif: base solide Vue.
- **Chapitre 10**: Router, Pinia, TS, tests composants. Objectif: app scalable.
- **Chapitre 11**: Performance, A11y avancée, SEO. Objectif: app rapide et référencée.
- **Chapitre 12**: Git/GitHub, branching, CI. Objectif: collaboration et automatisation.
- **Chapitre 13**: Déploiement, environnements, secrets. Objectif: mise en prod maîtrisée.
- **Chapitre 14**: Electron desktop. Objectif: empaqueter une app web.
- **Chapitre 15**: Capstone Kanban. Objectif: projet complet prêt pour portfolio.

---

## 🔖 Légende des icônes
- 📘 Chapitre
- 🎯 Objectifs
- 🧠 Concept clé
- 🔍 Définition
- ❓ Pourquoi
- 💡 Exemple
- 🧪 Exercice
- 🛠 Outil
- ⚠️ Attention
- ✅ Bonnes pratiques
- 🚀 Performance
- 🔎 Audit
- 🗺 Schéma
- 🧩 Composant

---

## 🔗 Navigation
- Chapitre 1: **HTML Sémantique & Accessibilité (A11y)** → `Chapitre-01—HTML-sémantique-et-accessibilité.md`
- Les autres chapitres seront ajoutés au fur et à mesure de la progression.

