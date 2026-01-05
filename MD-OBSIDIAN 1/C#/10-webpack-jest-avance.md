
# 📘 Chapitre 10.4 — Configuration avancée Webpack + Jest (alias, assets/CSS mocks, coverage & tests de bundles)

> **Niveau** : Intermédiaire → Avancé — **Objectif** : aligner **Webpack** (v5) et **Jest** (29+) dans un projet **TypeScript** moderne : **aliases** cohérents (Webpack/Jest/TS), **mocks** d’assets/CSS, **ESM/CJS** en tests, **source maps & coverage** fiables, **budgets de bundles** automatisés en **CI**, et **perf** (cache, multi‑thread).

---

## 🎯 Objectifs d’apprentissage
- Aligner les **chemins alias** (`@/`) entre **Webpack**, **Jest** et **tsconfig** pour des imports cohérents.
- Maîtriser les **mocks** d’assets (images/SVG) et **CSS modules** en tests.
- Configurer **Jest** pour **ESM** et modules à transpiler (dans `node_modules`).
- Obtenir une **couverture** fidèle des sources **TS/JS** (source maps) et fixer des **seuils**.
- Tester les **bundles** : taille maximale, nombre de chunks, vendors — et **faire échouer** la CI si budget dépassé.
- Améliorer les **performances** de build (cache disque, threads) et le **type‑checking** séparé.

---

## 🗂️ Arborescence proposée
```
project/
  ├─ src/
  │   ├─ app/
  │   │   ├─ api.ts
  │   │   └─ ui.tsx
  │   └─ index.tsx
  ├─ public/index.html
  ├─ jest.config.ts
  ├─ babel.config.js
  ├─ jest.setup.ts
  ├─ tsconfig.json
  ├─ webpack.common.js
  ├─ webpack.dev.js
  ├─ webpack.prod.js
  ├─ tests/
  │   ├─ api.test.ts
  │   ├─ ui.test.tsx
  │   └─ __mocks__/
  │       ├─ fileMock.js
  │       └─ svgTransform.js
  └─ tools/
      ├─ check-bundle-size.mjs
      └─ write-stats-plugin.mjs
```

---

## 🔗 Alignement des **aliases** (Webpack / Jest / TS)

### Webpack (`resolve.alias`) — `webpack.common.js`
```js
const path = require('path');
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.ts', '.tsx', '.js']
  }
};
```

### Jest (`moduleNameMapper`) — `jest.config.ts`
```ts
import type { Config } from 'jest';
const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: { '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest' },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': '<rootDir>/tests/__mocks__/svgTransform.js',
    '^.+\\.(png|jpg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/']
};
export default config;
```

### TypeScript (paths) — `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "sourceMap": true
  },
  "include": ["src", "tests"]
}
```

> **Astuce** : si tu utilises `ts-jest`, tu peux générer automatiquement `moduleNameMapper` à partir de `paths` ou le **maintenir** manuellement pour rester explicite.

---

## 🎨 Mocks **CSS** & **assets** (SVG/images)

### CSS modules — `identity-obj-proxy`
- Permet des assertions sur les **classNames** sans charger de CSS réel.

### Fichiers — `fileMock.js`
```js
// tests/__mocks__/fileMock.js
module.exports = 'test-file-stub';
```

### SVG en **React component** — `svgTransform.js`
```js
// tests/__mocks__/svgTransform.js
const { createTransformer } = require('@svgr/jest');
module.exports = createTransformer({ jsxRuntime: 'automatic' });
```

*(Pour un projet non‑React, mappe les SVG vers `fileMock` plutôt que `svgr/jest`.)*

---

## 🧩 ESM/CJS en tests — `transformIgnorePatterns`

Certains packages ESM (dans `node_modules`) nécessitent d’être **transpilés** par Babel en tests. Autorise leur transformation avec un **negative lookahead** :

```ts
// jest.config.ts (ajoute)
transformIgnorePatterns: [
  '/node_modules/(?!(nanoid|lit|lodash-es)/)'
]
```

- Garde la **liste courte** (uniquement modules ESM posant problème).  
- Avec `ts-jest`, préfère rester **tout TS** et n’activer Babel **que** si nécessaire.

---

## 🧭 Variables d’environnement (parité Webpack/Jest)

- **Webpack** expose des vars via `DefinePlugin` : `new webpack.DefinePlugin({ 'process.env.API_URL': JSON.stringify('https://api.example.com') })`.  
- **Jest** : définis ces vars dans `jest.setup.ts` **ou** via `cross-env` dans les scripts **npm**.

```ts
// jest.setup.ts
process.env.API_URL = 'https://api.example.com';
```

---

## 🧪 Coverage **fiable** (source maps)

### Babel — `babel.config.js`
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ],
  // aide Jest à mapper correctement TS → JS
  sourceMaps: 'inline'
};
```

### TypeScript — `tsconfig.json`
- Assure `"sourceMap": true`.  
- *Type‑check* séparé en CI : `tsc --noEmit`.

