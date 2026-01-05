
# 📘 Chapitre 11.2 — TypeScript avancé : Type Guards, Narrowing & `satisfies`

> **Niveau** : Intermédiaire → Avancé — **Objectif** : maîtriser le **narrowing** de TypeScript (analyses de flux de contrôle), les **type guards** (intégrés et personnalisés), les fonctions d’assertion (`asserts`), l’exhaustivité avec `never`, et l’opérateur **`satisfies`** (TS ≥ 4.9) pour valider des formes **sans élargir** les types.

---

## 🎯 Objectifs d’apprentissage
- Utiliser les **type guards intégrés** : `typeof`, `instanceof`, `in` et **truthiness**.
- Écrire des **type guards personnalisés** (`x is T`) pour raffiner `unknown`/unions.
- Implémenter des **fonctions d’assertion** (`asserts`) pour des préconditions runtime.
- Pratiquer le **narrowing exhaustif** avec `never` sur des **discriminated unions**.
- Employer **`satisfies`** pour contraindre une forme **tout en conservant** des **littéraux** (`as const`).

---

## 🧠 Concepts clés

### 🔎 Type guards intégrés
```ts
function fmt(value: unknown): string {
  if (typeof value === 'string') return value.toUpperCase(); // string
  if (typeof value === 'number') return value.toFixed(2);    // number
  if (value instanceof Date) return value.toISOString();     // Date
  if (value && typeof value === 'object' && 'message' in (value as any)) {
    // 'in' vérifie la présence d'une clé
    return String((value as { message: unknown }).message);
  }
  return String(value);
}
```

### 🧩 Truthiness & nullish
```ts
function ensureId(id?: string | null): string {
  if (id) return id; // truthy → string
  return 'unknown';
}

function coalesce(s: string | null | undefined) {
  return s ?? 'N/A'; // nullish coalescing (pas un guard TS, mais utile)
}
```

### 🧷 Type guards **personnalisés** (`predicate: x is T`)
```ts
// Discriminated union
type Ok<T>  = { kind: 'ok';  value: T };
type Err<E> = { kind: 'err'; error: E };
type Result<T, E = string> = Ok<T> | Err<E>;

// Guard
function isOk<T, E>(r: Result<T, E>): r is Ok<T> { return r.kind === 'ok'; }
function isErr<T, E>(r: Result<T, E>): r is Err<E> { return r.kind === 'err'; }

// Usage
function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return isOk(r) ? r.value : fallback;
}
```

**Dans les collections** :
```ts
type User = { id: number; name: string } | { id: number; deleted: true };
function isActive(u: User): u is { id: number; name: string } { return 'name' in u; }

const users: User[] = [ { id: 1, name: 'Eric' }, { id: 2, deleted: true } ];
const actives = users.filter(isActive); // type: { id: number; name: string }[]
```

### 🧪 Guards génériques & utilitaires
```ts
function isRecord<K extends PropertyKey = string, V = unknown>(x: unknown): x is Record<K, V> {
  return !!x && typeof x === 'object';
}

function isArrayOf<T>(xs: unknown, pred: (v: unknown) => v is T): xs is T[] {
  return Array.isArray(xs) && xs.every(pred);
}

// Exemple
type Product = { id: number; name: string };
const isProduct = (v: unknown): v is Product => isRecord(v) && typeof (v as any).id === 'number' && typeof (v as any).name === 'string';
```

### 🧷 Fonctions d’assertion (`asserts`)
```ts
// lève à l'exécution si la condition est fausse
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg ?? 'Assertion failed');
}

function assertNonNull<T>(value: T, msg?: string): asserts value is NonNullable<T> {
  assert(value != null, msg);
}

// Usage
function printUser(u?: { name?: string | null }) {
  assertNonNull(u, 'User manquant');
  assertNonNull(u.name, 'Name manquant');
  console.log(u.name.toUpperCase()); // 'u' et 'u.name' sont raffinés
}
```

### 🧭 Exhaustivité avec `never`
```ts
type Loading<T> =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'success'; data: T }
  | { state: 'error'; message: string };

function renderState<T>(s: Loading<T>): string {
  switch (s.state) {
    case 'idle':    return 'Prêt';
    case 'loading': return 'Chargement';
    case 'success': return JSON.stringify(s.data);
    case 'error':   return s.message;
    default: {
      const _exhaustive: never = s; // si une variante manque, TS signale ici
      return _exhaustive;
    }
  }
}
```

