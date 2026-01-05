---
title: Module TypeScript — Développement Front‑End (Complet)
tags: [front-end, typescript, tsconfig, types, generics, tooling, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module TypeScript — Complet et Opérationnel

> [!note]
> **Objectif** : Maîtriser **TypeScript** pour écrire du JavaScript **typé**, **robuste**, **maintenable** et **performant**. 
>
> **À la fin de ce module, vous saurez :**
> - Configurer **TypeScript** (tsconfig) et l’intégrer à **Vite/Webpack**.
> - Modéliser des **types** (primitifs, unions, intersections, littéraux), **interfaces**, **génériques**.
> - Utiliser **narrowing**, **type guards**, **discriminated unions**.
> - Créer **types utilitaires**, **mapped types**, **conditional types** avec `infer`.
> - Typer **fonctions**, **classes**, **modules**, **promises** et **APIs Web**.
> - Gérer **déclarations d’ambient** (`.d.ts`), **module augmentation**, **JSX/TSX** (Vue/React), **decorators** (expérimental).
> - Mettre en place **qualité** (ESLint + plugin TS), build (tsc, Vite, tsup), et **tests** (Vitest/Jest).

---

## Table des matières

- [1. Pourquoi TypeScript ?](#1-pourquoi-typescript)
- [2. Installation & tsconfig](#2-installation--tsconfig)
- [3. Types fondamentaux](#3-types-fondamentaux)
- [4. Unions, intersections, littéraux](#4-unions-intersections-litteraux)
- [5. Interfaces vs type aliases](#5-interfaces-vs-type-aliases)
- [6. Fonctions & surcharges](#6-fonctions--surcharges)
- [7. Narrowing & type guards](#7-narrowing--type-guards)
- [8. Discriminated unions](#8-discriminated-unions)
- [9. Génériques](#9-generiques)
- [10. Utility types & mapped types](#10-utility-types--mapped-types)
- [11. Conditional types & infer](#11-conditional-types--infer)
- [12. Classes, modules & décorateurs](#12-classes-modules--decorateurs)
- [13. Promises, async/await & APIs Web](#13-promises-asyncawait--apis-web)
- [14. Déclarations, ambient & augmentation](#14-declarations-ambient--augmentation)
- [15. TS avec Vue (SFC) & JSX/TSX](#15-ts-avec-vue-sfc--jsxtsx)
- [16. Outils : ESLint, build, bundlers](#16-outils--eslint-build-bundlers)
- [17. Performance & ergonomie de type](#17-performance--ergonomie-de-type)
- [18. Exercices guidés avec corrections](#18-exercices-guides-avec-corrections)
- [19. Checklists TypeScript](#19-checklists-typescript)
- [20. Glossaire rapide](#20-glossaire-rapide)
- [21. FAQ](#21-faq)
- [22. Références & ressources](#22-references--ressources)

---

## 1. Pourquoi TypeScript ?

- **Typage statique** → erreurs **plus tôt** (dev/build) ; meilleure **lisibilité**.
- **Autocomplétion/IDE** riche (IntelliSense), refactorings sûrs.
- **Interop** totale avec JS : TS compile en JS standard.

```mermaid
flowchart LR
  A[TS Source] --> B[tsc]
  B --> C[JS + d.ts]
  C --> D[Runtime]
```

---

## 2. Installation & tsconfig

### 2.1. Installation

```bash
npm i -D typescript
npx tsc --init
```

### 2.2. `tsconfig.json` minimal

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

> [!tip]
> `strict: true` active un ensemble de règles (strictNullChecks, noImplicitAny…). **Toujours** l’activer pour la robustesse.

---

## 3. Types fondamentaux

- **Primitifs** : `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`.
- **Objets** : `{}` typés ; **array** : `string[]` ou `Array<string>` ; **tuple** : `[number, string]`.
- **Any/Unknown/Never** :
  - `any` **désactive** la vérification (éviter).
  - `unknown` oblige **narrowing**.
  - `never` pour valeurs **inatteignables**.

```ts
let x: unknown = 42
if (typeof x === 'number') { x = x + 1 }
function fail(msg: string): never { throw new Error(msg) }
```

---

## 4. Unions, intersections, littéraux

- **Union** : `A | B` ; **Intersection** : `A & B`.
- **Littéraux** : `'ok' | 'ko'` ; **`as const`** pour fixes.

```ts
type Status = 'idle' | 'loading' | 'success' | 'error'
const cfg = { theme: 'dark', lang: 'fr' } as const
```

---

## 5. Interfaces vs type aliases

- **Interface** : extensible, pour contrats d’objets/classes.
- **Type alias** : unions, intersections, fonctions, etc.

```ts
interface User { id: number; name: string }
type Response<T> = { data: T; status: number }
```

---

## 6. Fonctions & surcharges

- Paramètres, retours typés ; **optionnels** (`?`) ; **surcharges**.

```ts
function format(d: Date): string
function format(s: string): string
function format(x: Date | string){ return typeof x === 'string' ? x : x.toISOString() }
```

---

## 7. Narrowing & type guards

- **Type guards** : `typeof`, `instanceof`, **prédicats** (`value is Type`).

```ts
type A = { a: number }; type B = { b: string }
function isA(x: A | B): x is A { return (x as A).a !== undefined }
```

---

## 8. Discriminated unions

- **Tag** commun (`kind`) pour affiner.

```ts
type Shape = { kind: 'rect', w: number, h: number } | { kind: 'circle', r: number }
function area(s: Shape){
  switch (s.kind){
    case 'rect': return s.w * s.h
    case 'circle': return Math.PI * s.r * s.r
  }
}
```

---

## 9. Génériques

- **Paramètres de type** pour **réutilisabilité**.

```ts
function wrap<T>(value: T){ return { value } }
interface ApiResponse<T>{ data: T; error?: string }
```

Contraintes : `T extends U` ; **défauts** : `T = unknown`.

---

## 10. Utility types & mapped types

Types prêts à l’emploi : `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`…

```ts
type ReadonlyUser = Readonly<User>
```

**Mapped types** : transformer les propriétés.

```ts
type Flags<T> = { [K in keyof T]: boolean }
```

---

## 11. Conditional types & infer

- `T extends U ? X : Y`
- **`infer`** pour capturer des types.

```ts
type ElementType<T> = T extends (infer U)[] ? U : T
```

---

## 12. Classes, modules & décorateurs

- **Classes** typées ; **`private`/`protected`** (différent de `#` privés JS).
- **Modules** : `import/export`.
- **Decorators** : expérimental (config `experimentalDecorators` / `emitDecoratorMetadata`).

```ts
class Account {
  private balance = 0
  constructor(public owner: string){}
  deposit(n: number){ this.balance += n }
  getBalance(){ return this.balance }
}
```

> [!warning]
> Les **decorators** dépendent d’options expérimentales et d’un **proposal** en évolution. Utilisez‑les **avec prudence**.

---

## 13. Promises, async/await & APIs Web

- Typage des `Promise<T>` ; `fetch` → `Response`/`JSON` typés.

```ts
async function getUser(id: number): Promise<User>{
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(res.statusText)
  return (await res.json()) as User
}
```

---

## 14. Déclarations, ambient & augmentation

- **Ambient** (`.d.ts`) pour décrire des libs JS.
- **Module augmentation** pour enrichir des types existants.

```ts
// global.d.ts
declare global { interface Window { appVersion: string } }
export {}
```

---

## 15. TS avec Vue (SFC) & JSX/TSX

- Vue 3 : `<script setup lang="ts">` ; props/emits **typés**.
- JSX/TSX (si nécessaire) : config `tsconfig` + bundler.

```vue
<script setup lang="ts">
interface Props { label: string }
const props = defineProps<Props>()
</script>
```

---

## 16. Outils : ESLint, build, bundlers

- **ESLint** + `@typescript-eslint` ; Prettier.
- **tsc** (types + emit) ou **`tsc --noEmit`** pour check.
- **Vite** (recommandé), **tsup/esbuild** pour libs, **Webpack** pour cas spécifiques.

```bash
npm i -D eslint @typescript-eslint/{eslint-plugin,parser} prettier
```

```js
// .eslintrc.cjs
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier']
}
```

---

## 17. Performance & ergonomie de type

- Évitez `any` ; préférez `unknown` + **narrowing**.
- Typage **local** des fonctions ; **inférence** partout ailleurs.
- Limitez **conditional types** profonds ; privilégiez **types simples** et **composition**.

---

## 18. Exercices guidés avec corrections

> [!info]
> Les **corrections** sont **repliables**. Cliquez pour afficher.

### Exercice 1 — Unions & narrowing
**Objectif** : Écrire une fonction qui accepte `string | number` et renvoie une chaîne.

<details>
<summary><strong>Correction</strong></summary>

```ts
function toText(x: string | number){ return typeof x === 'number' ? String(x) : x }
```

</details>

---

### Exercice 2 — Generics
**Objectif** : Créer `wrap<T>(value)` qui retourne `{ value: T }`.

<details>
<summary><strong>Correction</strong></summary>

```ts
function wrap<T>(value: T){ return { value } }
```

</details>

---

### Exercice 3 — Discriminated union
**Objectif** : Implémenter `area(s: Shape)` avec `kind`.

<details>
<summary><strong>Correction</strong></summary>

```ts
type Shape = { kind: 'rect', w: number, h: number } | { kind: 'circle', r: number }
function area(s: Shape){ return s.kind === 'rect' ? s.w*s.h : Math.PI*s.r*s.r }
```

</details>

---

### Exercice 4 — Mapped type
**Objectif** : Transformer un type en `boolean` flags.

<details>
<summary><strong>Correction</strong></summary>

```ts
type Flags<T> = { [K in keyof T]: boolean }
```

</details>

---

### Exercice 5 — API Fetch typée
**Objectif** : Écrire `getUser(id): Promise<User>` avec cast sécurisé.

<details>
<summary><strong>Correction</strong></summary>

```ts
interface User { id: number; name: string }
async function getUser(id: number): Promise<User>{
  const r = await fetch(`/api/users/${id}`)
  if (!r.ok) throw new Error(r.statusText)
  return await r.json() as User
}
```

</details>

---

### Exercice 6 — Déclaration ambient
**Objectif** : Ajouter `window.appVersion: string` via `.d.ts`.

<details>
<summary><strong>Correction</strong></summary>

```ts
// global.d.ts
declare global { interface Window { appVersion: string } }
export {}
```

</details>

---

## 19. Checklists TypeScript

- [ ] `strict: true` ; `noImplicitAny`, `strictNullChecks`
- [ ] Typage public API ; inférence interne privilégiée
- [ ] Unions/discriminated unions pour flux ; type guards
- [ ] Génériques pour réutilisabilité ; contraintes (`extends`)
- [ ] Utility/mapped/conditional types **mesurés** (simples d’abord)
- [ ] ESLint TS + Prettier ; `tsc --noEmit` dans CI
- [ ] Bundler (Vite) ; déclarations `.d.ts` pour libs

---

## 20. Glossaire rapide

- **Type alias** : nom pour un type (`type T = ...`).
- **Interface** : contrat extensible pour objets/classes.
- **Union** : type A **ou** B (`|`).
- **Intersection** : A **et** B (`&`).
- **Mapped** : transformation des propriétés (`[K in keyof T]`).
- **Conditional** : type conditionnel (`T extends U ? X : Y`).
- **Ambient** : déclaration de types sans implémentation (global/module).

---

## 21. FAQ

**Q : Dois‑je tout typer explicitement ?**
> Non. L’inférence est **puissante**. **Typez** les **API** publiques ; laissez le reste s’inférer.

**Q : `any` est‑il acceptable ?**
> À éviter. Préférez `unknown` + **narrowing** pour la sécurité.

**Q : TypeScript ralentit‑il le dev ?**
> Un léger coût initial, compensé par **moins de bugs** et **meilleure productivité** (IDE).

---

## 22. Références & ressources

- TypeScript Handbook : https://www.typescriptlang.org/docs/handbook/intro.html
- TSConfig Reference : https://www.typescriptlang.org/tsconfig
- Utility Types : https://www.typescriptlang.org/docs/handbook/utility-types.html
- @typescript-eslint : https://typescript-eslint.io/
- Vite + TS : https://vitejs.dev/guide/
- Vue + TS : https://vuejs.org/guide/typescript/overview.html

> [!success]
> Vous disposez maintenant d’un **module TypeScript complet**, prêt à l’emploi et à la production.
