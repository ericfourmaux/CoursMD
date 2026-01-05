# Mini‑ebook TypeScript (📘 complet + 🧪 exercices)

> Un guide pratique et progressif pour apprendre TypeScript, avec explications détaillées, exemples réalistes et exercices corrigés. Tout le code est **prêt à copier-coller**.

---

## Table des matières

1. Introduction à TypeScript
2. Installation & Configuration
3. Types de base
4. Littéraux, unions, intersections
5. Objets, interfaces & `type`
6. Tableaux, tuples, enums
7. Fonctions, paramètres & surcharges
8. Narrowing & type guards
9. Génériques
10. Types utilitaires & avancés
11. Modules, import/export
12. Classes & héritage
13. Async/await, Promises & API
14. Gestion des erreurs & `unknown`
15. Tooling (ESLint, Prettier, tests)
16. TypeScript avec Node & Express
17. TypeScript avec React
18. Architecture & patterns
19. Options clés du `tsconfig`
20. Mini‑projet (Node) — API Todo
21. Mini‑projet (React) — Filtre produits
22. Quiz & Annexes

---

## 1) Introduction à TypeScript

**TypeScript (TS)** est une surcouche de JavaScript qui apporte le **typage statique**, des **outils de développement** puissants, et compile en JavaScript standard (ES). Il aide à:

- Détecter les erreurs **avant l’exécution** (compilation)
- Améliorer la maintenabilité et le **refactoring**
- Faciliter la collaboration sur des projets **long terme**

> TS fonctionne partout où JS fonctionne: navigateur, Node.js, React, etc.

---

## 2) Installation & Configuration

### Créer un projet TypeScript minimal

```bash
mkdir cours-typescript && cd cours-typescript
npm init -y
npm install --save-dev typescript
npx tsc --init
```

Exemple de `tsconfig.json` **recommandé**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

> Si vous utilisez **ES Modules** en Node, ajoutez `"type": "module"` dans `package.json`.

### Compiler & exécuter

```bash
# src/index.ts
npx tsc
node dist/index.js
```

Option rapide (dev):

```bash
npm i -D ts-node
npx ts-node src/index.ts
```

---

## 3) Types de base

```ts
let nom: string = "Eric";
let age: number = 34;
let actif: boolean = true;
let rien: null = null;
let indefini: undefined = undefined;

// any : désactive le typage (à éviter)
let data: any = "n'importe quoi";

// unknown : plus sûr que any
let x: unknown = "abc";
if (typeof x === "string") {
  console.log(x.toUpperCase());
}

// void : fonction sans retour
function log(msg: string): void {
  console.log(msg);
}

// never : n'arrive jamais (erreur, boucle infinie)
function erreur(message: string): never {
  throw new Error(message);
}
```

**Bonnes pratiques**
- Évitez `any` ➜ préférez `unknown` + vérifications.
- Activez `strict` dans `tsconfig.json`.

---

## 4) Littéraux, unions, intersections

### Littéraux & unions
```ts
type Status = "idle" | "loading" | "success" | "error"; // littéraux
let s: Status = "idle";

type ID = string | number; // union
```

### Intersections
```ts
type Horodatage = { createdAt: Date };
type Identifiable = { id: string };
type Ressource = Horodatage & Identifiable; // intersection
const r: Ressource = { id: "42", createdAt: new Date() };
```

---

## 5) Objets, interfaces & `type`

```ts
// Interface
interface Utilisateur {
  id: string;
  nom: string;
  age?: number;          // optionnel
  readonly email: string; // immuable
}

// Type alias
type Produit = {
  id: string;
  prix: number;
  tags?: string[];
};

// Index signature
type Dictionnaire = {
  [key: string]: number;
};
```

**Interface vs type**
- `interface`: idéal pour API publiques, extensibles (déclaration fusion).
- `type`: puissant pour unions/intersections/mapped/conditionnels.

### 🧪 Exercices (Objets & Types)

1) Définir `Article` avec: `id:string` (readonly), `titre:string`, `contenu:string`, `tags?:string[]`, `auteur:{id:string; nom:string}`.
2) Créer `resume(article: Article): string` ➜ `"[titre] par [nom]"`.
3) Tester l’erreur sur modification de `id`.

