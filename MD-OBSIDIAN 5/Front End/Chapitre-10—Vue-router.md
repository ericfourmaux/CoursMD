
# 📘 Chapitre 10 — Vue Router, Pinia, TypeScript & Tests

> 🎯 **Objectifs du chapitre**
> - Mettre en place un **routing** professionnel avec **Vue Router 4**: routes nommées, **params**, **query**, **lazy‑loading**, **guards** et **métadonnées typées**.
> - Structurer un **état global** avec **Pinia**: stores typés, `getters`, `actions`, persistance, intégration avec composants.
> - Utiliser **TypeScript** pour **typer** routes, `meta`, stores et composants.
> - Tester **composants**, **stores** et **navigation** avec **Jest + Vue Testing Library**.
> - Améliorer **A11y** (focus après navigation) et **performance** (code splitting, préchargement).

---

## 🧠 1. Pourquoi Vue Router & Pinia ?

### 🔍 Définition
- **Vue Router** organise la **navigation** entre vues (pages) dans une SPA (Single‑Page Application).
- **Pinia** gère l’**état global** (partagé) avec une API moderne et typable.

### ❓ Pourquoi
- Séparer **navigation** (chemins, urls, garde) et **données** (stores) pour une **architecture claire**.
- Faciliter **tests**, **maintenabilité** et **typage**.

### 💡 Analogie
Pensez à un **centre‑ville**: 
- les **routes** sont les **rues** (Vue Router) avec panneaux (métadonnées, guards) ;
- **Pinia** est la **place centrale** où l’on **partage** des ressources (état utilisateur, préférences).

---

## 🧠 2. Installation & bootstrap

### 🛠 Fichiers clés
```
src/
  main.ts
  router/
    index.ts
    routes.ts
  stores/
    user.ts
    settings.ts
  views/
    HomeView.vue
    LoginView.vue
    DashboardView.vue
```

### 💡 `main.ts`
```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

---

## 🧠 3. Vue Router — bases, lazy‑loading & liens

### 💡 `router/index.ts`
```ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Lazy‑loading par import dynamique
const HomeView = () => import('../views/HomeView.vue');
const LoginView = () => import('../views/LoginView.vue');
const DashboardView = () => import('../views/DashboardView.vue');

export const routes: RouteRecordRaw[] = [
  { name: 'home', path: '/', component: HomeView, meta: { title: 'Accueil', public: true } },
  { name: 'login', path: '/login', component: LoginView, meta: { title: 'Connexion', public: true } },
  { name: 'dashboard', path: '/dashboard', component: DashboardView, meta: { title: 'Tableau de bord', requiresAuth: true } },
  { name: 'user', path: '/users/:id', component: DashboardView, meta: { title: 'Profil', requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved; // back/forward conserve
    return { top: 0 };      // scroll en haut
  }
});

export default router;
```

### 🧠 Lier & naviguer
```vue
<template>
  <nav>
    <router-link :to="{ name: 'home' }">Accueil</router-link>
    <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
  </nav>
