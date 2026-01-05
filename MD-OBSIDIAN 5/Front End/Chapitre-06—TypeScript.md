
# 📘 Chapitre 6 — TypeScript Fondamentaux & Migration depuis JS

> 🎯 **Objectifs du chapitre**
> - Comprendre les **bases de TypeScript** (types primitifs, objets, interfaces, unions/intersections, generics, utilitaires).
> - Pratiquer le **narrowing** (affinage des types), les **type guards**, `unknown` vs `any`, `never`, `void`, `satisfies`.
> - Configurer un projet avec **`tsconfig.json`** en **mode strict** et compiler avec `tsc`.
> - Typer le **DOM**, les **APIs Web**, et les fonctions **asynchrones**.
> - **Migrer** progressivement un code JS vers TS: `allowJs`, `checkJs` + JSDoc, fichiers `d.ts`, conversion .js → .ts.
> - Refactorer le **mini‑framework MVC** du Chapitre 5 en **TypeScript** strict.

---

## 🧠 1. Pourquoi TypeScript ?

### 🔍 Définition
**TypeScript (TS)** est un **sur‑ensemble** de JavaScript qui ajoute un **système de types** statique, compilé vers JS standard.

### ❓ Pourquoi
- **Détection anticipée** d’erreurs (autocomplétion, vérification des contrats).
- **Lisibilité** et **maintenabilité** accrues via interfaces & generics.
- **Refactors sûrs** vàv d’API en évolution.

### 💡 Exemple — Contrat explicite vs implicite
```ts
// JavaScript (implicite)
function total(prix, quantite) { return prix * quantite; }

// TypeScript (explicite)
function total(prix: number, quantite: number): number { return prix * quantite; }
```

---

## 🧠 2. Mise en place & `tsconfig.json`

### 🛠 Initialisation
Dans un projet Node (ou front), placez un `tsconfig.json` à la racine.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["dom", "node"]
  },
  "include": ["src"]
}
```

> ℹ️ **`strict: true`** active un ensemble d’options (dont `noImplicitAny`, `strictNullChecks`) pour un typage **rigoureux**.

### 💡 Compilation
```bash
# compiler
npx tsc --project tsconfig.json
# watcher
npx tsc -w
```

---

## 🧠 3. Types de base & alias

### 🔍 Primitifs & objets
```ts
let nom: string = 'Eric';
let age: number = 34;
let actif: boolean = true;
let id: bigint = 42n;
let sym: symbol = Symbol('k');
let rien: null = null;
let indef: undefined = undefined;

// Objet simple
type User = { id: string; name: string; active?: boolean };
const u: User = { id: 'u1', name: 'Eric' };
```

### ✅ Alias & interfaces
```ts
type Point = { x: number; y: number };
interface HasId { id: string }
interface UserWithId extends HasId { name: string; active?: boolean }
```

---

## 🧠 4. Unions, Intersections & Littéraux

### 🔍 Définition
- **Union** `A | B`: valeur de **l’un ou l’autre** type.
- **Intersection** `A & B`: valeur qui respecte **les deux**.
- **Littéraux**: valeurs **concrètes** (`'SUCCESS'`, `42`).

### 💡 Exemple
```ts
type Status = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
function setStatus(s: Status) { /* ... */ }

type Identifiable = { id: string };
type Timestamped = { createdAt: Date };
type Entity = Identifiable & Timestamped;
```

### 🧠 Narrowing (affinage) & garde de type
```ts
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(0));
  }
}

// Discriminated unions
type Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r * s.r;
    case 'rect': return s.w * s.h;
  }
}
```

---

## 🧠 5. `unknown` vs `any`, `never`, `void`, assertions & `satisfies`

### 🔍 Définition
- **`any`**: désactive le typage (à éviter).
- **`unknown`**: type **inconnu** qui **exige** un **narrowing** avant usage.
- **`never`**: valeur impossible (ex. exceptions, boucles infinies).
- **`void`**: absence de valeur de retour.

### 💡 Exemples
```ts
function parse(json: string): unknown { return JSON.parse(json); }
function assertIsUser(x: unknown): asserts x is User {
  if (typeof x !== 'object' || x === null || !('id' in x) || !('name' in x)) {
    throw new Error('Not a User');
  }
}