**Correction**
```ts
type Auteur = { id: string; nom: string };

type Article = {
  readonly id: string;
  titre: string;
  contenu: string;
  tags?: string[];
  auteur: Auteur;
};

function resume(article: Article): string {
  return `${article.titre} par ${article.auteur.nom}`;
}

const a: Article = {
  id: "a1",
  titre: "TS pour tous",
  contenu: "Contenu...",
  auteur: { id: "u1", nom: "Eric" },
};

console.log(resume(a));
// a.id = "x"; // ❌ Erreur: read-only
```

---

## 6) Tableaux, tuples, enums

```ts
const nombres: number[] = [1, 2, 3];

type Coord = [number, number]; // tuple
const c: Coord = [48.85, 2.35];

// Enum (préférez unions littérales en UI)
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}
const r: Role = Role.Admin;

// Const enum (inline)
const enum Code {
  Ok = 200,
  NotFound = 404,
}
const statusCode = Code.Ok;
```

---

## 7) Fonctions, paramètres & surcharges

```ts
function addition(a: number, b: number): number {
  return a + b;
}

function greet(name: string, uppercase = false): string {
  const msg = `Bonjour ${name}`;
  return uppercase ? msg.toUpperCase() : msg;
}

// Paramètres rest
function somme(...vals: number[]): number {
  return vals.reduce((acc, v) => acc + v, 0);
}

// Surcharges
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): string | number {
  return typeof input === "string" ? Number(input) : String(input);
}
```

**Piège**: éviter les `any` implicites, gérer `undefined` avec `strictNullChecks`.

---

## 8) Narrowing & type guards

```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // string
  } else {
    console.log(id.toFixed(0)); // number
  }
}

// Discriminated unions
type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function render(state: LoadState): string {
  switch (state.status) {
    case "idle":
      return "En attente";
    case "loading":
      return "Chargement...";
    case "success":
      return `Données: ${state.data}`;
    case "error":
      return `Erreur: ${state.error.message}`;
    default: {
      const _exhaustive: never = state; // ✅ exhaustive check
      return _exhaustive;
    }
  }
}
```

---

## 9) Génériques (generics)

```ts
function identite<T>(val: T): T {
  return val;
}

function wrap<T>(value: T): { value: T } {
  return { value };
}

interface ApiResponse<T> {
  status: number;
  data: T;
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
```

**Contraintes**: `K extends keyof T`, `T extends object` etc.

---

## 10) Types utilitaires & avancés

### Utilitaires courants
```ts
type A = { x: number; y?: string };

type A_Partial = Partial<A>;
type A_Required = Required<A>;
type A_Readonly = Readonly<A>;
type A_Pick = Pick<A, "x">;
type A_Omit = Omit<A, "y">;
type Dict = Record<string, number>;
type Ret = ReturnType<() => number>;
type Params = Parameters<(a: string, b: number) => void>;
type NonNull = NonNullable<string | null | undefined>; // string
```

### `keyof`, `typeof`, templates
```ts
const config = { host: "localhost", port: 3000 };
type Cfg = typeof config;
type CfgKeys = keyof Cfg; // "host" | "port"

type Route = `/api/${"users" | "posts"}/${string}`; // ex: /api/users/42
```

### Types conditionnels + `infer`
```ts
type Result<T> = T extends Promise<infer U> ? U : T;

type A1 = Result<Promise<string>>; // string
type A2 = Result<number>; // number
```

### `satisfies` (valider sans perdre l’inférence)
```ts
const theme = {
  primary: "#0044ff",
  secondary: "#00cc88",
} satisfies Record<string, string>;

const colors = ["red", "green", "blue"] as const;
type Color = (typeof colors)[number]; // "red" | "green" | "blue"
```

---

## 11) Modules, import/export

```ts
// src/math.ts
export function add(a: number, b: number) {
  return a + b;
}
export const PI = 3.14159;

// src/index.ts
import { add, PI } from "./math.js"; // Node ESM ➜ extension .js après build
console.log(add(2, PI));
```

> Utilisez les **ES Modules** modernes (import/export). Les namespaces sont historiques.

---

## 12) Classes & héritage

```ts
class Personne {
  #secret = "abc"; // champ privé JS (runtime)
  public nom: string;
  protected age: number;
  private _id: string;

  constructor(nom: string, age: number, id: string) {
    this.nom = nom;
    this.age = age;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  anniversaire(): void {
    this.age++;
  }
}

class Employe extends Personne {
  constructor(nom: string, age: number, id: string, public poste: string) {
    super(nom, age, id);
  }
}
```

**Note**: `private` TS vs `#privé` JS — `#` est privé au runtime.

---

## 13) Async/await, Promises & API