</template>
```
```ts
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'user', params: { id: 'u1' }, query: { tab: 'info' } });
```

### ✅ Bonnes pratiques
- **Routes nommées** pour stabilité.
- **Params** toujours **typés**/validés.
- **Lazy‑loading** des vues pour réduire JS initial.

---

## 🧠 4. TypeScript avancé — métadonnées typées des routes

### 🔍 Objectif
Typer `meta` pour indiquer `requiresAuth`, `title`, etc., et profiter de l’autocomplétion.

### 💡 Déclaration d’augmentation
```ts
// router/meta.d.ts
import 'vue-router';
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    public?: boolean;
    requiresAuth?: boolean;
  }
}
```

### 💡 Utilisation dans guards
```ts
router.beforeEach((to) => {
  if (to.meta?.title) document.title = to.meta.title + ' — MonApp';
});
```

---

## 🧠 5. Guards — Auth & redirections

### 💡 Guard global
```ts
import { useUserStore } from '../stores/user';
router.beforeEach((to) => {
  const user = useUserStore();
  if (to.meta.requiresAuth && !user.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});
```

### 💡 Guard par route
```ts
{
  name: 'dashboard',
  path: '/dashboard',
  component: DashboardView,
  beforeEnter: (to) => {
    // Vérifications spécifiques
    if (to.query.tab && !['info','settings'].includes(String(to.query.tab))) {
      return { name: 'dashboard', query: { tab: 'info' } };
    }
  },
  meta: { requiresAuth: true }
}
```

### 🧠 Focus management (A11y)
```ts
router.afterEach(() => {
  // Après navigation, placer le focus sur le contenu principal
  const main = document.querySelector('main, #main, [role="main"]') as HTMLElement | null;
  main?.setAttribute('tabindex', '-1');
  main?.focus();
});
```

---

## 🧠 6. Pinia — stores typés, getters, actions

### 💡 `stores/user.ts`
```ts
import { defineStore } from 'pinia';

export type User = { id: string; name: string };
export const useUserStore = defineStore('user', {
  state: () => ({ user: null as User | null }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    displayName: (state) => state.user?.name ?? 'Invité'
  },
  actions: {
    login(user: User) { this.user = user; },
    logout() { this.user = null; }
  }
});
```

### 💡 `stores/settings.ts`
```ts
import { defineStore } from 'pinia';
export const useSettingsStore = defineStore('settings', {
  state: () => ({ theme: 'light' as 'light' | 'dark' }),
  actions: {
    toggleTheme() { this.theme = this.theme === 'light' ? 'dark' : 'light'; }
  }
});
```

### 💡 Utilisation dans un composant
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore, useSettingsStore } from '../stores';

const user = useUserStore();
const settings = useSettingsStore();
const { isAuthenticated, displayName } = storeToRefs(user);
</script>
<template>
  <header>
    <p>Connecté: {{ isAuthenticated ? displayName : 'Non' }}</p>
    <button @click="settings.toggleTheme()">Thème: {{ settings.theme }}</button>
  </header>
</template>
```

### ✅ Bonnes pratiques
- Utiliser **`storeToRefs`** pour extraire des **réfs** réactives depuis getters/state.
- **Actions** pour toute mutation (éviter mutation directe dans composants).

---

## 🧠 7. Persistance de l’état (localStorage)

### 🔍 Objectif
Garder la session utilisateur et les préférences entre rechargements.

### 💡 Plugin Pinia minimal
```ts
// stores/plugins/persist.ts
import type { PiniaPluginContext } from 'pinia';

export function persistPlugin({ store }: PiniaPluginContext) {
  const key = `store:${store.$id}`;
  // Hydrate
  const cached = localStorage.getItem(key);
  if (cached) store.$patch(JSON.parse(cached));
  // Sauvegarde
  store.$subscribe((_mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state));
  }, { detached: true });
}
```

### 💡 Enregistrer le plugin
```ts
// main.ts
import { createPinia } from 'pinia';
import { persistPlugin } from './stores/plugins/persist';
const pinia = createPinia();
pinia.use(persistPlugin);
app.use(pinia);
```

### ⚠️ Attention
- **Ne pas** stocker de **secrets**.
- Gérer l’**invalidation** (ex. `logout` supprime les données sensibles).

---

## 🧠 8. Intégration Router ↔ Pinia

### 💡 Exemple
```ts
router.beforeEach((to) => {
  const settings = useSettingsStore();
  // Définir thème à partir de query si présent
  const theme = to.query.theme as 'light' | 'dark' | undefined;
  if (theme && ['light', 'dark'].includes(theme)) settings.theme = theme;
});
```

### 🧠 Préchargement conditionnel
```ts
router.beforeResolve(async (to) => {
  // Ex: charger des données critiques du dashboard avant affichage
  if (to.name === 'dashboard') {
    const user = useUserStore();
    if (!user.isAuthenticated) return;
    // fetch essentiel (simplifié)
    await fetch('/api/summary');
  }
});
```

---

## 🧠 9. Tests — stores, components & navigation

### 🛠 Préparation
```ts
// test/setup.ts
import { vi } from 'vitest'; // ou jest si vous utilisez Jest
```

> Si vous utilisez **Jest**, adaptez `import { vi }` par `jest` et configurez `jsdom`.

### 💡 Tester un store Pinia
```ts
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../src/stores/user';

describe('user store', () => {
  beforeEach(() => setActivePinia(createPinia()));
  it('login/logout', () => {
    const s = useUserStore();
    s.login({ id: 'u1', name: 'Eric' });
    expect(s.isAuthenticated).toBe(true);
    s.logout();
    expect(s.isAuthenticated).toBe(false);
  });
});
```

### 💡 Tester navigation (Vue Testing Library)
```ts
import { render, screen, fireEvent } from '@testing-library/vue';
import { createPinia } from 'pinia';
import router from '../src/router';
import App from '../src/App.vue';

it('redirige vers login si non authentifié', async () => {
  const pinia = createPinia();
  render(App, { global: { plugins: [pinia, router] } });
  await router.push('/dashboard');
  await router.isReady();
  expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
});
```

### 💡 Tester composant avec store
```ts
import { render, screen } from '@testing-library/vue';
import { createPinia } from 'pinia';
import Header from '../src/components/Header.vue';
import { useUserStore } from '../src/stores/user';

test('affiche le nom de l’utilisateur', async () => {
  const pinia = createPinia();
  render(Header, { global: { plugins: [pinia] } });
  const s = useUserStore();
  s.login({ id: 'u1', name: 'Eric' });
  expect(await screen.findByText(/Eric/)).toBeInTheDocument();
});
```

---

## 🧠 10. Performance — Code splitting & préchargement

### 🧮 Formule JS (gain estimé)
```js
// Estimer le gain de lazy‑loading pour une vue de taille viewKB
function lazyGain(initialKB, viewKB){
  const saved = viewKB; // déchargé du bundle initial
  const pct = Math.round((saved / Math.max(1, initialKB)) * 100);
  return { savedKB: saved, percent: pct };
}
console.log(lazyGain(300, 80)); // ~26% de réduction du JS initial
```

### ✅ Bonnes pratiques
- **Lazy‑load** toutes les **vues** principales.
- Précharger (`<link rel="prefetch" ...>`) **modérément** pour routes probables.
- Mesurer avec **DevTools** (Coverage) et ajuster.

---

## 🧠 11. Accessibilité — Focus & titres

### ✅ Bonnes pratiques
- Mettre à jour `document.title` via `meta.title`.
- Après navigation, déplacer le **focus** sur le contenu principal.
- `skip‑link` pour accès rapide au `main`.

### 💡 Exemple skip‑link
```html
<a href="#main" class="skip-link">Aller au contenu</a>
<main id="main">…</main>
```

---

## 🧪 12. Exercices guidés

1. **Routes**: Ajoutez une route `/profile/:id` avec vérification de `id` (regex) et titre dynamique.
2. **Guard**: Implémentez un guard global qui refuse l’accès si l’utilisateur n’a pas un rôle `admin`.
3. **Pinia**: Créez un store `cart` (items, total), avec `getters` et `actions` (`add`, `remove`).
4. **Persistance**: Ajoutez la persistance au store `cart` via le plugin.
5. **Tests**: Écrivez un test qui vérifie la redirection de `dashboard` vers `login` (non authentifié).
6. **A11y**: Ajoutez un `skip-link` et vérifiez au test que le focus est sur `main` après navigation.
7. **Perf**: Mesurez la taille des chunks et calculez le `lazyGain`.

---

## ✅ 13. Check‑list Router & Pinia

- [ ] Routes **nommées**, params **validés**.
- [ ] **Lazy‑loading** des vues + `splitChunks`.
- [ ] **Guards** pour auth/rôles + meta **typée**.
- [ ] Store **typé** (state/getters/actions).
- [ ] **Persist** localStorage (sans secrets).
- [ ] Tests **stores** + **navigation**.
- [ ] **Focus** après navigation & titre mis à jour.

---

## 📦 Livrable du chapitre
Une **application multi‑pages**:
- **Router** avec routes nommées, lazy‑loading, `meta` typée et guards.
- **Pinia** pour état global (user/settings/cart) avec persistance.
- **Tests** pour stores et navigation (redir. login, affichage utilisateurs).

---

## 🔚 Résumé essentiel du Chapitre 10
- **Vue Router** structure la navigation via routes **nommées**, **params** et **lazy‑loading**.
- Les **guards** + `meta` **typée** sécurisent l’accès et améliorent l’UX (titres, focus).
- **Pinia** offre un état global **typé** avec `getters`/`actions` et une **persistance** simple.
- Les **tests** garantissent la fiabilité de la navigation et des stores.
- **Performance**: code splitting et préchargement ciblé réduisent le JS initial.

---

> Prochain chapitre: **Performance Web, Accessibilité avancée & SEO** — Core Web Vitals, audits, optimisations, focus management et SEO front.
