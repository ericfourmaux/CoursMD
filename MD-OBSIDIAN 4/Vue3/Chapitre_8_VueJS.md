
# Chapitre 8 : Bonnes pratiques & DevTools (reprise détaillée)

> **Objectif du chapitre** : Adopter des **bonnes pratiques** de développement Vue 3 et exploiter **Vue Devtools** pour déboguer, profiler et optimiser. Nous couvrirons :
> - Organisation du **code & des dossiers**, conventions de **nommage**
> - **Qualité** : ESLint/Prettier, types, tests
> - Bonnes pratiques **réactivité/composants** (computed, watch, props/emit, slots)
> - Bonnes pratiques **performance** (listes, clés, rendu conditionnel, `:class`/`:style`, `keep-alive`, lazy, virtualisation)
> - **Vue Devtools** : inspection de composants, **time-travel** Pinia/Vuex, Timeline, Profiler
> - **Techniques de debug** (trace de dépendances, `watchEffect` cleanup, `console.time`)
> - Exercices pratiques

---

## 0) Mini-projet exécutable (CDN) – Démo bonnes pratiques & debug

> Ce mini-projet illustre : organisation, computed vs methods, `watch` avec cleanup, `keep-alive`, navigation simulée, et instrumentation de performance.

Copiez-collez dans `index.html` puis ouvrez dans votre navigateur.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 8 (Bonnes pratiques & DevTools)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    nav { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
    .row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
    .todo { display: flex; align-items: center; gap: .5rem; padding: .4rem; border-radius: 6px; }
    .todo.done { text-decoration: line-through; color: #718096; }
    .muted { color: #718096; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 8 : Bonnes pratiques & DevTools</h1>
  <div id="app"></div>

  <script>
  const { createApp, ref, reactive, computed, watchEffect, onMounted, onUnmounted } = Vue;

  /* Organisation indicative (SFC/Projet réel)
    src/
      components/
      views/
      stores/
      composables/    // hooks réutilisables (useX)
      services/       // API/fetch
      assets/
      App.vue
      main.ts
  */

  // Composable : logique réutilisable
  function useTodos() {
    const items = reactive([
      { id: 1, text: 'Lire la doc', done: false },
      { id: 2, text: 'Refactor composants', done: true },
      { id: 3, text: 'Optimiser liste', done: false }
    ]);
    const nextId = ref(4);
    const doneCount = computed(() => items.filter(t => t.done).length);
    const add = (text) => { const t = text.trim(); if (!t) return; items.push({ id: nextId.value++, text: t, done: false }); };
    const toggle = (id) => { const it = items.find(x => x.id === id); if (it) it.done = !it.done; };
    const remove = (id) => { const i = items.findIndex(x => x.id === id); if (i >= 0) items.splice(i, 1); };
    return { items, doneCount, add, toggle, remove };
  }

  const HomeView = {
    name: 'HomeView',
    setup() {
      const { items, doneCount, add, toggle, remove } = useTodos();
      const input = ref('');

      // watchEffect avec cleanup pour debug (ex. abonnement)
      let interval;
      watchEffect((onCleanup) => {
        console.time('recalc-done'); // instrumentation basique
        const _ = doneCount.value;   // force la dépendance
        console.timeEnd('recalc-done');
        interval = setInterval(() => {/* tick de démonstration */}, 2000);
        onCleanup(() => clearInterval(interval));
      });

      const addItem = () => { add(input.value); input.value = ''; };

      return { items, doneCount, input, addItem, toggle, remove };
    },
    template: `
      <div class="card">
        <h2>Accueil</h2>
        <p class="muted">Bonnes pratiques : computed, watchEffect cleanup, pas d'objets inline lourds dans le template.</p>
        <div class="row">
          <input v-model="input" placeholder="Ajouter" />
          <button @click="addItem">Ajouter</button>
          <span>Faits: {{ doneCount }} / {{ items.length }}</span>
        </div>
        <div>
          <div v-for="t in items" :key="t.id" :class="['todo', { done: t.done }]">
            <input type="checkbox" :checked="t.done" @change="toggle(t.id)" />
            <span>{{ t.text }}</span>
            <button @click="remove(t.id)">Supprimer</button>
          </div>
        </div>
      </div>
    `
  };

  const StatsView = {
    name: 'StatsView',
    setup() {
      const { items, doneCount } = useTodos();
      const total = computed(() => items.length);
      const ratio = computed(() => total.value ? (doneCount.value / total.value) : 0);
      return { total, doneCount, ratio };
    },
    template: `
      <div class="card">
        <h2>Statistiques</h2>
        <p>Total: {{ total }} | Faits: {{ doneCount }} | Ratio: {{ (ratio * 100).toFixed(1) }}%</p>
      </div>
    `
  };

  const views = { home: HomeView, stats: StatsView };

  const App = {
    name: 'App',
    setup() {
      const current = ref('home');
      const Comp = computed(() => views[current.value]);
      const keep = ref(true);
      return { current, Comp, keep };
    },
    template: `
      <div>
        <nav>
          <button @click="current = 'home'">Accueil</button>
          <button @click="current = 'stats'">Stats</button>
          <label><input type="checkbox" v-model="keep" /> keep-alive</label>
        </nav>
        <keep-alive v-if="keep">
          <component :is="Comp" />
        </keep-alive>
        <component v-else :is="Comp" />
      </div>
    `
  };

  createApp(App).mount('#app');
  </script>
</body>
</html>
```

---

## 1) Organisation du code & conventions

### Dossiers (suggestion)
- `components/` : petits composants réutilisables (boutons, cards)
- `views/` : pages (routées)
- `stores/` : état global (Pinia/Vuex)
- `composables/` : hooks réutilisables (`useXxx`)
- `services/` : appels API, adapters
- `assets/` : images, styles globaux

### Nommage & SFC
- **Composants** : `PascalCase` (`UserCard.vue`), **fichiers** souvent `kebab-case`
- Ordre SFC : `<template>`, `<script setup>` (ou `<script>`), `<style scoped>`
- Props **en lecture seule** (dans l’enfant), mises à jour via **emit** ou **v-model:prop**
- Logique métier **en script/composables**, pas dans le template

### Qualité
- **ESLint** + **Prettier** : lint + format
- Types : **TypeScript** recommandé (ou JSDoc)
- Tests : **unitaires** (Vue Test Utils), **intégration** (Cypress/Playwright)

**Analogie** : Une bibliothèque bien rangée : sections (dossiers), étiquettes (noms), règles de prêt (props/emit).

---

## 2) Bonnes pratiques de réactivité & composants

- **Computed > Methods** pour dérivés fréquents (mémoïsation)
- **watch** pour effets (IO, timers), **cleanup** via callback `onCleanup`
- **Props en lecture seule** : ne pas muter dans l’enfant ; préférez **emit** ou `v-model:prop`
- **Slots** : documenter les **slot props** ; garder la logique dans l’enfant
- **Éviter les objets inline lourds** dans `:class`/`:style` et fonctions anonymes **directement** dans le template (crée une nouvelle référence à chaque rendu)
- **Clés de liste** : **jamais** l’index ; utiliser une **clé stable** (id)
- **Transitions** : éviter les animations coûteuses sur **grandes listes**

**Exemple – `watchEffect` avec cleanup**
```js
watchEffect((onCleanup) => {
  const val = source.value; // dépendance
  const handle = startSubscription(val);
  onCleanup(() => stopSubscription(handle));
});
```

---

## 3) Performance (rendu & interaction)

- **Rendu conditionnel** : `v-if` démonte/remonte (moins coûteux si rare) ; `v-show` toggle rapide si fréquent
- **Listes** : key stable, pagination, **virtualisation** (lib dédiée) pour > 1000 items
- **Styles & classes** : pré-calculer via **computed** (évite nouveaux objets à chaque rendu)
- **keep-alive** : mémorise état des **composants dynamiques** (vues), pratique pour onglets
- **Lazy‑loading** : charger au besoin (Router, images)
- **Debounce/Throttle** : pour inputs, scroll, resize
- **markRaw / shallowRef** (avancé) : éviter la **profonde réactivité** d’objets lourds (lib tierces)

**Exemple – classes pré-calculées**
```js
const cls = computed(() => ({ todo: true, done: t.done, important: t.important }));
// <div :class="cls">...</div>
```

---

## 4) Vue Devtools – Inspection & Profiling

### Installation
- Extension navigateur (Chrome/Firefox) : **Vue Devtools**

### Outils principaux
- **Components** : inspecter la **hiérarchie**, props, état, computed
- **Pinia/Vuex** : time‑travel, voir **mutations/actions** et **snapshots** d’état
- **Timeline** : événements, renders, perf
- **Profiler** : mesurer le temps de rendu de composants

### Méthodes de debug additionnelles
- `console.time()` / `console.timeEnd()` pour mesurer une section
- `performance.now()` pour timings fins
- Logs contrôlés via **stores**/**composables** (centraliser la journalisation)

**Analogie** : Devtools = **stéthoscope** de l’application. On écoute ce qui se passe (renders, state changes) et on cible les zones à optimiser.

---

## 5) Techniques de debug réactivité

- **Problème : computed non mis à jour** → vérifier que la **source réactive** est **bien lue** dans la fonction
- **watch d’objet non déclenché** → par défaut, non‑deep ; utiliser `watch(obj, cb, { deep: true })` ou `watch(() => obj.prop, cb)`
- **Refs non retournés** dans `setup()` → invisibles dans le template
- **Props mutées** dans l’enfant → avertissement ; corriger par **emit**

**Exemple – éviter le faux deep**
```js
const state = reactive({ user: { name: 'Alice' } });
watch(() => state.user.name, (nv, ov) => { /* ... */ });
// plutôt que watch(state, ..., { deep: true }) si seule la name importe
```

---

## 6) Exercices pratiques

1. **Devtools Components & Timeline**
   - Ouvrez Devtools, inspectez `HomeView`, trouvez `doneCount` et observez quand il recalcul.
   - Timeline : repérez les renders lors du toggle de tâches.

2. **Profiler**
   - Mesurez le temps de rendu de la liste To‑Do (avec 500 items simulés).
   - Réduisez le coût en **pré‑calculant** classes/styles via computed.

3. **watchEffect cleanup**
   - Ajoutez un abonnement fictif (interval) et vérifiez qu’il est bien **nettoyé** lors du changement de vue.

4. **keep‑alive**
   - Activez/désactivez `keep-alive` et observez l’état conservé (input, scroll).

5. **Virtualisation** (bonus)
   - Intégrez une lib de virtualisation (en projet Vite) et comparez le nombre de DOM nodes.

---

## 7) Résumé – Points clés
- **Organisation** claire (components/views/stores/composables/services)
- **Computed > Methods** pour dérivés ; **watch** pour effets (avec **cleanup**)
- **Props** immuables côté enfant → **emit** / `v-model:prop`
- **Perf** : clés stables, `v-if`/`v-show`, computed pour classes/styles, **keep-alive**, **lazy**
- **Devtools** : Components, Timeline, Profiler, time‑travel stores
- **Debug réactivité** : dépendances bien lues, `watch(() => nested.prop)`, pas d’objets inline lourds

---

## 8) Annexes – Snippets SFC

### `useList.ts` (composable)
```ts
import { ref, reactive, computed } from 'vue';
export function useList() {
  const items = reactive([] as { id:number; text:string; done:boolean }[]);
  const nextId = ref(1);
  const doneCount = computed(() => items.filter(t => t.done).length);
  const add = (text:string) => items.push({ id: nextId.value++, text, done:false });
  return { items, doneCount, add };
}
```

### `HomeView.vue`
```vue
<template>
  <div class="card">
    <input v-model="input" />
    <button @click="addItem">Ajouter</button>
    <p>Faits: {{ doneCount }} / {{ items.length }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useList } from '@/composables/useList';
const { items, doneCount, add } = useList();
const input = ref('');
const addItem = () => { if (input.value.trim()) add(input.value.trim()); input.value=''; };
</script>
<style scoped>
.card{ border:1px solid #e2e8f0; border-radius:8px; padding:1rem; }
</style>
```

---

> 🔜 **Prochain chapitre** : **Projet final** – Intégration complète (Router + Pinia + composants + styles dynamiques + persistance locale), avec check‑list de bonnes pratiques et livrable en SFC.
