
# 📘 Chapitre 16 — Micro‑Frontends, Monorepos & Module Federation + Design System

> 🎯 **Objectifs du chapitre**
> - Comprendre les **monorepos** (pnpm/yarn workspaces, Nx/Turborepo) et organiser un **écosystème multi‑apps/packages**.
> - Mettre en place des **micro‑frontends** (runtime via **Webpack 5 Module Federation**, build‑time via packages) et connaître les **trade‑offs**.
> - Concevoir un **Design System**: **design tokens**, librairie de composants, **Storybook**, accessibilité, **thèmes**.
> - Publier et versionner des **packages** (npm), automatiser via **CI** (release/changelog) et tester (unitaires + visuels).
> - Garantir **performance** (split, cache, shared) et **sécurité** (isolation, CSP) à l’échelle.

---

## 🧠 1. Monorepos — Concepts & outils

### 🔍 Définition
Un **monorepo** regroupe **plusieurs packages/apps** (librairies, apps web, outils) dans **un seul dépôt**. On utilise des workspaces (pnpm/yarn/npm) ou des orchestrateurs (Nx/Turborepo) pour **builder**, **tester** et **partager**.

### ✅ Pourquoi
- **Partage** de code (design system, utils) sans duplication.
- **Coordination** des versions; **CI** unique; cache partagé.
- **DX**: scripts unifiés (`build`, `test`, `lint`) et pipelines incrémentaux.

### 📦 Workspaces (exemple pnpm)
```json
{
  "name": "mf-workspace",
  "private": true,
  "packageManager": "pnpm@9",
  "workspaces": ["apps/*", "packages/*"]
}
```

### 📦 Structure
```
repo/
  apps/
    host-app/         # Shell + routing
    remote-profile/   # MFE
    remote-board/     # MFE
  packages/
    ui-kit/           # Design system (lib composants)
    utils/            # utilitaires
```

### 🛠 Scripts utiles (à la racine)
```json
{
  "scripts": {
    "build": "pnpm -r run build",           // -r: recursive
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "format": "pnpm -r run format",
    "dev": "pnpm --filter host-app --filter remote-* run dev"
  }
}
```

> ℹ️ **Nx**/**Turborepo** ajoutent **cache** distribué, graphe de dépendances et exécutions **incrémentales**.

---

## 🧠 2. Micro‑frontends — Approches

### 🔍 Deux familles
- **Runtime composition** (Module Federation, iframes, web components): **charger** à l’exécution des modules **distants**.
- **Build‑time composition** (packages internes): **compiler** une app avec des packages partagés.

### ✅ Quand utiliser
- **Teams indépendantes**, domaines fonctionnels distincts.
- Cadences de **release** différentes.
- Besoin d’isoler les **risques** (plantage d’un MFE ≠ shell entier).

### ⚠️ Trade‑offs
- Cohérence **UI** et **perf** (multiples bundles): résoudre via **Design System** + **Partage** (`shared`) + budgets.
- **Observabilité** et **versioning**; **synchronisation** des dépendances critiques (Vue, Pinia…).

---

## 🧠 3. Webpack 5 — Module Federation (runtime)

### 🗺 Concepts
- **Host/Shell**: application principale.
- **Remote**: micro‑frontend exposant des **modules**.
- **shared**: dépendances communes (Vue, Pinia…) avec **version** et **singleton**.

### 💡 Host (webpack config)
```js
// apps/host-app/webpack.dev.js
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { ModuleFederationPlugin } from 'webpack').container;

export default {
  mode: 'development',
  entry: path.resolve('src/main.ts'),
  devServer: { port: 4200 },
  output: { publicPath: 'http://localhost:4200/' },
  module: { rules: [ { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        profile: 'profile@http://localhost:4300/remoteEntry.js',
        board:   'board@http://localhost:4400/remoteEntry.js'
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.5.0' },
        pinia: { singleton: true },
        'vue-router': { singleton: true }
      }
    })
  ],
  resolve: { extensions: ['.ts', '.js'] }
};
```

### 💡 Remote (webpack config)
```js
// apps/remote-profile/webpack.dev.js
import path from 'node:path';
import { ModuleFederationPlugin } from 'webpack').container;
export default {
  mode: 'development',
  entry: path.resolve('src/bootstrap.ts'),
  devServer: { port: 4300 },
  output: { publicPath: 'http://localhost:4300/' },
  module: { rules: [ { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] },
  plugins: [
    new ModuleFederationPlugin({
      name: 'profile',
      filename: 'remoteEntry.js',
      exposes: {
        './ProfileWidget': './src/ProfileWidget.ts'  // module consommé par host
      },
      shared: { vue: { singleton: true } }
    })
  ],
  resolve: { extensions: ['.ts', '.js'] }
};
```

### 💡 Consommation dans le Host (Vue)
```ts
// apps/host-app/src/remotes.ts
export const loadProfile = async () => {
  // import remote exposé
  const module = await import('profile/ProfileWidget');
  return module.default; // composant Vue
};
```

### ✅ Bonnes pratiques MF
- **Versionner**/**pinner** les **shared** (évite conflits).
- Prévoir des **fallbacks** si un remote est **down**.
- **Observabilité**: logs/metrics par remote (identifiant de build).

---

## 🧠 4. Build‑time — Packages internes (Design System & utils)

