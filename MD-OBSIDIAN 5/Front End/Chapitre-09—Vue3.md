
# 📘 Chapitre 9 — Vue 3 (Composition API) – Bases

> 🎯 **Objectifs du chapitre**
> - Comprendre la **réactivité Vue 3**: `ref`, `reactive`, `computed`, `watch`, `watchEffect`.
> - Maîtriser les **composants** avec `<script setup>`, **props**, **events** (`emits`), **slots** et **styles scoped**.
> - Utiliser les **directives** (`v-if`, `v-for`, `v-show`, `v-model`, `:class`, `:style`) et les **modifiers**.
> - Découvrir le **cycle de vie** (`onMounted`, `onUpdated`, `onUnmounted`) et les **composables** (fonctions réutilisables).
> - Concevoir une **mini‑application** avec composants, état local et bonne organisation.

---

## 🧠 1. Pourquoi Vue 3 et sa Composition API ?

### 🔍 Définition
La **Composition API** de Vue 3 (ex. `setup()`, `ref`, `reactive`, `computed`) permet de **composer** la logique par **fonctions** réutilisables (composables), de façon plus **modulaire** et **typable** (idéal avec TypeScript au chapitre 10).

### ❓ Pourquoi
- **Lisibilité**: regrouper la logique par **fonctionnalités** (ex. input + validation + fetch).
- **Réutilisation**: extraire des **composables** (ex. `useFetch`, `useToggle`).
- **Tests**: la logique étant en fonctions pures, elle se **teste** plus facilement.

### 💡 Analogie
Pensez à une **feuille Excel**: chaque cellule dépend d’autres; dans Vue, `computed` est une **cellule calculée**, `watch` est **une macro** déclenchée par un changement.

---

## 🧠 2. Réactivité: `ref` vs `reactive`, `computed`, `watch`

### 🔍 `ref`
Crée un **conteneur réactif** pour une **valeur primitive** ou un **objet**. On accède à la valeur via `.value` dans JS (dans les templates, l’unwrapping est automatique).
```ts
import { ref } from 'vue';
const count = ref(0);
count.value++; // JS
```

### 🔍 `reactive`
Crée un **proxy réactif** pour un **objet**.
```ts
import { reactive } from 'vue';
const state = reactive({ user: null, loading: false });
state.loading = true;
```

### 🔍 `computed`
Valeur **dérivée** (cache + recalcul **lazy**).
```ts
import { ref, computed } from 'vue';
const price = ref(20), qty = ref(3);
const total = computed(() => price.value * qty.value);
```

### 🔍 `watch` & `watchEffect`
- `watch(source, cb)`: observe **source** (ref, getter, array de sources); `cb(newVal, oldVal)`.
- `watchEffect(cb)`: exécute `cb` et **ré‑observe** automatiquement les dépendances.
```ts
import { ref, watch, watchEffect } from 'vue';
const name = ref('Eric');
watch(name, (n, o) => console.log('name:', o, '→', n));
watchEffect(() => console.log('Upper:', name.value.toUpperCase()));
```

### ⚠️ Pièges & bonnes pratiques
- **Toujours** utiliser `.value` pour les `ref` en **JS**.
- **Ne pas** destructurer un `reactive` (perte de réactivité) → utiliser `toRefs`.
```ts
import { reactive, toRefs } from 'vue';
const s = reactive({ a: 1, b: 2 });
const { a, b } = toRefs(s); // a,b sont des ref
```
- Éviter `watch` **profond** sans nécessité; préférez `computed`.

---

## 🧠 3. Composants avec `<script setup>`

### 🔍 Définition
`<script setup>` simplifie l’écriture des composants et **infère** les props/emits. Tout ce qui est déclaré est **visible** dans le template.

### 💡 Exemple — Compteur
```vue
<template>
  <button @click="inc">Compteur: {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
function inc(){ count.value++; }
</script>

<style scoped>
button { padding: .5rem .75rem; border: 0; border-radius: 6px; background: #0b57d0; color: #fff; }
</style>
```

### 🧠 Props & Emits
```vue
<template>
  <h3>{{ title }}</h3>
  <button @click="onLike">👍 {{ likes }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{ title: string; initialLikes?: number }>();
const emit = defineEmits<{ (e: 'liked', value: number): void }>();
const likes = ref(props.initialLikes ?? 0);
function onLike(){ likes.value++; emit('liked', likes.value); }
</script>
```

