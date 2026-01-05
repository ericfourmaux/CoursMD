---
title: Module Nuxt 3 — SSR/SSG avec Vue 3 (Complet)
tags: [nuxt3, vue, ssr, ssg, seo, hydration, routing, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Nuxt 3 — SSR/SSG avec Vue 3

> [!note]
> **Objectif** : Construire un front **SSR/SSG** avec **Nuxt 3** : pages, layouts, routing, data‑fetch, **SEO/meta**, intégration **Pinia**, et déploiement.

---

## Table des matières
- [1. Démarrage](#1-demarrage)
- [2. Pages, layouts & routing](#2-pages-layouts--routing)
- [3. Data fetching & hydration](#3-data-fetching--hydration)
- [4. Meta/SEO & head](#4-metaseo--head)
- [5. Pinia & state](#5-pinia--state)
- [6. Middleware & auth](#6-middleware--auth)
- [7. Build & déploiement](#7-build--deploiement)
- [8. Exercices](#8-exercices)
- [9. Checklist](#9-checklist)
- [10. Glossaire](#10-glossaire)
- [11. FAQ](#11-faq)
- [12. Ressources](#12-ressources)

---

## 1. Démarrage

```bash
npx nuxi init front-ssr
cd front-ssr && npm i
npm run dev
```

---

## 2. Pages, layouts & routing

- Fichiers `pages/` → routes automatiques.
- Layouts sous `layouts/` ; `<NuxtPage/>`.

```vue
<!-- pages/index.vue -->
<template>
  <h1>Accueil</h1>
</template>
```

---

## 3. Data fetching & hydration

- `useFetch`/`useAsyncData` ; cache et SSR.

```vue
<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/products')
</script>
```

---

## 4. Meta/SEO & head

- `useHead` ; titres/description/OG.

```ts
useHead({ title:'Produits', meta:[{ name:'description', content:'Liste' }] })
```

---

## 5. Pinia & state

```ts
// plugins/pinia.ts
import { createPinia } from 'pinia'
export default defineNuxtPlugin(nuxtApp => { nuxtApp.vueApp.use(createPinia()) })
```

---

## 6. Middleware & auth

- Route guards via `defineNuxtRouteMiddleware`.

```ts
export default defineNuxtRouteMiddleware((to) => {
  const authed = useCookie('auth').value
  if (to.path.startsWith('/profile') && !authed) return '/login'
})
```

---

## 7. Build & déploiement

- `npm run build` ; hébergement (Vercel/Netlify) ; adapter **env**.

---

## 8. Exercices

> [!info]
> Cliquez pour afficher.

### Exercice 1 — `useFetch` SSR
**Objectif** : charger produits et afficher loading/erreur.

<details><summary><strong>Correction</strong></summary>
Voir snippet `useFetch`.
</details>

### Exercice 2 — Middleware auth
**Objectif** : protéger `/profile`.

<details><summary><strong>Correction</strong></summary>
Voir snippet `defineNuxtRouteMiddleware`.
</details>

---

## 9. Checklist
- [ ] Pages/Layouts structurés
- [ ] Data‑fetch SSR ; erreurs gérées
- [ ] Meta/SEO cohérents
- [ ] Pinia initialisé ; state hydraté
- [ ] Middleware auth ; cookies sécurisés
- [ ] Build & déploiement opérants

---

## 10. Glossaire
- **SSR/SSG** : rendu serveur / génération statique.
- **Hydration** : activation du JS sur HTML rendu.

---

## 11. FAQ
**Nuxt ou Vue pur ?**
> Nuxt pour **SEO/SSR** et structure, Vue pur pour SPA simple.

---

## 12. Ressources
- Nuxt 3 : https://nuxt.com/docs

> [!success]
> Module **Nuxt 3** prêt.
