
# Chapitre 6 : Vue Router (Introduction, reprise détaillée)

> **Objectif du chapitre** : Mettre en place la **navigation** dans une application Vue 3 avec **Vue Router 4**. Vous apprendrez : configuration du routeur, **routes** (simples, nommées, dynamiques, imbriquées), **liens** (`<router-link>`), **navigation programmatique** (`router.push`), **gardiens de navigation** (global, par-route, par-composant), **lazy‑loading**, **scrollBehavior**, et gestion des **404**.

---

## 0) Mini‑projet exécutable (CDN) – Router de base + fil rouge To‑Do

> **But** : Créer un mini‑SPA avec 4 vues (Accueil, Détails To‑Do, Statistiques, Paramètres), démontrer routes **dynamiques**, **imbriquées**, **liens actifs**, **navigation programmatique**, **gardiens** et **lazy‑loading**.

Copiez ce bloc dans `index.html` et ouvrez‑le dans votre navigateur.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 6 (Vue Router)</title>
  <!-- Vue 3 & Vue Router 4 en mode global -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/vue-router@4/dist/vue-router.global.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    nav { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .router-link-active { font-weight: 600; text-decoration: underline; }
    .container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
    .row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .todo { display: flex; align-items: center; gap: .5rem; padding: .4rem; border-radius: 6px; }
    .todo.done { text-decoration: line-through; color: #718096; }
    .badge { background: #edf2f7; padding: .25rem .5rem; border-radius: 999px; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 6 : Vue Router (Introduction)</h1>
  <div id="app"></div>

  <script>
  const { createApp, ref, computed, defineAsyncComponent } = Vue;
  const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter;

  // --- Données fil rouge (simples, en mémoire) ---
  const todos = ref([
    { id: 1, text: 'Lire la doc Vue', done: false },
    { id: 2, text: 'Créer un composant', done: true },
    { id: 3, text: 'Configurer le router', done: false }
  ]);
  const isAuth = ref(false); // démo gardien

  // --- Vues ---
  const HomeView = {
    name: 'HomeView',
    setup() {
      const router = useRouter();
      const gotoTodo = (id) => router.push({ name: 'todo-details', params: { id } });
      const doneCount = computed(() => todos.value.filter(t => t.done).length);
      const toggle = (id) => {
        const t = todos.value.find(x => x.id === id);
        if (t) t.done = !t.done;
      };
      return { todos, gotoTodo, doneCount, toggle };
    },
    template: `
      <div class="container">
        <h2>Accueil</h2>
        <p class="badge">Tâches réalisées: {{ doneCount }}</p>
        <div>
          <div v-for="t in todos" :key="t.id" :class="['todo', { done: t.done }]">
            <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
            <span>{{ t.text }}</span>
            <button @click="gotoTodo(t.id)">Détails</button>
          </div>
        </div>
      </div>
    `
  };

  const TodoDetailsView = {
    name: 'TodoDetailsView',
    // props via route (voir config de route: props:true)
    props: ['id'],
    setup(props) {
      const item = computed(() => todos.value.find(t => String(t.id) === String(props.id)));
      const router = useRouter();
      const back = () => router.push({ name: 'home' });
      return { item, back };
    },
    template: `
      <div class="container">
        <h2>Détails To‑Do #{{ id }}</h2>
        <p v-if="item">Texte: <strong>{{ item.text }}</strong> – Fait? <strong>{{ item.done }}</strong></p>
        <p v-else>Élément introuvable.</p>
        <button @click="back">Retour</button>
      </div>
    `
  };

  // Lazy‑loading de la vue Stats via defineAsyncComponent
  const StatsView = defineAsyncComponent(() => new Promise(resolve => {
    setTimeout(() => resolve({
      name: 'StatsView',
      setup() {
        const total = computed(() => todos.value.length);
        const done = computed(() => todos.value.filter(t => t.done).length);
        return { total, done };
      },
      template: `
        <div class="container">
          <h2>Statistiques (lazy)</h2>
          <p>Total: {{ total }} | Réalisées: {{ done }}</p>
        </div>
      `
    }), 400); // simule un chargement asynchrone
  }));

  // Vues imbriquées: Settings + sous‑routes
  const SettingsLayout = {
    name: 'SettingsLayout',
    template: `
      <div class="container">
        <h2>Paramètres</h2>
        <nav class="row">
          <router-link to="profile">Profil</router-link>
          <router-link to="preferences">Préférences</router-link>
        </nav>
        <router-view />
      </div>
    `
  };
  const SettingsProfile = { name: 'SettingsProfile', template: `<p>Profil utilisateur</p>` };
  const SettingsPreferences = { name: 'SettingsPreferences', template: `<p>Préférences d\'affichage</p>` };

  const LoginView = {
    name: 'LoginView',
    setup() {
      const router = useRouter();
      const login = () => { isAuth.value = true; router.push({ name: 'settings' }); };
      return { login };
    },
    template: `
      <div class="container">
        <h2>Connexion</h2>
        <p>Accédez aux paramètres après connexion.</p>
        <button @click="login">Se connecter</button>
      </div>
    `
  };

  const NotFoundView = { name: 'NotFoundView', template: `<div class="container"><h2>404</h2><p>Page non trouvée.</p></div>` };

  // --- Définition des routes ---
  const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/todos/:id', name: 'todo-details', component: TodoDetailsView, props: true },
    { path: '/stats', name: 'stats', component: StatsView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/settings', name: 'settings', component: SettingsLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'profile', name: 'settings-profile', component: SettingsProfile },
        { path: 'preferences', name: 'settings-preferences', component: SettingsPreferences }
      ]
    },
    // 404 catch‑all (Vue Router 4)
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
  ];

  // --- Création du routeur ---
  const router = createRouter({
    history: createWebHashHistory(), // ou createWebHistory() si serveur configuré
    routes,
    scrollBehavior(to, from, saved) {
      // Si on a une position sauvegardée (back/forward) on la restore, sinon top
      return saved || { left: 0, top: 0 };
    },
    // linkActiveClass: 'is-active', linkExactActiveClass: 'is-exact' // (optionnel)
  });

  // --- Gardien global (auth simulée) ---
  router.beforeEach((to, from) => {
    if (to.meta.requiresAuth && !isAuth.value) {
      return { name: 'login' }; // redirige vers login
    }
  });

  // --- App racine ---
  const App = {
    name: 'App',
    template: `
      <div>
        <nav>
          <router-link :to="{ name: 'home' }">Accueil</router-link>
          <router-link :to="{ name: 'stats' }">Statistiques</router-link>
          <router-link :to="{ name: 'settings' }">Paramètres</router-link>
          <router-link :to="{ name: 'login' }">Connexion</router-link>
        </nav>
        <router-view />
      </div>
    `
  };

  createApp(App).use(router).mount('#app');
  </script>
</body>
</html>
```

---

## 1) Pourquoi un routeur ? (définition & motivation)

### Définition
**Vue Router** est la bibliothèque officielle de **routing** pour Vue 3. Elle permet de créer une **Single‑Page Application (SPA)** composée de **vues** (composants) navigables via des **routes**.

### Pourquoi ?
- **Organisation** : découper l’app en pages/vues.
- **URL significatives** : deep‑linking, partage d’état via l’URL (`params`, `query`).
- **Expérience SPA** : navigation sans rechargement, gestion de l’historique.

**Analogie** : Le routeur est un **GPS de l’application** — il relie les « adresses » (URLs) aux « destinations » (composants). Le navigateur demande une rue (`/stats`), Vue Router vous emmène au bon écran.

---

## 2) Créer et configurer un routeur

### Les bases
- **Importer** (CDN global) : `VueRouter` expose `createRouter`, `createWebHashHistory`, `createWebHistory`.
- **Définir** un tableau `routes` : chaque entrée associe `path` → `component` (et optionnellement `name`, `props`, `children`, `meta`).
- **Créer** le routeur : `createRouter({ history, routes, ... })`.
- **Installer** dans l’app : `app.use(router)`.

### Histories
- `createWebHashHistory()` : `/#/route` (simple, pas de config serveur).
- `createWebHistory()` : URLs « propres » (`/route`) — nécessite **réécriture serveur** pour renvoyer `index.html`.

### scrollBehavior
Gère la position de défilement lors des navigations : `savedPosition` (back/forward) ou **top**.

---

## 3) Routes : simples, nommées, dynamiques, imbriquées

### Simples
```js
{ path: '/', component: HomeView }
```

### Nommées (recommandé)
```js
{ path: '/stats', name: 'stats', component: StatsView }
```
Navigation : `router.push({ name: 'stats' })`.

### Dynamiques (`:param`)
```js
{ path: '/todos/:id', name: 'todo-details', component: TodoDetailsView, props: true }
```
- `props: true` → injecte `id` (String) en **prop** du composant.
- Accès via `route.params.id` (avec `useRoute()`) ou via **prop**.

### Imbriquées (nested)
```js
{ path: '/settings', component: SettingsLayout, children: [
  { path: 'profile', component: SettingsProfile },
  { path: 'preferences', component: SettingsPreferences }
]}
```
Rendu via `<router-view />` **dans** le parent.

### 404 (catch‑all)
```js
{ path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
```

---

## 4) Liens & navigation programmatique

### `<router-link>`
- `to="/stats"` ou `:to="{ name: 'stats' }"`.
- Classes auto : `router-link-active`, `router-link-exact-active`.
- Personnalisation : `linkActiveClass`, `linkExactActiveClass`.

### Navigation programmatique
- `router.push('/stats')` ou `router.push({ name: 'stats' })`.
- Navigations relatives, **remplacement** : `router.replace(...)`.

### `useRoute()` / `useRouter()`
- `useRoute()` → lire `params`, `query`, `meta`.
- `useRouter()` → effectuer des **navigations**.

---

## 5) Gardiens de navigation (guards)

### Global (`beforeEach`) – ex. **auth**
```js
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuth.value) return { name: 'login' };
});
```

### Par‑route
```js
{
  path: '/admin', component: AdminView,
  beforeEnter(to, from) {
    // logique spécifique à la route
  }
}
```

### Par‑composant (Options API)
```js
export default {
  beforeRouteEnter(to, from, next) { next(); },
  beforeRouteUpdate(to, from) { /* réagir au changement de params */ },
  beforeRouteLeave(to, from) { /* confirmation de sortie */ }
};
```

### Composition API
Utilisez les **composables** du routeur (dans `setup`) :
```js
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
onBeforeRouteUpdate((to, from) => { /* ... */ });
onBeforeRouteLeave((to, from) => { /* ... */ });
```

> **Bonnes pratiques** : placez les règles **globales** (auth, analytics) dans `beforeEach`, la logique **spécifique** dans `beforeEnter`, et les **confirmations** dans `beforeRouteLeave`.

---

## 6) Lazy‑loading & code splitting

### Pourquoi ?
Réduire le **bundle initial** en chargeant des vues **à la demande**.

### Comment ?
- SFC/ESM : `component: () => import('./views/StatsView.vue')`.
- CDN/démo : `defineAsyncComponent(() => Promise.resolve({ ... }))` (voir mini‑projet).

> **Astuce** : combinez lazy‑loading avec des **groupes de préchargement** si votre build tool le permet.

---

## 7) Query & navigation

- Lire une **query** : `useRoute().query.q`.
- Naviguer avec **query** : `router.push({ name: 'search', query: { q: 'vue' } })`.
- Gardez les **types** en tête (tout est **string** en URL).

---

## 8) Exercices pratiques

1. **Routes dynamiques (To‑Do)**
   - Ajouter une route `/todos/:id/edit` avec formulaire de modification.
   - Bloquer l’accès si `id` inexistant (rediriger vers 404).

2. **Gardiens**
   - Exiger l’auth sur `/settings/*` ; rediriger vers `/login`.
   - Ajouter une confirmation de sortie via `beforeRouteLeave` (si le formulaire n’est pas sauvegardé).

3. **Lazy‑loading**
   - Charger `/stats` en lazy via `() => import(...)` (dans un projet bundlé).
   - Afficher un **squelette** pendant le chargement (via `defineAsyncComponent` options).

4. **Scroll & query**
   - Implémenter `scrollBehavior` qui restaure `savedPosition` ou `top`.
   - Ajoutez une page `/search?q=...` et lisez `route.query.q`.

---

## 9) Résumé – Points clés
- Vue Router 4 structure la **navigation** d’une SPA Vue 3.
- Routes **simples/nommées/dynamiques/imbriquées** + **404**.
- `<router-link>` + **classes actives** ; `router.push`/**replace**.
- **Gardiens** : **global**, **par‑route**, **par‑composant**.
- **Lazy‑loading** pour réduire le **bundle initial**.
- `scrollBehavior`, `params`, `query`, `meta` pour une expérience riche.

---

## 10) Annexes – SFC (exemples)

### `router/index.ts` (TypeScript, projet Vite)
```ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/todos/:id', name: 'todo-details', component: () => import('@/views/TodoDetailsView.vue'), props: true },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsLayout.vue'),
      children: [
        { path: 'profile', name: 'settings-profile', component: () => import('@/views/SettingsProfile.vue') },
        { path: 'preferences', name: 'settings-preferences', component: () => import('@/views/SettingsPreferences.vue') }
      ]
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') }
  ],
  scrollBehavior(to, from, saved) { return saved || { top: 0 }; }
});

router.beforeEach((to) => { if (to.meta.requiresAuth) {/* check auth */} });
export default router;
```

### Gardiens par‑composant (Options API)
```vue
<script>
export default {
  beforeRouteLeave(to, from) {
    const leave = confirm('Quitter la page ?');
    if (!leave) return false;
  }
};
</script>
```

### Composition API (hooks du routeur)
```vue
<script setup lang="ts">
import { onBeforeRouteUpdate, onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

onBeforeRouteUpdate((to, from) => {
  // réagir aux changements de params
});
onBeforeRouteLeave((to, from) => {
  // confirmation éventuelle
});
</script>
```

---

> 🔜 **Prochain chapitre** : **Gestion d’état (Vuex / Pinia – Introduction)** – state global, mutations/actions, stores modulaires, et intégration avec Vue Router.