### 📦 UI Kit (library de composants)
```json
// packages/ui-kit/package.json
{
  "name": "@workspace/ui-kit",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "jest",
    "lint": "eslint \"src/**/*.{ts,vue}\""
  },
  "peerDependencies": { "vue": "^3.5.0" }
}
```

### 💡 Design tokens (JSON + CSS variables)
```json
// packages/ui-kit/tokens.json
{
  "color": {
    "primary": "#0b57d0",
    "danger":  "#b00020",
    "bg":      "#ffffff",
    "text":    "#111827"
  },
  "space": { "xs": 4, "sm": 8, "md": 12, "lg": 16 },
  "radius": { "sm": 6, "md": 8 }
}
```
```css
/* packages/ui-kit/src/tokens.css */
:root{ --color-primary:#0b57d0; --color-danger:#b00020; --color-bg:#fff; --color-text:#111827; --space-sm:8px; --radius-md:8px; }
[data-theme="dark"]{ --color-bg:#0b0b0b; --color-text:#e5e7eb; }
```

### 💡 Bouton commun (extrait)
```vue
<template>
  <button class="btn" :class="variant" :disabled="disabled"><slot /></button>
</template>
<script setup lang="ts">
const props = defineProps<{ variant?: 'primary'|'danger'; disabled?: boolean }>();
</script>
<style scoped>
.btn{ padding: .5rem .75rem; border-radius: var(--radius-md); border: none; color: #fff; }
.btn.primary{ background: var(--color-primary); }
.btn.danger{ background: var(--color-danger); }
.btn:disabled{ opacity:.6; cursor:not-allowed; }
</style>
```

---

## 🧠 5. Storybook & tests visuels

### 💡 Storybook (config minimal)
```js
// .storybook/main.js
module.exports = {
  stories: ['../packages/ui-kit/src/**/*.stories.@(js|ts|vue)'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  addons: ['@storybook/addon-a11y', '@storybook/addon-essentials']
};
```

### ✅ Tests visuels & a11y
- **Chromatic/Playwright** (snapshots visuels), **@storybook/addon-a11y** (WCAG).
- Intégrer dans **CI** pour détecter régressions UI.

---

## 🧠 6. Publication npm (packages)

### 🔐 Pré‑requis
- `npm login`, **access token** sécurisé en CI.
- `private:false` pour publier; **semver** clair.

### 💡 Workflow de release (GitHub Actions)
```yaml
name: Release Packages
on:
  push:
    tags: [ 'v*' ]  # ex. v0.2.0
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', registry-url: 'https://registry.npmjs.org' }
      - run: pnpm i --frozen-lockfile
      - name: Build all
        run: pnpm -r run build
      - name: Publish
        run: pnpm -r publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### ✅ Bonnes pratiques
- **peerDependencies** pour frameworks (Vue) afin d’éviter doublons.
- **Changelog** généré (Conventional Commits).

---

## 🧠 7. Performance & sécurité à l’échelle

### 🚀 Performance
- **shared** bien **pinnés** (versions) pour éviter multiples copies.
- **Code splitting** par route/micro‑domaine.
- **Cache** `immutable` + **contenthash** côté CDN.

### 🔐 Sécurité
- **CSP** stricte, pas de `unsafe-eval`; limiter les **origines** (`connect-src`) des remotes.
- **Sandbox** / isolation si iframes ou web components tiers.

---

## 🧪 8. Exercices guidés

1. **Monorepo**: Créez `apps/host-app`, `apps/remote-profile`, `packages/ui-kit` sous pnpm workspaces.
2. **MF**: Exposez `ProfileWidget` dans `remote-profile` et consommez‑le dans `host-app` via `import('profile/ProfileWidget')`.
3. **Design System**: Ajoutez des **tokens** et un **Button**; publiez `@workspace/ui-kit` (mock local).
4. **Storybook**: Écrivez des stories (`Button.stories.ts`) et activez l’addon a11y.
5. **CI Release**: Simulez un tag `v0.2.0` et déclenchez le workflow de publication (sandbox npm).
6. **Perf**: Mesurez le **gain** du partage `vue` en `shared` (bundle size).

---

## ✅ 9. Check‑list Micro‑frontends & Monorepo

- [ ] Workspaces configurés (apps/*, packages/*).
- [ ] **Module Federation** (host/remote) opérationnel, **shared** bien définis.
- [ ] Design System avec **tokens** + **composants** + **Storybook**.
- [ ] Tests unitaires + **visuels** intégrés à la **CI**.
- [ ] Publication npm sécurisée (token) + **changelog**.
- [ ] Budgets de **perf** et **CSP** en place.

---

## 📦 Livrable du chapitre
Un **monorepo** (pnpm) avec **host** + **2 remotes**, un **UI‑kit** partagé, **Storybook**, **CI de release**, et une **démo** MF fonctionnelle.

---

## 🔚 Résumé essentiel du Chapitre 16
- Les **monorepos** permettent de **centraliser** apps/packages et d’industrialiser le build/test.
- Les **micro‑frontends** s’assemblent au **runtime** (Module Federation) ou au **build‑time** (packages); choisir selon **autonomie des équipes** et **perf**.
- Un **Design System** (tokens + Storybook) garantit **cohérence** et **accessibilité**.
- La **publication** npm + **CI** rend le système **vivant** et **réutilisable**.

---

> Prochain chapitre: **Architecture Front à grande échelle** — état global avancé, événements cross‑app, monitoring, observabilité et SLO.