### 🧠 Slots (injection de contenu)
```vue
<template>
  <Card>
    <template #header>En‑tête</template>
    Contenu principal
    <template #footer>Bas de page</template>
  </Card>
</template>
```

### 🧠 Styles **scoped** & classes dynamiques
```vue
<template>
  <p :class="{ done, highlight: score > 10 }">Statut</p>
</template>
<style scoped>
.done { text-decoration: line-through; }
.highlight { color: #0b57d0; }
</style>
```

---

## 🧠 4. Directives essentielles

### 🔍 `v-if` / `v-show`
```vue
<p v-if="loading">Chargement…</p>
<p v-else>Prêt</p>
<p v-show="visible">Visible sans retirer du DOM</p>
```

### 🔍 `v-for` (avec `key`)
```vue
<li v-for="item in items" :key="item.id">{{ item.name }}</li>
```

### 🔍 `v-model` (+ modifiers)
```vue
<input v-model.trim="email" type="email" />
<input v-model.number="age" type="number" />
```

### 🔍 Binding d’attributs & styles
```vue
<img :src="avatarUrl" :alt="`Portrait de ${name}`" />
<div :style="{ color: theme.primary }">Texte</div>
```

---

## 🧠 5. Cycle de vie & effets

### 🔍 Hooks
- `onMounted` — après insertion dans le DOM.
- `onUpdated` — après mise à jour.
- `onUnmounted` — au démontage.
```ts
import { onMounted, onUnmounted } from 'vue';
onMounted(() => console.log('Composant monté'));
onUnmounted(() => console.log('Bye'));
```

### 🧠 Flush & timing des watchers
```ts
watch(source, cb, { flush: 'post' }); // après mise à jour du DOM
watchEffect(cb, { flush: 'sync' });   // synchronisé
```

---

## 🧠 6. Composables (logique réutilisable)

### 🔍 Définition
Un **composable** est une **fonction** (préfixe `use…`) qui encapsule **état réactif** + **logique**.

### 💡 `useFetch`
```ts
// useFetch.ts
import { ref } from 'vue';
export function useFetch<T>(url: string){
  const data = ref<T|null>(null);
  const error = ref<string|null>(null);
  const loading = ref(false);
  async function run(){
    loading.value = true;
    try {
      const res = await fetch(url);
      if(!res.ok) throw new Error('HTTP ' + res.status);
      data.value = await res.json();
    } catch (e:any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
  run();
  return { data, error, loading, run };
}
```

### 💡 Utilisation
```vue
<script setup lang="ts">
import { useFetch } from './useFetch';
const { data, loading, error } = useFetch<{ id: string; name: string }[]>('/api/users');
</script>
<template>
  <p v-if="loading">Chargement…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <ul v-else>
    <li v-for="u in data" :key="u.id">{{ u.name }}</li>
  </ul>
</template>
```

---

## 🧠 7. Accessibilité (A11y) et Vue

### ✅ Bonnes pratiques
- Utiliser une **sémantique** HTML correcte dans les templates.
- Gérer **focus** et **clavier** (`@keydown.enter`, `@keyup.space`).
- Annoncer les changements dynamiques via **ARIA live regions** si nécessaire.

### 💡 Exemple
```vue
<button aria-live="polite" @click="add">Ajouter</button>
```

---

## 🧠 8. Organisation & conventions

### 📦 Arborescence
```
src/
  components/
    Button.vue
    UserCard.vue
  composables/
    useFetch.ts
    useToggle.ts
  views/
    HomeView.vue
  App.vue
  main.ts
```

### ✅ Conventions
- Nommer les composables `useX`.
- Un composant par fichier, **props** en PascalCase côté JS et **kebab‑case** côté template.
- Éviter la **logique métier** dans les vues; préférer des **composables**.

---

## 🧠 9. Mini‑application — Liste filtrée de produits

### 📦 Objectif
Construire une **liste de produits** avec **filtre** (texte + prix max), état local et composables.

