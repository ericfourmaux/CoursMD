
# Chapitre 5 : Styles et classes dynamiques (reprise détaillée)

> **Objectif du chapitre** : Maîtriser les liaisons dynamiques de **classes** (`:class`) et de **styles inline** (`:style`), comprendre quand utiliser **`v-show` vs classes**, utiliser le **CSS scoped** dans les SFC, et connaître les pièges/fréquences d'erreurs. Exemples complets en **Options API** et **Composition API**, avec un **mini-projet fil rouge** (To‑Do) enrichi par des styles dynamiques.

---

## 0) Mini-projet exécutable (CDN) – Styles dynamiques

> **But** : Démontrer `:class` (objets, tableaux, conditions), `:style` (objets/tabl.), **thème clair/sombre**, états (actif, terminé, erreur), et **scoped CSS** (via un composant SFC reproduit en HTML pour la démo).

Copiez-collez dans `index.html` puis ouvrez dans votre navigateur.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 5 (Styles & Classes)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    :root {
      --accent: #2b6cb0;
      --danger: #c53030;
      --muted: #718096;
    }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .box { border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
    .row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .pill { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.85rem; }
    .pill.gray { background: #edf2f7; color: #2d3748; }
    .pill.green { background: #c6f6d5; color: #22543d; }
    .pill.red { background: #fed7d7; color: #822727; }
    .btn { padding: 0.4rem 0.8rem; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; }
    .btn.primary { border-color: var(--accent); color: #fff; background: var(--accent); }
    .btn.danger { border-color: var(--danger); color: #fff; background: var(--danger); }
    .theme-light { background: #ffffff; color: #1a202c; }
    .theme-dark { background: #1a202c; color: #e2e8f0; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
    .card.dark { border-color: #4a5568; }
    .todo { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem; border-radius: 6px; }
    .todo.done { text-decoration: line-through; color: #718096; }
    .todo.important { border-left: 4px solid var(--accent); }
    .todo.error { border-left: 4px solid var(--danger); background: #fff5f5; }
    .muted { color: var(--muted); }
    .w-200 { width: 200px; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 5 : Styles & Classes dynamiques</h1>
  <div id="app" class="grid"></div>

  <script>
  const { createApp, ref, reactive, computed } = Vue;

  // Composant DemoCard : simule un SFC avec styles contextuels
  const DemoCard = {
    name: 'DemoCard',
    props: { title: { type: String, default: '' }, dark: { type: Boolean, default: false } },
    template: `
      <div class="card" :class="{ dark: dark }">
        <h3>{{ title }}</h3>
        <slot></slot>
      </div>
    `
  };

  // Fil rouge: To-Do item (Options API style)
  const TodoItem = {
    name: 'TodoItem',
    props: {
      text: { type: String, required: true },
      done: { type: Boolean, default: false },
      important: { type: Boolean, default: false },
      error: { type: Boolean, default: false }
    },
    emits: ['toggle', 'remove'],
    methods: {
      onToggle() { this.$emit('toggle'); },
      onRemove() { this.$emit('remove'); }
    },
    computed: {
      cls() {
        // Syntaxe objet + conditions
        return {
          todo: true,
          done: this.done,
          important: this.important,
          error: this.error
        };
      },
      stl() {
        // Syntaxe objet :style (numérique -> px si propriété attend des unités)
        return {
          fontSize: this.important ? '1rem' : '0.95rem',
          letterSpacing: this.important ? '0.03em' : 'normal',
          opacity: this.done ? 0.7 : 1
        };
      }
    },
    template: `
      <div :class="cls" :style="stl">
        <input type="checkbox" :checked="done" @change="onToggle" />
        <span>{{ text }}</span>
        <button class="btn danger" @click="onRemove">Supprimer</button>
      </div>
    `
  };

  /* ==========================
     Colonne 1 : Options API
     ========================== */
  const OptionsDemo = {
    name: 'OptionsDemo',
    components: { DemoCard, TodoItem },
    data() {
      return {
        titre: 'Options API',
        themeDark: false,
        actif: true,
        niveau: 'normal', // 'normal' | 'eleve'
        largeur: 200,
        tasks: reactive([
          { text: 'Lire la doc Vue', done: false, important: true, error: false },
          { text: 'Créer un composant', done: true, important: false, error: false },
          { text: 'Corriger un bug', done: false, important: false, error: true }
        ])
      };
    },
    computed: {
      themeClass() { return this.themeDark ? 'theme-dark' : 'theme-light'; },
      badgeClasses() {
        // Syntaxe tableau + conditions
        return [
          'pill',
          this.actif ? 'green' : 'gray',
          this.niveau === 'eleve' ? 'red' : ''
        ];
      },
      boxStyles() {
        // Syntaxe objet :style
        return {
          borderColor: this.themeDark ? '#4a5568' : '#e2e8f0',
          boxShadow: this.actif ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          padding: '0.75rem'
        };
      }
    },
    methods: {
      toggleTheme() { this.themeDark = !this.themeDark; },
      toggleActif() { this.actif = !this.actif; },
      addTask() { this.tasks.push({ text: 'Nouvelle tâche', done: false, important: false, error: false }); },
      toggleTask(i) { this.tasks[i].done = !this.tasks[i].done; },
      removeTask(i) { this.tasks.splice(i, 1); }
    },
    template: `
      <section class="box" :class="themeClass">
        <h2>{{ titre }}</h2>
        <div class="row">
          <button class="btn" @click="toggleTheme">Basculer thème</button>
          <button class="btn" @click="toggleActif">Basculer actif</button>
          <span :class="badgeClasses">Badge</span>
        </div>

        <demo-card :dark="themeDark">
          <div :style="boxStyles" class="row">
            <span class="muted">Styles inline via :style</span>
            <div :class="['w-200']">Bloc largeur 200px (classe statique + tableau)</div>
          </div>
        </demo-card>

        <demo-card title="To-Do (classes dynamiques)">
          <div class="row">
            <button class="btn primary" @click="addTask">Ajouter tâche</button>
          </div>
          <div>
            <todo-item v-for="(t,i) in tasks" :key="i"
                       :text="t.text" :done="t.done" :important="t.important" :error="t.error"
                       @toggle="toggleTask(i)" @remove="removeTask(i)" />
          </div>
        </demo-card>
      </section>
    `
  };

  /* ==========================
     Colonne 2 : Composition API
     ========================== */
  const CompositionDemo = {
    name: 'CompositionDemo',
    components: { DemoCard, TodoItem },
    setup() {
      const title = ref('Composition API');
      const themeDark = ref(true);
      const active = ref(true);
      const level = ref('eleve');
      const width = ref(200);
      const tasks = reactive([
        { text: 'Configurer Router', done: false, important: true, error: false },
        { text: 'Refactor CSS', done: false, important: false, error: false }
      ]);

      const themeClass = computed(() => themeDark.value ? 'theme-dark' : 'theme-light');
      const badgeClasses = computed(() => ['pill', active.value ? 'green' : 'gray', level.value === 'eleve' ? 'red' : '']);
      const boxStyles = computed(() => ({
        borderColor: themeDark.value ? '#4a5568' : '#e2e8f0',
        boxShadow: active.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        padding: '0.75rem'
      }));

      const toggleTheme = () => { themeDark.value = !themeDark.value; };
      const toggleActive = () => { active.value = !active.value; };
      const addTask = () => { tasks.push({ text: 'Nouvelle tâche (comp)', done: false, important: false, error: false }); };
      const toggleTask = (i) => { tasks[i].done = !tasks[i].done; };
      const removeTask = (i) => { tasks.splice(i, 1); };

      return { title, themeDark, active, level, width, tasks, themeClass, badgeClasses, boxStyles, toggleTheme, toggleActive, addTask, toggleTask, removeTask };
    },
    template: `
      <section class="box" :class="themeClass">
        <h2>{{ title }}</h2>
        <div class="row">
          <button class="btn" @click="toggleTheme">Basculer thème</button>
          <button class="btn" @click="toggleActive">Basculer actif</button>
          <span :class="badgeClasses">Badge</span>
        </div>

        <demo-card :dark="themeDark">
          <div :style="boxStyles" class="row">
            <span class="muted">Styles inline via :style (Composition)</span>
            <div :class="['w-200']">Bloc largeur 200px</div>
          </div>
        </demo-card>

        <demo-card title="To-Do (classes dynamiques)">
          <div class="row">
            <button class="btn primary" @click="addTask">Ajouter tâche</button>
          </div>
          <div>
            <todo-item v-for="(t,i) in tasks" :key="i"
                       :text="t.text" :done="t.done" :important="t.important" :error="t.error"
                       @toggle="toggleTask(i)" @remove="removeTask(i)" />
          </div>
        </demo-card>
      </section>
    `
  };

  const App = { name: 'App', components: { OptionsDemo, CompositionDemo }, template: `<div class="grid"><OptionsDemo /><CompositionDemo /></div>` };
  createApp(App)
    .component('demo-card', DemoCard)
    .component('todo-item', TodoItem)
    .mount('#app');
  </script>
</body>
</html>
```

---

## 1) `:class` – Lier des **classes CSS** dynamiquement

### Définition
`v-bind:class` (ou `:class`) permet d’ajouter des **classes CSS** en fonction d’un **état réactif**.

### Pourquoi ?
- Styliser des **variantes** (actif/inactif, thème, erreur)
- **Afficher l’état** de l’UI sans manipuler le DOM manuellement

### Syntaxes (toutes cumulables)
- **Chaînes** : `:class="'active'"`
- **Tableaux** : `:class="['base', condition ? 'on' : 'off']"`
- **Objets** : `:class="{ active: condition, danger: isError }"`

**Exemple (Options API)**
```html
<span :class="['pill', actif ? 'green' : 'gray']">Badge</span>
<div :class="{ todo: true, done: t.done, important: t.important, error: t.error }">...</div>
```

**Exemple (Composition API)**
```html
<span :class="badgeClasses">Badge</span>
<!-- où badgeClasses est un computed: ['pill', active ? 'green' : 'gray', level==='eleve' ? 'red' : ''] -->
```

**Analogie** : pensez à des **étiquettes** que l’on colle sur un élément. Selon l’état, vous collez les **bonnes étiquettes**.

---

## 2) `:style` – Lier des **styles inline** dynamiquement

### Définition
`v-bind:style` (ou `:style`) applique des **styles inline** sous forme d’**objets** ou de **tableaux**.

### Syntaxes
- **Objet** : `:style="{ color: 'red', fontSize: '14px' }"`
- **Tableau d’objets** : `:style="[styleBase, styleAccent]"`

### Points techniques
- **CamelCase** recommandé (`fontSize`, `backgroundColor`) ; `kebab-case` supporté en chaînes (`'font-size'`).
- Pour les propriétés **qui attendent des unités**, une **valeur numérique** est interprétée en **px** (ex. `width: 200` → `200px`). Préférez chaînes pour la clarté.
- Certaines propriétés acceptent des **valeurs unitaires** (ex. `lineHeight`, `zIndex`).

**Exemple**
```html
<div :style="{ borderColor: themeDark ? '#4a5568' : '#e2e8f0', padding: '0.75rem' }">...</div>
```

**Analogie** : les **boutons réglables** d’un panneau de contrôle : vous tournez le bouton (valeur) et le style **s’ajuste** instantanément.

---

## 3) `:class` vs `:style` – Quand choisir l’un ou l’autre ?

- **`:class`**
  - Idéal pour des **variantes sémantiques** (états, thèmes, tailles) et pour profiter du **cache** & de la **cascade CSS**.
  - Les styles sont définis dans des **feuilles CSS** (maintenabilité, réutilisation).

- **`:style`**
  - Utile pour des **valeurs calculées** (ex. largeur liée à une donnée).
  - **Moins** approprié pour des thèmes complets (préférez des classes + variables CSS).

**Bonnes pratiques** :
- Préférez **classes** + **CSS** pour *structure et thème*.
- Réservez **styles inline** aux *ajustements dynamiques* (dimensions, transformations).

---

## 4) `v-show` vs classes (masquer/afficher)

- **`v-show`** : ajoute/enlève `display: none` (toujours monté dans le DOM). **Rapide** si affichage/masquage fréquent.
- **Classes** : vous appliquez vous-même `.hidden` ou `.opaque`. **Contrôle fin** (transitions personnalisées).

**Règle** :
- Si vous voulez **vraiment retirer** du DOM → `v-if`.
- Si vous **masquez souvent** → `v-show`.
- Si vous **thématisez** et **transitionnez** → classes.

---

## 5) CSS Scoped dans SFC (Single File Components)

### Définition
Le **scoped CSS** (via l’attribut `scoped` dans `<style>`) **isole** les styles d’un composant en ajoutant un **identifiant** (`data-v-xxxx`) aux sélecteurs et aux éléments.

### Pourquoi ?
- Éviter les **fuites** de styles.
- Faciliter la **composition** de composants.

### Sélecteurs profonds
- Pour cibler un **enfant interne** dans un style scoped, utilisez la fonction **`:deep(...)`** ou le combinator `::v-deep` (selon votre préprocesseur).

**Exemple (SFC)**
```vue
<template>
  <div class="panel">
    <slot />
  </div>
</template>
<style scoped>
.panel { border: 1px solid #ddd; }
:deep(.todo.done) { color: #718096; } /* cible un descendant stylé ailleurs */
</style>
```

> **Note** : Préférez `:deep()` dans Vue 3. Les anciennes syntaxes `>>>` / `/deep/` sont **dépréciées**.

---

## 6) Pièges courants & Sécurité

- **Clés d’objets `:class`** mal orthographiées → classes manquantes.
- **Valeurs numériques** sans unités en `:style` sur des propriétés qui en exigent → incohérences.
- **`v-html`** : n’injectez pas de **HTML non fiable** (XSS) ; n’y liez pas des **styles** non maîtrisés.
- **Conflits de cascade** : des classes globaux peuvent **écraser** des scoped selon la **spécificité**.
- **Performance** : évitez les objets `:style` reconstruits à chaque rendu → utilisez des **computed**.

---

## 7) Exercices pratiques

1. **Thème clair/sombre**
   - Implémentez un switch qui bascule `theme-dark`/`theme-light` via `:class`.
   - Ajoutez une **variable CSS** `--accent` et changez-la via `:style`.

2. **Badges d’état**
   - Créez un composant `StatusBadge` : props `status` (`success|warning|error`), classe dynamique + couleurs.
   - Ajoutez un **computed** pour la liste des classes.

3. **Liste To‑Do**
   - Étendez `TodoItem` : au survol (`hover`), ajoutez une classe `.hovered` ; s’il y a une erreur, appliquez `.error`.
   - Utilisez `:style` pour ajuster `opacity` selon `done`.

4. **SFC scoped + deep**
   - Créez `Panel.vue` avec `<style scoped>` et utilisez `:deep(.important)` pour styliser une classe enfant.

---

## 8) Résumé – Points clés
- `:class` : **objets**, **tableaux**, **conditions** pour variantes sémantiques.
- `:style` : **objets**/**tableaux** pour valeurs calculées (dimensions/couleurs).
- **`v-show`** vs **classes** : masquage rapide vs contrôle CSS.
- **Scoped CSS** : isolation des styles + `:deep()` pour cibler des descendants.
- **Bonnes pratiques** : privilégier les **classes** + variables CSS ; computed pour perf.

---

## 9) Annexes – SFC complets (extraits)

### `StatusBadge.vue` (Options API)
```vue
<template>
  <span :class="classes">{{ label }}</span>
</template>
<script>
export default {
  name: 'StatusBadge',
  props: { status: { type: String, default: 'success' } },
  computed: {
    label() { return this.status.toUpperCase(); },
    classes() {
      return ['pill', this.status === 'success' ? 'green' : this.status === 'warning' ? 'gray' : 'red'];
    }
  }
};
</script>
<style scoped>
.pill { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.85rem; }
.green { background: #c6f6d5; color: #22543d; }
.gray { background: #edf2f7; color: #2d3748; }
.red { background: #fed7d7; color: #822727; }
</style>
```

### `Panel.vue` (Composition API + scoped + deep)
```vue
<template>
  <div class="panel"><slot /></div>
</template>
<script setup>
// aucun état interne nécessaire
</script>
<style scoped>
.panel { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
:deep(.important) { border-left: 4px solid #2b6cb0; }
</style>
```

### `TodoItem.vue` (Options API + :class et :style)
```vue
<template>
  <div :class="cls" :style="stl">
    <input type="checkbox" :checked="done" @change="$emit('toggle')" />
    <span>{{ text }}</span>
    <button class="btn danger" @click="$emit('remove')">Supprimer</button>
  </div>
</template>
<script>
export default {
  name: 'TodoItem',
  props: { text: String, done: Boolean, important: Boolean, error: Boolean },
  computed: {
    cls() { return { todo: true, done: this.done, important: this.important, error: this.error }; },
    stl() { return { opacity: this.done ? 0.7 : 1, letterSpacing: this.important ? '0.03em' : 'normal' }; }
  }
};
</script>
<style scoped>
.todo { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem; border-radius: 6px; }
.todo.done { text-decoration: line-through; color: #718096; }
.todo.important { border-left: 4px solid #2b6cb0; }
.todo.error { border-left: 4px solid #c53030; background: #fff5f5; }
</style>
```

---

> 🔜 **Prochain chapitre** : **Vue Router (Introduction)** – config de routes, navigation, routes dynamiques, et composition des vues.
