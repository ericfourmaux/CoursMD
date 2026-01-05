
# 📘 Chapitre 8 — Tests Unitaires & Qualité avec Jest

> 🎯 **Objectifs du chapitre**
> - Mettre en place une **stratégie de tests** professionnelle (pyramide: unités → intégration → e2e).
> - Utiliser **Jest** comme **test runner** et **framework d’assertions** (JS/TS).
> - Écrire des **tests unitaires** et **DOM** avec **Testing Library** (centrés sur le comportement et l’accessibilité).
> - Maîtriser les **mocks**, **spies**, **timers**, **snapshots** et la **couverture**.
> - Adopter un **workflow TDD** (Red → Green → Refactor) et des **bonnes pratiques**.

---

## 🧠 1. Pourquoi tester ?

### 🔍 Définition
Les **tests** vérifient automatiquement que le code **se comporte** comme attendu. Un test unitaire cible **une petite unité** (fonction, méthode). Les tests d’intégration vérifient **l’interaction** entre modules; les e2e valident **le parcours utilisateur**.

### ❓ Pourquoi (bénéfices)
- **Confiance** lors des refactors.
- **Documentation vivante** des comportements.
- **Prévention** des régressions.

### 💡 Analogie
Tester = **file de sécurité** pour des travaux en hauteur: vous pouvez **bouger** (refactorer) sans tomber (régression).

---

## 🧠 2. La pyramide des tests

### 🔍 Concept
```
     e2e (peu nombreux, lents)
      ───────────────────────
        Intégration (quelques)
      ───────────────────────
     Unitaires (nombreux, rapides)
```

### ✅ Bonnes pratiques
- Priorité aux **unitaires** (rapides et stables).
- **Intégration** ciblée pour points critiques.
- **e2e** sur scénarios clés (login, paiement, navigation…).

---

## 🧠 3. Mise en place de Jest (JS/TS)

### 🛠 Scripts npm
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

### 🛠 Configuration minimaliste (JS avec Babel)
```js
// jest.config.js
export default {
  testEnvironment: 'jsdom', // pour tests DOM
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js']
};
```

### 🛠 Configuration TypeScript (ts-jest)
```ts
// jest.config.ts
import type { Config } from 'jest';
const config: Config = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts']
};
export default config;
```

### 🛠 setupTests (Testing Library, assertions étendues)
```ts
// setupTests.ts
import '@testing-library/jest-dom';
```

> ℹ️ `testEnvironment: 'jsdom'` permet de tester **DOM**/events. Pour tests **Node** purs, utilisez `testEnvironment: 'node'`.

---

## 🧠 4. Premiers tests unitaires (fonctions pures)

### 💡 Fonction à tester
```ts
// src/math.ts
export function moyenne(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}
```

### 💡 Test
```ts
// src/math.test.ts
import { moyenne } from './math';

describe('moyenne', () => {
  it('retourne 0 pour tableau vide', () => {
    expect(moyenne([])).toBe(0);
  });
  it('calcule la moyenne', () => {
    expect(moyenne([2, 4, 6])).toBe(4);
  });
});
```

### ✅ Assertions courantes
```ts
expect(2 + 2).toBe(4);          // ===
expect({a:1}).toEqual({a:1});   // deep equality
expect([1,2]).toContain(2);
expect('abc').toMatch(/ab/);
expect(() => JSON.parse('{')).toThrow();
```

---

## 🧠 5. Tests asynchrones (Promises, async/await)

### 💡 Exemple
```ts
// src/api.ts
export async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
```
```ts
// src/api.test.ts
import { fetchUser } from './api';

// mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('fetchUser', () => {
  it('retourne le JSON en cas de succès', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'u1' }) });
    await expect(fetchUser('u1')).resolves.toEqual({ id: 'u1' });
  });
  it('rejette en cas de statut HTTP non OK', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchUser('u1')).rejects.toThrow('HTTP 500');
  });
});
```

### ✅ Bonnes pratiques
- **Ne pas** tester les détails d’implémentation (ex. nombre d’appels internes) sauf besoin.
- Tester **effets observables** (valeur, erreur).

---

## 🧠 6. Mocks, Spies & Timers