const data = parse('{"id":"u1","name":"Eric"}');
assertIsUser(data); // après cette ligne, data est typé User
console.log(data.name);

// never
function fail(msg: string): never { throw new Error(msg); }

// satisfies (vérifie le *contrat* sans changer le type de v)
const palette = {
  primary: '#0b57d0',
  danger: '#b00020'
} satisfies Record<string, string>;
```

---

## 🧠 6. Fonctions, paramètres, overloads

### ✅ Paramètres optionnels & défauts
```ts
function greet(name: string, title = 'M.') { return `Bonjour ${title} ${name}`; }
```

### 💡 Overloads (signatures multiples)
```ts
function len(x: string): number;
function len(x: any[]): number;
function len(x: unknown): number { return (x as any).length; }
```

### 🧠 Fonctions génériques
```ts
function first<T>(xs: T[]): T | undefined { return xs[0]; }
function map2<A,B>(xs: A[], f: (a: A) => B): B[] { return xs.map(f); }
```

---

## 🧠 7. Generics, utilitaires & mapped types

### 💡 Generics avec contraintes
```ts
function prop<T extends object, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
```

### 📦 Types utilitaires
```ts
type User = { id: string; name: string; active?: boolean };

type ReadonlyUser = Readonly<User>;
type RequiredUser = Required<User>;
type UserPreview = Pick<User, 'id' | 'name'>;
type NoActive = Omit<User, 'active'>;
type UserMap = Record<string, User>;
```

### 🧠 Mapped & Conditional Types
```ts
type Flags<T> = { [K in keyof T]: boolean };

type Result<T> = T extends string ? { kind: 'text'; value: string }
  : T extends number ? { kind: 'num'; value: number }
  : { kind: 'unknown' };

// infer
type ElementType<T> = T extends (infer U)[] ? U : T;
```

---

## 🧠 8. Classes, interfaces & modules ES

### 💡 Classes avec visibilité
```ts
class Rectangle {
  #id = Math.random().toString(36).slice(2); // champ privé JS
  protected _w: number; protected _h: number;
  constructor(w: number, h: number) { this._w = w; this._h = h; }
  get area() { return this._w * this._h; }
}
```

### ✅ Interfaces & implémentations
```ts
interface Printable { print(): string }
class Invoice implements Printable { constructor(private total: number){} print(){ return `${this.total.toFixed(2)} €`; } }
```

### 🛠 Modules ES & `import type`
```ts
// utils.ts
export type Id = string;
export function uid(): Id { return Math.random().toString(36).slice(2); }

