---
title: "🧪 Chapitre 18 — Tests unitaires avec Jest (introduction)"
tags: [jest, tests, unit, coverage, ts-jest, babel, mocking, timers, snapshots, testing-library, ci]
cssclass: chapitre
---

# 🧪 Chapitre 18 — Tests unitaires avec Jest (introduction)

> **Objectif pédagogique :** installer et configurer **Jest**, écrire des **tests unitaires** lisibles (sync/async), utiliser les **matchers**, **mocks**, **spies**, **timers**, **snapshots**, mesurer la **couverture** (*coverage*), intégrer **TypeScript**, et brancher la **CI** (GitHub Actions). À la fin, tu sauras **valider** des fonctions, **isoler** les dépendances, et **automatiser** l’exécution.

---

## 🧠 Résumé rapide (à garder en tête)
- **Jest** : framework de tests **tout‑en‑un** pour JS/TS (runner, assertions, mocks, snapshots).
- **Tests** : **déterministes**, **rapides**, **isolés** ; nommage clair et **Given‑When‑Then**.
- **Matchers** : `toBe`, `toEqual`, `toContain`, `resolves`, `rejects`, `toMatchObject`…
- **Mocks/Spies** : `jest.fn`, `jest.spyOn`, `mockImplementation`, **reset/clear** entre tests.
- **Async** : `await`, `resolves/rejects`, **fake timers** si nécessaire.
- **Coverage** : **lignes/branches/fonctions** ; seuils par projet.

---

## 📦 Installation (JS/TS)

> **Pré‑requis** : Node ≥ 18, dépôt initialisé.

```bash
# Base
npm install -D jest

# TypeScript (recommandé via ts-jest)
npm install -D typescript ts-jest @types/jest

# (Optionnel) Tester DOM (UI)
npm install -D jest-environment-jsdom @testing-library/jest-dom @testing-library/dom
```

---

## ⚙️ Configuration — JS/TS & DOM

### `jest.config.cjs` (TypeScript + Node)
```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 80, statements: 80 }
  },
};
```

### `jest.config.cjs` (DOM/JS‑DOM, pour tests UI)
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
```

### `jest.setup.ts` (activer jest‑dom)
```ts
import '@testing-library/jest-dom';
```

### Scripts npm
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

> **Organisation conseillée** : `src/` pour le code, `__tests__/` au même niveau que les fichiers testés (ex. `src/utils/__tests__/sum.test.ts`).

---

## ✍️ Écrire des tests — bases & style

### 1) Test **synchrones**
```ts
// src/utils/sum.ts
export function sum(a: number, b: number) { return a + b; }

// src/utils/__tests__/sum.test.ts
import { sum } from '../sum';