```ts
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

type UserDTO = { id: number; name: string };

async function main() {
  const user = await fetchJson<UserDTO>("https://api.example.com/users/1");
  console.log(user.name);
}
```

> TS ne valide pas les données au runtime. Pour les I/O externes, utilisez **Zod** ou **io-ts** pour valider.

### 🧪 Exercices (Génériques & Async)

1) `mapAsync<T, U>(items: T[], fn: (x: T) => Promise<U>): Promise<U[]>`
2) `Result<T> = { ok: true; value: T } | { ok: false; error: Error }` + `toResult<T>(p: Promise<T>): Promise<Result<T>>`

**Correction**
```ts
async function mapAsync<T, U>(items: T[], fn: (x: T) => Promise<U>): Promise<U[]> {
  const out: U[] = [];
  for (const item of items) {
    out.push(await fn(item));
  }
  return out;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

async function toResult<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const v = await promise;
    return { ok: true, value: v };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, error: err };
  }
}
```

---

## 14) Gestion des erreurs & `unknown`

```ts
function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined; // ou never throw ici
  }
}

function isUser(obj: unknown): obj is { id: number; name: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    typeof (obj as any).id === "number" &&
    typeof (obj as any).name === "string"
  );
}
```

**Bonnes pratiques**
- Typage des erreurs: `catch (e: unknown)` ➜ vérifier `instanceof Error`.
- Ne pas supposer les types des entrées externes.

---

## 15) Tooling (ESLint, Prettier, tests)

### ESLint + TypeScript
```bash
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

`.eslintrc.cjs`
```js
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  }
};
```

### Prettier
```bash
npm i -D prettier eslint-config-prettier
```

### Tests (ex: Vitest)
```bash
npm i -D vitest ts-node
```

Exemple de test:
```ts
import { describe, it, expect } from "vitest";
import { addition } from "./math";

describe("addition", () => {
  it("additionne deux nombres", () => {
    expect(addition(2, 3)).toBe(5);
  });
});
```

### 🧪 Exercices (Tooling)

1) Configurez ESLint & Prettier, corrigez les warnings d’un fichier TS.
2) Écrivez un test pour `addition(a,b)`.

---

## 16) TypeScript avec Node & Express

```bash
npm i express
npm i -D @types/express
```

```ts
import express, { Request, Response } from "express";
const app = express();
app.use(express.json());

type CreateUserBody = { name: string };

app.post("/users", (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ id: 1, name });
});

app.listen(3000, () => console.log("API sur http://localhost:3000"));
```

> Typage des `req.params`, `req.query`, `req.body` via les generics `Request<P, ResBody, ReqBody, ReqQuery>`.

---

## 17) TypeScript avec React

Créer un projet vite (React + TS):

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm i
npm run dev
```

Composant de base:
```tsx
type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({ onClick, children, variant = "primary" }: ButtonProps) {
  const cls = variant === "primary" ? "btn btn-primary" : "btn btn-secondary";
  return <button className={cls} onClick={onClick}>{children}</button>;
}
```

Bonnes pratiques React+TS:
- Typage des props via `type`/`interface`.
- Éviter `React.FC` pour props implicites.
- Unions discriminées pour variantes complexes.

### 🧪 Exercices (React)

1) Composant `Avatar` avec props `{src:string; alt:string; size?: "sm"|"md"|"lg"}`.
2) Hook `useFetch<T>(url:string): {loading:boolean; data?:T; error?:Error}`.

**Correction**
```tsx
type AvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
};
export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  const px = size === "sm" ? 24 : size === "md" ? 40 : 64;
  return <img src={src} alt={alt} width={px} height={px} />;
}

import { useEffect, useState } from "react";
export function useFetch<T>(url: string) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (alive) setData(json);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [url]);

  return { loading, data, error };
}
```

---

## 18) Architecture & patterns

- DTO + validation runtime (Zod) pour flux API.
- Discriminated unions pour états (`loading/success/error`).
- `switch` exhaustif + `never` pour ne rien oublier.
- `satisfies` pour objets de config sans perdre l’inférence.
- Préférer unions littérales aux enums en UI.
- Séparer types publics (API) des types internes.

### 🧪 Exercices (Patterns)

1) Machine d’état `AuthState`: `"loggedOut" | "loggingIn" | "loggedIn" | "error"`.
2) `transition(state, event)` avec événements exhaustifs.

