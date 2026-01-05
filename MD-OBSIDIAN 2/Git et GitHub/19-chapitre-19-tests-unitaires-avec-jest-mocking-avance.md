---
title: "🧩 Chapitre 19 — Jest : mocking avancé (modules, timers, spies)"
tags: [jest, mocking, spies, timers, esm, commonjs, ts-jest, axios, fetch, __mocks__, isolateModules]
cssclass: chapitre
---

# 🧩 Chapitre 19 — Jest : mocking avancé (modules, timers, spies)

> **Objectif pédagogique :** maîtriser les **patrons avancés de mocking** avec **Jest** : modules (CommonJS/ESM), **`__mocks__`** manuels, **`jest.mock`** (factory), **`jest.unstable_mockModule`** pour ESM, **spies sur getters/setters**, **classes**, **`requireActual`**/**`doMock`**, **isolation** avec **`jest.isolateModules`**, **timers modernes** (mock du temps, `setSystemTime`), et recettes pour **`fetch`/`axios`**. À la fin, tu sauras **choisir** le bon type de mock et **éviter** les anti‑patterns.

---

## 🧠 Résumé rapide (à garder en tête)
- **Types de mocks** :
  - **Auto‑mock** (`jest.mock('mod')`) + **factory** pour personnaliser.  
  - **Manuel** via dossier `__mocks__/mod.ts` (pris si `jest.mock('mod')`).  
  - **Partiel** avec `jest.requireActual('mod')` puis **écraser** certaines fonctions.  
  - **ESM** : utiliser **`jest.unstable_mockModule`** + `import()` **asynchrone**.
- **Spies** : `jest.spyOn(obj, 'fn')` + variante **accessor** (`'get'/'set'`).
- **Timers modernes** : `jest.useFakeTimers()` + `jest.setSystemTime()`, `runOnlyPendingTimers`, `advanceTimersByTime`.  
- **Isolation** : `jest.resetModules()` et **`jest.isolateModules()`** pour recharger un module avec un mock différent **par test**.

---

## ⚙️ Pré‑requis (rappel)
- **TypeScript** : `ts-jest` configuré (voir Chap. 18).  
- **Organisation** : `src/` + `__tests__/`, option **`__mocks__/`** pour mocks manuels.

---

## 🔧 `jest.mock()` — CommonJS & factory personnalisée

```ts
// src/lib/math.ts
export function add(a:number,b:number){ return a+b; }
export function mul(a:number,b:number){ return a*b; }

// src/app.ts
import * as math from './lib/math';
export function compute(a:number,b:number){
  return math.add(a,b) + math.mul(a,b);
}

// src/__tests__/app.test.ts
// Mock total du module avec factory
jest.mock('../lib/math', () => ({
  add: jest.fn().mockImplementation((a,b) => 0), // neutralise add
  mul: jest.fn().mockImplementation((a,b) => a*b)
}));

import { compute } from '../app'; // après le jest.mock (hoisté)
import { add, mul } from '../lib/math';

describe('compute()', () => {
  it('utilise les mocks', () => {
    expect(compute(2,3)).toBe(6); // add neutralisé
    expect(add).toHaveBeenCalledWith(2,3);
    expect(mul).toHaveBeenCalledWith(2,3);
  });
});
```

> **Notes** : `jest.mock()` est **hoisté** par Jest en haut du fichier, avant les `import`. On **importe après** le mock pour lire les fonctions mockées.

---

## 🗃️ Mocks **manuels** — dossier `__mocks__/`

```ts
// src/lib/__mocks__/math.ts
export const add = jest.fn((a:number,b:number) => 0);
export const mul = jest.fn((a:number,b:number) => a*b);

// src/__tests__/app.manual.test.ts
jest.mock('../lib/math'); // utilisera automatiquement __mocks__/math.ts
import { compute } from '../app';
import { add, mul } from '../lib/math';

describe('compute() avec mock manuel', () => {
  it('fonctionne', () => {
    expect(compute(2,3)).toBe(6);
    expect(add).toHaveBeenCalled();
  });
});
```

> **Avantage** : centraliser un mock **réutilisable**. Idéal pour modules **verbaux** (ex. `axios`, clients API).

---

## 🧩 Mock **partiel** — `requireActual` + écrasement

```ts
// src/__tests__/partial.test.ts
jest.mock('../lib/math', () => {
  const actual = jest.requireActual('../lib/math');
  return {
    ...actual,
    add: jest.fn((a:number,b:number) => a-b) // écrase add seulement
  };
});
import { add, mul } from '../lib/math';

test('mock partiel', () => {
  expect(add(3,2)).toBe(1);     // mocké
  expect(mul(3,2)).toBe(6);     // réel
});
```

---

## 🔀 Par **test** : `jest.doMock()` + **isolation** des modules

```ts
// src/__tests__/variant.test.ts

describe('variants de mock', () => {
  afterEach(() => { jest.resetModules(); });

  it('variant A', () => {
    jest.doMock('../lib/math', () => ({ add: jest.fn(()=>1), mul: jest.fn(()=>1) }));
    const { compute } = require('../app'); // CJS require forcé après doMock
    expect(compute(2,3)).toBe(2);
  });

  it('variant B (isolateModules)', () => {
    jest.isolateModules(() => {
      jest.doMock('../lib/math', () => ({ add: jest.fn(()=>10), mul: jest.fn(()=>0) }));
      const { compute } = require('../app');
      expect(compute(2,3)).toBe(10);
    });
  });
});
```

> **Idée** : `resetModules()` **vide** le cache des imports ; `isolateModules()` exécute le code dans un **contexte isolé** (parfait pour **changer** de mock **par test**).

---

## 🧪 ESM : `jest.unstable_mockModule()` + `import()` asynchrone

```ts
// src/esm/math.mts (exemple ESM pur)
export const add = (a:number,b:number) => a+b;
export const mul = (a:number,b:number) => a*b;

// src/__tests__/esm.test.ts
// ⚠️ ESM: mocking via unstable_mockModule + import asynchrone
beforeEach(() => { jest.resetModules(); });

test('mock ESM', async () => {
  await jest.unstable_mockModule('../esm/math.mjs', () => ({
    add: jest.fn(() => 100),
    mul: jest.fn(() => 0)
  }));
  const app = await import('../app-esm.mjs'); // fichier qui importe math.mjs
  expect(app.compute(1,2)).toBe(100);
});
```

> **Contexte** : pour **ESM natif**, `jest.mock` a des limites ; `unstable_mockModule` permet un mocking **avant** l’`import()` du module cible.

---

## 🕵️ Spies avancés — **getters/setters**, **classes**

```ts
// src/models/user.ts
export class User {
  #name:string;
  constructor(name:string){ this.#name = name; }
  get name(){ return this.#name; }
  set name(v:string){ this.#name = v.toUpperCase(); }
}

// src/__tests__/user.test.ts
import { User } from '../models/user';

test('spy sur getter/setter', () => {
  const u = new User('eric');
  const getSpy = jest.spyOn(u, 'name', 'get');
  const setSpy = jest.spyOn(u, 'name', 'set');
  u.name = 'Fourmaux';
  expect(setSpy).toHaveBeenCalledWith('Fourmaux');
  expect(getSpy.mock.results.length).toBeGreaterThan(0);
});

// Mock de classe (constructeur + méthodes)
jest.mock('../models/user');
import { User as MockedUser } from '../models/user';
(MockedUser as unknown as jest.Mock).mockImplementation(function(name:string){
  return { name, greet: jest.fn(()=>'hi') } as any;
});
```

> **Accessors** : troisième argument `'get'|'set'`. **Classes** : un `jest.mock()` sur le fichier transforme le constructeur en **mock**.

---

## 🌐 Mocker **fetch** & **axios**

### `fetch` (global)
```ts
global.fetch = jest.fn();
(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
```

### `axios` (module)
```ts
// __mocks__/axios.ts
export default { get: jest.fn(), post: jest.fn() };

// test
jest.mock('axios');
import axios from 'axios';
(axios.get as jest.Mock).mockResolvedValueOnce({ data: { ok: true } });
```

> **Bon réflexe** : **séquencer** avec `mockResolvedValueOnce` / `mockRejectedValueOnce` pour **chaînes** d’appels.

---

## ⏱️ Timers modernes — contrôler le temps

```ts
jest.useFakeTimers(); // (moderne par défaut)
jest.setSystemTime(new Date('2025-12-22T10:00:00Z'));

setTimeout(()=>{/*...*/}, 1000);
setInterval(()=>{/*...*/}, 500);

