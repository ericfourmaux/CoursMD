
# 📘 Chapitre 10.2 — Tests front avec Jest (TS + Babel), mocks, coverage & CI

> **Niveau** : Intermédiaire — **Objectif** : configurer **Jest** pour un projet **TypeScript** packagé avec **Webpack**, tester du **code UI** avec **Testing Library** (DOM/React optionnel), maîtriser les **mocks** (modules, `fetch`, timers), les **snapshots**, la **couverture** et l’intégration **CI**.

---

## 🎯 Objectifs d’apprentissage
- Installer et configurer **Jest 29+** avec **jsdom** pour tester le **DOM**.
- Choisir entre **babel-jest** (TS via `@babel/preset-typescript`) et **ts-jest**.
- Écrire des tests AAA (Arrange–Act–Assert) pour **fonctions** et **UI**.
- Utiliser **Testing Library** (DOM) + **jest-dom** pour des assertions **sémantiques**.
- Gérer les **mocks** (CSS/assets, modules ESM/CJS, `fetch`, **timers**, **Date**).
- Activer la **couverture** (`--coverage`), fixer des **seuils** et publier en **CI**.

---

## 🧰 Installation

```bash
# Dans un projet front (Webpack + TS)
npm i -D jest @types/jest jest-environment-jsdom \
         babel-jest @babel/core @babel/preset-env @babel/preset-typescript \
         @testing-library/dom @testing-library/jest-dom \
         identity-obj-proxy \
         whatwg-fetch \
         ts-jest # (optionnel si préférence ts-jest)
```

> **Note** : `jest-environment-jsdom` apporte un **DOM virtuel**; `whatwg-fetch` fournit `fetch` en tests; `identity-obj-proxy` **mock** les **CSS modules**.

---

## 🗂️ Arborescence suggérée

```
project/
  ├─ src/
  │  ├─ app/
  │  │   ├─ greet.ts
  │  │   └─ dom.ts
  │  └─ index.ts
  ├─ public/index.html
  ├─ jest.config.ts
  ├─ babel.config.js
  ├─ jest.setup.ts
  ├─ package.json
  └─ tests/
     ├─ greet.test.ts
     ├─ dom.test.ts
     └─ __mocks__/fileMock.js
```

---

## ⚙️ Configuration Jest (option **babel-jest**)

### `jest.config.ts`
```ts
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    // CSS Modules → proxy pour classnames
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Assets (images/svg)
    '^.+\\.(svg|png|jpg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js',
    // Aliases webpack (ex: '@/') → mapper vers src
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/']
};

export default config;
```

### `babel.config.js`
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }]
  ]
};
```

### `jest.setup.ts`
```ts
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // fetch pour jsdom

// Option: mock stricte des heures pour des tests déterministes
const fixedNow = new Date('2025-01-15T10:00:00Z').getTime();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _Date = Date as any;
_Date.now = () => fixedNow;
```

### `tests/__mocks__/fileMock.js`
```js
module.exports = 'test-file-stub';
```

> **Pourquoi babel-jest ?** Simplicité, vitesse; transpile TS → JS sans **type-checking** (la **validation TS** se fait via `tsc --noEmit` ou l’IDE).

---

## ⚙️ Alternative : `ts-jest`

### Installation
```bash
npm i -D ts-jest @types/jest jest-environment-jsdom
```

### `jest.config.ts` (ts-jest)
```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(svg|png|jpg|gif)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html']
};

export default config;
```

> **Pourquoi ts-jest ?** Support **TypeScript** complet (transpile + type-check optionnel). **Légèrement plus lent** que babel-jest.

---

## 💡 Exemples de code & tests

### 1) **Fonction pure** — `greet.ts`
```ts
export const greet = (name: string) => `Bonjour, ${name}!`;
```

#### Test — `greet.test.ts`
```ts
import { greet } from '@/app/greet';

describe('greet', () => {
  it('devrait saluer le nom fourni', () => {
    expect(greet('Eric')).toBe('Bonjour, Eric!');
  });
});
```

---

### 2) **DOM API** (sans framework) — `dom.ts`
```ts
export function renderTitle(target: HTMLElement, text: string) {
  const h1 = document.createElement('h1');
  h1.textContent = text;
  h1.className = 'title';
  target.appendChild(h1);
}
```

#### Test `dom.test.ts` (Testing Library DOM)
```ts
import { renderTitle } from '@/app/dom';
import { prettyDOM } from '@testing-library/dom';

