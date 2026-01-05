
# 📘 Chapitre 11.3 — TypeScript avancé : Utility Types (DeepPartial, DeepReadonly, Exact, Brand)

> **Niveau** : Intermédiaire → Avancé — **Objectif** : aller au‑delà des utilitaires intégrés de TypeScript (comme `Partial`, `Required`, `Readonly`) pour créer et utiliser des **types utilitaires avancés** : `DeepPartial`, `DeepReadonly`, `Exact`, **Brand types** (nominal), `Mutable`, `RequireAtLeastOne` / `RequireExactlyOne`, `NonEmptyArray`, `ValueOf`, ainsi que des **template literal types** (ex. `SnakeCase`, `KebabCase`).

---

## 🎯 Objectifs d’apprentissage
- Savoir écrire des **types mappés récursifs** (Deep*) robustes et performants.
- Comprendre la différence **structural vs nominal** et introduire des **Brand types** pour éviter les confusions.
- Utiliser des **utilitaires de contrainte** (Exact, RequireExactlyOne) pour durcir les contrats.
- Construire des **helpers pratiques** pour le quotidien : `NonEmptyArray`, `ValueOf`, `Mutable`, `ReadonlyDeep`.
- Appliquer ces utilitaires dans des **APIs**, **DTOs**, **configs** et **tests**.

---

## 🧠 Concepts clés

### 🔤 Structural vs Nominal
- **TypeScript est structurel** : deux types sont compatibles s’ils ont la **même forme**.
- Les **Brand types** simulent le **nominal** (ajout d’une marque invisible au runtime) pour empêcher des **confusions** (ex.: `UserId` vs `OrderId`).

### 🧩 Types mappés récursifs
- Les utilitaires `DeepPartial`/`DeepReadonly` traversent les **objets** pour appliquer l’opération **à tous les niveaux**.
- Il faut **exclure** certains cas (`Function`, `Date`, `Map`, `Set`) pour éviter des **sur‑généralisations**.

### 🧷 Contrats stricts
- `Exact<T, U>` vérifie que `U` **n’ajoute pas de clés** en dehors de `T` (utile en tests et pour les **fixtures**).
- `RequireExactlyOne<T, Keys>` impose que **une seule** clé parmi `Keys` soit **présente**.

---

## 🔧 Implémentations — Utility Types (prêts à l’emploi)

```ts
// 1) Base helpers
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;
export type Builtin = Primitive | Date | RegExp | Function | Error;

// 2) DeepPartial — rend toutes les propriétés optionnelles (récursif)
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends Map<infer K, infer V>
        ? Map<DeepPartial<K>, DeepPartial<V>>
        : T extends Set<infer U>
          ? Set<DeepPartial<U>>
          : T extends object
            ? { [K in keyof T]?: DeepPartial<T[K]> }
            : T;

// 3) DeepReadonly — fige récursivement
export type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : T extends Map<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U>>
          : T extends object
            ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
            : T;

// 4) Mutable — inverse de Readonly (shallow)
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// 5) ValueOf — valeurs possibles d’un objet
export type ValueOf<T> = T[keyof T];

// 6) NonEmptyArray — au moins un élément
export type NonEmptyArray<T> = [T, ...T[]];

// 7) Brand — nominal typing (via intersection)
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };
export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;

// 8) Exact — interdiction des clés extra (validation de shape)
export type Exact<T, U extends T> = U & { [K in Exclude<keyof U, keyof T>]?: never };

// 9) RequireAtLeastOne / RequireExactlyOne
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>
  }[Keys];

export type RequireExactlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Record<Exclude<Keys, K>, never>
  }[Keys];

// 10) String case helpers (template literal types)
export type SnakeCase<S extends string> = S extends `${infer H}${infer R}`
  ? `${Lowercase<H>}${R extends Capitalize<R> ? `_${SnakeCase<Uncapitalize<R>>}` : SnakeCase<R>}`
  : S;

export type KebabCase<S extends string> = S extends `${infer H}${infer R}`
  ? `${Lowercase<H>}${R extends Capitalize<R> ? `-${KebabCase<Uncapitalize<R>>}` : KebabCase<R>}`
  : S;
```

---

## 💡 Exemples concrets d’utilisation