jest.advanceTimersByTime(1000);       // avance de 1s
jest.runOnlyPendingTimers();          // exécute ce qui est en file
jest.advanceTimersToNextTimer();      // va jusqu’au prochain timer
jest.useRealTimers();                 // restore
```

> **Astuce** : utilise `setSystemTime` pour des fonctions sensibles à `Date.now()` (logs, TTL). Évite les **sleep réels** en tests.

---

## 🧼 Reset global entre tests

```ts
afterEach(() => {
  jest.clearAllMocks();      // calls, instances
  jest.resetAllMocks();      // impl par défaut
  jest.restoreAllMocks();    // remet les spies
});
```

> **Modules** : `jest.resetModules()` si un module lit un **ENV** ou une config au **import**.

---

## 🧠 Bonnes pratiques & anti‑patterns
- **Ne pas sur‑mock** : plus un test est proche du **comportement réel**, plus il est **fiable**.  
- **Mocks par test** : évite les **mutations globales** durables ; privilégie `isolateModules`/`resetModules`.  
- **Contract over mocks** : teste les **effets** (retours, appels) plutôt que l’**implémentation interne**.  
- **Snapshots raisonnables** : petits et stables ; sinon préfère des **matchers ciblés**.  
- **Timers** : **fake timers** pour vitesse/fiabilité ; attention aux **promises microtasks** (attends `await Promise.resolve()` si besoin).

---

## 🧪 Exercices pratiques
1. **Mock partiel** : écraser `add()` seulement avec `requireActual`.
2. **Deux variantes** : même test, deux résolutions différentes via `doMock` + `isolateModules`.
3. **ESM** : mocker un module ESM avec `unstable_mockModule` + `import()`.
4. **Accessors** : spy sur `get/set` d’une classe, vérifier les **calls**.
5. **Timers** : fixer `setSystemTime`, utiliser `advanceTimersToNextTimer` puis `runOnlyPendingTimers`.
6. **Axios** : créer un mock manuel `__mocks__/axios.ts` et l’utiliser dans 2 tests séquencés.

---

## 💻 VS Code & CI
- **VS Code** : extension **Jest** pour watch/debug ; dossiers `__mocks__` visibles.  
- **CI (Actions)** : n’oublie pas `jest.clear/reset/restore` en **setupFilesAfterEnv** pour stabilité.

```ts
// jest.setup.ts
afterEach(() => { jest.clearAllMocks(); });
```

---

## 🧑‍🏫 Théorie & utilitaires en **JavaScript**

### 1) Mini factory de **mock** (compter les appels)
```js
function mockFactory(){
  const calls=[]; const fn=(...args)=>calls.push(args);
  fn.calls=calls; fn.reset=()=>{ calls.length=0; };
  return fn;
}
const m = mockFactory(); m(1); m('x');
console.log(m.calls.length); // 2
m.reset();
```

### 2) Recharger un module avec **mocks différents** (concept)
```js
function reload(requirePath, factory){
  jest.resetModules();
  jest.doMock(requirePath, factory);
  return require(requirePath.replace('/lib/','/app/')); // ex. charger app qui importe lib
}
```

### 3) Séquence de réponses **axios**
```js
const seq = [
  Promise.resolve({ data: { ok: true } }),
  Promise.reject(new Error('boom')),
];
const axios = { get: jest.fn() };
axios.get.mockResolvedValueOnce(await seq[0]);
axios.get.mockRejectedValueOnce(await seq[1]);
```

---

## 📎 Glossaire (sélection)
- **Auto‑mock** : `jest.mock('module')` crée des fonctions **mock**.
- **Mock manuel** : dossier `__mocks__/` consommé par `jest.mock`.
- **Partiel** : `jest.requireActual` → copie réelle, puis **override**.
- **ESM mocking** : `jest.unstable_mockModule` + `import()`.
- **Spies** : `jest.spyOn` sur fonctions **ou accessors**.
- **Timers** : `useFakeTimers`, `setSystemTime`, `advanceTimers…`.
- **Isolation** : `resetModules`, `isolateModules`.

---

## 📚 Ressources officielles
- Jest Mock Functions (API) : https://jestjs.io/docs/mock-functions  
- `jest.mock` & modules : https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options  
- Manual mocks `__mocks__` : https://jestjs.io/docs/manual-mocks  
- ESM mocking (`unstable_mockModule`) : https://jestjs.io/docs/ecmascript-modules  
- Timers (fake timers & système) : https://jestjs.io/docs/timer-mocks  
- `isolateModules` & reset : https://jestjs.io/docs/jest-object#jestisolatemodulesfn

---

## 🧾 Résumé — Chapitre 19
- **Mocking modulaire** adapté à CommonJS **et** ESM, y compris mocking **partiel**.
- **Spies avancés** (get/set) et **classes** mockées proprement.
- **Timers modernes** : contrôle fin du temps et des files d’attente.
- **Isolation par test** : recharger modules et **varier** les mocks sans fuite d’état.
- **Recettes** pour **`fetch/axios`** et séquences **résoudre/rejeter**.

---

> 🔜 **Prochain chapitre** : [[20-chapitre-20-testing-library-react-vue-patron-d-ecriture]] (sera fourni après validation).