// consumer.ts
import type { Id } from './utils';
import { uid } from './utils';
const id: Id = uid();
```

---

## 🧠 9. Typage du DOM & des APIs Web

### 💡 Sélecteurs & événements
```ts
const btn = document.querySelector<HTMLButtonElement>('#save');
btn?.addEventListener('click', (e: MouseEvent) => { console.log(e.clientX); });
```

### 🛠 FormData & fetch
```ts
async function submit(form: HTMLFormElement): Promise<void> {
  const payload = Object.fromEntries(new FormData(form).entries());
  const res = await fetch('/api/save', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
```

### 🧮 Contrats JSON (runtime + TS)
```ts
type UserDTO = { id: string; name: string };
function isUserDTO(x: unknown): x is UserDTO {
  return typeof x === 'object' && x !== null && 'id' in x && 'name' in x;
}
```

---

## 🧠 10. Asynchronicité & Promises typées

### 💡 `async`/`await` avec types
```ts
async function getUsers(): Promise<User[]> { /* ... */ return []; }
```

### 🛠 `Promise.all` & `allSettled`
```ts
const [a, b] = await Promise.all<[User[], User[]]>([getUsers(), getUsers()]);
const settled = await Promise.allSettled([getUsers(), getUsers()]);
```

### 🧮 Formule (retry exponentiel, typée)
```ts
async function retry<T>(fn: () => Promise<T>, max = 5, baseMs = 200, factor = 2): Promise<T> {
  for (let attempt = 0; attempt < max; attempt++) {
    try { return await fn(); } catch (e) {
      const jitter = Math.random() * 50;
      const delay = baseMs * Math.pow(factor, attempt) + jitter;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Échecs répétés');
}
```

---

## 🧠 11. Migration progressive depuis JavaScript

### 🗺 Stratégie étape par étape
1. **Activer TS sans conversion**: `tsconfig.json` avec `allowJs: true`, `checkJs: true` pour **analyser** les `.js` existants.
2. **Doc de types avec JSDoc**: annoter les fonctions JS pour aider l’inférence TS.
3. **Corriger les erreurs**: ajouter **type guards**, `/** @typedef */`, créer des **fichiers `.d.ts`** pour contrats partagés.
4. **Convertir fichier par fichier**: `.js` → `.ts`, remplacer `require` par `import`, ajouter types manquants.
5. **Activer `strict`**: corriger `any`, `null/undefined`, unions, etc.
6. **Intégration tooling**: ajouter ESLint config TS + tests Jest (chapitre 8).

### 💡 JSDoc (avant conversion)
```js
/**
 * @typedef {{ id: string, name: string, active?: boolean }} User
 */
/**
 * @param {User[]} users
 * @param {(u: User) => boolean} predicate
 */
function filterUsers(users, predicate) { return users.filter(predicate); }
```

### 💡 Déclarations d’ambiance (`.d.ts`)
```ts
// types.d.ts (inclus par tsconfig via "include")
declare module 'config' {
  export type Env = 'dev' | 'prod';
  export interface AppConfig { apiUrl: string; }
}
```

---

## 🧠 12. Migration du mini‑framework MVC (Chapitre 5) vers TS

### 📦 bus.ts
```ts
export class EventBus {
  private map = new Map<string, Set<(detail: unknown) => void>>();
  on<T>(type: string, h: (detail: T) => void) {
    const set = this.map.get(type) ?? new Set(); set.add(h as any); this.map.set(type, set);
  }
  emit<T>(type: string, detail: T) {
    for (const h of this.map.get(type) ?? []) (h as (d: T) => void)(detail);
  }
}
```

### 📦 model.ts
```ts
import { EventBus } from './bus';
export type Todo = { id: string; title: string; done: boolean };
export type Filter = 'ALL' | 'DONE' | 'TODO';
export type State = { items: Todo[]; filter: Filter };

export class Store {
  private items: Todo[] = []; private filter: Filter = 'ALL';
  constructor(private bus: EventBus) {}
  add(title: string) { this.items.push({ id: crypto.randomUUID(), title, done: false }); this.bus.emit<State>('store:update', this.state()); }
  toggle(id: string) { const it = this.items.find(x => x.id === id); if (it) { it.done = !it.done; this.bus.emit<State>('store:update', this.state()); } }
  setFilter(f: Filter) { this.filter = f; this.bus.emit<State>('store:update', this.state()); }
  state(): State { return { items: [...this.items], filter: this.filter }; }
}
```

### 📦 view.ts
```ts
import type { State } from './model';
import { EventBus } from './bus';

export class View {
  constructor(private root: HTMLElement, private bus: EventBus) {
    bus.on<State>('store:update', s => this.render(s));
  }
  render({ items, filter }: State) {
    const filtered = items.filter(i => filter === 'ALL' ? true : (filter === 'DONE' ? i.done : !i.done));
    this.root.innerHTML = `
      <div class="filters">
        <button data-f="ALL">Tous</button>
        <button data-f="DONE">Faits</button>
        <button data-f="TODO">À faire</button>
      </div>
      <ul class="todos">${filtered.map(i => `
        <li class="todo" data-id="${i.id}">
          <label><input type="checkbox" ${i.done ? 'checked' : ''}/> ${i.title}</label>
        </li>`).join('')}</ul>`;
  }
}
```

### 📦 controller.ts
```ts
import { Store } from './model';
export class Controller {
  constructor(private store: Store) {}
  bind(root: HTMLFormElement) {
    root.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (e.target as HTMLFormElement).elements.namedItem('title') as HTMLInputElement;
      const val = title.value.trim(); if (val) this.store.add(val); (e.target as HTMLFormElement).reset();
    });
    root.addEventListener('change', (e) => {
      const li = (e.target as HTMLElement).closest<HTMLLIElement>('.todo'); if (li) this.store.toggle(li.dataset.id as string);
    });
    root.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-f]'); if (b) this.store.setFilter(b.dataset.f as any);
    });
  }
}
```

### 📦 main.ts
```ts
import { EventBus } from './bus';
import { Store } from './model';
import { View } from './view';
import { Controller } from './controller';