describe('sum()', () => {
  it('additionne deux nombres', () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

### 2) Test **asynchrones**
```ts
// src/api/fetchUser.ts
export async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// src/api/__tests__/fetchUser.test.ts
describe('fetchUser()', () => {
  it('résout avec les données', async () => {
    // Mock du fetch global
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: '42' }) });
    await expect(fetchUser('42')).resolves.toEqual({ id: '42' });
  });

  it('rejette en cas d’erreur HTTP', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchUser('42')).rejects.toThrow('HTTP 500');
  });
});
```

### 3) **Spies** et **mocks**
```ts
// src/lib/logger.ts
export const logger = { info: (...args: any[]) => console.log(...args) };

// src/lib/__tests__/logger.test.ts
import { logger } from '../logger';

describe('logger', () => {
  it('appelle console.log via spy', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('hello');
    expect(spy).toHaveBeenCalledWith('hello');
    spy.mockRestore();
  });
});
```

### 4) **Timers** & fake timers
```ts
// src/utils/delay.ts
export function delay(ms: number, cb: () => void) {
  setTimeout(cb, ms);
}

// src/utils/__tests__/delay.test.ts
describe('delay()', () => {
  it('appelle le callback après le délai', () => {
    jest.useFakeTimers();
    const cb = jest.fn();
    delay(1000, cb);
    expect(cb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
```

### 5) **Snapshots** (prudence)
```ts
// src/components/__tests__/card.test.ts
const renderCard = (data: any) => ({ title: data.title, content: data.content });

describe('Card snapshot', () => {
  it('rendu stable', () => {
    expect(renderCard({ title: 'T', content: 'C' })).toMatchSnapshot();
  });
});
```

> **Bonnes pratiques** : snapshots **sur des composants stables** (petits, peu sensibles à la forme). Évite les snapshots **géants**.

---

## 🔎 Matchers utiles (sélection)
- **Égalité** : `toBe` (strict), `toEqual` (deep), `toBeCloseTo` (floats).
- **Objets** : `toHaveProperty`, `toMatchObject`, `toContainEqual`.
- **Tableaux/chaînes** : `toContain`, `toHaveLength`, `toMatch` (regex).
- **Exceptions/async** : `toThrow`, `resolves`, `rejects`.
- **Spies** : `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`.

---

## 🧹 Isolation — reset & teardown
- **Nettoyage** : `jest.clearAllMocks()`, `jest.resetAllMocks()`, `jest.restoreAllMocks()` dans `afterEach`.
- **Modules** : `jest.resetModules()` si tu as des **singletons** dépendant d’ENV.
- **Hooks** : `beforeAll/beforeEach/afterEach/afterAll` pour préparer/vider l’état.

```ts
beforeEach(() => { jest.clearAllMocks(); });
```

---

## 📈 Coverage — mesurer & fixer des seuils

### Lancer avec rapport
```bash
npm run test:cov
```

### Interpréter
- **Lines** : lignes exécutées.
- **Branches** : embranchements `if/else` couverts.
- **Functions** : fonctions appelées.

> **Conseil** : vise **80%** global au départ, ajuste par **module** si nécessaire.

---

## 🧪 Patterns avancés
- **Table‑driven** : `test.each` pour jeux de données.
- **Mock partiel** : `jest.spyOn(obj, 'method').mockImplementation(...)`.
- **Mock de modules** : `jest.mock('module', () => ({}))` ; rétablis avec `jest.unmock`.
- **Params ENV** : injecte via `process.env`, reset entre tests.

```ts
describe('table‑driven', () => {
  test.each([
    [2, 3, 5],
    [-1, 1, 0],
  ])('sum(%d,%d)=%d', (a, b, out) => {
    expect(sum(a, b)).toBe(out);
  });
});
```

---

## 💻 VS Code — debug & confort
- **Extension Jest** : lancer en watch, voir les statuts inline.
- **Debug** : ajouter une config `launch.json` (Node) pour exécuter un test ciblé.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest current file",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
      "args": ["${file}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🔁 CI (GitHub Actions) — Job minimal

```yaml
# .github/workflows/test.yml
name: Test
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:cov
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-${{ matrix.node }}
          path: coverage/
```

---

## ⚠️ Encadré risques & hygiène
- **Sur‑mocking** : trop de mocks → tests fragiles ; préfère des tests proches du **comportement réel**.
- **Snapshots volumineux** : difficiles à relire ; garde‑les **petits**.
- **Tests flakys** : évite dépendances réseau/temps ; utilise **mocks** et **fake timers**.
- **Couverture trompeuse** : 100% ne garantit pas la **qualité** ; cible la **valeur** (cas critiques).

---

## 🧪 Exercices pratiques
1. **Installer & configurer** Jest (ts‑jest), écrire 3 tests (sync, async, spy).  
2. **Fake timers** : tester une fonction avec `setTimeout`.
3. **Mock fetch** : simuler succès & erreur ; tester `resolves/rejects`.
4. **Snapshots** : créer un petit snapshot stable ; modifier et observer le **diff**.
5. **Coverage** : fixer des seuils et faire passer les tests en **CI**.

---

## 🧑‍🏫 Théorie & utilitaires en **JavaScript**

### 1) Mini **assert** (pour comprendre les matchers)
```js
function assertEqual(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}; got ${JSON.stringify(actual)}`);
  }
}
```

### 2) **Mock** trivial (concept de jest.fn)
```js
function makeMock() {
  const calls = [];
  const fn = (...args) => { calls.push(args); };
  fn.calls = calls;
  return fn;
}
const m = makeMock();
m('a');
console.log(m.calls.length === 1); // true
```

### 3) **Couverture** simplifiée (idée)
```js
function coverage(linesExecuted, linesTotal) {
  return Math.round((linesExecuted / linesTotal) * 100);
}
console.log(coverage(80, 100)); // 80
```

---

## 📎 Glossaire (sélection)
- **Jest** : framework de tests pour JS/TS (runner, assertions, mocks, snapshots).
- **Matcher** : fonction d’assertion (`toBe`, `toEqual`, etc.).
- **Spy** : surveillance d’appel (ex. `jest.spyOn`).
- **Mock** : remplacement d’une dépendance par une version contrôlée.
- **Fake timers** : simulation du temps pour `setTimeout/Interval`.
- **Snapshot** : sérialisation de sortie à comparer d’un run à l’autre.
- **Coverage** : métriques d’exécution des tests.

---

## 📚 Ressources officielles
- Jest — Getting Started : https://jestjs.io/docs/getting-started  
- TypeScript + Jest (ts‑jest) : https://kulshekhar.github.io/ts-jest/  
- Jest DOM (Testing Library) : https://testing-library.com/docs/ecosystem-jest-dom/  
- Jest Expect (matchers) : https://jestjs.io/docs/expect  
- Jest Mock Functions : https://jestjs.io/docs/mock-functions  
- Snapshots : https://jestjs.io/docs/snapshot-testing  
- Fake Timers : https://jestjs.io/docs/timer-mocks

---

## 🧾 Résumé des points essentiels — Chapitre 18
- **Jest** = runner + assertions + mocks + snapshots.
- **Tests** lisibles (sync/async), **matchers** variés, **spies** & **timers**.
- **TypeScript** via **ts‑jest** ; **DOM** avec **jsdom** + **jest‑dom**.
- **Coverage** utile (lignes/branches/fonctions) ; seuils réalistes.
- **CI** prête : job minimal pour exécuter les tests et publier les rapports.

---

> 🔜 **Prochain chapitre** : [[19-chapitre-19-tests-unitaires-avec-jest-mocking-avance]] (sera fourni après validation).
