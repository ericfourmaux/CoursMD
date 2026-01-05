
# 📘 Chapitre 10.1 — Webpack : bases & structure (v5)

> **Niveau** : Intermédiaire — **Objectif** : comprendre **Webpack** (v5) pour un projet front moderne : **entrée/sortie**, **loaders**, **plugins**, **DevServer**, **code splitting**, **tree‑shaking**, **source maps**, **assets**, **Babel/TypeScript**, **variables d’environnement**, **cache & hashing**, et **organisation** des fichiers.

---

## 🎯 Objectifs d’apprentissage
- Initialiser un projet **Webpack 5** avec `npm` et structurer les **répertoires** (`src/`, `dist/`, `assets/`).
- Configurer `webpack.config.js` : **entry**, **output**, **mode**, **devtool**.
- Utiliser des **loaders** (CSS/SASS, Babel, TypeScript, images, fonts) et les **asset modules** (`asset/resource`, `asset/inline`, `asset/source`, `asset`).
- Brancher des **plugins** courants : `HtmlWebpackPlugin`, `Clean` (via `output.clean`), `DefinePlugin`, `MiniCssExtractPlugin`.
- Activer **DevServer** (HMR), **code splitting** dynamique (`import()`), **tree‑shaking** et **hashing** (`[contenthash]`).

---

## 🏁 Pré‑requis & installation

```bash
# 1) Projet
mkdir webpack-demo && cd webpack-demo
npm init -y

# 2) Dépendances
npm i -D webpack webpack-cli webpack-dev-server \
       html-webpack-plugin mini-css-extract-plugin css-loader style-loader \
       sass sass-loader postcss postcss-loader autoprefixer \
       babel-loader @babel/core @babel/preset-env core-js \
       typescript ts-loader \
       eslint eslint-webpack-plugin \
       cross-env dotenv webpack-merge
```

> Astuce : installe seulement ce dont tu as besoin. Tu peux retirer `TypeScript`, `SASS` ou `eslint` si non utilisés.

---

## 🗂️ Arborescence conseillée

```
webpack-demo/
  ├─ src/
  │   ├─ index.ts        # point d'entrée (ou index.js)
  │   ├─ app/
  │   │   └─ main.ts
  │   ├─ styles/
  │   │   └─ main.scss
  │   └─ assets/
  │       ├─ logo.svg
  │       └─ fonts/
  ├─ public/
  │   └─ index.html      # template HTML (sans bundles)
  ├─ .babelrc
  ├─ postcss.config.cjs
  ├─ tsconfig.json
  ├─ package.json
  ├─ webpack.common.js
  ├─ webpack.dev.js
  └─ webpack.prod.js
```

---

## ⚙️ Configs de base (split config : common/dev/prod)

### `webpack.common.js`
```js
// webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    assetModuleFilename: 'assets/[name][hash][ext][query]',
    clean: true // remplace CleanWebpackPlugin
  },
  module: {
    rules: [
      // TypeScript
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      // JavaScript + Babel (optionnel si TS transpile tout)
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage', corejs: 3
              }]
            ]
          }
        }
      },
      // Styles (CSS/SASS + PostCSS)
      {
        test: /\.(css|s[ac]ss)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      },
      // Assets (images, fonts, SVG)
      { test: /\.(png|jpg|gif|svg)$/i, type: 'asset' },
      { test: /\.(woff2?|eot|ttf|otf)$/i, type: 'asset/resource' }
    ]
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html', inject: 'body' }),
    new MiniCssExtractPlugin({ filename: 'styles/[name].[contenthash].css' })
  ]
};
```

### `webpack.dev.js`
```js
// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    static: { directory: require('path').resolve(__dirname, 'public') },
    port: 5173,
    open: true,
    hot: true,
    historyApiFallback: true
  },
  optimization: { runtimeChunk: 'single' }
});
```

### `webpack.prod.js`
```js
// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  performance: { hints: 'warning', maxEntrypointSize: 512000, maxAssetSize: 512000 },
  optimization: {
    splitChunks: { chunks: 'all' },
    moduleIds: 'deterministic'
  },
  plugins: [
    // Variables d'environnement (exposition contrôlée)
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
});
```

---

## 📄 Fichiers de config annexes

### `.babelrc`
```json
{
  "presets": [
    ["@babel/preset-env", { "useBuiltIns": "usage", "corejs": 3 }]
  ]
}
```

### `postcss.config.cjs`
```js
module.exports = {
  plugins: [require('autoprefixer')]
};
```

### `tsconfig.json` (TS + ESM)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "jsx": "react-jsx",
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### `package.json` (scripts)
```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "start": "node dist/main.js"
  }
}
```

---

## 🧩 Concepts essentiels

### 1) **Entry / Output**
- `entry` **définit** le(les) points d’entrée. `output` contrôle le **chemin** et le **nom** des bundles. Utilise `[name].[contenthash].js` pour le **cache‑busting**.