### 🔍 Définition
- **Mock**: remplace une dépendance par une version **contrôlée**.
- **Spy**: observe les appels d’une fonction existante.
- **Timers**: simule les **horloges** (`setTimeout`, `setInterval`).

### 💡 jest.fn & spyOn
```ts
const log = jest.fn();
log('a');
expect(log).toHaveBeenCalledWith('a');

const obj = { add: (a:number,b:number)=>a+b };
const spy = jest.spyOn(obj, 'add');
obj.add(1,2);
expect(spy).toHaveReturnedWith(3);
```

### 💡 jest.mock (module)
```ts
// utils.ts
export function now(){ return Date.now(); }
// service.ts
import { now } from './utils';
export function token(){ return `t_${now()}`; }
// service.test.ts
jest.mock('./utils', () => ({ now: () => 12345 }));
import { token } from './service';
expect(token()).toBe('t_12345');
```

### 💡 Fake timers
```ts
jest.useFakeTimers();
const fn = jest.fn();
setTimeout(fn, 1000);
jest.advanceTimersByTime(1000);
expect(fn).toHaveBeenCalledTimes(1);
```

### ⚠️ Attention
Après `jest.useFakeTimers()`, utilisez **`jest.runAllTimers()`** ou **`advanceTimersByTime`** pour **drainer** les timers avant les assertions.

---

## 🧠 7. Snapshots

### 🔍 Définition
Un **snapshot** capture la **représentation** d’un rendu (DOM, objet) à un instant. On valide que le rendu **n’a pas changé** involontairement.

### 💡 Exemple (DOM)
```ts
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';

document.body.innerHTML = `<button>OK</button>`;
expect(document.body).toMatchSnapshot();
```

### ⚠️ Bon usage
- Tenir les snapshots **petits** et **pertinents**.
- **Mettre à jour** en connaissance de cause (`jest -u`).

---

## 🧠 8. Testing Library — Tester le comportement & l’accessibilité

### 🔍 Principes
- Tester comme un **utilisateur**: **rôles**, **texte**, **labels** (pas le DOM interne).
- Préférer `getByRole`, `getByLabelText`, `getByText`.

### 💡 Exemple
```ts
import { getByRole, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

document.body.innerHTML = `
  <form>
    <label for="email">Email</label>
    <input id="email" type="email" />
    <button type="submit">Envoyer</button>
  </form>
`;

const button = getByRole(document.body, 'button', { name: 'Envoyer' });
expect(button).toBeEnabled();

const input = document.getElementById('email')!;
fireEvent.input(input, { target: { value: 'user@example.com' } });
expect(input).toHaveValue('user@example.com');
```

### ✅ Async DOM (apparition après action)
```ts
import { screen } from '@testing-library/dom';
// après interaction, un message apparaît
setTimeout(() => {
  const msg = document.createElement('p');
  msg.textContent = 'Terminé';
  document.body.appendChild(msg);
}, 100);

await expect(screen.findByText('Terminé')).resolves.toBeInTheDocument();
```

### ⚠️ Bonnes pratiques
- **Ne pas** tester les classes CSS; tester **états** et **textes**.
- Préférer les **query par rôle** pour l’accessibilité.

---

## 🧠 9. Organisation & Style des tests

### 💡 AAA (Arrange‑Act‑Assert)
```ts
// Arrange
const xs = [1,2,3];
// Act
const result = xs.reduce((s,x)=>s+x,0);
// Assert
expect(result).toBe(6);
```

### 💡 Given‑When‑Then (BDD)
```ts
// Given
const panier = [];
// When
panier.push('article');
// Then
expect(panier).toHaveLength(1);
```

### ✅ Nommage & structure
- Un fichier `*.test.ts` par module.
- `describe` pour regrouper; `it` pour cas.
- **Données de test** simples et **lisibles**.

---

## 🧠 10. Couverture de code (coverage)

### 🔍 Définition
La **couverture** mesure le pourcentage de **lignes**, **branches**, **fonctions** exécutées par les tests.

### 🛠 Commande
```bash
npm run test:coverage
```

### 🛠 Seuils dans `jest.config`
```js
export default {
  // ...
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 }
  }
};
```

### 🧮 Formule JS (calcul simplifié)
```js
function coveragePercent(covered, total){
  return Math.round((covered / Math.max(1,total)) * 100);
}
console.log('Couverture lignes:', coveragePercent(85, 100), '%');
```

