
# 📘 Chapitre 7 — Tooling Pro: Node.js, npm, scripts & Webpack

> 🎯 **Objectifs du chapitre**
> - Comprendre l’**écosystème Node/npm**: `package.json`, scripts, dépendances, **semver**, ESM/CJS.
> - Construire un **pipeline Front-End** professionnel avec **Webpack 5** (dev + prod), **TypeScript**, **Babel**, **PostCSS**, **ESLint/Prettier**.
> - Mettre en place un **serveur de dev** (HMR), **code splitting**, **tree‑shaking**, **cache** et gestion des **assets**.
> - Gérer **variables d’environnement**, **linting** et **pré‑commit**.

---

## 🧠 1. Node.js & npm — Fondamentaux

### 🔍 Définition
- **Node.js**: runtime JavaScript côté serveur.
- **npm**: gestionnaire de **paquets** et **scripts**.

### ❓ Pourquoi
- Uniformiser le **tooling** (build, test, lint) et les **dépendances**.

### 💡 `package.json` — Anatomie
```json
{
  "name": "frontend-pro-pipeline",
  "version": "0.1.0",
  "private": true,
  "type": "module", // ESM par défaut
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "lint": "eslint \"src/**/*.{js,ts,vue}\"",
    "format": "prettier --write \"src/**/*.{js,ts,css,md}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    // runtime deps (ex pour app Vue plus tard)
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "ts-loader": "^9.5.0",
    "fork-ts-checker-webpack-plugin": "^9.0.0",
    "webpack": "^5.95.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.4",
    "html-webpack-plugin": "^5.6.0",
    "mini-css-extract-plugin": "^2.9.0",
    "css-loader": "^7.1.0",
    "style-loader": "^4.0.0",
    "postcss": "^8.4.31",
    "postcss-loader": "^7.3.0",
    "autoprefixer": "^10.4.19",
    "babel-loader": "^9.2.1",
    "@babel/core": "^7.26.0",
    "@babel/preset-env": "^7.26.0",
    "eslint": "^9.12.0",
    "@typescript-eslint/parser": "^8.7.0",
    "@typescript-eslint/eslint-plugin": "^8.7.0",
    "prettier": "^3.3.3",
    "eslint-config-prettier": "^9.1.0",
    "dotenv": "^16.4.5"
  }
}
```

### ✅ Semver (versions)
- `^1.2.3` (caret) → autorise **minor/patch**.
- `~1.2.3` (tilde) → autorise **patch**.
- **Pinning** exact pour builds **reproductibles**.

### ⚠️ ESM vs CJS
- `"type": "module"` → **ESM** par défaut (`import`/`export`).
- CJS (`require`) seulement si nécessaire; évitez le **mélange**.

---

## 🧠 2. Webpack 5 — Concepts Clés

### 🔍 Définition
**Webpack** est un **bundler**: il construit un **graphe de dépendances** et produit des **chunks** (JS/CSS/assets).

### ❓ Pourquoi
- **Compatibilité** navigateur (transpilation, polyfills).
- **Optimisation** (code splitting, cache, tree‑shaking).
- **DX** (HMR, dev server).

### 🗺 Glossaire
- **Loader**: transforme un type de fichier (TS → JS, CSS → modules).
- **Plugin**: étend le pipeline (HTML injection, extraction CSS).
- **Entry**: point(s) de départ du graphe.
- **Output**: nommage des bundles (`[name].[contenthash].js`).
- **Asset modules**: images, fonts (`asset/resource|inline|source|asset`).

---

## 🧠 3. Structure de projet
```
project/
  src/
    index.ts
    styles.css
    assets/
      logo.svg
  public/
    index.html
  tsconfig.json
  webpack.dev.js
  webpack.prod.js
  .babelrc
  postcss.config.js
  .eslintrc.cjs
  .prettierrc
  package.json
```

---

## 🧠 4. Configuration Webpack — Développement (HMR)

### 💡 `webpack.dev.js`
```js
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-module-source-map',
  entry: path.resolve('src/index.ts'),
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]' // stable noms en dev
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { modules: false } }, 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset', // automatique inline/resource selon taille
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' })
  ],
  resolve: { extensions: ['.ts', '.js'] },
  devServer: {
    static: { directory: path.resolve('public') },
    port: 5173,
    open: true,
    hot: true,
    historyApiFallback: true,
    client: { overlay: true }
  },
  optimization: { runtimeChunk: 'single' }
};
```

### ✅ Points clés (dev)
- **HMR** pour rechargement rapide.
- **source‑maps** pour debug.
- `transpileOnly` + **ForkTsChecker** (prod ci‑dessous) pour accélérer.

