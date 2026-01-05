
# 📘 Chapitre 18 — Fin du parcours & Plan d’évolution

> 🎯 **Objectifs du chapitre**
> - Consolider ton **portfolio** et ta présence pro (GitHub, LinkedIn, CV).
> - Mettre en place un **plan d’étude concret sur 4 semaines** (algos, tooling, UX, tests).
> - Préparer des **entretiens techniques** (simulateur, check-lists, templates).
> - Définir un **plan d’évolution 3 mois** (objectifs, jalons, indicateurs).

---

## 🧠 1. Bilan & compétences acquises

Tu as bâti une base **professionnelle** :
- **Front moderne**: HTML sémantique, CSS (Flex/Grid), JS ES6+, POO, patterns.
- **Architecture**: MVC, S.O.L.I.D, stores (Pinia), Router, Module Federation.
- **Stack**: Vue 3 + TS, Webpack 5, PostCSS, Babel, ESLint/Prettier.
- **Qualité**: Jest + Vue Testing Library, coverage, CI GitHub Actions.
- **Perf & A11y**: Web Vitals (LCP/CLS/INP), Lighthouse, focus management.
- **Déploiement**: Netlify/Vercel/GH Pages, envs & secrets, cache/CDN.
- **Electron**: Main/Renderer/Preload, IPC sécurisé, packaging.

---

## 🗂️ 2. Portfolio & Présence pro

### 📦 Répos à exposer (min. 4)
1. **Kanban Vue + TS** (Chap. 15) — drag & drop, filtres, tests, CI, déploiement.
2. **Electron Notes** (Chap. 14) — IPC, prefs persistées, packaging.
3. **Micro‑frontends** (Chap. 16) — host+remotes, Design System, Storybook.
4. **Perf & A11y** (Chap. 11) — avant/après avec mesures (Lighthouse, Web Vitals).

### 🧾 README type (par projet)
```md
# Nom du projet

![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-%E2%89%A5%2080%25-green)

## 🎯 Objectif
Phrase claire (une ligne) expliquant la valeur.

## 🚀 Démo
- App: https://<ton-domaine>/<ton-projet>
- Storybook (si Design System): https://<ton-domaine>/storybook

## 🔧 Stack
Vue 3, TypeScript, Pinia, Router, Webpack 5, Jest, ESLint/Prettier.

## 🧪 Qualité
- Tests unitaires + DOM (Jest + @testing-library/vue).
- Coverage ≥ 80%.
- CI GitHub Actions (lint/build/tests/deploy).

## 📊 Performance & A11y
- Lighthouse: Perf ≥ 90, A11y ≥ 90.
- Web Vitals collectés (LCP/CLS/INP).

## 📁 Structure
(Arborescence synthétique + conventions).

## 📜 Licence
MIT
```

### 👤 GitHub & LinkedIn
- **GitHub**: épingle tes 4 projets, mets une bio claire, ajoute un **README de profil**.
- **LinkedIn**: titre précis (ex. *Intégrateur principal, Web / Front-end Vue + TS*), 3 projets clés, compétences (Vue, TS, Webpack, Jest, A11y, Perf), lien vers portfolio.

### 🧭 Portfolio web (one‑page)
Sections: **Héros**, **Projets**, **Compétences**, **Mesures (Perf/A11y)**, **Contact**.

---

## 📅 3. Plan d’étude concret — 4 semaines

### 🗺️ Vue globale
- **Semaine 1 — Algorithmes & JS avancé**
- **Semaine 2 — Tooling & Tests**
- **Semaine 3 — Vue 3 & Accessibilité**
- **Semaine 4 — Performance, Architecture & Entretiens**

### 📆 Détail jour par jour

#### Semaine 1 — Algorithmes & JS
- **Jour 1**: Complexités (Big‑O), tableaux, deux pointeurs. *Exos*: `twoSum`, `mergeIntervals`.
- **Jour 2**: Hash map & set. *Exos*: `anagram`, `frequencyCounter`.
- **Jour 3**: Piles/Files. *Exos*: `validParentheses`, `queueWithStacks`.
- **Jour 4**: Recursion & DFS/BFS (graphes). *Exos*: `dfsGraph`, `bfsGrid`.
- **Jour 5**: Trie & recherche. *Exos*: `prefixSearch`, `binarySearch variants`.
- **Jour 6**: JS avancé: closures, currying, debounce/throttle.
- **Jour 7**: Revue + mini‑projet utilitaires (lib `@eric/utils`).

#### Semaine 2 — Tooling & Tests
- **Jour 1**: Webpack (dev/prod), SplitChunks, HMR.
- **Jour 2**: TypeScript strict, types utilitaires, mapped/conditional.
- **Jour 3**: Jest asynchrone, mocks/spies/timers, snapshots.
- **Jour 4**: Vue Testing Library (queries, a11y, interactions).
- **Jour 5**: CI GitHub Actions (matrix, cache, artifacts).
- **Jour 6**: Linting + Prettier + hooks Husky (pre‑commit).
- **Jour 7**: Intégration sur projet (Kanban) + coverage ≥ 80%.

#### Semaine 3 — Vue 3 & A11y
- **Jour 1**: Composition API (`ref/reactive/computed/watch`).
- **Jour 2**: Router (guards/meta), Pinia (getters/actions/persist).
- **Jour 3**: Composables (`useFetch`, `useToggle`).
- **Jour 4**: A11y: focus management, roles/labels, modales.
- **Jour 5**: Design System: tokens + Storybook.
- **Jour 6**: i18n (fr/en), locales.
- **Jour 7**: Revue + publication d’un composant `@workspace/ui-kit` (mock).