### ⚠️ Attention
- La couverture **n’indique pas** la pertinence des assertions.
- Privilégier des **tests significatifs** et **robustes**.

---

## 🧠 11. TDD — Red → Green → Refactor

### 🔍 Cycle
1. **Red**: écrire un test qui échoue.
2. **Green**: implémenter le minimum pour passer.
3. **Refactor**: améliorer le code (tests restent **verts**).

### 💡 Exemple rapide
```ts
// Test (Red)
expect(isPair(3)).toBe(false);
expect(isPair(4)).toBe(true);
// Implémentation (Green)
function isPair(n:number){ return n % 2 === 0; }
// Refactor éventuel (ex. performances, lisibilité)
```

---

## 🧠 12. Tests de modules des chapitres précédents

### 💡 Algorithmes (Chapitre 4)
```ts
import { mergeSort, quickSort } from './algos';

describe('tri', () => {
  it('mergeSort trie correctement', () => {
    expect(mergeSort([3,1,2])).toEqual([1,2,3]);
  });
  it('quickSort trie correctement', () => {
    const a = [5,4,3,2,1];
    expect(quickSort(a)).toEqual([1,2,3,4,5]);
  });
});
```

### 💡 Store MVC (Chapitre 5)
```ts
import { Store } from './model';
import { EventBus } from './bus';

describe('Store', () => {
  it('ajoute un todo et notifie', () => {
    const bus = new EventBus();
    const store = new Store(bus);
    const handler = jest.fn();
    bus.on('store:update', handler);
    store.add('Lire');
    expect(handler).toHaveBeenCalled();
    expect(store.state().items[0].title).toBe('Lire');
  });
});
```

---

## 🧪 13. Exercices guidés

1. **Assertions**: Ajoutez des cas d’erreur dans `moyenne()` (ex. `NaN`) et testez `toBeNaN`.
2. **Async**: Mockez `fetch` pour simuler un **timeout** via fake timers.
3. **Mocks**: Remplacez une **dépendance de date** par `jest.mock()` et validez un **token** stable.
4. **Snapshots**: Écrivez un snapshot sur un **menu** DOM et mettez‑le à jour suite à une nouvelle entrée.
5. **Testing Library**: Testez un **formulaire** avec `getByRole` et validez `aria-invalid` après une saisie invalide.
6. **Coverage**: Ajoutez des tests pour atteindre **≥ 80%** lignes/fonctions.
7. **TDD**: Implémentez `uniq(xs)` (supprime doublons) en commençant par les tests.

---

## ✅ 14. Check‑list Qualité des tests

- [ ] Tests **rapides** et **isolés** (pas d’I/O réseau réel).
- [ ] Assertions **centrées sur le comportement** (pas sur les détails internes).
- [ ] **Mocks** pertinents et **nettoyés** (`jest.resetAllMocks()` si nécessaire).
- [ ] **Fake timers** maîtrisés et drainés.
- [ ] **Snapshots** concis et mis à jour consciemment.
- [ ] **Coverage** suivie avec des **seuils**.
- [ ] **Watch mode** pour feedback rapide.

---

## 📦 Livrable du chapitre
Un **dossier de tests** complet:
- Tests unitaires pour **algos** (Chapitre 4) et **Store MVC** (Chapitre 5).
- Tests **DOM** avec **Testing Library** (`jsdom`).
- **Coverage** activée avec seuils ≥ 80% lignes/fonctions.
- Scripts npm: `test`, `test:watch`, `test:coverage`.

---

## 🔚 Résumé essentiel du Chapitre 8
- **Jest** fournit runner + assertions + mocks; `jsdom` pour DOM.
- **Testing Library** pousse à tester le **comportement** et l’**accessibilité**.
- Les **mocks/spies/timers** contrôlent les dépendances et le temps.
- Les **snapshots** valident des représentations stables (DOM/objets).
- La **couverture** est un **indicateur** (pas un but absolu); gardez des tests **significatifs**.
- Le **TDD** structure l’écriture de code: Red → Green → Refactor.

---

> Prochain chapitre: **Vue 3 (Composition API) – Bases** — réactivité (`ref`, `reactive`, `computed`, `watch`), composants, props/emits et directives.