---

## 🧠 5. Configuration Webpack — Production (optimisation)

### 💡 `webpack.prod.js`
```js
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { DefinePlugin } from 'webpack';

export default {
  mode: 'production',
  target: 'browserslist',
  devtool: 'source-map',
  entry: path.resolve('src/index.ts'),
  output: {
    path: path.resolve('dist'),
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    clean: true // équivalent du plugin Clean
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { modules: false } }, 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html', minify: true }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
    new DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') })
  ],
  resolve: { extensions: ['.ts', '.js'] },
  optimization: {
    splitChunks: { chunks: 'all' },
    runtimeChunk: 'single',
    moduleIds: 'deterministic'
  }
};
```

### ✅ Points clés (prod)
- **Contenthash** pour **cache longue durée**.
- **SplitChunks** + `runtimeChunk` pour **caching** efficace.
- **MiniCssExtractPlugin** pour CSS séparé.

---

## 🧠 6. TypeScript — Vérification asynchrone

### 💡 ForkTsChecker (optionnel)
```js
// Ajouter dans webpack.(dev|prod).js
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

plugins: [
  // ...
  new ForkTsCheckerWebpackPlugin({ async: true, typescript: { configFile: 'tsconfig.json' } })
]
```

### ✅ Pourquoi
- `ts-loader` en `transpileOnly` → build **rapide**.
- **Checker** déporté en parallèle → **DX** fluide.

---

## 🧠 7. Babel — Ciblage navigateurs

### 💡 `.babelrc`
```json
{
  "presets": [
    ["@babel/preset-env", { "targets": "defaults, not IE 11" }]
  ]
}
```

### ❓ Pourquoi
- Ajouter les **polyfills**/transpilation nécessaires selon **cibles**.
- Utiliser **Babel** même si TS transpile → pour **features** JS.

---

## 🧠 8. PostCSS & Autoprefixer

### 💡 `postcss.config.js`
```js
export default {
  plugins: [
    require('autoprefixer')()
  ]
};
```

### ✅ Pourquoi
- Ajouter des **préfixes** CSS selon **browserslist**.

---

## 🧠 9. ESLint & Prettier — Qualité de code

### 💡 `.eslintrc.cjs`
```js
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};
```

### 💡 `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100
}
```

### ✅ Scripts npm
```json
{
  "scripts": {
    "lint": "eslint \"src/**/*.{js,ts}\"",
    "format": "prettier --write \"src/**/*.{js,ts,css,md}\""
  }
}
```

---

## 🧠 10. Variables d’environnement

### 💡 `dotenv` + `DefinePlugin`
```js
// webpack.(dev|prod).js
import dotenv from 'dotenv';
dotenv.config();
import { DefinePlugin } from 'webpack';

plugins: [
  new DefinePlugin({
    __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:3000')
  })
];
```

### 💡 Usage côté app
```ts
declare const __API_URL__: string;
fetch(`${__API_URL__}/status`).then(/* ... */);
```

### ⚠️ Attention
- **Ne pas** exposer des **secrets** (clé privée) côté client.
- Utiliser **CI** pour injecter variables de build.

---

## 🧠 11. Code Splitting & Lazy Loading

### 💡 Import dynamique
```ts
if (location.hash === '#chart') {
  const mod = await import('./chart');
  mod.renderChart();
}
```

### ✅ Configuration
- `optimization.splitChunks.chunks = 'all'` → partage automatique des libs.
- **Rester en ESM** (`import/export`) pour **tree‑shaking**.

---

## 🧠 12. Tree‑shaking & sideEffects

### 💡 `package.json`
```json
{
  "sideEffects": [
    "*.css"
  ]
}
```

### ✅ Pourquoi
- Permet à Webpack de **supprimer** le code non utilisé (dead code).

---

## 🧠 13. Assets & Images

### 💡 Asset Modules
```js
{
  test: /\.(png|jpg|jpeg|gif|svg)$/i,
  type: 'asset', // inline si petit, resource sinon
}
```

### 💡 Optimisation (optionnel)
```js
// image-minimizer-webpack-plugin (exemple)
// plugins: [ new ImageMinimizerPlugin({ minimizer: { implementation: ImageMinimizerPlugin.imageminGenerate } }) ]
```

---

## 🧠 14. DevServer — Sécurité & Proxy

### 💡 Proxy API
```js
// webpack.dev.js
devServer: {
  proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } }
}
```

### ✅ Bonnes pratiques
- **Limiter** les origines en prod (CSP côté serveur).
- **History API Fallback** pour SPA.

---

## 🧠 15. Exemple complet — `src/index.ts`, `public/index.html`, `styles.css`

### 💡 `src/index.ts`
```ts
import './styles.css';
const app = document.getElementById('app');
app!.innerHTML = `<h1>Pipeline Webpack + TS</h1>`;