### 2) **Mode** & **Source maps**
- `mode: 'development' | 'production'`.  
- Dev : `eval-cheap-module-source-map` rapides; Prod : `source-map` **complètes**.

### 3) **Loaders**
- Transforment des **ressources** : `babel-loader` (JS), `ts-loader` (TS), `css-loader`/`sass-loader` (styles).

### 4) **Asset modules** (Webpack 5)
- `asset/resource` (copie fichier), `asset/inline` (embeds base64), `asset/source` (texte), `asset` (auto selon taille).

### 5) **Plugins**
- `HtmlWebpackPlugin` injecte les bundles dans un **template**.  
- `MiniCssExtractPlugin` **extrait** CSS en fichiers séparés.  
- `DefinePlugin` **expose** des variables **au build**.

### 6) **DevServer** (HMR)
- `webpack-dev-server` sert les fichiers en mémoire, **hot reload**, proxy API, `historyApiFallback` pour **SPA**.

### 7) **Code splitting** & **lazy‑loading**
- `import('./module')` crée un **chunk** séparé. Par défaut, `splitChunks` en prod fait des **vendors**.

### 8) **Tree‑shaking**
- Utilise **ES Modules** (`import/export`) et indique `"sideEffects": false` dans `package.json` (si tes fichiers n’ont pas d’effets de bord). Webpack élimine le **code mort**.

### 9) **Env & secrets**
- Charge `.env` via **dotenv** dans le config/node, et expose **explicitement** via `DefinePlugin`. ⚠️ Ne pas exposer des **secrets** côté client.

### 10) **Performance & cache**
- `moduleIds: 'deterministic'`, `runtimeChunk: 'single'` et `[contenthash]` pour conserver le **cache** navigateur.

---

## 🧪 Exemple minimal — `src/index.ts`
```ts
import './styles/main.scss';

const mount = (selector: string) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `<h1>Webpack 5 ready ✅</h1>`;
};

mount('#app');

// Code splitting (lazy)
const btn = document.createElement('button');
btn.textContent = 'Charger module';
btn.onclick = async () => {
  const { greet } = await import('./app/main');
  greet('Eric');
};
document.body.appendChild(btn);
```

### `src/app/main.ts`
```ts
export const greet = (name: string) => {
  alert(`Bonjour, ${name} !`);
};
```

### `public/index.html`
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Webpack Demo</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

### `src/styles/main.scss`
```scss
$primary: #2d6cdf;
body { font-family: system-ui, sans-serif; margin: 2rem; }
h1 { color: $primary; }
```

---

## 🔧 Exercices guidés
1. **Build dev/prod** : lance `npm run dev` (HMR) puis `npm run build`; observe les **fichiers hashés** dans `dist/` et le **split** auto des vendors.  
2. **Lazy‑chunk** : crée `src/analytics.ts` chargé via `import()` au clic; vérifie la création d’un **chunk** distinct.  
3. **Env** : ajoute `.env` avec `API_URL=https://api.example.com` et expose `API_URL` via `DefinePlugin`; consomme‑la dans `index.ts`.  
4. **PostCSS** : écris un sélecteur avec `display: flex` et vérifie les **prefixes** générés par `autoprefixer`.  
5. **Tree‑shaking** : exporte deux fonctions, n’en importe qu’une; constate la **réduction** du bundle en prod.

---

## 🧪 Tests / Vérifications (rapides)
```bash
# DevServer
npm run dev
# → ouvre http://localhost:5173 et modifie src/styles/main.scss, observe HMR

# Build prod + audit rapide
npm run build
ls dist
# → bundles .js/.css avec [contenthash]
```

---

## ⚠️ Pièges fréquents
- **Exposer des secrets** côté client via `DefinePlugin` → **à proscrire**.  
- **CommonJS** partout → bloque le **tree‑shaking**; préfère **ESM**.  
- **Source maps** complètes en prod publiques → fuient du **code**; limiter l’accès ou utiliser `hidden-source-map`.  
- **InMemory provider** pour images énormes (`asset/inline`) → gonfle le bundle; préférer `asset/resource`.  
- **CSS en `style-loader`** en prod → styles **inline** non optimisés; extraire avec `MiniCssExtractPlugin`.

---

## 🧮 Formules (en JavaScript)
- **Règle de pouce bundle** (naïve) :
```javascript
const budgetOk = (kb) => kb <= 512; // viser <= 512 KB par entry
```
- **Seuil de split** (idée) :
```javascript
const shouldSplit = (moduleSizeKb) => moduleSizeKb > 100; // créer chunk séparé
```

---

## 📌 Résumé essentiel
- **Webpack 5** = bundler modulaire : **loaders** (transformations) + **plugins** (fonctionnalités).  
- Structure **common/dev/prod** pour séparer **développement** et **production**.  
- **DevServer** (HMR), **splitChunks** + `import()` (lazy), **tree‑shaking** avec **ESM**, **hashing** pour cache.  
- Soigne les **assets**, **CSS**, **source maps** et **variables d’environnement**; évite secrets et préfère **MiniCssExtractPlugin** en prod.
