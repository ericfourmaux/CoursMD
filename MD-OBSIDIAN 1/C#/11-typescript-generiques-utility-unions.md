
# 📘 Chapitre 11.1 — TypeScript avancé : Génériques, Utility Types & Discriminated Unions

> **Niveau** : Intermédiaire → Avancé — **Objectif** : maîtriser les **génériques** (fonctions, classes, interfaces), les **contraintes** (`extends`), les **types utilitaires** (builtin), les **types mappés** & **conditionnels** (`infer`), les **template literal types**, et les **discriminated unions** avec **narrowing** exhaustif.

---

## 🎯 Objectifs d’apprentissage
- Écrire des **fonctions** et **interfaces** génériques réutilisables (contraintes, valeurs par défaut).
- Utiliser les **utility types** intégrés (`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`, etc.).
- Composer des **mapped types** & **conditional types** avec `infer` pour construire des types **avancés** (ex. `DeepReadonly`, `AsyncReturnType`).
- Exploiter les **template literal types** et `as const`/`satisfies` pour des unions **fortement typées**.
- Modéliser des **discriminated unions** robustes et implémenter un **narrowing exhaustif** avec `never`.

---

## 🧠 Concepts clés

### 🔤 Génériques — motivation
Les génériques permettent d’écrire des **APIs polymorphes** qui restent **type‑safe**. Plutôt que d’utiliser `any`, on **paramètre** le type :

```ts
function first<T>(xs: T[]): T | undefined {
  return xs[0];
}

const a = first<number>([1,2,3]); // a: number | undefined
const b = first(["x","y"]);     // inféré: string | undefined
```

### 🧩 Contraintes & paramètres par défaut
```ts
// Contrainte: T doit avoir une clé 'id'
interface WithId { id: string | number }
function toMap<T extends WithId>(items: T[]): Record<string, T> {
  const r: Record<string, T> = {};
  for (const it of items) r[String(it.id)] = it;
  return r;
}

// Paramètre générique par défaut
type ApiResponse<T = unknown> = { ok: true; data: T } | { ok: false; error: string };
```

### 🧭 `keyof`, `typeof`, index access
```ts
type User = { id: number; name: string; active: boolean };
type Keys = keyof User;   // "id" | "name" | "active"

declare const u: User;
type NameType = User["name"]; // string

const Routes = { home: "/", products: "/products" } as const;
type RouteKey = keyof typeof Routes;         // "home" | "products"
type RouteValue = (typeof Routes)[RouteKey]; // "/" | "/products"
```

### 🧱 Types utilitaires (builtin)
```ts
type A = { x: number; y?: string };
type APartial = Partial<A>;       // y devient optionnel (x aussi)
type ARequired = Required<A>;     // y devient obligatoire
const ro: Readonly<A> = { x: 1 }; // propriétés non modifiables

type Picked = Pick<A, "x">;      // { x: number }
type Omitted = Omit<A, "y">;     // { x: number }

type Dict = Record<string, number>; // { [key: string]: number }

function f(a: number, b: string) { return { a, b } }
type P = Parameters<typeof f>;        // [number, string]
type R = ReturnType<typeof f>;        // { a: number; b: string }

class Box { constructor(public w: number){} }
type CtorParams = ConstructorParameters<typeof Box>; // [number]
type Instance = InstanceType<typeof Box>;            // Box

// Set union helpers
type NonNull = NonNullable<string | null | undefined>; // string

type OnlyStrings = Extract<"a"|"b"|1|2, string>;      // "a"|"b"
type WithoutStrings = Exclude<"a"|"b"|1|2, string>;    // 1|2
```

### 🧮 Mapped types & Conditional types
```ts
// Mapped type: DeepReadonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
};

// Conditional + infer: AsyncReturnType
type AsyncReturnType<T> = T extends (...args: any) => Promise<infer U> ? U : never;

async function getUser(id: number) { return { id, name: "Eric" } }
type UserFromAPI = AsyncReturnType<typeof getUser>; // { id: number; name: string }
```

### 🧾 Template literal types
```ts
// Construire des unions de string typées
type Lang = "fr" | "en" | "es";
type Key = "title" | "desc";

type I18nKey = `${Lang}.${Key}`; // "fr.title" | "fr.desc" | "en.title" | ...

// Capitalization helpers
type CapitalizeDemo = Capitalize<"hello">; // "Hello"
```

### 🧷 `as const` & `satisfies` (TS 4.9+)
```ts
const roles = ["admin", "user", "guest"] as const;
type Role = typeof roles[number]; // "admin" | "user" | "guest"

// 'satisfies' valide sans élargir le type
const config = {
  api: "/api",
  retries: 3
} satisfies Record<string, string | number>;

// 'config' garde ses types précis: { api: string; retries: 3 }
```

---