```ts
// DeepPartial pour patcher une config profonde
type AppConfig = {
  api: { url: string; headers: Record<string,string> };
  features: { darkMode: boolean; experimental: { searchV2: boolean } };
};

const patch: DeepPartial<AppConfig> = {
  features: { experimental: { searchV2: true } }
};

// DeepReadonly pour empêcher toute mutation
const frozen: DeepReadonly<AppConfig> = {
  api: { url: '/api', headers: { Accept: 'json' } },
  features: { darkMode: true, experimental: { searchV2: false } }
};
// frozen.features.darkMode = false; // ❌ erreur

// Brand pour distinguer des IDs
function getUserById(id: UserId) { /* ... */ }
const uid = 'u_123' as UserId;
getUserById(uid);
// getUserById('o_456' as OrderId); // ❌ le brand ne matche pas

// Exact pour fixtures de tests
type User = { id: UserId; name: string };
const u1: Exact<User, { id: UserId; name: string }> = { id: uid, name: 'Eric' }; // ok
// const u2: Exact<User, { id: UserId; name: string; age: number }> = { id: uid, name: 'Eric', age: 30 }; // ❌ clé extra

// RequireExactlyOne : contrainte de sélection
type Query = { id?: UserId; email?: string; username?: string };
function findUser(q: RequireExactlyOne<Query, 'id'|'email'|'username'>) { /* ... */ }
findUser({ id: uid }); // ok
// findUser({ id: uid, email: 'x@x' }); // ❌ deux clés à la fois

// NonEmptyArray pour éviter les erreurs sur reduce sans seed
function sumNonEmpty(xs: NonEmptyArray<number>) { return xs.reduce((a,b)=>a+b); }
sumNonEmpty([1,2,3]); // ok

// ValueOf pour produire une union de valeurs
const Status = { idle: 'idle', loading: 'loading', done: 'done' } as const;
type StatusValue = ValueOf<typeof Status>; // 'idle' | 'loading' | 'done'

// SnakeCase/KebabCase pour générer des clés transformées
type Headers = { AcceptLanguage: string; ContentType: string };
type HeadersSnake = { [K in keyof Headers as SnakeCase<string & K>]: Headers[K] };
// HeadersSnake → { accept_language: string; content_type: string }
```

---

## 🏗️ Patterns utiles en projet

- **DTOs/API** : `DeepPartial<T>` pour **patchs**; `DeepReadonly<T>` pour **réponses** immuables.
- **Domain‑driven** : `Brand<UUID,'OrderId'>` vs `Brand<UUID,'UserId'>` pour **éviter les mélanges**.
- **Validation de fixtures** : `Exact<T,U>` dans les **tests** pour détecter des **clés surnuméraires**.
- **Formulaires** : `RequireExactlyOne` pour **options exclusives**; `RequireAtLeastOne` pour **au moins une**.
- **Collections** : `NonEmptyArray<T>` pour **algos** (reduce, head/tail) sans **cas vide**.

---

## 🔧 Exercices guidés
1. **Brand** : crée `Email` comme `Brand<string,'Email'>` et une fonction `send(to: Email)`; teste qu’un `string` brut **ne passe pas** sans branding.  
2. **Exact** : écris un helper `expectExact<T>(obj: Exact<T, typeof obj>): obj is T` à utiliser dans un test.  
3. **RequireExactlyOne** : impose `password` **ou** `otp`, mais **pas les deux**, pour une `LoginRequest`.  
4. **SnakeCase** : transforme un type `CamelHeaders` en `SnakeHeaders` et vérifie les clés générées.

```ts
// 3) Idée
type LoginRequest = { username: string; password?: string; otp?: string };
type LoginStrict = RequireExactlyOne<LoginRequest, 'password'|'otp'>;
```

---

## 🧪 Tests / Vérifications (rapides)
```ts
// Brand
type Email = Brand<string,'Email'>;
const e = 'eric@example.com' as Email;
const bad: string = 'plain';
// send(e) → ok ; send(bad) → ❌ si le type est Email

// Exact
type T = { a: number };
// const badFixture: Exact<T,{a:number;b:number}> = { a:1, b:2 }; // ❌

// NonEmptyArray
const xs: NonEmptyArray<number> = [1];
// const ys: NonEmptyArray<number> = []; // ❌

// Case helpers
type C = SnakeCase<'ContentType'>; // 'content_type'
```

---

## ⚠️ Pièges fréquents
- **Deep* naïfs** : ne pas oublier **`Map`/`Set`/`Date`/`Function`**; sinon comportements **indésirables**.
- **Brands invisibles** : attention aux **casts** abusifs (`as Brand<...>`); utiliser des **constructeurs** pour brander.
- **Exact trop strict** : empêche l’extension progressive; réserver à des **tests/fixtures**.
- **Template literal case** : peut être **coûteux** en types complexes; limiter aux **interfaces** raisonnables.

---

## 🧮 Formules (JS)
- **Cardinalité d’un union de valeurs** (naïf)
```javascript
const unionSize = (values) => new Set(values).size;
```
- **Présence minimale (at least one)**
```javascript
const atLeastOne = (obj, keys) => keys.some(k => obj[k] != null);
```

---

## 📌 Résumé essentiel
- Les **utility types avancés** permettent de **durcir** ou **assouplir** des contrats **en profondeur**.
- Les **Brand types** ajoutent un **nominal** utile dans un monde **structurel**.
- `Exact`, `RequireExactlyOne` et consorts **encadrent** précisément les **formes** permises.
- Applique‑les aux **APIs**, **DTOs**, **fixtures** et **algorithmes** pour des erreurs **de compile‑time** plutôt que **runtime**.
