
# Chapitre 7 : Gestion d’état – Pinia & Vuex (reprise détaillée)

> **Objectif du chapitre** : Introduire la **gestion d’état globale** dans Vue 3 avec **Pinia** (solution officielle recommandée) et **Vuex 4** (historique, encore utilisé). Vous apprendrez :
> - Quand et pourquoi un **store** global est nécessaire
> - Les **concepts** : `state`, **dérivés** (`getters` / `computed`), **mutations/actions** (Vuex) et **actions** (Pinia)
> - Comment **brancher** le store à l’app (
>   `app.use(createPinia())` / `app.use(store)`)
> - Utilisation en **Options API** et **Composition API**
> - **Plugins** (ex. persistance), **modules** et **bonnes pratiques**
> - Intégration avec le **fil rouge To‑Do** et Vue Router

---

## 0) Mini‑projet exécutable (CDN) – Deux variantes : **Pinia** et **Vuex**

> Pour éviter les conflits, voici **deux** versions `index.html` (vous pouvez tester l’une puis l’autre). Elles partagent le fil rouge **To‑Do**.

### A) **Pinia** (recommandé pour Vue 3)

Copiez‑collez dans `index.html` et ouvrez dans votre navigateur :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 7 (Pinia)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/pinia@latest/dist/pinia.iife.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    .row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .todo { display: flex; align-items: center; gap: .5rem; padding: .4rem; border-radius: 6px; }
    .todo.done { text-decoration: line-through; color: #718096; }
    .badge { background: #edf2f7; padding: .25rem .5rem; border-radius: 999px; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 7 : Pinia</h1>
  <div id="app"></div>

  <script>
  const { createApp, ref, computed } = Vue;
  const { createPinia, defineStore } = Pinia;

  // --- Store Pinia ---
  const useTodos = defineStore('todos', {
    state: () => ({
      items: [
        { id: 1, text: 'Lire la doc Vue', done: false },
        { id: 2, text: 'Créer un composant', done: true },
        { id: 3, text: 'Brancher Pinia', done: false }
      ],
      nextId: 4
    }),
    getters: {
      doneCount: (state) => state.items.filter(t => t.done).length,
      // getter dérivé paramétré (retourne une fonction)
      byId: (state) => (id) => state.items.find(t => t.id === id)
    },
    actions: {
      add(text) {
        const t = text?.trim();
        if (!t) return;
        this.items.push({ id: this.nextId++, text: t, done: false });
      },
      toggle(id) {
        const it = this.items.find(x => x.id === id);
        if (it) it.done = !it.done;
      },
      remove(id) {
        const i = this.items.findIndex(x => x.id === id);
        if (i >= 0) this.items.splice(i, 1);
      }
    }
  });

  // --- Composant To‑Do (Composition API) ---
  const TodoList = {
    name: 'TodoList',
    setup() {
      const store = useTodos();
      const input = ref('');
      const add = () => { store.add(input.value); input.value = ''; };
      return { store, input, add };
    },
    template: `
      <div>
        <p class="badge">Faites: {{ store.doneCount }} / {{ store.items.length }}</p>
        <div class="row">
          <input v-model="input" placeholder="Ajouter une tâche" />
          <button @click="add">Ajouter</button>
        </div>
        <div>
          <div v-for="t in store.items" :key="t.id" :class="['todo', { done: t.done }]">
            <input type="checkbox" :checked="t.done" @change="store.toggle(t.id)" />
            <span>{{ t.text }}</span>
            <button @click="store.remove(t.id)">Supprimer</button>
          </div>
        </div>
      </div>
    `
  };

  // --- App racine ---
  const App = { name: 'App', components: { TodoList }, template: `<todo-list />` };
  const app = createApp(App);
  app.use(createPinia());
  app.mount('#app');
  </script>
</body>
</html>
```

### B) **Vuex 4** (pour comparer la sémantique historique)

Copiez‑collez dans `index.html` et ouvrez la page :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 7 (Vuex)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/vuex@4/dist/vuex.global.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    .todo { display: flex; align-items: center; gap: .5rem; padding: .4rem; border-radius: 6px; }
    .todo.done { text-decoration: line-through; color: #718096; }
    .badge { background: #edf2f7; padding: .25rem .5rem; border-radius: 999px; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 7 : Vuex</h1>
  <div id="app"></div>

  <script>
  const { createApp } = Vue;
  const { createStore, useStore } = Vuex;

  // --- Store Vuex ---
  const store = createStore({
    state: () => ({
      items: [
        { id: 1, text: 'Lire la doc Vue', done: false },
        { id: 2, text: 'Créer un composant', done: true },
        { id: 3, text: 'Essayer Vuex', done: false }
      ],
      nextId: 4
    }),
    getters: {
      doneCount: (state) => state.items.filter(t => t.done).length,
      byId: (state) => (id) => state.items.find(t => t.id === id)
    },
    mutations: {
      ADD(state, text) { state.items.push({ id: state.nextId++, text, done: false }); },
      TOGGLE(state, id) { const it = state.items.find(x => x.id === id); if (it) it.done = !it.done; },
      REMOVE(state, id) { const i = state.items.findIndex(x => x.id === id); if (i >= 0) state.items.splice(i, 1); }
    },
    actions: {
      add({ commit }, raw) { const text = raw?.trim(); if (!text) return; commit('ADD', text); },
      toggle({ commit }, id) { commit('TOGGLE', id); },
      remove({ commit }, id) { commit('REMOVE', id); }
    }
  });

  const TodoList = {
    name: 'TodoList',
    setup() {
      const store = useStore();
      const input = Vue.ref('');
      const add = () => { store.dispatch('add', input.value); input.value = ''; };
      return { store, input, add };
    },
    template: `
      <div>
        <p class="badge">Faites: {{ store.getters.doneCount }} / {{ store.state.items.length }}</p>
        <div>
          <input v-model="input" placeholder="Ajouter une tâche" />
          <button @click="add">Ajouter</button>
        </div>
        <div>
          <div v-for="t in store.state.items" :key="t.id" :class="['todo', { done: t.done }]">
            <input type="checkbox" :checked="t.done" @change="store.dispatch('toggle', t.id)" />
            <span>{{ t.text }}</span>
            <button @click="store.dispatch('remove', t.id)">Supprimer</button>
          </div>
        </div>
      </div>
    `
  };

  const App = { name: 'App', components: { TodoList }, template: `<todo-list />` };
  createApp(App).use(store).mount('#app');
  </script>
</body>
</html>
```

---

## 1) Pourquoi un **store** global ?

### Définition
Un **store** centralise l’**état partagé** \(S\) et les **règles** de mise à jour. Il évite les **prop‑drilling** (props à rallonge) et **émissions d’événements** en cascade.

### Pourquoi ?
- **Cohérence** : une **source de vérité** unique
- **Lisibilité** : localisation des **règles** métier
- **Testabilité** : actions/mutations isolables
- **Outils** : DevTools (time‑travel, tracing)

**Analogie** : Un **poste de contrôle** (control tower) qui coordonne tous les flux. Les composants **consultent** et **demandent** des modifications via des **actions/mutations**.

---

## 2) Concepts formels & différences Pinia / Vuex

### State
- Référentiel \(S\) partagé, typiquement un **objet** réactif.

### Dérivés (Getters)
- Fonctions \( g: S \to D \) (ex. `doneCount`). **Mémoïsés** (comme computed) si dépendances inchangées.

### Mutations / Actions
- **Vuex** :
  - **Mutations** \( \mu: S \times P \to S \) → **synchrones** (journalisables)
  - **Actions** \( \alpha: P \to S \) → **asynchrones** (appellent des mutations)
- **Pinia** :
  - **Actions** (synchro/async) qui peuvent **muter** directement l’état (`this.items.push(...)`) ; pas de couche `mutations` séparée

### Ergonomie
- **Pinia** est **composition‑friendly** (retourne un **composable** store), TypeScript‑friendly, API **simple**.
- **Vuex 4** conserve le **pattern** historique (mutations/actions) apprécié pour le traçage précis.

> **Choix pratique** : pour Vue 3, partez sur **Pinia** par défaut. Utilisez **Vuex** si vous avez un **legacy** ou si vos standards imposent le pattern mutations.

---

## 3) Brancher le store à l’application

- **Pinia** : `app.use(createPinia())` puis `const store = useTodos()` en `setup()`.
- **Vuex** : `app.use(store)` puis `this.$store` (Options) ou `useStore()` (Composition).

---

## 4) Utilisation en composants

### Composition API (Pinia)
```js
const store = useTodos();
store.add('Tâche');
store.toggle(1);
const n = store.doneCount; // getter
```

### Options API (Vuex)
```js
export default {
  computed: {
    items() { return this.$store.state.items; },
    doneCount() { return this.$store.getters.doneCount; }
  },
  methods: {
    add(text) { this.$store.dispatch('add', text); },
    toggle(id) { this.$store.dispatch('toggle', id); }
  }
};
```

---

## 5) Plugins & persistance

### Pinia – plugin simple (persistance `localStorage`)
```js
// pinia-plugin-persist-like (minimaliste)
function persistPlugin({ store }) {
  const key = `pinia:${store.$id}`;
  const saved = localStorage.getItem(key);
  if (saved) store.$patch(JSON.parse(saved));
  store.$subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
}

const pinia = createPinia();
pinia.use(persistPlugin);
app.use(pinia);
```

### Vuex – plugin
```js
const persist = (store) => {
  const key = 'vuex:root';
  const saved = localStorage.getItem(key);
  if (saved) store.replaceState(JSON.parse(saved));
  store.subscribe((mutation, state) => {
    localStorage.setItem(key, JSON.stringify(state));
  });
};

const store = createStore({ /* ... */ , plugins: [persist] });
```

> **Attention** : filtrer (whitelist) ce que vous persistez (évitez tokens sensibles en clair).

---

## 6) Modules & organisation du code

### Vuex (modules)
```js
const todos = {
  namespaced: true,
  state: () => ({ items: [] }),
  mutations: { /* ... */ },
  actions: { /* ... */ },
  getters: { /* ... */ }
};

const store = createStore({ modules: { todos } });
```

### Pinia (stores multiples)
Créez plusieurs `defineStore()` (`useTodos`, `useUser`, `useSettings`) et composez‑les en `setup()`.

**Bonnes pratiques** : séparer **domaine** par store/module ; éviter un « mega‑store ».

---

## 7) Intégration Router + Store (fil rouge)

- Stockez l’**id** courant (ex. `currentId`) ou utilisez `route.params.id`.
- Déclenchez des **actions** avant entrée de route (`beforeEnter`) pour **précharger**.
- Utilisez les **getters** pour les pages Stats (ex. `doneCount`).

Exemple (Pinia + Router hook local) :
```js
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
const route = useRoute();
const todos = useTodos();
onBeforeRouteUpdate((to) => {
  const id = Number(to.params.id);
  // éventuel chargement async ici
});
```

---

## 8) Exercices pratiques

1. **Actions asynchrones**
   - Dans Pinia, créez `async fetchTodos()` qui simule un `fetch` (
   `setTimeout`) et `patch` l’état.
   - Dans Vuex, créez une `action` `fetchTodos` qui `commit('SET_TODOS', data)`.

2. **Persistance sélective**
   - Écrivez un plugin Pinia/Vuex qui persiste **uniquement** `items` du module `todos`.

3. **Stores modulaires**
   - Créez `useUser` (Pinia) ou module `user` (Vuex) avec `login/logout` et persistance basique.

4. **Intégration Router**
   - Ajoutez route `/todos/:id/edit` et chargez l’élément via getter `byId(id)`.
   - Bloquez la sortie si le formulaire n’est pas sauvegardé (`beforeRouteLeave`).

---

## 9) Résumé – Points clés
- **Pinia** : simple, composition‑friendly, actions mutent directement l’état.
- **Vuex** : mutations + actions, traçage précis.
- **Getters** : dérivés mémoïsés (comme computed).
- **Plugins** : persistance localStorage (avec prudence).
- **Organisation** : domaines par store/module ; intégration Router pour préchargement et navigation.

---

## 10) Annexes – SFC (exemples rapides)

### `stores/todos.ts` (Pinia)
```ts
import { defineStore } from 'pinia';
export const useTodos = defineStore('todos', {
  state: () => ({ items: [], nextId: 1 }),
  getters: {
    doneCount: (state) => state.items.filter(t => t.done).length,
    byId: (state) => (id: number) => state.items.find(t => t.id === id)
  },
  actions: {
    add(text: string) { this.items.push({ id: this.nextId++, text, done: false }); },
    toggle(id: number) { const it = this.items.find(x => x.id === id); if (it) it.done = !it.done; }
  }
});
```

### `store/index.ts` (Vuex 4)
```ts
import { createStore } from 'vuex';
export default createStore({
  state: () => ({ items: [], nextId: 1 }),
  getters: { doneCount: (s) => s.items.filter(t => t.done).length },
  mutations: {
    ADD(s, text: string) { s.items.push({ id: s.nextId++, text, done: false }); },
    TOGGLE(s, id: number) { const it = s.items.find(x => x.id === id); if (it) it.done = !it.done; }
  },
  actions: {
    add({ commit }, text: string) { commit('ADD', text); },
    toggle({ commit }, id: number) { commit('TOGGLE', id); }
  }
});
```

---

> 🔜 **Prochain chapitre** : **Bonnes pratiques & DevTools** – organisation avancée, profiling, perf, et patterns utiles.
