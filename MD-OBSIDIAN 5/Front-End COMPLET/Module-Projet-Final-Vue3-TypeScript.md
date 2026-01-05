---
title: Module Projet Final — Vue 3 + TypeScript (Complet)
tags: [front-end, vue3, typescript, pinia, vue-router, vite, ci-cd, deployment, testing, module, projet-final]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Projet Final — Vue 3 + TypeScript

> [!note]
> **Objectif** : Réaliser un **projet complet** en **Vue 3 + TypeScript** avec **Router**, **Pinia**, **API layer**, **tests (Vitest + Vue Test Utils)**, **CI/CD (GitHub Actions)**, **déploiement** (Netlify/Vercel), **performance & a11y**, et **observabilité**.
>
> **Livrables** : dépôt Git public/privé, application déployée, pipeline CI, rapport Lighthouse, tests unitaires/E2E, documentation (README + docs).

---

## Table des matières

- [1. Brief & fonctionnalités](#1-brief--fonctionnalites)
- [2. Architecture & conventions](#2-architecture--conventions)
- [3. Démarrage & configuration (Vite)](#3-demarrage--configuration-vite)
- [4. TypeScript & qualité](#4-typescript--qualite)
- [5. Router (routes, lazy‑load, gardes)](#5-router-routes-lazy-load-gardes)
- [6. Pinia (stores, actions, getters)](#6-pinia-stores-actions-getters)
- [7. API Layer (fetch, DTO, erreurs)](#7-api-layer-fetch-dto-erreurs)
- [8. UI : composants, formulaires, accessibilité](#8-ui--composants-formulaires-accessibilite)
- [9. Performance & budgets](#9-performance--budgets)
- [10. Tests (unitaires & composants)](#10-tests-unitaires--composants)
- [11. CI/CD (GitHub Actions)](#11-cicd-github-actions)
- [12. Déploiement (Netlify/Vercel)](#12-deploiement-netlifyvercel)
- [13. Observabilité & monitoring](#13-observabilite--monitoring)
- [14. Sécurité & conformité](#14-securite--conformite)
- [15. Documentation & maintenance](#15-documentation--maintenance)
- [16. Exercices guidés avec corrections](#16-exercices-guides-avec-corrections)
- [17. Checklist finale](#17-checklist-finale)

---

## 1. Brief & fonctionnalités

Application « **Catalogue + Auth + Panier** » :
- Parcourir un catalogue, rechercher/filtrer.
- Voir détail produit, ajouter au panier.
- Authentification (login/logout simulé), profil.
- Tableau de bord avec favoris et historique.

> [!tip]
> Si une API n’est pas disponible, utilisez un **mock** JSON local ou un **service worker** de développement.

---

## 2. Architecture & conventions

```
project/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ pages/
│  ├─ router/
│  ├─ stores/
│  ├─ composables/
│  ├─ services/           # api layer
│  ├─ types/              # DTO & types partagés
│  ├─ styles/
│  ├─ utils/
│  ├─ App.vue
│  └─ main.ts
├─ tests/
│  ├─ unit/
│  └─ components/
├─ .github/workflows/
├─ .eslintrc.cjs
├─ .prettierrc.json
├─ tsconfig.json
├─ vite.config.ts
└─ package.json
```

- **Nommage** : SFC en **kebab‑case** ; composants en **PascalCase** ; stores Pinia en **camelCase**.
- **Alias** `@` → `src`.

---

## 3. Démarrage & configuration (Vite)

```bash
npm create vue@latest projet-final
cd projet-final
npm i
npm i -D eslint prettier @typescript-eslint/{eslint-plugin,parser} vitest jsdom @vue/test-utils
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173 },
  build: { sourcemap: true, outDir: 'dist' }
})
```

---

## 4. TypeScript & qualité

```json
// tsconfig.json (extrait)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "types": ["vitest/globals", "vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests"]
}
```

```js
// .eslintrc.cjs
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-recommended', 'prettier'],
}
```

---

## 5. Router (routes, lazy‑load, gardes)

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  { path: '/', name: 'home', component: () => import('@/pages/Home.vue') },
  { path: '/products', name: 'products', component: () => import('@/pages/Products.vue') },
  { path: '/products/:id', name: 'product', component: () => import('@/pages/Product.vue') },
  { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/pages/Profile.vue'), meta: { auth: true } }
]
export const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const authed = !!localStorage.getItem('auth')
  if (to.meta.auth && !authed) return { name: 'login' }
})
```

---

## 6. Pinia (stores, actions, getters)

```ts
// src/stores/cart.ts
import { defineStore } from 'pinia'
export const useCart = defineStore('cart', {
  state: () => ({ items: [] as { id:number; title:string; price:number; qty:number }[] }),
  getters: { total: (s) => s.items.reduce((a,i)=>a+i.price*i.qty, 0) },
  actions: {
    add(p: { id:number; title:string; price:number }){
      const x = this.items.find(i=>i.id===p.id); if(x) x.qty++; else this.items.push({ ...p, qty:1 })
    },
    remove(id:number){ this.items = this.items.filter(i=>i.id!==id) }
  }
})
```

---

## 7. API Layer (fetch, DTO, erreurs)

```ts
// src/types/product.ts
export interface Product { id: number; title: string; price: number; description: string }
```

```ts
// src/services/api.ts
const BASE = import.meta.env.VITE_API_URL ?? '/api'
export async function getProducts(): Promise<Product[]>{
  const r = await fetch(`${BASE}/products`)
  if(!r.ok) throw new Error(r.statusText)
  return await r.json() as Product[]
}
```

---

## 8. UI : composants, formulaires, accessibilité

```vue
<!-- src/components/ProductCard.vue -->
<template>
  <article class="card">
    <h3>{{ p.title }}</h3>
    <p>{{ currency(p.price) }}</p>
    <button class="btn" @click="$emit('add', p)">Ajouter</button>
  </article>
</template>
<script setup lang="ts">
import type { Product } from '@/types/product'
const props = defineProps<{ p: Product }>()
const emit = defineEmits<{ (e:'add', p:Product): void }>()
function currency(n:number){ return new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD'}).format(n) }
</script>
```

> [!tip]
> Assurez **focus visible** et rôles/ARIA adaptés pour les composants interactifs.

---

## 9. Performance & budgets

- **Budgets** : JS ≤ 200 KB gz, CSS ≤ 50 KB gz, LCP ≤ 2.5 s, INP ≤ 200 ms.
- **Code splitting**, **lazy‑load** pages/composants lourds.
- **Images** : AVIF/WebP + `srcset/sizes`; polices WOFF2 + `font-display: swap`.

---

## 10. Tests (unitaires & composants)

```ts
// tests/unit/sum.spec.ts
import { describe, it, expect } from 'vitest'
describe('sum', () => { it('works', () => { expect(1+2).toBe(3) }) })
```

```ts
// tests/components/ProductCard.spec.ts
import { mount } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard.vue'
it('emit add', async () => {
  const w = mount(ProductCard, { props: { p: { id:1, title:'A', price:10, description:'' } } })
  await w.get('button').trigger('click')
  expect(w.emitted('add')).toBeTruthy()
})
```

---

## 11. CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

---

## 12. Déploiement (Netlify/Vercel)

- **Netlify** : reliez le repo ; commande `npm run build` ; dossier `dist`.
- **Vercel** : import du repo ; framework **Vite** détecté ; adapter base si sous‑répertoire.

> [!warning]
> Stockez **secrets** (API keys) dans les **environments** de la plateforme (jamais dans le repo).

---

## 13. Observabilité & monitoring

- **Lighthouse** rapports périodiques.
- Intégrer **web‑vitals** (LCP/CLS/INP) et remonter vers analytics.

```ts
import { onCLS, onINP, onLCP } from 'web-vitals'
onCLS(console.log); onINP(console.log); onLCP(console.log)
```

---

## 14. Sécurité & conformité

- **CSP**, `rel="noopener noreferrer"` pour liens externes.
- Validation stricte des **entrées** ; éviter `v-html`.
- **Licences** et mentions légales.

---

## 15. Documentation & maintenance

- **README** avec scripts, env, archi, déploiement.
- **CHANGELOG** (Conventional Commits) ; **semantic‑release** (optionnel).

---

## 16. Exercices guidés avec corrections

> [!info]
> Les **corrections** sont **repliables**. Cliquez pour afficher.

### Exercice 1 — Route protégée
**Objectif** : Rediriger `/profile` vers `/login` si non authentifié.

<details>
<summary><strong>Correction</strong></summary>

```ts
router.beforeEach((to) => {
  const authed = !!localStorage.getItem('auth')
  if (to.meta.auth && !authed) return { name: 'login' }
})
```

</details>

---

### Exercice 2 — Store panier
**Objectif** : Ajouter un produit et calculer le total.

<details>
<summary><strong>Correction</strong></summary>

```ts
export const useCart = defineStore('cart', {
  state: () => ({ items: [] as { id:number; title:string; price:number; qty:number }[] }),
  getters: { total: (s) => s.items.reduce((a,i)=>a+i.price*i.qty, 0) },
  actions: { add(p){ const x=this.items.find(i=>i.id===p.id); if(x) x.qty++; else this.items.push({ ...p, qty:1 }) } }
})
```

</details>

---

### Exercice 3 — API service typé
**Objectif** : Charger produits et typage `Product[]`.

<details>
<summary><strong>Correction</strong></summary>

```ts
export async function getProducts(): Promise<Product[]>{
  const r = await fetch(`${BASE}/products`)
  if(!r.ok) throw new Error(r.statusText)
  return await r.json() as Product[]
}
```

</details>

---

### Exercice 4 — Test de composant
**Objectif** : Tester l’événement `add` du `ProductCard`.

<details>
<summary><strong>Correction</strong></summary>

```ts
const w = mount(ProductCard, { props: { p: { id:1, title:'A', price:10, description:'' } } })
await w.get('button').trigger('click')
expect(w.emitted('add')).toBeTruthy()
```

</details>

---

## 17. Checklist finale

- [ ] Archi conforme (alias, dossiers, conventions)
- [ ] TS `strict: true` ; ESLint + Prettier OK
- [ ] Router (lazy, gardes) ; Pinia (stores, getters, actions)
- [ ] API layer typé ; erreurs gérées
- [ ] UI accessible ; focus visible ; roles/ARIA
- [ ] Perf (budgets, splitting, images/polices) ; Lighthouse ≥ 90
- [ ] Tests unitaires OK ; couverture minimale
- [ ] CI construit & publie artefacts ; CD déploie
- [ ] Secrets gérés ; conformité (CSP, licences)
- [ ] README, CHANGELOG et documentation à jour

> [!success]
> Projet final **prêt pour production**.
