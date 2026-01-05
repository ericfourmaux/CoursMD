
# 📘 Chapitre 10.3 — Tests UI avec React + Testing Library

> **Niveau** : Intermédiaire — **Objectif** : tester des **composants React** avec **Testing Library** (RTL), **Jest**, **jest-dom**, **user-event** et **MSW** (Mock Service Worker). Au programme : **render** contrôlé, **queries** accessibles, **événements utilisateurs**, **mocks HTTP**, **providers** (Context/Router), **snapshots** (avec parcimonie), **couverture** et **CI**.

---

## 🎯 Objectifs d’apprentissage
- Configurer Jest + RTL pour un projet **TypeScript** (DOM virtuel via **jsdom**).
- Écrire des tests **accessibles** avec `getByRole`, `getByLabelText`, `findBy...` (asynchronisme).
- Simuler des **interactions réelles** (`user-event`) : clic, clavier, saisie, tabulation.
- **Mocker** des appels réseau avec **MSW** (handlers par scénario, erreurs). 
- Tester composants avec **providers** (Context, Router) via **render utilitaire**.
- Mesurer **couverture**, fixer des **seuils**, intégrer en **CI**.

---

## 🧰 Installation

```bash
# React + tests
npm i -D jest @types/jest jest-environment-jsdom \
         @testing-library/react @testing-library/jest-dom @testing-library/user-event \
         msw \
         babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

> *Si tu utilises `ts-jest`, remplace `babel-jest` par `ts-jest` et adapte la config comme au Chapitre 10.2.*

---

## 🗂️ Arborescence recommandée

```
frontend/
  ├─ src/
  │   ├─ components/
  │   │   ├─ ProductCard.tsx
  │   │   └─ ProductList.tsx
  │   ├─ api/
  │   │   └─ products.ts
  │   ├─ context/
  │   │   └─ ThemeContext.tsx
  │   ├─ App.tsx
  │   └─ index.tsx
  ├─ tests/
  │   ├─ ProductCard.test.tsx
  │   ├─ ProductList.test.tsx
  │   └─ test-utils.tsx
  ├─ jest.config.ts
  ├─ babel.config.js
  ├─ jest.setup.ts
  └─ package.json
```

---

## ⚙️ Configuration Jest + RTL

### `jest.config.ts`
```ts
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: { '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest' },
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: { global: { branches: 80, functions: 85, lines: 85, statements: 85 } }
};

export default config;
```

### `babel.config.js`
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    ['@babel/preset-typescript']
  ]
};
```

### `jest.setup.ts`
```ts
import '@testing-library/jest-dom';
import { server } from './tests/msw-server';

// MSW : démarrer avant chaque test
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### `tests/msw-server.ts`
```ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/products', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Mouse', price: 29.9 }
    ]));
  })
);
```

---

## 💡 Composants & tests — exemples

### 1) `ProductCard.tsx` — composant accessible
```tsx
type Props = { name: string; price: number; onAdd?: () => void };
export function ProductCard({ name, price, onAdd }: Props) {
  return (
    <article aria-label={name} className="card">
      <h2>{name}</h2>
      <p>
        <span aria-label="price">{price.toFixed(2)} $</span>
      </p>
      <button type="button" onClick={onAdd}>Ajouter au panier</button>
    </article>
  );
}
```

#### Test — `ProductCard.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/components/ProductCard';