document.getElementById('lazy')?.addEventListener('click', async () => {
  const { greet } = await import('./lazy');
  alert(greet('Eric'));
});
```

### 💡 `src/lazy.ts`
```ts
export function greet(name: string){ return `Bonjour ${name}`; }
```

### 💡 `public/index.html`
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Webpack + TypeScript</title>
</head>
<body>
  <div id="app"></div>
  <button id="lazy">Charger module</button>
</body>
</html>
```

### 💡 `src/styles.css`
```css
:root { --primary: #0b57d0; }
body { font-family: system-ui, sans-serif; }
button { background: var(--primary); color: #fff; padding: .5rem .75rem; border: 0; border-radius: 6px; }
```

---

## 🧠 16. Formules & budgets de performance (JS)

### 🧮 Estimer le **temps de téléchargement** et de **parse** JS
```js
// Hypothèses simplifiées
function estimateLoad(parseMBps = 50, netMbps = 10, totalKB = 300) {
  const bytes = totalKB * 1024;
  const dlMs = (bytes * 8) / (netMbps * 1e6) * 1000; // temps dl à netMbps
  const parseMs = (bytes / (parseMBps * 1024 * 1024)) * 1000; // parse à parseMBps
  const totalMs = dlMs + parseMs;
  return { dlMs: Math.round(dlMs), parseMs: Math.round(parseMs), totalMs: Math.round(totalMs) };
}
console.log('Budget pour 300KB @10Mbps:', estimateLoad());
```

### ✅ Bonnes pratiques
- **Budgets** (ex. **JS initial < 200KB** gzip) pour LCP.
- **Lazy‑load** les features non critiques.

---

## 🧠 17. Husky (pré‑commit) — Optionnel

### 💡 Installation
```bash
npx husky init
```

### 💡 Hook exemple
```bash
# .husky/pre-commit
npm run lint && npm run format
```

---

## 🧪 18. Exercices guidés

1. **Webpack dev/prod**: Créez les deux configs et démarrez le **DevServer**.
2. **TypeScript**: Activez `transpileOnly` + ForkTsChecker et provoquez une **erreur de type** pour vérifier la remontée.
3. **Code splitting**: Ajoutez un import dynamique et vérifiez la génération de chunks.
4. **Assets**: Importez une image et affichez‑la via asset modules.
5. **ESLint/Prettier**: Lancez `npm run lint` et corrigez les avertissements.
6. **Env**: Injectez `__API_URL__` et affichez la valeur côté UI.

---

## ✅ 19. Check‑list Tooling Pro

- [ ] `package.json` propre (scripts, semver, ESM).
- [ ] Webpack **dev**: HMR, source‑maps.
- [ ] Webpack **prod**: `contenthash`, `splitChunks`, `clean`.
- [ ] **TypeScript**: `ts-loader` + ForkTsChecker.
- [ ] **Babel**: cibles `browserslist`.
- [ ] **PostCSS/Autoprefixer**.
- [ ] **ESLint/Prettier** intégrés et scripts.
- [ ] **Env** via `DefinePlugin`/CI (sans secrets exposés).

---

## 📦 Livrable du chapitre
Un **pipeline** complet: Webpack 5 (dev/prod) + TypeScript + Babel + PostCSS + ESLint/Prettier + DevServer (HMR), prêt pour Vue 3 au chapitre suivant.

---

## 🔚 Résumé essentiel du Chapitre 7
- **npm** et `package.json` orchestrent scripts et dépendances; respectez **semver** et ESM.
- **Webpack 5** gère bundling, **HMR** en dev, **contenthash** + **splitChunks** en prod.
- **TypeScript** se branche via `ts-loader` et vérification asynchrone (**ForkTsChecker**).
- **Babel** cible les navigateurs, **PostCSS** autoprefixe, **ESLint/Prettier** garantissent la qualité.
- Les **variables d’environnement** se fixent au build via `DefinePlugin` et ne doivent **pas** exposer de secrets.
- **Code splitting** + **tree‑shaking** réduisent le **JS initial** et améliorent les **Core Web Vitals**.

---

> Prochain chapitre: **Tests Unitaires & Qualité avec Jest** — assertions, mocks/spies, snapshots et couverture.