### Focaliser la couverture
```ts
// jest.config.ts (extrait)
collectCoverageFrom: [
  'src/**/*.{ts,tsx,js,jsx}',
  '!src/**/*.d.ts',
  '!src/main.tsx',
  '!src/**/__tests__/**'
],
coverageThreshold: {
  global: { branches: 80, functions: 85, lines: 85, statements: 85 }
}
```

---

## 📦 Tests de **bundles** (budgets & stats) en CI

### A) Budget de taille avec **size-limit**
```bash
npm i -D size-limit @size-limit/file
```

**`package.json`**
```json
{
  "scripts": {
    "size": "size-limit"
  },
  "size-limit": [
    { "name": "main", "path": "dist/main.*.js", "limit": "200 kB" },
    { "name": "styles", "path": "dist/styles/*.css", "limit": "50 kB" }
  ]
}
```

### B) Statistiques Webpack (chunks, vendors) — plugin custom

**`tools/write-stats-plugin.mjs`**
```js
import { writeFileSync } from 'node:fs';
export default class WriteStatsPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('WriteStatsPlugin', (stats) => {
      const json = stats.toJson({ assets: true, chunks: true, modules: false });
      writeFileSync('dist/stats.json', JSON.stringify(json, null, 2));
    });
  }
}
```

**`webpack.prod.js`** (ajoute)
```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const WriteStatsPlugin = require('./tools/write-stats-plugin.mjs').default;
module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: { splitChunks: { chunks: 'all' }, runtimeChunk: 'single' },
  plugins: [ new WriteStatsPlugin() ]
});
```

**Test stats** — `tools/check-bundle-size.mjs`
```js
import { readFileSync } from 'node:fs';
const stats = JSON.parse(readFileSync('dist/stats.json', 'utf-8'));
const chunks = stats.chunks || [];
const vendors = chunks.find(c => (c.names||[]).some(n => /vendors/i.test(n)));
if (!vendors) {
  console.error('❌ Aucun chunk vendors détecté');
  process.exit(1);
}
console.log('✅ Chunk vendors présent');
```

🔧 **CI (GitHub Actions)** : exécute `npm run build`, puis `npm run size` et `node tools/check-bundle-size.mjs` pour **fail** si budget/chunks non conformes.

---

## ⚡ Perf & DX

### Cache disque & IDs stables (Webpack)
```js
// webpack.common.js (extraits)
module.exports = {
  cache: { type: 'filesystem' },
  output: { filename: '[name].[contenthash].js', moduleIds: 'deterministic' }
};
```

### Threads pour loaders lourds
```js
// accélère TS/Babel sur grosses bases
{
  test: /\.(ts|tsx|js)$/,
  use: [
    { loader: 'thread-loader', options: { workers: 2 } },
    { loader: 'babel-loader', options: { cacheDirectory: true } }
  ],
  exclude: /node_modules/
}
```

### Type‑check hors bundling
- **fork-ts-checker-webpack-plugin** pour vérifier les types **en parallèle** sans bloquer le bundling.  
- En CI : `tsc --noEmit` pour un verdict **strict**.

---

## 🧪 Exemples de tests

### API — `api.ts`
```ts
export async function getProduct(id: number) {
  const res = await fetch(`${process.env.API_URL}/products/${id}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
```

### Test — `api.test.ts`
```ts
describe('getProduct', () => {
  beforeEach(() => { (global as any).fetch = jest.fn(); });
  it('retourne le JSON', async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
    await expect(getProduct(1)).resolves.toEqual({ id: 1 });
  });
});
```

---

## ⚠️ Pièges fréquents
- Aliases **non** alignés (Webpack ≠ Jest ≠ TS) → imports cassés; **garder une source de vérité** (`@/`).  
- **TransformIgnorePatterns** trop large → packages ESM non exécutables; restreindre la liste.  
- **Source maps** absentes → couverture **fausse**; activer `sourceMaps` Babel + `sourceMap` TS.  
- Assets **inline** en prod (`style-loader`) → CSS **non** optimisé; utiliser `MiniCssExtractPlugin`.  
- Budgets de bundles **non surveillés** → régressions perf; automatiser via **size-limit** + **stats**.

---

## 🧮 Formules (JS)
- **Budget binaire naïf** :
```javascript
const budgetOk = (bytes, limitKb) => bytes <= limitKb * 1024;
```
- **Ratio vendors** (idée) :
```javascript
const vendorsRatio = (vendorsBytes, totalBytes) => vendorsBytes / Math.max(1, totalBytes);
```

---

## 📌 Résumé essentiel
- **Synchronise** alias et mappings (Webpack/Jest/TS).  
- **Mock** intelligemment CSS/Assets; traite les **ESM** particuliers via `transformIgnorePatterns`.  
- **Coverage** = source maps activées et seuils clairs; type‑check en **CI**.  
- **Surveille** tes bundles (budgets/chunks) et **échoue** la CI en cas de dérive.  
- **Optimise** les builds (cache, threads) et stabilise les **IDs** pour le cache navigateur.