## 🧬 Discriminated Unions & Narrowing exhaustif

### Modéliser résultats/états
```ts
// Discriminateur 'kind'
type Result<T, E = string> =
  | { kind: "ok"; value: T }
  | { kind: "err"; error: E };

function unwrap<T>(r: Result<T>): T {
  switch (r.kind) {
    case "ok": return r.value;
    case "err": throw new Error(String(r.error));
    default: const _exhaustive: never = r; return _exhaustive; // assure exhaustivité
  }
}
```

### États d’un chargement
```ts
type Loading<T> =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; message: string };

function render<T>(m: Loading<T>) {
  if (m.state === "idle") return "Cliquez";
  if (m.state === "loading") return "Patientez";
  if (m.state === "success") return JSON.stringify(m.data);
  if (m.state === "error") return m.message;
  const _exhaustive: never = m; // jamais atteint
}
```

---

## 💡 Exemples complets

### Builder typé avec options génériques
```ts
type Options = { cache?: boolean; retries?: number };

class Client<TOptions extends Options = {}> {
  constructor(public baseUrl: string, public opts: TOptions) {}
  withOptions<U extends Options>(opts: U) { return new Client<U>(this.baseUrl, opts); }
}

const c = new Client("/api", {});
const c2 = c.withOptions({ cache: true, retries: 2 });
// c2.opts: { cache: boolean; retries: number }
```

### Sélecteur type‑safe (keyof + contraintes)
```ts
function pluck<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const r = {} as Pick<T, K>;
  for (const k of keys) (r as any)[k] = obj[k];
  return r;
}

const user = { id: 1, name: "Eric", active: true };
const small = pluck(user, "id", "name"); // { id: 1; name: "Eric" }
```

### DeepReadonly sur une config
```ts
type Config = { api: { url: string; headers: Record<string,string> }, features: { darkMode: boolean } };
const cfg: DeepReadonly<Config> = {
  api: { url: "/api", headers: { Accept: "json" } },
  features: { darkMode: true }
};
// cfg.api.url = "x"; // ❌ erreur: readonly
```

---

## 🔧 Exercices guidés
1. **`Result<T,E>`** : ajoute des helpers `isOk`, `map`, `mapErr` pour composer les résultats.
2. **`AsyncReturnType`** : écris `AwaitedReturn<T>` qui extrait le type **après 2 niveaux** de `Promise`.
3. **`DeepPartial<T>`** : implémente un type mappé rendant **toutes** les propriétés **optionnelles** récursivement.
4. **`RouteParams`** : avec des **template literal types**, extrais `{ locale: "fr"|"en"; id: string }` d’une route typée `/${Lang}/products/${string}`.

```ts
// 2) Idée pour double Awaited
type AwaitedReturn<T> = T extends (...args: any) => Promise<infer U> ? (U extends Promise<infer V> ? V : U) : never;
```

---

## 🧪 Tests / Vérifications (rapides)
```ts
// 1) Exhaustivité
const r: Result<number> = { kind: "ok", value: 42 };
console.log(unwrap(r) === 42);

// 2) Utility types
type T = { a: number; b?: string };
const p: Partial<T> = {};           // ok
const q: Required<T> = { a: 1, b: "x" }; // ok

// 3) Generic pluck
const o = { id: 1, name: "E", active: false };
const o2 = pluck(o, "id", "active");
console.log(o2.id === 1 && o2.active === false);
```

---

## ⚠️ Pièges fréquents
- **`any`** ubiquitaire : perd toute sécurité; préférer `unknown` + **refinement**, ou des **génériques**.
- **Contraintes manquantes** (`extends`) : mènent à des **types trop larges** (perte d’inférence).
- **Mapped types naïfs** sur `object` : attention aux `Date`, `Map`, fonctions; prévoir des cas **exclus**.
- **Unions non discriminées** : rendent le **narrowing** fragile; introduire un **discriminateur** (`kind`/`type`).
- **`as` casting** excessif : masque les erreurs; utiliser des **type guards**.

---

## 🧮 Formules (JS)
- **Taille d’une union** (naïf) :
```javascript
const unionSize = (variants) => variants.length; // comptage des variantes
```
- **Couverture de clés** dans un mapped type (idée) :
```javascript
const keysCovered = (obj, keys) => keys.every(k => k in obj);
```

---

## 📌 Résumé essentiel
- Les **génériques** et **contraintes** offrent des APIs **réutilisables** et **sûres**.
- Les **utility types** accélèrent la modélisation courante (optionnalité, extraction, dictionnaires, fonctions).
- Les **mapped types** & **conditional types** (avec `infer`) débloquent des **transformations** puissantes.
- Les **template literal types**, `as const` et `satisfies` aident à construire des unions **précises**.
- Les **discriminated unions** + **exhaustive narrowing** garantissent un contrôle **robuste** des **états**.
