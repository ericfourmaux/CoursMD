
# Vue 3 – Réactivité approfondie : `ref`, `reactive`, `computed`, `shallowRef`, `watch`, `hooks`

> **But de ce guide** : Comprendre clairement **les primitives de réactivité** de Vue 3 et savoir **quand** et **comment** les utiliser, avec des exemples simples et complets.

---

## 1) Vue 3 – Réactivité : vue d’ensemble

### Définition
La réactivité Vue 3 repose sur :
- des **proxies** JavaScript (pour les objets) qui "interceptent" lecture/écriture;
- un système de **dépistage des dépendances** : lorsque une **source** change (ref/objet réactif), les **effets** (rendus, `computed`, `watch`) qui en dépendent sont **re-déclenchés**.

### Modèle simplifié
- Soit un **état** \( S \) (objets réactifs + refs), et des **dérivés** \( f_i(S) \) (ex. `computed`).
- Vue maintient un graphe **dépendances → effets**. Un changement sur \( S \) invalide les \( f_i \) qui le lisent → **recalcul / re-rendu**.

**Pourquoi c’est utile ?** Vous écrivez du code **déclaratif** : vous dites *"ce que l’UI doit afficher selon les données"*, Vue s’occupe de la **mise à jour**.

---

## 2) `ref()` – Valeurs réactives primitives (et plus)

### Définition
`ref(initialValue)` crée une **boîte réactive** autour d’une valeur. La valeur est accessible via la propriété **`.value`** en JavaScript.

### Quand l’utiliser ?
- **Primitifs** (`number`, `string`, `boolean`) ✅
- Valeurs **non-objet** ou pour isoler une valeur **unique**.

### Exemple minimal
```js
import { ref } from 'vue';
const count = ref(0);
function inc() { count.value++; }
```
Dans un **template**, Vue "déboîte" automatiquement les refs → **pas besoin** de `.value` : `{{ count }}`.

### Objets dans `ref`
`ref({ ... })` fonctionne, mais la **réactivité interne** est limitée : Vue **observe** la **remise** de `.value`, pas l’objet en profondeur. Pour des objets **deep**, préférez `reactive()`.

### Pièges fréquents
- **Oublier `.value`** dans le script : `count++` ne change pas le ref; utilisez `count.value++`.
- **Destructuration** : `const { value } = count` **perd** la réactivité. Gardez le ref entier ou utilisez `toRef`/`toRefs` selon besoin.

---

## 3) `reactive()` – Objets réactifs (deep)

### Définition
`reactive(obj)` renvoie un **proxy** qui **observe profondément** l’objet (et ses enfants).

### Quand l’utiliser ?
- États **composés** (objets/arrays) ✅
- Données **imbriquées** : `user.profile.name`, etc.

### Exemple
```js
import { reactive } from 'vue';
const user = reactive({ name: 'Alice', profile: { city: 'Paris' } });
user.profile.city = 'Lyon'; // Déclenche les effets dépendants
```

### Destructuration et `toRefs`
La destructuration directe **casse** la réactivité :
```js
const state = reactive({ a: 1, b: 2 });
const { a } = state; // a n'est pas un ref, ne se mettra pas à jour
```
Utilisez `toRefs(state)` pour obtenir des **refs** liées aux propriétés :
```js
import { toRefs } from 'vue';
const { a, b } = toRefs(state); // a.value, b.value restent réactifs
```

---

## 4) `computed()` – Dérivés mémoïsés

### Définition
`computed(getter)` crée une **valeur dérivée** **mémoïsée** : recalcul **uniquement** si ses **dépendances changent**.

### Quand l’utiliser ?
- Calculs **affichés souvent** ✅
- Coûtant **modérément**, qu’on ne veut pas recalculer à chaque rendu.

### Exemple
```js
import { ref, computed } from 'vue';
const price = ref(10);
const qty = ref(3);
const total = computed(() => price.value * qty.value); // 30
```

### Setter (deux‑sens)
`computed({ get, set })` pour une valeur dérivée **modifiable** :
```js
const firstName = ref('Ada');
const lastName = ref('Lovelace');
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: v => { const [f, l] = v.split(' '); firstName.value = f; lastName.value = l; }
});
```

### À éviter
- **Effets** (API, timers) dans un `computed` → utilisez `watch`.

---

## 5) `shallowRef()` – Réactivité **peu profonde**

### Définition
`shallowRef(v)` ne suit **que** les changements de **`.value`** (pas l’intérieur si c’est un objet).

### Quand l’utiliser ?
- Intégrer des **instances externes** (Chart.js, Leaflet, Map…) ✅
- **Grosses structures** peu modifiées, pour éviter un coût de réactivité **deep**.

### Exemple
```js
import { shallowRef } from 'vue';
const chart = shallowRef(null);
function mountChart(el) {
  chart.value = createChart(el, { /* options lourdes */ });
}
function replaceConfig(newCfg) {
  // Remplacer l'instance pour déclencher une mise à jour
  chart.value = createChart(chart.value.el, newCfg);
}
```
> Pour forcer la notification sans remplacer l’objet, utilisez `triggerRef(chart)` (rare).

**Différences** :
- `ref(obj)` → suit l’affectation à `.value` mais **pas** les mutations internes;
- `reactive(obj)` → suit **deep**;
- `shallowRef(obj)` → suit **uniquement** le **changement d’objet**.

---

## 6) `watch()` vs `watchEffect()` – Réagir aux changements

### `watch(source, callback, options)`
- **source** : ref(s), **getter** (`() => state.x`), ou tableau de sources;
- **callback(nouveau, ancien, onCleanup)**;
- options : `{ immediate, deep, flush: 'pre'|'post'|'sync' }`.

