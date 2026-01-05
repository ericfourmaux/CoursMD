---
title: Module Outils & Workflow — Développement Front‑End (Complet)
tags: [front-end, outils, workflow, git, github, npm, vite, webpack, sass, less, postcss, ci-cd, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Outils & Workflow — Complet et Opérationnel

> [!note]
> **Objectif** : Mettre en place un **workflow professionnel** de développement front‑end de A à Z : de Git/GitHub à NPM/monorepo, Vite/Webpack, Sass/Less, qualité (ESLint/Prettier/Stylelint), CI/CD et publication.
>
> **À la fin de ce module, vous saurez :**
> - Maîtriser **Git** (branches, merges, rebase, tags, hooks) et **GitHub** (PRs, Actions, sécurité, règles de protection).
> - Configurer **NPM/PNPM/Yarn**, comprendre **SemVer**, `package.json`, workspaces/monorepo et **nvm**.
> - Construire avec **Vite** et **Webpack** (HMR, code splitting, tree shaking, cache, env, plugins, loaders).
> - Utiliser **Sass (SCSS)** et **Less** (variables, mixins, @use/@forward, architecture CSS).
> - Établir une **structure de projet** robuste et portable.
> - Assurer **qualité & style** (ESLint, Prettier, Stylelint, Husky, lint‑staged, commitlint).
> - Déployer via **CI/CD** (GitHub Actions) et gérer les **releases** (Conventional Commits, semantic‑release).

---

## Table des matières

- [1. Git — Fondamentaux & pratiques pro](#1-git--fondamentaux--pratiques-pro)
- [2. GitHub — Collaboration, sécurité, automation](#2-github--collaboration-securite-automation)
- [3. Gestion des paquets — NPM, PNPM, Yarn](#3-gestion-des-paquets--npm-pnpm-yarn)
- [4. Configuration du projet : package.json, SemVer, scripts](#4-configuration-du-projet--packagejson-semver-scripts)
- [5. Environnements & variables (.env)](#5-environnements--variables-env)
- [6. Vite — Dev server & build moderne](#6-vite--dev-server--build-moderne)
- [7. Webpack — Build custom et compatibilité large](#7-webpack--build-custom-et-compatibilite-large)
- [8. Babel, PostCSS, Browserslist & Autoprefixer](#8-babel-postcss-browserslist--autoprefixer)
- [9. Préprocesseurs CSS : Sass (SCSS) & Less](#9-preprocesseurs-css--sass-scss--less)
- [10. Structure de projet recommandée](#10-structure-de-projet-recommandee)
- [11. Qualité & Style : ESLint, Prettier, Stylelint, Husky](#11-qualite--style--eslint-prettier-stylelint-husky)
- [12. Optimisations & performance](#12-optimisations--performance)
- [13. CI/CD avec GitHub Actions](#13-cicd-avec-github-actions)
- [14. Versionning & Releases](#14-versionning--releases)
- [15. Sécurité & conformité](#15-securite--conformite)
- [16. Exercices guidés avec corrections](#16-exercices-guides-avec-corrections)
- [17. Checklist de référence](#17-checklist-de-reference)
- [18. Glossaire rapide](#18-glossaire-rapide)
- [19. FAQ](#19-faq)
- [20. Références & ressources](#20-references--ressources)

---

## 1. Git — Fondamentaux & pratiques pro

### 1.1. Démarrage

```bash
# Configuration initiale
git config --global user.name "Votre Nom"
git config --global user.email "vous@example.com"
# Création & premier commit
git init
printf "# Mon projet\n" > README.md
git add README.md
git commit -m "chore: initial commit"
```

### 1.2. Branches & stratégies

- **Nommage** : `feature/...`, `fix/...`, `chore/...`, `release/...`.
- **Stratégies** :
  - *Trunk‑based* : une branche principale (ex. `main`), merges fréquents.
  - *Git Flow* : `develop`, `feature/*`, `release/*`, `hotfix/*`.

> [!tip]
> Préférez **Trunk‑based** pour la simplicité et la vitesse ; utilisez des **feature flags** pour activer/désactiver des fonctionnalités.

### 1.3. Merges, rebase & historique

```bash
# Rebase interactif pour nettoyer l'historique
git rebase -i HEAD~5
# Merge avec squash (GitHub UI ou local)
git merge --squash feature/login
```

- **Merge commit** : conserve l’historique complet.
- **Squash merge** : condense la branche en un commit.
- **Rebase** : réécrit l’historique au-dessus de la branche cible (attention en partagé).

### 1.4. Tags & versions

```bash
git tag -a v1.0.0 -m "release: 1.0.0"
git push origin v1.0.0
```

### 1.5. Outils utiles

- **.gitignore** (ex. `node_modules/`, `dist/`, `.env`).
- **Stash** : `git stash` / `git stash pop`.
- **Cherry‑pick** : appliquer un commit spécifique.
- **Hooks** : pre‑commit, commit‑msg (via **Husky** + **lint‑staged**).
- **GPG** : signer vos commits/tags.

---

## 2. GitHub — Collaboration, sécurité, automation

### 2.1. Pull Requests & Reviews

- PR **petites**, **claires**, avec description, captures et checklist.
- Exiger **1–2 reviewers** ; activer **status checks** (CI). 

### 2.2. Règles de branche & protection

- Interdire push direct sur `main` ; obliger PR + review.
- Exiger **tests passants** et **lint OK**.
- Activer **require signed commits** (optionnel).

### 2.3. Templates & labels

- **Issue templates** (bug, feature) ; **PR template** avec checklist.
- Labels cohérents (`bug`, `enhancement`, `documentation`, `good first issue`).

### 2.4. Sécurité

- **Dependabot** (alertes CVE), **CodeQL** (code scanning).
- Secrets & **Environments** (staging, production) avec protections.

### 2.5. GitHub Actions

- Workflows pour **lint/test/build/deploy**.
- Caching NPM/PNPM, matrices de versions Node.

---

## 3. Gestion des paquets — NPM, PNPM, Yarn

- **NPM** (référence), **PNPM** (liens hard/soft → rapide & économe), **Yarn** (alternative).
- Choisir **un** gestionnaire et le documenter.
- Fichiers de lock : `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`.
- **nvm** pour fixer la version de Node (`.nvmrc`).

```bash
# Initialiser un projet NPM
npm init -y
# Définir Node via nvm
echo "18" > .nvmrc
```

> [!warning]
> Évitez de mélanger NPM/PNPM/Yarn dans un même repo. **Standardisez**.

---

## 4. Configuration du projet : package.json, SemVer, scripts

### 4.1. `package.json` clé

```json
{
  "name": "mon-projet",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier -w .",
    "test": "vitest"
  },
  "engines": { "node": ">=18" },
  "browserslist": ["defaults", "not IE 11", "maintained node versions"],
  "dependencies": {},
  "devDependencies": {}
}
```

### 4.2. SemVer (`MAJOR.MINOR.PATCH`)

- `^1.2.3` : **compatible** (≥1.2.3 <2.0.0)
- `~1.2.3` : **patch/minor** (≥1.2.3 <1.3.0)
- Fixer versions critiques pour reproductibilité.

### 4.3. Workspaces & monorepo

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

> [!tip]
> Les **workspaces** facilitent le partage de code (UI kits, utils) et une **release** coordonnée.

---

## 5. Environnements & variables (.env)

- `.env`, `.env.development`, `.env.production`.
- Avec **Vite** : variables **préfixées** `VITE_` exposées au client.
- Ne **committez pas** de secrets ; utilisez **environments GitHub**.

```bash
VITE_API_URL=https://api.example.com
```

```js
// usage côté client
const api = import.meta.env.VITE_API_URL;
```

---

## 6. Vite — Dev server & build moderne

### 6.1. Installation

```bash
npm create vite@latest mon-app -- --template react
cd mon-app
npm install
npm run dev
```

### 6.2. Config `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173 },
  build: { sourcemap: true, outDir: 'dist' }
})
```

### 6.3. Env, assets & plugins

- `import.meta.env` ; `base` pour déploiement sous sous‑répertoire.
- Plugins : compression, PWA, SVG loader, legacy.

> [!tip]
> Vite exploite **ES Modules natifs** et **Rollup** pour le build — rapide en dev, optimisé en prod.

---

## 7. Webpack — Build custom et compatibilité large

### 7.1. Installation minimale

```bash
npm i -D webpack webpack-cli webpack-dev-server html-webpack-plugin css-loader style-loader babel-loader @babel/core @babel/preset-env
```

### 7.2. Config `webpack.config.js`

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: { filename: 'bundle.[contenthash].js', clean: true },
  devtool: 'source-map',
  devServer: { open: true, hot: true },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [ new HtmlWebpackPlugin({ template: 'public/index.html' }) ]
}
```

### 7.3. Production & optimisation

- **Tree shaking** (ESM), **code splitting** (`import()`), **cache** (`contenthash`).
- **MiniCssExtractPlugin** + `css-minimizer-webpack-plugin`.

---

## 8. Babel, PostCSS, Browserslist & Autoprefixer

### 8.1. Babel

```json
{
  "presets": [["@babel/preset-env", { "targets": "defaults" }]]
}
```

### 8.2. PostCSS & Autoprefixer

```js
// postcss.config.js
module.exports = { plugins: [require('autoprefixer')] }
```

### 8.3. Browserslist

Dans `package.json` → champ `browserslist` pour cibler navigateurs.

> [!tip]
> Assurez la cohérence **Babel ↔ Browserslist ↔ Autoprefixer** pour un build fiable.

---

## 9. Préprocesseurs CSS : Sass (SCSS) & Less

### 9.1. Sass (SCSS)

- **Variables** : `$primary: hsl(220 80% 50%);`
- **Nesting** raisonnable ; **mixins** & **functions**.
- **Module system** : `@use` / `@forward` (remplace `@import`).

```scss
// styles/_tokens.scss
$space-1: .25rem;
$space-2: .5rem;
$space-3: 1rem;

// styles/main.scss
@use 'tokens' as *;
.button {
  padding: $space-3;
  &:hover { transform: translateY(-1px); }
}
```

Avec Vite : `npm i -D sass` ; avec Webpack : `sass-loader`.

### 9.2. Less

- **Variables** : `@primary: #3366ff;`
- **Mixins** : `.rounded(@r) { border-radius: @r; }`

```less
@primary: #3366ff;
.button { background: @primary; .rounded(8px); }
```

> [!warning]
> Évitez `@import` (Sass **déprécié**). Préférez `@use/@forward` pour modularité et performances.

---

## 10. Structure de projet recommandée

```
project/
├─ public/                # fichiers statiques (index.html, icônes)
├─ src/
│  ├─ assets/             # images, fonts, svg
│  ├─ styles/             # scss/less/postcss
│  ├─ components/         # UI réutilisable
│  ├─ pages/              # vues/page
│  ├─ utils/              # helpers
│  └─ main.js             # point d'entrée
├─ tests/                 # tests unitaires/E2E
├─ .editorconfig
├─ .eslintrc.cjs
├─ .prettierrc.json
├─ .stylelintrc.json
├─ .nvmrc
├─ vite.config.js | webpack.config.js
└─ package.json
```

> [!tip]
> **Séparez** contenu (`public`) et code (`src`). Utilisez **alias** (`@`) pour des imports propres.

---

## 11. Qualité & Style : ESLint, Prettier, Stylelint, Husky

### 11.1. ESLint & Prettier

```bash
npm i -D eslint prettier eslint-config-prettier eslint-plugin-import
npx eslint --init
```

```js
// .eslintrc.cjs
module.exports = {
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parserOptions: { sourceType: 'module' },
  rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
}
```

### 11.2. Stylelint (CSS/SCSS)

```bash
npm i -D stylelint stylelint-config-standard-scss
```

```js
// .stylelintrc.json
{ "extends": ["stylelint-config-standard-scss"] }
```

### 11.3. Husky + lint-staged + commitlint

```bash
npm i -D husky lint-staged @commitlint/{cli,config-conventional}
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix"],
    "*.{css,scss,less}": ["stylelint --fix"],
    "*.{md,json}": ["prettier -w"]
  }
}
```

```js
// commitlint.config.cjs
module.exports = { extends: ['@commitlint/config-conventional'] }
```

Hooks Husky (ex.) : `pre-commit` (lint‑staged), `commit-msg` (commitlint).

---

## 12. Optimisations & performance

- **Code splitting** (`import()`), **lazy‑loading**.
- **Tree shaking** (ESM seulement).
- **Caching** via `contenthash` et headers.
- **Images** : compression, formats modernes (AVIF/WebP), `srcset/sizes`.
- **Gzip/Brotli** et **HTTP/2** ; **Preload/Prefetch**.
- **Critical CSS** ; nettoyage CSS (Purge/Content‑aware).

---

## 13. CI/CD avec GitHub Actions

### 13.1. Workflow de base

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node-version }}, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run test --if-present
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

### 13.2. Déploiement (ex. Netlify/Vercel)

- Ajoutez un job **deploy** avec secrets (`NETLIFY_AUTH_TOKEN`, `VERCEL_TOKEN`).

> [!tip]
> **Séparez** CI (lint/test/build) et CD (deploy) ; exigez **status checks** avant merge.

---

## 14. Versionning & Releases

- **Conventional Commits** : `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`…
- **semantic‑release** : détermine la version via commits, crée **CHANGELOG**, **tag** et **GitHub Release**.

```bash
npm i -D semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github
```

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [ main ]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx semantic-release
```

---

## 15. Sécurité & conformité

- **npm audit** ; **Dependabot** ; mise à jour régulière.
- **CSP** (headers), **SRI** pour assets tiers.
- **Licences** : fichier `LICENSE`, mentions dans `package.json`.
- **CODEOWNERS** : responsabilité des répertoires.

---

## 16. Exercices guidés avec corrections

> [!info]
> Les **corrections** sont **repliables**. Cliquez pour afficher.

### Exercice 1 — Initialiser un repo Git pro
**Objectif** : Créer un repo, configurer `.gitignore`, premier commit, branche protection.

<details>
<summary><strong>Correction</strong></summary>

```bash
mkdir projet && cd projet
git init
echo "node_modules/\ndist/\n.env" > .gitignore
echo "# Projet" > README.md
git add .
git commit -m "chore: initial setup"
# Créez le repo sur GitHub, poussez et activez branch protection sur 'main'
```

</details>

---

### Exercice 2 — `package.json`, SemVer & scripts
**Objectif** : Initialiser NPM, ajouter scripts et engines, fixer versions.

<details>
<summary><strong>Correction</strong></summary>

```bash
npm init -y
npm pkg set type=module
npm pkg set engines.node=">=18"
npm pkg set scripts.dev="vite" scripts.build="vite build" scripts.preview="vite preview"
```

</details>

---

### Exercice 3 — Vite + React + alias + .env
**Objectif** : Installer, configurer alias, utiliser `VITE_`.

<details>
<summary><strong>Correction</strong></summary>

```bash
npm create vite@latest app -- --template react
cd app && npm i
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ resolve: { alias: { '@': '/src' } }, plugins: [react()] })
```

```bash
# .env
VITE_API_URL=https://api.example.com
```

```js
// src/main.jsx
console.log(import.meta.env.VITE_API_URL)
```

</details>

---

### Exercice 4 — Webpack + Babel + Sass
**Objectif** : Créer un build Webpack avec Babel et Sass.

<details>
<summary><strong>Correction</strong></summary>

```bash
npm i -D webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader @babel/core @babel/preset-env sass sass-loader css-loader style-loader mini-css-extract-plugin css-minimizer-webpack-plugin
```

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: { filename: 'bundle.[contenthash].js', clean: true },
  module: { rules: [
    { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
    { test: /\.s?css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] }
  ]},
  plugins: [ new HtmlWebpackPlugin({ template: 'public/index.html' }), new MiniCssExtractPlugin({ filename: 'styles.[contenthash].css' }) ],
  optimization: { minimizer: ['...', new (require('css-minimizer-webpack-plugin'))()] }
}
```

</details>

---

### Exercice 5 — Sass (SCSS) avec `@use`/`@forward`
**Objectif** : Organiser tokens et composants.

<details>
<summary><strong>Correction</strong></summary>

```scss
// styles/_tokens.scss
$space-3: 1rem; $primary: hsl(220 80% 55%);
// styles/_button.scss
@use 'tokens' as *;
.button { padding: $space-3; background: $primary; }
// styles/main.scss
@forward 'tokens';
@use 'button';
```

</details>

---

### Exercice 6 — ESLint/Prettier/Stylelint + Husky
**Objectif** : Activer un lint auto avant commit.

<details>
<summary><strong>Correction</strong></summary>

```bash
npm i -D eslint prettier eslint-config-prettier stylelint stylelint-config-standard-scss husky lint-staged @commitlint/{cli,config-conventional}
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix"],
    "*.{css,scss}": ["stylelint --fix"],
    "*.{md,json}": ["prettier -w"]
  }
}
```

```bash
# .husky/pre-commit
yarn lint-staged || npx lint-staged
# .husky/commit-msg
npx --no-install commitlint --edit $1
```

</details>

---

### Exercice 7 — Pipeline CI GitHub Actions
**Objectif** : Lancer lint/test/build sur PR.

<details>
<summary><strong>Correction</strong></summary>

```yaml
name: CI
on: pull_request
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run test --if-present
      - run: npm run build
```

</details>

---

### Exercice 8 — Releases automatiques
**Objectif** : Publier versions et CHANGELOG via semantic‑release.

<details>
<summary><strong>Correction</strong></summary>

```yaml
name: Release
on:
  push:
    branches: [ main ]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx semantic-release
```

</details>

---

## 17. Checklist de référence

- [ ] `.gitignore` propre ; branches protégées ; PRs petites et testées
- [ ] `package.json` soigné (scripts, engines, browserslist) ; SemVer maîtrisé
- [ ] NPM/PNPM standardisé ; `.nvmrc` présent ; lockfile versionné
- [ ] Vite/Webpack configuré ; sourcemaps ; code splitting ; cache
- [ ] Sass/Less en place ; `@use/@forward` ; architecture CSS claire
- [ ] ESLint/Prettier/Stylelint ; Husky + lint‑staged ; commitlint
- [ ] CI (lint/test/build) ; CD protégé par status checks
- [ ] Releases (tags, CHANGELOG) ; semantic‑release si possible
- [ ] Sécurité (audit deps, Dependabot, secrets) ; licence

---

## 18. Glossaire rapide

- **SemVer** : version sémantique (MAJOR.MINOR.PATCH).
- **Tree shaking** : élimination de code non utilisé (ESM).
- **Code splitting** : découpage du bundle en morceaux chargés à la demande.
- **Workspaces** : paquets multiples dans un monorepo.
- **HMR** : Hot Module Replacement (dev rapide).

---

## 19. FAQ

**Q : PNPM ou NPM ?**
> PNPM est **plus rapide** et économe ; NPM est **standard** et largement supporté. Choisissez selon équipe/outillage.

**Q : Vite ou Webpack ?**
> Vite pour **dev rapide** et configuration simple ; Webpack pour **cas complexes** et compatibilité avancée.

**Q : Où mettre les secrets ?**
> Jamais dans le repo. Utilisez **environments/secrets** GitHub et variables de déploiement.

**Q : Sass ou Less ?**
> Sass (SCSS) est **dominant** et moderne (`@use/@forward`). Less reste viable pour certains écosystèmes.

---

## 20. Références & ressources

- Git — Documentation : https://git-scm.com/doc
- GitHub Docs — Actions & sécurité : https://docs.github.com/
- NPM Docs : https://docs.npmjs.com/
- PNPM Docs : https://pnpm.io/
- Yarn Docs : https://yarnpkg.com/
- Vite — Guide : https://vitejs.dev/guide/
- Webpack — Concepts : https://webpack.js.org/concepts/
- Babel — Docs : https://babeljs.io/docs/
- PostCSS/Autoprefixer : https://postcss.org/ / https://github.com/postcss/autoprefixer
- Browserslist : https://github.com/browserslist/browserslist
- Sass — Guide : https://sass-lang.com/guide
- Less — Docs : https://lesscss.org/
- ESLint : https://eslint.org/ ; Prettier : https://prettier.io/ ; Stylelint : https://stylelint.io/
- semantic‑release : https://semantic-release.gitbook.io/semantic-release/

> [!success]
> Vous disposez maintenant d’un **module Outils & Workflow complet**, prêt à l’emploi et à la production.