it('devrait rendre un <h1> avec le texte', () => {
  const container = document.createElement('div');
  renderTitle(container, 'Webpack & Jest');

  const h1 = container.querySelector('h1');
  expect(h1).toHaveTextContent('Webpack & Jest');
  expect(h1).toHaveClass('title');

  // Snapshot utile pour suivre le DOM rendu
  expect(prettyDOM(container)).toMatchSnapshot();
});
```

> **Snapshots** : gardent une photo du rendu **DOM**. À utiliser **judicieusement** (stable, sémantique). Ne pas snapshotter de grands arbres **volatils**.

---

### 3) **Mock de modules** (ESM/CJS)

```ts
// src/app/api.ts
export async function getProduct(id: number) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
```

```ts
// tests/api.test.ts
import { getProduct } from '@/app/api';

describe('getProduct', () => {
  beforeEach(() => {
    // reset fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = jest.fn();
  });

  it('retourne le JSON quand 200', async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
    await expect(getProduct(1)).resolves.toEqual({ id: 1 });
  });

  it('lève une erreur quand HTTP != 200', async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(getProduct(1)).rejects.toThrow('HTTP 500');
  });
});
```

---

### 4) **Timers & Date**
```ts
// Exemple: fonction qui déclenche une callback après 1000 ms
export const after1s = (fn: () => void) => setTimeout(fn, 1000);
```

```ts
// tests/timers.test.ts
jest.useFakeTimers();

it('appelle la callback après 1 seconde', () => {
  const fn = jest.fn();
  after1s(fn);
  jest.advanceTimersByTime(999);
  expect(fn).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
});
```

---

## 📈 Couverture & seuils

### Scripts `package.json`
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

### Seuils (dans `jest.config.ts`)
```ts
coverageThreshold: {
  global: {
    branches: 80,
    functions: 85,
    lines: 85,
    statements: 85
  }
}
```

> **Conseil** : démarre **modéré** (80–85%), augmente progressivement; privilégie **qualité** des scénarios plutôt que la **quantité**.

---

## 🛠️ Intégration **CI** (GitHub Actions)

```yaml
name: Front Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  jest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:cov
      - name: Upload coverage (lcov)
        uses: actions/upload-artifact@v4
        with:
          name: jest-coverage
          path: coverage
```

---

## 🧱 Schémas ASCII

### A) Pile des tests
```
Jest → jsdom (DOM virtuel)
  ├─ babel-jest / ts-jest (transform TS)
  ├─ Testing Library (DOM)
  └─ jest-dom (assertions sémantiques)
```

### B) Mocks classiques
```
CSS → identity-obj-proxy
Assets → fileMock.js
fetch → jest.fn() + whatwg-fetch
Timers → jest.useFakeTimers()
```

---

## ⚠️ Pièges fréquents
- **Confusion Babel vs ts-jest** : ne mélange pas deux **transformers**; choisis l’un.
- **`fetch` absent** en jsdom : ajouter `whatwg-fetch` dans `jest.setup.ts`.
- **SnapShots partout** : deviennent fragiles; préfère **assertions sémantiques** Testing Library.
- **CSS inline** (pas de modules) : évite d’assertionner les **styles**; assert **classes**/accessibilité.
- **Type-check manquant** avec babel-jest : exécute `tsc --noEmit` en CI.
- **Imports alias Webpack** non mappés : configure `moduleNameMapper`.

---

## 🧮 Formules (en JavaScript)
- **Taux de couverture global** (idée) :
```javascript
const coverageRate = (covered, total) => (covered / Math.max(1, total)) * 100;
```
- **Seuils respectés ?**
```javascript
const meetsThresholds = ({b,f,l,s}, t) => b>=t.branches && f>=t.functions && l>=t.lines && s>=t.statements;
```

---

## 📌 Résumé essentiel
- **Jest + jsdom** testent le DOM **sans navigateur**; utilise **Testing Library** + **jest-dom** pour des tests **accessibles** et **robustes**.
- Choisis **babel-jest** (rapide) ou **ts-jest** (complet) et **aligne** ta config.
- Maîtrise les **mocks** (modules, assets, `fetch`, timers) et les **snapshots** avec parcimonie.
- Active la **couverture**, fixe des **seuils**, publie en **CI**; garde des tests **déterministes** et **lisibles**.