**Exemple (validation + debounce)**
```js
import { ref, watch } from 'vue';
const query = ref('');
let timer;
watch(query, (nv, ov, onCleanup) => {
  clearTimeout(timer);
  timer = setTimeout(() => performSearch(nv), 300);
  onCleanup(() => clearTimeout(timer)); // évite les fuites
});
```

### `watchEffect(effect, options)`
- Exécute l’effect **tout de suite**, puis à chaque changement de **toute** dépendance lue;
- Pas de `nouveau/ancien` : c’est pour **effets** rapides.

**Exemple (log d’état)**
```js
import { watchEffect } from 'vue';
watchEffect((onCleanup) => {
  console.log('state now:', state.user.name);
  const id = startSubscription();
  onCleanup(() => stopSubscription(id));
});
```

### Choisir entre les deux
- **`watch`** : vous ciblez **précisément** une ou des sources, besoin de `nv/ov`, `deep`, `immediate`.
- **`watchEffect`** : vous voulez **réagir vite** à *tout ce qui est lu* dans l’effect (simple, mais moins controlé).

---

## 7) Hooks de cycle de vie (Composition API)

Principaux **hooks** (`import { onMounted, onUnmounted, ... } from 'vue'`) :
- `onMounted` : après montage du composant (DOM prêt) → init plugins/DOM;
- `onUpdated` : après une mise à jour du DOM;
- `onUnmounted` : avant destruction → **nettoyage** (timers, listeners);
- `onBeforeMount` / `onBeforeUpdate` / `onBeforeUnmount` : stades pré‑événements;
- `onActivated` / `onDeactivated` : avec `<keep-alive>` (entrée/sortie);
- `onErrorCaptured` : attraper les erreurs enfant.

**Exemple complet**
```js
import { onMounted, onUnmounted } from 'vue';
let handle;
onMounted(() => {
  handle = window.addEventListener('resize', onResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});
```

### Hooks du routeur (si Vue Router)
```js
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
onBeforeRouteUpdate((to, from) => { /* réagir aux nouveaux params */ });
onBeforeRouteLeave((to, from) => { /* confirmer la sortie si non-sauvé */ });
```

### Options API (équivalents)
- `mounted`, `updated`, `beforeUnmount`, etc. dans l’objet composant.

---

## 8) Recettes & pièges courants

- **Perte de réactivité par destructuration** : utilisez `toRefs(state)`.
- **Effets dans `computed`** : non; placez code de **side‑effect** dans `watch`/hooks.
- **Grande liste** : pré‑calculer `:class`/`:style` via `computed`; envisager **virtualisation**.
- **Objets lourds externes** : stocker en `shallowRef` ou `markRaw`.
- **Flush timing (`watch`)** :
  - `flush: 'pre'` (par défaut) avant mise à jour DOM;
  - `flush: 'post'` après mise à jour DOM (utiles pour lire DOM);
  - `flush: 'sync'` immédiatement (prudent).

---

## 9) Exemples d’ensemble (petits modules)

### Compteur + dérivé
```js
import { ref, computed } from 'vue';
const count = ref(0);
const double = computed(() => count.value * 2);
const inc = () => count.value++;
```

### État composé + `toRefs`
```js
import { reactive, toRefs } from 'vue';
const state = reactive({ a: 1, b: 2 });
const { a, b } = toRefs(state);
a.value++; // met à jour state.a
```

### Watch ciblé + cleanup
```js
import { ref, watch } from 'vue';
const email = ref('');
let cancel;
watch(email, (nv, _, onCleanup) => {
  cancel = startValidation(nv);
  onCleanup(() => cancel?.());
}, { immediate: true });
```

### Hook `onMounted` (init externe)
```js
import { onMounted, onUnmounted, shallowRef } from 'vue';
const chart = shallowRef(null);
onMounted(() => {
  chart.value = createChart('#el', { /* options */ });
});
onUnmounted(() => chart.value?.destroy?.());
```

---

## 10) Choix rapide – Quand utiliser quoi ?

- **`ref`** : primitives, une valeur unique, toggle, compteur.
- **`reactive`** : objets/arrays **deep**; états fortement imbriqués.
- **`computed`** : **dérivés** affichés souvent, cache.
- **`shallowRef`** : objets **lourds** ou instances externes; remplacer `.value` plutôt que muter.
- **`watch`** : effets **ciblés** sur une source (API, timers, logs); `immediate/deep/flush` au besoin.
- **`watchEffect`** : effet **simple** qui dépend de *tout ce qu’il lit*.
- **Hooks** : initialiser/nettoyer **intégrations** (DOM, plugins) et **flux de navigation**.

---

## 11) Mini‑exercices

1. Convertissez un état `reactive({ a:1, b:2 })` en refs avec `toRefs` et affichez `a`/`b`.
2. Écrivez un `computed` `fullName` en mode get/set.
3. Implémentez un `watch(query)` avec **debounce 300 ms** et **cleanup**.
4. Montez une instance externe (ex. `new Map()`) avec `shallowRef`; remplacez-la sur un bouton.
5. Ajoutez un `onBeforeRouteLeave` pour **confirmer** la sortie si `dirty === true`.

---

## 12) Résumé

- **Réactivité** = graphe **sources → effets**;
- `ref` pour **valeurs**, `reactive` pour **objets**;
- `computed` pour **dérivés cache**;
- `shallowRef` pour **objets lourds/externes**;
- `watch`/`watchEffect` pour **effets** (avec **cleanup**);
- **Hooks** pour la **vie du composant** et les **intégrations**.

