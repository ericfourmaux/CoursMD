
# Vue 3 – Réactivité approfondie (Guide enrichi)

> **Contenu ajouté** :
> 1) **Tableau de décision** (« Quand utiliser quoi ? »)
> 2) **Exemples SFC complets** (`<script setup>`) prêts à coller dans un projet Vite
> 3) **Diagramme visuel** (Mermaid) du graphe **sources → effets**

---

## 1) Tableau de décision – *Quand utiliser quoi ?*

| Outil | Ce que c’est | À utiliser quand… | Forces | Points d’attention |
|---|---|---|---|---|
| **`ref`** | Boîte réactive autour d’une **valeur unique** (accès `.value` en JS) | Vous manipulez des **primitifs** (nombre, booléen, chaîne), états **simples** (toggle, compteur) | Simple, performant, clair | Ne pas oublier `.value` en JS ; destructuration peut **casser** la réactivité |
| **`reactive`** | **Proxy** réactif d’un **objet/array** (réactivité **profonde**) | États **composés**/imbriqués (objets, tableaux) | Deep tracking, ergonomique dans les templates | Désigner des **props** précises avec `toRefs` pour éviter perte de réactivité |
| **`computed`** | **Valeur dérivée mémoïsée** | Dérivés **affichés souvent**, calculs **non triviaux** | Cache, recalcul seulement si dépendances changent | Pas d’**effets** internes (API/timers) ; pour ça, `watch` |
| **`shallowRef`** | Ref **peu profonde** (ne suit que le changement de `.value`) | **Instances lourdes** externes (Chart, Map, éditeurs), objets **massifs** | Évite le coût du deep tracking | Les mutations **internes** ne déclenchent pas de rendu ; remplacer `.value` |
| **`watch`** | Effet ciblé sur **source(s)** choisie(s) | Besoin de `nv/ov`, `immediate`, `deep`, **debounce**/**cleanup** | Contrôle fin, options riches | Bien choisir `flush` (`pre`/`post`/`sync`) ; penser au **cleanup** |
| **`watchEffect`** | Effet auto‑déclenché par **toutes les lectures** internes | Effet **simple** (logs, subscriptions) sans besoin de `nv/ov` | Très concis, rapide à mettre | Moins contrôlé (toutes les lectures deviennent dépendances) |
| **Hooks** | Cycle de vie du composant (montage, update, destruction) | Intégrer des **plugins** DOM, timers, listeners ; gérer navigation | Nettoyage garanti (`onUnmounted`) ; cohérent avec Composition API | Ne pas oublier le **nettoyage** (listeners/timers) |

> **Règle d’or** : *Dérivés →* `computed`, *Effets →* `watch`/`watchEffect`, *Valeur →* `ref`, *Objets →* `reactive`, *Instances lourdes →* `shallowRef`, *Intégrations →* **Hooks**.

---

## 2) Exemples SFC complets (`<script setup>`) – prêts pour Vite

> **Astuce Vite** : placez ces fichiers dans `src/components/` et importez‑les dans `App.vue`.

### 2.1 `Counter.vue` – `ref` + `computed`
```vue
<template>
  <section class="card">
    <h3>Compteur</h3>
    <p>Valeur: <strong>{{ count }}</strong></p>
    <p>Double (computed): <strong>{{ double }}</strong></p>
    <button @click="inc">+1</button>
    <button @click="reset">Reset</button>
  </section>
</template>
<script setup>
import { ref, computed } from 'vue';
const count = ref(0);
const double = computed(() => count.value * 2);
const inc = () => { count.value++; };
const reset = () => { count.value = 0; };
</script>
<style scoped>
.card { border:1px solid #e2e8f0; border-radius:8px; padding:1rem; }
button { margin-right: .5rem; }
</style>
```

### 2.2 `UserForm.vue` – `reactive` + `watch` (debounce + cleanup)
```vue
<template>
  <section class="card">
    <h3>Formulaire utilisateur</h3>
    <label>Nom: <input v-model.trim="form.name" /></label>
    <label>Email: <input v-model.trim="form.email" type="email" /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <button @click="submit">Envoyer</button>
  </section>
</template>
<script setup>
import { reactive, ref, watch } from 'vue';
const form = reactive({ name: '', email: '' });
const error = ref('');
let timer; // debounce
watch(() => form.email, (nv, _, onCleanup) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nv);
    error.value = ok ? '' : 'Email invalide';
  }, 300);
  onCleanup(() => clearTimeout(timer));
}, { immediate: true });
const submit = () => { if (!error.value) alert(`Nom=${form.name}, Email=${form.email}`); };
</script>
<style scoped>
.card { border:1px solid #e2e8f0; border-radius:8px; padding:1rem; display:grid; gap:.5rem; }
.error { color:#c53030; }
label { display:grid; gap:.25rem; }
</style>
```

### 2.3 `ChartPanel.vue` – `shallowRef` + hooks (init/destroy)
```vue
<template>
  <section class="card">
    <h3>Chart externe</h3>
    <div ref="el" class="chart"></div>
    <button @click="reload">Recharger config</button>
  </section>
</template>
<script setup>
import { shallowRef, onMounted, onUnmounted, ref } from 'vue';
// Simule une lib de chart externe
function createChart(el, cfg){ return { el, cfg, destroy(){ /* ... */ } }; }
const el = ref(null);
const chart = shallowRef(null);
onMounted(() => { chart.value = createChart(el.value, { theme:'light', series:[1,2,3] }); });
onUnmounted(() => chart.value?.destroy?.());
const reload = () => { chart.value = createChart(el.value, { theme:'dark', series:[5,4,3] }); };
</script>
<style scoped>
.card { border:1px solid #e2e8f0; border-radius:8px; padding:1rem; }
.chart { height: 180px; background:#f7fafc; border:1px dashed #cbd5e0; }
</style>
```

### 2.4 `DerivedName.vue` – `computed` get/set
```vue
<template>
  <section class="card">
    <h3>Nom complet (computed settable)</h3>
    <label>Prénom: <input v-model="first" /></label>
    <label>Nom: <input v-model="last" /></label>
    <label>Nom complet: <input v-model="full" /></label>
    <p>Bonjour, <strong>{{ full }}</strong> !</p>
  </section>
</template>
<script setup>
import { ref, computed } from 'vue';
const first = ref('Ada');
const last = ref('Lovelace');
const full = computed({
  get: () => `${first.value} ${last.value}`,
  set: (v) => { const [f, l] = v.split(' '); first.value = f ?? ''; last.value = l ?? ''; }
});
</script>
<style scoped>
.card { border:1px solid #e2e8f0; border-radius:8px; padding:1rem; display:grid; gap:.5rem; }
label { display:grid; gap:.25rem; }
</style>
```

### 2.5 `RouterGuardView.vue` – Hooks du routeur
```vue
<template>
  <section class="card">
    <h3>Édition (avec garde de sortie)</h3>
    <label>Titre: <input v-model.trim="title" /></label>
    <label>Contenu: <textarea v-model.trim="body" rows="4" /></label>
    <p v-if="dirty" class="warn">Modifications non sauvegardées</p>
    <button @click="save">Sauvegarder</button>
  </section>
</template>
<script setup>
import { ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
const title = ref('');
const body = ref('');
const dirty = ref(false);
const save = () => { /* sauvegarde */ dirty.value = false; alert('Sauvegardé'); };
// marquer comme dirty si changement
const mark = () => { dirty.value = true; };
// watchers simples (ex: input events natifs) – ou utilisez watch(title/body)
// Ici on accroche directement via v-model et on set dirty dans les handlers personnalisés si besoin.
onBeforeRouteLeave((_to, _from) => {
  if (dirty.value) {
    const ok = confirm('Quitter sans sauvegarder ?');
    if (!ok) return false; // canceller la navigation
  }
});
</script>
<style scoped>
.card { border:1px solid #e2e8f0; border-radius:8px; padding:1rem; display:grid; gap:.5rem; }
.warn { color:#c53030; }
label { display:grid; gap:.25rem; }
</style>
```

---

## 3) Diagramme visuel (Mermaid) – Graphe **sources → effets**

```mermaid
flowchart TD
  subgraph Sources
    A[ref()]:::src
    B[reactive()]:::src
    C[shallowRef()]:::src
  end
  subgraph Derives & Effects
    D[computed()]:::der
    E[Template Render Effect]:::eff
    F[watch()]:::eff
    G[watchEffect()]:::eff
  end
  subgraph Lifecycle
    H[onMounted/onUnmounted]:::hook
    I[onBeforeRouteUpdate/Leave]:::hook
  end

  A --> D
  A --> E
  A --> F
  A --> G
  B --> D
  B --> E
  B --> F
  B --> G
  C --> E
  C --> F

  H --> E
  I --> F

  classDef src fill:#ebf8ff,stroke:#2b6cb0,color:#2b6cb0;
  classDef der fill:#f0fff4,stroke:#2f855a,color:#22543d;
  classDef eff fill:#fff5f5,stroke:#c53030,color:#822727;
  classDef hook fill:#faf5ff,stroke:#6b46c1,color:#44337a;
```

> **Lecture** : les **Sources** (refs/objets réactifs) alimentent des **dérivés** (`computed`) et des **effets** (rendus, `watch`, `watchEffect`). Les **hooks** orchestrent montage/démontage et la navigation.

---

## 4) Check‑list rapide

- `ref` pour **valeur simple**, `reactive` pour **objets**
- `computed` pour **dérivés** (pas d’effets)
- `watch`/`watchEffect` pour **effets** (avec **cleanup**)
- `shallowRef` pour **instances lourdes**
- Hooks pour **intégrations** (DOM, routeurs) et **nettoyage**
- **Clés stables** dans les listes, évitez les **objets inline** dans templates

---

## 5) Aller plus loin

- Ajoutez une **persistance** (localStorage) avec Pinia/Vuex (voir Chapitre 7)
- Intégrez le **Router** (Chapitre 6) et appliquez les **guards**
- Instrumentez avec **Vue Devtools** (Chapitre 8)

---

**Fin du guide enrichi**