**Correction (synthèse)**
```ts
type AuthState =
  | { status: "loggedOut" }
  | { status: "loggingIn"; username: string }
  | { status: "loggedIn"; user: { id: number; name: string } }
  | { status: "error"; error: Error };

type AuthEvent =
  | { type: "startLogin"; username: string }
  | { type: "success"; user: { id: number; name: string } }
  | { type: "fail"; error: Error }
  | { type: "logout" };

function transition(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case "startLogin":
      return { status: "loggingIn", username: event.username };
    case "success":
      return { status: "loggedIn", user: event.user };
    case "fail":
      return { status: "error", error: event.error };
    case "logout":
      return { status: "loggedOut" };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
```

---

## 19) Options clés du `tsconfig`

- `"strict": true` ➜ vérifications strictes (recommandé)
- `"noImplicitAny": true` ➜ interdit les `any` implicites
- `"strictNullChecks": true` ➜ oblige à gérer `null/undefined`
- `"noUncheckedIndexedAccess": true` ➜ `arr[i]` peut être `undefined`
- `"esModuleInterop": true` ➜ imports CommonJS plus simples
- `"skipLibCheck": true` ➜ plus rapide (ignore d.ts des libs)

---

## 20) Mini‑projet (Node) — API Todo

**Objectif**: API CRUD de tâches, simple et typée.

```ts
// src/types.ts
export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

// src/store.ts
import { Todo } from "./types.js";
const todos = new Map<string, Todo>();

export const store = {
  list(): Todo[] { return Array.from(todos.values()); },
  add(title: string): Todo {
    const id = Math.random().toString(36).slice(2);
    const t: Todo = { id, title, done: false };
    todos.set(id, t);
    return t;
  },
  toggle(id: string): Todo | undefined {
    const t = todos.get(id);
    if (!t) return;
    t.done = !t.done;
    return t;
  },
  remove(id: string): boolean {
    return todos.delete(id);
  }
};

// src/server.ts
import express, { Request, Response } from "express";
import { store } from "./store.js";
const app = express();
app.use(express.json());

app.get("/todos", (_req, res) => res.json(store.list()));
app.post("/todos", (req: Request<{}, {}, { title: string }>, res: Response) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).json({ error: "title requis" });
  const t = store.add(title);
  res.status(201).json(t);
});
app.post("/todos/:id/toggle", (req: Request<{id: string}>, res: Response) => {
  const t = store.toggle(req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});
app.delete("/todos/:id", (req: Request<{id: string}>, res: Response) => {
  res.json({ ok: store.remove(req.params.id) });
});

app.listen(3000, () => console.log("Todo API http://localhost:3000"));
```

**Démarrage**:
```bash
npm i express
npm i -D @types/express typescript ts-node
npx tsc --init
# package.json ➜ { "type": "module" }
node dist/server.js
```

---

## 21) Mini‑projet (React) — Filtre produits

**Objectif**: Liste filtrée typée.

```tsx
type Product = { id: string; name: string; price: number; category: "books"|"music"|"games" };

type Filter = {
  search?: string;
  categories?: Product["category"][];
  priceMax?: number;
};

function applyFilter(products: Product[], f: Filter): Product[] {
  return products.filter(p => {
    if (f.search && !p.name.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.categories && f.categories.length && !f.categories.includes(p.category)) return false;
    if (typeof f.priceMax === "number" && p.price > f.priceMax) return false;
    return true;
  });
}
```

**Exercices**
- Créer un composant `Filters` avec props typées et callbacks.
- Vérifier l’exhaustivité des catégories via `as const` et `type Category = typeof categories[number]`.

---

## 22) Quiz & Annexes

**Quiz rapide**
1) `unknown` vs `any`: lequel est plus sûr et pourquoi?
2) Comment assurer l’exhaustivité d’un `switch` sur un union?
3) Exemple d’utilisation de `keyof` avec `Pick`?
4) À quoi sert `satisfies`?
5) Pourquoi `strictNullChecks` est important?

**Rappels utiles**
- `Parameters<T>` et `ReturnType<T>` pour introspection
- `Record<K,V>` pour dictionnaires typés
- `as const` pour littéraux immuables
- `typeof` pour dériver un type d’une valeur
- `infer` dans types conditionnels pour extraire un type

---

## Ressources et conseils

- Activez `strict` dès le départ.
- Validez toute donnée externe (API, fichiers) au **runtime**.
- Préférez unions littérales aux enums pour l’UI.
- Utilisez `never` pour garantir des switches exhaustifs.
- Découpez vos types et modules pour limiter les effets de bord.