### 🧾 `satisfies` (TS ≥ 4.9) — valider **sans élargir**
```ts
// On veut contraindre la forme tout en gardant des littéraux précis
const routes = {
  home: '/',
  products: '/products',
  details: (id: string) => `/products/${id}`
} satisfies {
  home: string;
  products: string;
  details: (id: string) => string;
};

// routes.home est conservé comme '/' (littéral), pas élargi à string

// Records exhaustifs via satisfies + 'as const'
const locales = ['fr', 'en'] as const;
type Locale = typeof locales[number];

const i18n = {
  fr: { title: 'Titre', ok: 'OK' },
  en: { title: 'Title', ok: 'OK' }
} satisfies Record<Locale, { title: string; ok: string }>; // force les clés fr/en
```

**Avec les unions de clés** :
```ts
const roles = ['admin','user','guest'] as const;
type Role = typeof roles[number];

const permissions = {
  admin: ['read','write','delete'],
  user:  ['read'],
  guest: []
} satisfies Record<Role, readonly string[]>; // manquant → erreur de type
```

---

## 💡 Patterns avancés

### 1) Décodage JSON **sécurisé**
```ts
function parseProducts(json: string): Product[] {
  const data: unknown = JSON.parse(json);
  if (!isArrayOf<Product>(data, isProduct)) throw new Error('Shape invalide');
  return data; // Product[]
}
```

### 2) Guards + `asserts` pour **préconditions**
```ts
function getEnv(name: string): string {
  const v = process.env[name];
  assert(v, `ENV ${name} manquant`);
  return v; // string
}
```

### 3) API client — **discriminants** + exhaustivité
```ts
type Api<T> = { status: 200; data: T } | { status: 404; message: string } | { status: 500; error: string };

function handle<T>(r: Api<T>): T {
  switch (r.status) {
    case 200: return r.data;
    case 404: throw new Error(r.message);
    case 500: throw new Error(r.error);
    default: { const _x: never = r; return _x; }
  }
}
```

---

## 🔧 Exercices guidés
1. **`isNonEmptyString`** : écris un guard qui valide `string` non vide; utilise‑le pour filtrer `Array<unknown>`.
2. **`assertNumber`** : implémente `assertNumber(x): asserts x is number` et réécris une fonction `sum(...xs: unknown[])`.
3. **`satisfies` + Record** : définis `supportedLocales` et force la présence des traductions pour chaque locale.
4. **Exhaustivité** : ajoute un nouvel état `"retry"` à `Loading<T>` et adapte `renderState` (le `never` doit t’aider).

```ts
// 1) Idée
function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0;
}

// 2) Idée
function assertNumber(x: unknown): asserts x is number {
  if (typeof x !== 'number') throw new Error('Not a number');
}
```

---

## 🧪 Tests / Vérifications (rapides)
```ts
console.log(fmt('abc') === 'ABC');
console.log(fmt(3.14159).includes('.'));

const r1: Result<number> = { kind: 'ok', value: 1 };
const r2: Result<number> = { kind: 'err', error: 'oops' };
console.log(unwrapOr(r1, 0) === 1 && unwrapOr(r2, 0) === 0);

// satisfies
const perms = { admin: ['read'], user: ['read'], guest: [] } satisfies Record<Role, readonly string[]>;
console.log(perms.admin.length === 1);
```

---

## ⚠️ Pièges fréquents
- **Guards trop permissifs** : valident des formes **incomplètes** → bugs; vérifier **toutes** les propriétés nécessaires.
- **Casts (`as`) abusifs** : contournent le type‑checker; préférer des guards **runtime**.
- **`any`** partout : désactive le narrowing; utiliser `unknown` + guards.
- **`!` (non‑null assertion)** : cache des `null` potentiels; préférer `assertNonNull()`.
- **`satisfies` sans `as const`** : les littéraux **s’élargissent**; figer les tableaux/objets si nécessaire.

---

## 🧮 Formules (en JavaScript)
- **Estimation de complétude d’un Record** (naïf) :
```javascript
const completeness = (obj, mustKeys) => mustKeys.every(k => Object.hasOwn(obj, k));
```
- **Ratio de raffinements réussis** (idée) :
```javascript
const refineRate = (checked, narrowed) => narrowed / Math.max(1, checked);
```

---

## 📌 Résumé essentiel
- **Type guards** (intégrés/personnalisés) et **asserts** structurent un **narrowing** sûr.
- **Discriminated unions** + `never` assurent un **contrôle exhaustif** des variantes.
- **`satisfies`** contraint sans élargir : parfait pour **config**/**records** avec littéraux.
- Évite les **casts**; préfère des **guards** robustes et des **préconditions** explicites.