### 💡 `ProductList.vue`
```vue
<template>
  <section>
    <h2>Produits</h2>
    <label>
      Recherche
      <input v-model.trim="q" placeholder="ex. carte" />
    </label>
    <label>
      Prix max
      <input v-model.number="max" type="number" />
    </label>
    <ul>
      <li v-for="p in filtered" :key="p.id">
        <strong>{{ p.name }}</strong> — {{ p.price }} €
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
const products = ref([
  { id: 'p1', name: 'Carte graphique', price: 299 },
  { id: 'p2', name: 'SSD NVMe', price: 129 },
  { id: 'p3', name: 'Écran 27\"', price: 249 },
]);
const q = ref('');
const max = ref(Infinity);
const filtered = computed(() => {
  const qq = q.value.toLowerCase();
  return products.value.filter(p => p.name.toLowerCase().includes(qq) && p.price <= max.value);
});
</script>

<style scoped>
section { max-width: 680px; margin: 1rem auto; }
label { display: block; margin: .5rem 0; }
input { padding: .4rem .6rem; }
</style>
```

### 💡 `App.vue`
```vue
<template>
  <main>
    <ProductList />
  </main>
</template>
<script setup>
import ProductList from './components/ProductList.vue';
</script>
```

### 💡 `main.ts`
```ts
import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');
```

---

## 🧠 10. Formules & théorie (JS) — Modèle réactif simplifié

### 🧮 Propagation de dépendances
```js
// graphe de dépendances (simplifié)
class Cell {
  constructor(expr){ this.expr = expr; this.value = undefined; this.deps = new Set(); }
}
function compute(cell){
  // recalcul lazy
  cell.value = cell.expr();
  for(const d of cell.deps) compute(d); // propagation naïve
}
// Analogie: computed = Cell; watch = effet déclenché quand value change
```

### ✅ Bonnes pratiques de calcul
- Préférer les valeurs **dérivées** (`computed`) aux watchers **impératifs**.
- **Mémoriser** les calculs coûteux via `computed`.

---

## 🧪 11. Exercices guidés

1. **Ref/Reactive**: Transformez un objet en `reactive` puis exposez ses champs via `toRefs`.
2. **Computed**: Créez une liste triée dérivée d’un tableau de tâches.
3. **Watch**: Écoutez un champ de recherche et déclenchez un **fetch** (debounce recommandé).
4. **Props/Emits**: Ajoutez un composant `LikeButton` qui **émet** `liked`.
5. **Slots**: Créez un `Card` avec slots `header` et `footer`.
6. **Lifecycle**: Logguez `onMounted` et nettoyez un intervalle dans `onUnmounted`.
7. **Composable**: Écrivez `useToggle()` qui expose `state` + `toggle()`.

---

## ✅ 12. Check‑list Vue 3 (bases)

- [ ] Utiliser `<script setup>`.
- [ ] `ref` pour primitives; `reactive` pour objets.
- [ ] `computed` pour dériver; `watch` si effet **impératif** nécessaire.
- [ ] **Props** typées; **events** documentés (`emits`).
- [ ] **Slots** pour composition de UI.
- [ ] **Styles scoped** et **classes dynamiques**.
- [ ] Découper en **composables**.
- [ ] Respecter **A11y** (rôles, titres, focus clavier).

---

## 📦 Livrable du chapitre
Une **mini‑application Vue 3**:
- Composant principal `App.vue` + `ProductList.vue`.
- État local via `ref`/`computed`.
- Props/Emits, slots, styles scoped.
- Organisation en `components/` et `composables/`.

---

## 🔚 Résumé essentiel du Chapitre 9
- La **Composition API** structure la logique en **fonctions réactives** (`ref`, `reactive`) et **valeurs dérivées** (`computed`).
- Utiliser `watch`/`watchEffect` pour les **effets**; préférer `computed` pour les valeurs dérivées.
- Les **composants** avec `<script setup>` simplifient props/emits et facilitent la **composition**.
- Les **directives** (`v-if`, `v-for`, `v-model`) sont les briques de base pour l’UI.
- Les **composables** (`useX`) encapsulent et **réutilisent** la logique.
- La **mini‑app** du chapitre démontre état local, filtres et organisation.

---

> Prochain chapitre: **Vue Router, Pinia, TypeScript & Tests** — routes, état global, typage, et tests de composants.