const bus = new EventBus();
const store = new Store(bus);
const view = new View(document.getElementById('list') as HTMLElement, bus);
const ctrl = new Controller(store);
ctrl.bind(document.getElementById('app') as HTMLFormElement);
```

### ✅ Points clés de la migration
- **Types explicites** (State, Filter, Todo) pour clarifier le contrat.
- **`import type`** pour éviter d’inclure du code lors d’imports de types.
- **Narrowing DOM** avec **génériques** `querySelector<...>` et **assertions** prudentes.

---

## 🧪 13. Exercices guidés

1. **Unions**: Créez un type `Result` discriminé (`ok`|`err`) et une fonction `match`.
2. **Generics**: Écrivez `uniq<T>` qui supprime les doublons d’un tableau via `Set`.
3. **Mapped Types**: Implémentez `DeepPartial<T>` (niveau 1 d’abord), testez sur un objet imbriqué.
4. **Conditional**: Écrivez `Promised<T>` qui extrait le type résolu d’une `Promise<T>`.
5. **DOM**: Typifiez un composant `Modal` (props, callbacks) avec `HTMLElement` générique.
6. **JSDoc**: Ajoutez JSDoc à un fichier `.js`, activez `checkJs` et corrigez les erreurs.
7. **Migration**: Convertissez `view.js` du Chapitre 5 en `view.ts` avec `import type`.

---

## ✅ 14. Check‑list TypeScript rapide

- [ ] **`strict: true`** activé.
- [ ] Éviter `any`; préférer `unknown` + **type guards**.
- [ ] Utiliser **unions discriminés** et **littéraux** pour états.
- [ ] Factoriser avec **generics** et **types utilitaires**.
- [ ] Typage **DOM** explicite (`querySelector<...>`).
- [ ] **Modules ES** + `import type` pour types only.
- [ ] **JSDoc** et `checkJs` pour migration progressive.
- [ ] Créer des **`.d.ts`** pour contrats globaux.

---

## 📦 Livrable du chapitre
Refactor complet du **mini‑framework MVC** en **TypeScript strict**, compilé via `tsc`, avec un `tsconfig.json` robuste et des types explicites.

---

## 🔚 Résumé essentiel du Chapitre 6
- TypeScript ajoute un **système de types** à JS qui **sécurise** les API et **facilite** les refactors.
- La configuration via **`tsconfig.json`** (mode **strict**) est fondamentale pour éviter les zones grises.
- Les **unions**, **intersections**, **generics**, **mapped**/**conditional** types permettent de modéliser des contrats réalistes.
- Les **type guards**, `unknown`, `never`, `satisfies` aident à écrire un code **sûr** et **expressif**.
- La **migration progressive** (JSDoc + `checkJs`, `.d.ts`, conversion ciblée) minimise le risque et le coût.
- Le **DOM** et l’**asynchronicité** se typent naturellement (événements, `fetch`, `Promise`), rendant l’ensemble cohérent.

---

> Prochain chapitre: **Tooling Pro: Node.js, npm, scripts & Webpack** — intégration de TypeScript avec Webpack, Babel, ESLint/Prettier, et optimisation du pipeline.