#### Semaine 4 — Performance, Architecture & Entretiens
- **Jour 1**: Web Vitals & Lighthouse, budgets JS/CSS.
- **Jour 2**: Observabilité (logs/traces), erreurs & source maps.
- **Jour 3**: Résilience: retry/backoff, circuit‑breaker.
- **Jour 4**: Architecture MF (Module Federation) — host/remote, shared.
- **Jour 5**: Simulateur d’entretiens (tech & comportemental).
- **Jour 6**: Déploiement Netlify/Vercel, headers sécurité (CSP/HSTS).
- **Jour 7**: Finalisation portfolio + **mock interviews**.

> ⏱️ **Rythme**: 2–3 h/jour en semaine, 4–5 h/week‑end.

---

## 🎙️ 4. Simulateur d’entretiens (technique & comportemental)

### 🧩 Format 60 min
- **5 min**: Présentation & pitch.
- **35 min (coding)**: implémenter une fonctionnalité (ex. **recherche debounced + liste filtrée** en Vue).
- **10 min (design)**: décrire une **architecture front** (state global, router, perf, a11y).
- **10 min (comportemental)**: questions STAR + Q/A.

### 📜 Prompt technique (exemple)
```md
Implémente en Vue 3 un champ de recherche qui filtre des produits (titre/label) avec:
- Debounce 300ms (pas d’appels superflus)
- Compteur de résultats & message d’empty state
- A11y: label visible, rôle list/listitem, focus clavier
- Tests: unitaire (filtre) + DOM (interaction)
```

### 🧮 Rubrique d’évaluation (100 pts)
- **Clarté & structure** (15)
- **Qualité du code & TS** (20)
- **Tests** (20)
- **A11y & UX** (15)
- **Performance (debounce, rendu)** (10)
- **Communication & raisonnement** (20)

### 🗣️ Pitch personnel (template)
```md
Bonjour, je suis Eric, intégrateur web orienté front Vue + TypeScript.
J’ai construit un Kanban complet avec tests/CI et un app Electron.
Je cherche à contribuer à une équipe qui valorise la qualité, l’accessibilité et la performance.
```

### ⭐ STAR (comportemental) — Canevas
```md
**Situation**: contexte
**Tâche**: objectif attendu
**Action**: ce que tu as fait (technique/communication)
**Résultat**: impact mesuré (chiffres, qualité, délais)
```

### ✉️ Email de suivi (post‑entretien)
```md
Objet: Merci – Entretien du <date>

Bonjour <Prénom>,
Merci pour l’échange de ce jour. J’ai apprécié <point fort> et je suis motivé par <projet/mission>.
Je reste disponible pour toute information complémentaire.
Bien cordialement,
Eric Fourmaux
```

---

## ✅ 5. Check‑lists

### 🔎 Avant l’entretien
- Relire **fiche poste** (compétences clés).
- Réviser **2–3 projets** (démo, tests, perf).
- Préparer **questions** (équipe, architecture, CI, perf/A11y).
- Environnement prêt (Node, editor, test runner).

### 🧪 Pendant
- Clarifier **requirements** (inputs, outputs, contraintes).
- **Penser à voix haute**, proposer une **stratégie**.
- **Écrire des tests** basiques si le format le permet.
- Gérer le **temps** (milestones, fallback).

### 📬 Après
- Envoyer **email** de suivi.
- Noter **feedbacks** & axes d’amélioration.

---

## 📈 6. Plan d’évolution — 3 mois

### 🎯 Objectifs
- **Tech**: maîtriser **Module Federation**, **Design System** publisable, **observabilité** front.
- **Qualité**: coverage ≥ **85%** sur projet principal, 2 audits Lighthouse ≥ 90.
- **Pro**: 2 **mock interviews**/mois, 1 **talk** interne ou article.

### 🛣️ Jalons
- **Mois 1**: consolider Kanban + tests; publier un composant `@workspace/ui-kit`.
- **Mois 2**: micro‑frontends host+remote, storybook + tests visuels; déploiement preview auto.
- **Mois 3**: observabilité (Web Vitals + traces), budgets CI, préparation intensifs d’entretiens.

### 📊 Indicateurs
- PRs **merge**/semaine, issues closes.
- Perf (LCP médiane), A11y (contrastes, focus), bugs/erreurs.

---

## 📚 7. Ressources (sans liens, à rechercher selon préférences)
- **JS & TS**: «You Don’t Know JS (Yet)», docs TypeScript.
- **Vue 3**: Documentation officielle, RFCs.
- **Testing**: Jest, Testing Library docs.
- **Perf/A11y**: Web Vitals, Lighthouse, WCAG.
- **CI/CD**: GitHub Actions docs.

---

## 🔚 Résumé essentiel
- Ton **portfolio** est la vitrine: montre **qualité**, **tests**, **perf** et **accessibilité**.
- Le **plan 4 semaines** cadence la montée en compétence; le **simulateur** prépare les entretiens.
- Le **plan 3 mois** fixe des jalons concrets pour progresser et convaincre.

---

> **Félicitations pour le parcours !** Je reste disponible pour adapter ce plan à tes opportunités et organiser des **mock interviews**.
