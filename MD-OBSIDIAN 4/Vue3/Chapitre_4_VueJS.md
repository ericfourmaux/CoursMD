
# Chapitre 4 : Les composants (reprise détaillée)

> **Objectif du chapitre** : Maîtriser les **composants Vue** (définition, pourquoi), les **Props** (validation, lecture seule), la **communication enfant → parent** via **événements** (et pourquoi **ne pas muter une prop** dans l’enfant), **`v-model` sur composants** (conventions `modelValue` / `update:modelValue`, variante `v-model:propName`), et les **Slots** (par défaut, nommés, **slot props**). Exemples complets en **Options API** et **Composition API**, avec un **mini-projet** exécutable.

---

## 0) Mini-projet exécutable (CDN) – démonstrations intégrées

Copiez-collez dans `index.html` puis ouvrez dans votre navigateur. Il illustre :
- **Props** + **validation implicite** par types
- **Événements personnalisés** (`$emit`)
- **`v-model` sur composants** (par défaut et `v-model:propName`)
- **Slots** (nommés + **slot props**)
- **Anti-pattern** : mutation d’une **prop** dans l’enfant (objet) vs **pattern correct** : emit → parent met à jour

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 4 (Reprise)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .box { border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
    fieldset { border: 1px solid #ccc; margin-top: 1rem; }
    legend { padding: 0 0.5rem; }
    .warn { color: #b33; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 4 : Composants</h1>
  <div id="app"></div>

  <script>
  const { createApp, ref, computed, reactive } = Vue;

  // 1) CustomInput : v-model (modelValue / update:modelValue)
  const CustomInput = {
    name: 'CustomInput',
    props: {
      modelValue: { type: String, default: '' },
      label: { type: String, default: 'Saisie' },
      placeholder: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    template: `
      <label>
        {{ label }} :
        <input :value="modelValue"
               :placeholder="placeholder"
               @input="$emit('update:modelValue', $event.target.value)" />
      </label>
    `
  };

  // 2) ChildCounter : v-model avec argument (v-model:count) + événement personnalisé
  const ChildCounter = {
    name: 'ChildCounter',
    props: { count: { type: Number, default: 0 }, step: { type: Number, default: 1 } },
    emits: ['update:count', 'increment'],
    template: `
      <div style="margin-top:1rem">
        <p>Compteur (enfant) : <strong>{{ count }}</strong></p>
        <button @click="$emit('update:count', count + step)">+{{ step }} (v-model:count)</button>
        <button @click="$emit('increment', step)">Notifier parent (increment)</button>
      </div>
    `
  };

  // 3) CardBox : Slots (header, default, footer) + slot props
  const CardBox = {
    name: 'CardBox',
    data() { return { now: new Date().toLocaleTimeString() }; },
    template: `
      <div class="box">
        <header><slot name="header">(Sans en-tête)</slot></header>
        <main>
          <slot :now="now">(Contenu par défaut)</slot>
        </main>
        <footer><slot name="footer">(Sans pied)</slot></footer>
      </div>
    `
  };

  // 4) Anti-pattern : Enfant qui mute une prop objet
  const UserCardBad = {
    name: 'UserCardBad',
    props: { user: { type: Object, required: true } },
    template: `
      <fieldset>
        <legend>Anti-pattern (mutation dans l'enfant)</legend>
        <p class="warn">⚠️ Mauvaise pratique : l'enfant modifie directement la prop « user »</p>
        <p>user.name = <strong>{{ user.name }}</strong></p>
        <label>Changer (mauvais) : <input @input="user.name = $event.target.value" /></label>
        <p>➡️ Cette mutation modifie l'objet du parent par référence et génère un avertissement Vue.</p>
      </fieldset>
    `
  };

  // 5) Pattern correct : Enfant émet un événement, Parent met à jour
  const UserCardGood = {
    name: 'UserCardGood',
    props: { name: { type: String, default: '' } },
    emits: ['update:name'],
    template: `
      <fieldset>
        <legend>Bon pattern (emit → parent)</legend>
        <p>name (prop) = <strong>{{ name }}</strong></p>
        <label>Changer le nom :
          <input :value="name" @input="$emit('update:name', $event.target.value)" />
        </label>
        <p>➡️ L'enfant n'altère pas la prop ; il propose une nouvelle valeur au parent.</p>
      </fieldset>
    `
  };

  // Colonne gauche : Options API
  const OptionsDemo = {
    name: 'OptionsDemo',
    components: { CustomInput, ChildCounter, CardBox, UserCardBad, UserCardGood },
    data() {
      return {
        titre: 'Options API',
        pseudo: '',
        parentCount: 0,
        pas: 2,
        parentName: 'Alice',
        userObj: reactive({ name: 'Bob', email: 'bob@example.com' })
      };
    },
    methods: {
      onIncrement(step) { this.parentCount += step; }
    },
    computed: {
      info() { return `${this.titre} – count=${this.parentCount}`; }
    },
    template: `
      <section class="box">
        <h2>{{ titre }}</h2>
        <custom-input v-model="pseudo" label="Pseudo" placeholder="Tapez votre pseudo" />
        <p>Parent reçoit pseudo = <strong>{{ pseudo }}</strong></p>

        <fieldset>
          <legend>Compteur via v-model:count + événement personnalisé</legend>
          <child-counter v-model:count="parentCount" :step="pas" @increment="onIncrement" />
          <p>Parent count = <strong>{{ parentCount }}</strong> | pas = {{ pas }}</p>
        </fieldset>

        <fieldset>
          <legend>Slots avec CardBox</legend>
          <card-box>
            <template #header>
              <h3>En-tête (Options)</h3>
            </template>
            <template #default="{ now }">
              <p>**Slot props** : heure = <strong>{{ now }}</strong></p>
              <p>Info parent (computed) : {{ info }}</p>
            </template>
            <template #footer>
              <small>Pied « Options »</small>
            </template>
          </card-box>
        </fieldset>

        <fieldset>
          <legend>Communication parent ↔ enfant</legend>
          <user-card-bad :user="userObj" />
          <p class="warn">Anti-pattern : l'enfant modifie <code>user.name</code> (mauvais).</p>
          <user-card-good :name="parentName" @update:name="parentName = $event" />
          <p>Parent applique la mise à jour : parentName = <strong>{{ parentName }}</strong></p>
        </fieldset>
      </section>
    `
  };

  // Colonne droite : Composition API
  const CompositionDemo = {
    name: 'CompositionDemo',
    components: { CustomInput, ChildCounter, CardBox, UserCardBad, UserCardGood },
    setup() {
      const title = ref('Composition API');
      const nickname = ref('');
      const count = ref(0);
      const step = ref(3);
      const info = computed(() => `${title.value} – count=${count.value}`);
      const onIncrement = (s) => { count.value += s; };

      const parentName = ref('Charly');
      const userObj = reactive({ name: 'Dora', email: 'dora@example.com' });

      return { title, nickname, count, step, info, onIncrement, parentName, userObj };
    },
    template: `
      <section class="box">
        <h2>{{ title }}</h2>
        <custom-input v-model="nickname" label="Nickname" placeholder="Type your nickname" />
        <p>Parent reçoit nickname = <strong>{{ nickname }}</strong></p>

        <fieldset>
          <legend>Compteur via v-model:count + événement personnalisé</legend>
          <child-counter v-model:count="count" :step="step" @increment="onIncrement" />
          <p>Parent count = <strong>{{ count }}</strong> | step = {{ step }}</p>
        </fieldset>

        <fieldset>
          <legend>Slots avec CardBox</legend>
          <card-box>
            <template #header><h3>En-tête (Composition)</h3></template>
            <template #default="{ now }">
              <p>**Slot props** : heure = <strong>{{ now }}</strong></p>
              <p>Info parent (computed) : {{ info }}</p>
            </template>
            <template #footer><small>Pied « Composition »</small></template>
          </card-box>
        </fieldset>

        <fieldset>
          <legend>Communication parent ↔ enfant</legend>
          <user-card-bad :user="userObj" />
          <p class="warn">⚠️ Anti-pattern : mutation directe d'une prop objet.</p>
          <user-card-good v-model:name="parentName" />
          <p>Parent applique la mise à jour (v-model:name) : parentName = <strong>{{ parentName }}</strong></p>
        </fieldset>
      </section>
    `
  };

  // App principale
  const App = {
    name: 'App', components: { OptionsDemo, CompositionDemo },
    template: `<div class="row"><OptionsDemo /><CompositionDemo /></div>`
  };

  createApp(App)
    .component('custom-input', CustomInput)
    .component('child-counter', ChildCounter)
    .component('card-box', CardBox)
    .component('user-card-bad', UserCardBad)
    .component('user-card-good', UserCardGood)
    .mount('#app');
  </script>
</body>
</html>
```

---

## 1) Qu’est-ce qu’un composant Vue ?

### Définition
Un **composant** est une **unité réutilisable** d’interface et de logique qui encapsule :
- **Template** (HTML déclaratif)
- **État** (données locales)
- **Comportements** (méthodes, calculs)

### Pourquoi des composants ?
- **Réutilisabilité** : comme des **Lego** UI.
- **Maintenabilité** : isoler la complexité.
- **Composition** : assembler des briques simples.

**Analogie** : des **modules** de maison (porte, fenêtre) qu’on remplace/compose sans toucher au reste.

---

## 2) Props : données **parent → enfant** (flux unidirectionnel)

### Définition
Les **props** sont **lecture seule** côté enfant. Le parent **fournit**, l’enfant **consomme**.

### Pourquoi ?
- Réduire les **effets de bord**.
- Faciliter le **raisonnement** (données vont dans **un sens**).

### Validation (Options API)
```js
export default {
  props: {
    title: { type: String, required: true },
    items: { type: Array, default: () => [] },
    status: { type: String, validator: v => ['on', 'off'].includes(v) }
  }
}
```

### Validation (Composition API / `<script setup>`) 
```vue
<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
  status: { type: String, validator: v => ['on', 'off'].includes(v) }
});
</script>
```

> ⚠️ **Règle** : ne **muter** jamais une prop dans l’enfant (y compris **objets/arrays** reçus par prop). Si vous devez la modifier, **émettez** un événement, ou **copiez localement** (ex. `const local = ref(props.objet)`).

---

## 3) Communication enfant → parent : **événements personnalisés**

### Définition
L’enfant **notifie** le parent via `$emit('eventName', payload)` (Options) ou `emit('eventName', payload)` (Composition). Le parent **écoute** avec `@eventName`.

### Pourquoi ?
- Respect du **flux unidirectionnel**.
- Découplage : l’enfant **informe**, le parent **décide**.

**Options API**
```vue
<template>
  <button @click="$emit('increment', 1)">+1</button>
</template>
<script>
export default { emits: ['increment'] };
</script>
```

**Composition API / `<script setup>`**
```vue
<script setup>
import { defineEmits } from 'vue';
const emit = defineEmits(['increment']);
const onClick = () => emit('increment', 1);
</script>
<template>
  <button @click="onClick">+1</button>
</template>
```

---

## 4) **Ne pas muter une prop dans l’enfant** (anti-pattern) → **Pattern correct**

### Anti-pattern
Muter une prop (ou un **objet** reçu par prop) dans l’enfant :
```vue
<script>
export default { props: { user: Object } };
</script>
<template>
  <input @input="user.name = $event.target.value" /> <!-- Mauvais -->
</template>
```
**Effets** : mutation par **référence** (l’état parent change sans contrôle), **avertissements** Vue, débogage difficile.

### Pattern correct : **emit → parent met à jour**
**Options API**
```vue
<!-- Enfant -->
<script>
export default { props: { name: String }, emits: ['update:name'] };
</script>
<template>
  <input :value="name" @input="$emit('update:name', $event.target.value)" />
</template>

<!-- Parent -->
<template>
  <UserCardGood :name="parentName" @update:name="parentName = $event" />
</template>
```
**Composition API**
```vue
<!-- Enfant -->
<script setup>
import { defineProps, defineEmits } from 'vue';
const props = defineProps({ name: String });
const emit = defineEmits(['update:name']);
</script>
<template>
  <input :value="props.name" @input="emit('update:name', $event.target.value)" />
</template>

<!-- Parent -->
<script setup>
import { ref } from 'vue';
const parentName = ref('Alice');
</script>
<template>
  <UserCardGood :name="parentName" @update:name="parentName = $event" />
</template>
```

### Variante idiomatique : `v-model:propName`
- Prop : `name`
- Événement : `update:name`
- Parent : `<UserCardGood v-model:name="parentName" />`

---

## 5) `v-model` sur composants

### Conventions (par défaut)
- **Prop** : `modelValue`
- **Événement** : `update:modelValue`

```vue
<!-- Parent -->
<CustomInput v-model="pseudo" />

<!-- Enfant -->
<script>
export default { props: { modelValue: String }, emits: ['update:modelValue'] };
</script>
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
```

### Variante ciblée : `v-model:propName`
```vue
<ChildCounter v-model:count="parentCount" :step="2" />
```
Associe prop `count` ↔ event `update:count`.

---

## 6) Slots : composer l’interface

### Types
- **Par défaut** : `<slot>`
- **Nommés** : `<slot name="header">` / `<slot name="footer">`
- **Slot props** : données de l’enfant injectées dans le contenu du parent

**Enfant**
```vue
<template>
  <div class="card">
    <header><slot name="header">(Header par défaut)</slot></header>
    <main><slot :now="new Date().toLocaleTimeString()">(Body par défaut)</slot></main>
    <footer><slot name="footer">(Footer par défaut)</slot></footer>
  </div>
</template>
```
**Parent**
```vue
<Card>
  <template #header><h3>Mon en-tête</h3></template>
  <template #default="{ now }">
    <p>Heure fournie par l'enfant : {{ now }}</p>
  </template>
  <template #footer><small>Pied</small></template>
</Card>
```

**Analogie** : Les slots sont des **emplacements** vides dans un moule où le parent **verse** son contenu.

---

## 7) Bonnes pratiques (composants)
- **Granularité** : une responsabilité claire par composant.
- **Props** : lecture seule → mutation via **emit** / **v-model**.
- **Événements** : noms cohérents (`submit`, `change`, `update:param`).
- **Validation** : `type`, `required`, `default`, `validator`.
- **Slots** : documenter les **slot props**.
- (Avancé) État global : **provide/inject**, **Pinia/Vuex** (plus tard).

---

## 8) Exercices pratiques

1. **Stepper**
   - `Stepper` avec prop `value` (Number) et `step`.
   - Supporter `v-model:value` (event `update:value`).
   - Émettre un événement `change` (payload `{ op, step }`).

2. **CardBox**
   - Slots `header`, `default`, `footer`.
   - Transmettre un **slot prop** (ex. `date`) et l’afficher côté parent.

3. **UserForm + CustomInput**
   - 3 champs en `v-model` (nom, email, ville).
   - Validation côté enfant (regex email) → `invalid` si erreur.
   - Parent collecte et affiche les erreurs.

4. **TodoList / TodoItem**
   - `TodoList` reçoit `items` via prop.
   - `TodoItem` émet `remove(index)`.
   - Parent supprime l’item, compteur via **computed**.

---

## 9) Résumé – Points clés
- Un **composant** encapsule template/état/comportement.
- **Props** = parent → enfant (**lecture seule**).
- **Événements** = enfant → parent (emit).
- `v-model` sur composants : `modelValue` / `update:modelValue`, ou `v-model:propName`.
- **Slots** : par défaut, nommés, **slot props** pour partager des données.
- **Ne pas muter** une prop dans l’enfant ; **emit** pour proposer une mise à jour.

---

## 10) Annexes – SFC (Single File Components) complets

### `Stepper.vue` (Options API)
```vue
<template>
  <div class="stepper">
    <p>Valeur: <strong>{{ value }}</strong></p>
    <button @click="inc">+{{ step }}</button>
    <button @click="dec">-{{ step }}</button>
  </div>
</template>
<script>
export default {
  name: 'Stepper',
  props: {
    value: { type: Number, required: true },
    step: { type: Number, default: 1 }
  },
  emits: ['update:value', 'change'],
  methods: {
    inc() { this.$emit('update:value', this.value + this.step); this.$emit('change', { op: '+', step: this.step }); },
    dec() { this.$emit('update:value', this.value - this.step); this.$emit('change', { op: '-', step: this.step }); }
  }
};
</script>
<style scoped>
.stepper { display: flex; gap: 0.5rem; align-items: center; }
</style>
```

### `CardBox.vue` (Composition API, slots + slot props)
```vue
<template>
  <div class="card-box">
    <header><slot name="header">(Header défaut)</slot></header>
    <main>
      <slot :now="now">(Body défaut)</slot>
    </main>
    <footer><slot name="footer">(Footer défaut)</slot></footer>
  </div>
</template>
<script setup>
import { ref } from 'vue';
const now = ref(new Date().toLocaleTimeString());
</script>
<style scoped>
.card-box { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
header, footer { color: #555; }
</style>
```

### `UserForm.vue` (Composition API, `CustomInput` en v-model)
```vue
<template>
  <form @submit.prevent="onSubmit">
    <CustomInput label="Nom" v-model="nom" />
    <CustomInput label="Email" v-model="email" />
    <CustomInput label="Ville" v-model="ville" />
    <p v-if="error" style="color:red">{{ error }}</p>
    <button>Envoyer</button>
  </form>
</template>
<script setup>
import { ref } from 'vue';
import CustomInput from './CustomInput.vue';
const nom = ref('');
const email = ref('');
const ville = ref('');
const error = ref('');
const onSubmit = () => {
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value);
  error.value = ok ? '' : 'Email invalide';
  if (!error.value) alert(`Nom=${nom.value}, Email=${email.value}, Ville=${ville.value}`);
};
</script>
```

---

> 🔜 **Prochain chapitre** : Styles et classes dynamiques (`:class`, `:style`, `scoped` CSS) – cas pratiques & pièges fréquents.