test('affiche nom et prix, bouton cliquable', async () => {
  const user = userEvent.setup();
  const onAdd = jest.fn();
  render(<ProductCard name="Laptop" price={999} onAdd={onAdd} />);

  // Queries accessibles
  expect(screen.getByRole('heading', { level: 2, name: /laptop/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/price/i)).toHaveTextContent('999.00 $');

  await user.click(screen.getByRole('button', { name: /ajouter au panier/i }));
  expect(onAdd).toHaveBeenCalledTimes(1);
});
```

---

### 2) `ProductList.tsx` — chargement asynchrone (MSW)
```tsx
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/api/products';
import { ProductCard } from '@/components/ProductCard';

type Product = { id: number; name: string; price: number };

export function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setItems(data);
      } catch (e) {
        setError('Impossible de charger');
      }
    })();
  }, []);

  if (error) return <div role="alert">{error}</div>;
  if (items.length === 0) return <div>Chargement...</div>;

  return (
    <section aria-label="products">
      {items.map(p => <ProductCard key={p.id} name={p.name} price={p.price} />)}
    </section>
  );
}
```

### `src/api/products.ts`
```ts
export async function fetchProducts() {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
```

#### Tests — `ProductList.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { server } from './msw-server';
import { ProductList } from '@/components/ProductList';

test('affiche la liste chargée', async () => {
  render(<ProductList />);
  // findBy... attend que l'élément apparaisse (promesse)
  const cards = await screen.findAllByRole('article');
  expect(cards).toHaveLength(2);
  expect(screen.getByRole('region', { name: /products/i })).toBeInTheDocument();
});

test('affiche une erreur si le serveur renvoie 500', async () => {
  server.use(rest.get('/api/products', (_req, res, ctx) => res(ctx.status(500))));
  render(<ProductList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/impossible de charger/i);
});
```

---

## 🧰 Utilitaires de test — providers & router

### `tests/test-utils.tsx`
```tsx
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);

export const renderWithProviders = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) => {
  return render(ui, { wrapper: Providers, ...options });
};
```

> **Astuce** : centralise `ThemeProvider`, `Router`, `QueryClientProvider`, etc., pour des tests propres.

---

## 📏 Bonnes pratiques (Testing Library)
- **Accès par rôle/label** : favorise `getByRole`, `getByLabelText`, `getByPlaceholderText` → **accessibilité**.
- **Asynchronisme** : utilise `findBy` et `waitFor` pour attendre **DOM** ou **promesses**.
- **Interactions réalistes** : `user-event` simule **clavier**, **clic**, **tab**, **copier/coller**.
- **Snapshots** : limiter aux **petits** arbres stables; préférer assertions sémantiques.
- **Nettoyage** : RTL nettoie le DOM **après chaque test**; évite les **leaks**.

---

## ⏱️ Scripts & CI

### `package.json`
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### GitHub Actions (extrait)
```yaml
name: Front React Tests
on:
  pull_request:
    branches: [ main, develop ]

jobs:
  react-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:cov
      - uses: actions/upload-artifact@v4
        with: { name: jest-coverage, path: coverage }
```

---

## 🧪 Tests / Vérifications (rapides)
```bash
# 1) Lancer les tests
npm run test

# 2) Voir la couverture
npm run test:cov
open coverage/lcov-report/index.html

# 3) Simuler une erreur serveur
# (dans ProductList.test) server.use(rest.get('/api/products', ...ctx.status(500)))
# → vérifier qu'un <div role="alert"> apparaît
```

---

## ⚠️ Pièges fréquents
- **Mélange Babel/ts-jest** : choisir **un** transformer.
- **Queries non accessibles** : éviter `getByTestId` par défaut; préférer **rôle/label**.
- **Attentes impatientes** : ne pas `await` `getBy...` (synchrone); utiliser `findBy...` pour **async**.
- **user-event** non configuré : utilise `userEvent.setup()` pour timers & events **fiables**.
- **MSW** non reset : appelle `server.resetHandlers()` après chaque test.
- **fake timers** + Promises : `await` les microtasks (`await Promise.resolve()`) avant `advanceTimersByTime`.

---

## 🧮 Formules (en JavaScript)
- **Temps de rendu moyen (naïf) sur N tests** :
```javascript
const avgRenderMs = (samples) => samples.reduce((s,x)=>s+x,0)/Math.max(1,samples.length);
```
- **Taux de réussite** :
```javascript
const passRate = (passed, total) => passed / Math.max(1, total);
```

---

## 📌 Résumé essentiel
- **RTL** centre les tests sur l’**utilisateur** : requêtes **accessibles** et interactions **réalistes** (`user-event`).
- **MSW** rend les tests **fiables** pour les appels réseau (succès/erreur) **sans serveur réel**.
- **Providers** via un utilitaire `renderWithProviders` simplifient les tests de composants complexes.
- Garde les **snapshots** pour le strict **nécessaire**; **mesure** la couverture et intègre aux **pipelines CI**.
