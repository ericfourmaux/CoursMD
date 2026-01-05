
# Chapitre 3 : Gestion des événements et des données (reprise détaillée)

> **Objectif du chapitre** : Approfondir `v-on` (événements), `v-model` (liaison bidirectionnelle), **computed vs methods vs watchers**, **modificateurs d’événements**, **`v-model` sur composants**, et **communication parent ↔ enfant** avec une **mise en garde** : *ne pas muter une prop dans l’enfant*. Exemples complets en **Options API** et **Composition API**, avec un **mini-projet** prêt à exécuter.

---

## 0) Mini-projet exécutable (CDN) – démonstrations intégrées

Copiez-collez dans `index.html` puis ouvrez dans votre navigateur. Il contient :
- Événements (`@click`, `@keyup.enter`), modificateurs (`.prevent`, `.stop`)
- `v-model` (inputs natifs + composants)
- **Computed/Methods/Watch**
- **Communication parent ↔ enfant** : exemple **anti-pattern** (mutation de prop) et **pattern correct** (emit → parent met à jour)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue 3 – Chapitre 3 (Reprise)</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .box { border: 1px solid #ddd; padding: 1rem; border-radius: 8px; }
    fieldset { border: 1px solid #ccc; margin-top: 1rem; }
    legend { padding: 0 0.5rem; }
    label { display: block; margin: 0.4rem 0; }
    input, select, button { margin-top: 0.2rem; }
    .warn { color: #b33; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Vue 3 – Chapitre 3 : Événements, Données & Communication</h1>
  <div id="app" class="grid"></div>

  <script>
  const { createApp, ref, reactive, computed, watch } = Vue;

  /* ==========================
     Composants de démonstration
     ========================== */

  // CustomInput : v-model (modelValue / update:modelValue)
  const CustomInput = {
    name: 'CustomInput',
    props: { modelValue: { type: String, default: '' }, label: { type: String, default: 'Saisie' } },
    emits: ['update:modelValue'],
    template: `
      <label>
        {{ label }} :
        <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
      </label>
    `
  };

  // ChildCounter : v-model:count + événement personnalisé
  const ChildCounter = {
    name: 'ChildCounter',
    props: { count: { type: Number, default: 0 }, step: { type: Number, default: 1 } },
    emits: ['update:count', 'increment'],
    template: `
      <div style="margin-top:0.5rem">
        <p>Compteur (enfant) : <strong>{{ count }}</strong></p>
        <button @click="$emit('update:count', count + step)">+{{ step }} (v-model:count)</button>
        <button @click="$emit('increment', step)">Notifier parent (increment)</button>
      </div>
    `
  };

  // Anti-pattern : Enfant mutante une prop (objet) → effets de bord
  const UserCardBad = {
    name: 'UserCardBad',
    props: { user: { type: Object, required: true } },
    // ⚠️ Anti-pattern : mutation directe de prop ou de sa structure
    template: `
      <fieldset>
        <legend>Anti-pattern (mutation dans l'enfant)</legend>
        <p class="warn">⚠️ Mauvaise pratique : l'enfant modifie directement la prop</p>
        <p>user.name = <strong>{{ user.name }}</strong></p>
        <label>Nouveau nom : <input @input="user.name = $event.target.value" /></label>
        <p>➡️ Cette mutation modifie l'objet du parent par référence et génère un avertissement Vue.</p>
      </fieldset>
    `
  };

  // Pattern correct : Enfant émet un événement → Parent met à jour son state
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
        <p>➡️ L'enfant n'altère pas la prop : il propose un nouveau nom au parent.</p>
      </fieldset>
    `
  };

  /* ==========================
     Colonne 1 : Options API
     ========================== */
  const OptionsDemo = {
    name: 'OptionsDemo',
    components: { CustomInput, ChildCounter, UserCardBad, UserCardGood },
    data() {
      return {
        compteur: 0,
        message: '',
        estActif: false,
        couleur: 'rouge',
        fruit: 'pomme',
        age: 18,
        texte: '',
        recherche: '',
        historique: [],
        saisie: '',
        derniereValidation: '',
        pseudo: '',
        // Pour démonstration parent/enfant
        userObj: reactive({ name: 'Alice', email: 'alice@example.com' }),
        parentName: 'Bob'
      };
    },
    computed: {
      doubleCompteur() { return this.compteur * 2; }
    },
    methods: {
      incrementer() { this.compteur++; },
      ajouter(valeur) { this.compteur += valeur; },
      avecEvent(evt) { this.derniereValidation = `type=${evt.type}, target=${evt.target.tagName}`; },
      calcDouble() { return this.compteur * 2; },
      validerSaisie() { this.derniereValidation = this.saisie; },
      // Listener de l'enfant « bon pattern »
      onUpdateName(nv) { this.parentName = nv; }
    },
    watch: {
      compteur(nv, ov) { this.historique.push(`${ov}→${nv}`); }
    },
    template: `
      <section class="box">
        <h2>Options API</h2>

        <h3>1) v-on / @ + paramètres + objet event</h3>
        <p>Compteur : <strong>{{ compteur }}</strong></p>
        <button @click="incrementer">+1</button>
        <button @click="ajouter(5)">+5</button>
        <button @click="avecEvent($event)">Utiliser l'événement</button>

        <h3>2) v-model sur inputs natifs</h3>
        <label>Message : <input v-model="message" placeholder="Tapez ici" /></label>
        <p>Echo : {{ message }}</p>
        <label><input type="checkbox" v-model="estActif" /> Actif ?</label>
        <fieldset>
          <legend>Radio</legend>
          <label><input type="radio" value="rouge" v-model="couleur" /> Rouge</label>
          <label><input type="radio" value="bleu" v-model="couleur" /> Bleu</label>
        </fieldset>
        <label>Fruit :
          <select v-model="fruit">
            <option value="pomme">Pomme</option>
            <option value="banane">Banane</option>
            <option value="poire">Poire</option>
          </select>
        </label>
        <p>estActif={{ estActif }}, couleur={{ couleur }}, fruit={{ fruit }}</p>

        <h3>3) Modificateurs v-model</h3>
        <label>Âge (number) : <input v-model.number="age" type="number" /></label>
        <label>Texte (trim) : <input v-model.trim="texte" /></label>
        <label>Recherche (lazy) : <input v-model.lazy="recherche" placeholder="Enter ou blur" /></label>
        <p>age: {{ age }} ({{ typeof age }}), texte: "{{ texte }}", recherche: "{{ recherche }}"</p>

        <h3>4) computed vs methods vs watch</h3>
        <p>Double (computed) : {{ doubleCompteur }} | Double (method) : {{ calcDouble() }}</p>
        <p>Historique (watch) : {{ historique.join(', ') }}</p>

        <h3>5) @keyup / key modifiers</h3>
        <label>Saisie (Enter pour valider) : <input @keyup.enter="validerSaisie" v-model="saisie" /></label>
        <p>Dernière validation : {{ derniereValidation }}</p>

        <h3>6) v-model sur composant</h3>
        <custom-input v-model="pseudo" label="Pseudo" />
        <p>Pseudo = {{ pseudo }}</p>

        <h3>7) Communication parent ↔ enfant</h3>
        <user-card-bad :user="userObj" />
        <p class="warn">Dans cet anti-pattern, l'enfant modifie <code>user.name</code> : mutation par référence (mauvais).</p>
        <user-card-good :name="parentName" @update:name="onUpdateName" />
        <p>Parent applique la mise à jour : parentName = <strong>{{ parentName }}</strong></p>
      </section>
    `
  };

  /* ==========================
     Colonne 2 : Composition API
     ========================== */
  const CompositionDemo = {
    name: 'CompositionDemo',
    components: { CustomInput, ChildCounter, UserCardBad, UserCardGood },
    setup() {
      const cpt = ref(0);
      const msg = ref('');
      const active = ref(false);
      const color = ref('vert');
      const city = ref('Paris');
      const age2 = ref(20);
      const text2 = ref('');
      const search2 = ref('');
      const inputVal = ref('');
      const lastValidation = ref('');
      const nickname = ref('');

      const inc = () => cpt.value++;
      const add = (n) => { cpt.value += n; };
      const withEvent = (evt) => { lastValidation.value = `type=${evt.type}`; };
      const validate = () => { lastValidation.value = inputVal.value; };

      const doubleCpt = computed(() => cpt.value * 2);
      const calcDoubleCpt = () => cpt.value * 2;
      const logs = ref([]);
      watch(cpt, (nv, ov) => { logs.value.push(`${ov}→${nv}`); });

      // Parent/enfant : démonstration
      const userObj = reactive({ name: 'Charly', email: 'charly@example.com' }); // anti-pattern pour comparaison
      const parentName = ref('Dora');
      const onUpdateName = (nv) => { parentName.value = nv; };

      return {
        cpt, msg, active, color, city,
        age2, text2, search2,
        inputVal, lastValidation, nickname,
        inc, add, withEvent, validate,
        doubleCpt, calcDoubleCpt, logs,
        userObj, parentName, onUpdateName
      };
    },
    template: `
      <section class="box">
        <h2>Composition API</h2>

        <h3>1) v-on / @</h3>
        <p>Compteur : <strong>{{ cpt }}</strong></p>
        <button @click="inc">+1</button>
        <button @click="add(3)">+3</button>
        <button @click="withEvent($event)">Utiliser l'événement</button>

        <h3>2) v-model</h3>
        <label>Message : <input v-model="msg" /></label>
        <label><input type="checkbox" v-model="active" /> Actif ?</label>
        <fieldset>
          <legend>Radio</legend>
          <label><input type="radio" value="vert" v-model="color" /> Vert</label>
          <label><input type="radio" value="jaune" v-model="color" /> Jaune</label>
        </fieldset>
        <label>Ville :
          <select v-model="city">
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Marseille">Marseille</option>
          </select>
        </label>
        <p>active={{ active }}, color={{ color }}, city={{ city }}</p>

        <h3>3) Modificateurs v-model</h3>
        <label>Âge (number) : <input v-model.number="age2" type="number" /></label>
        <label>Texte (trim) : <input v-model.trim="text2" /></label>
        <label>Recherche (lazy) : <input v-model.lazy="search2" /></label>
        <p>age2: {{ age2 }} ({{ typeof age2 }}), text2: "{{ text2 }}", search2: "{{ search2 }}"</p>

        <h3>4) computed vs methods vs watch</h3>
        <p>Double (computed) : {{ doubleCpt }} | Double (method) : {{ calcDoubleCpt() }}</p>
        <p>Log (watch) : {{ logs.join(' → ') }}</p>

        <h3>5) @keyup / key modifiers</h3>
        <label>Valider (Enter) : <input @keyup.enter="validate" v-model="inputVal" /></label>
        <p>Dernière validation : {{ lastValidation }}</p>

        <h3>6) v-model sur composant</h3>
        <custom-input v-model="nickname" label="Nickname" />
        <p>Nickname = {{ nickname }}</p>

        <h3>7) Communication parent ↔ enfant</h3>
        <user-card-bad :user="userObj" />
        <p class="warn">⚠️ Enfant modifie <code>user.name</code> : mutation par référence (anti-pattern).</p>
        <user-card-good :name="parentName" @update:name="onUpdateName" />
        <p>Parent applique la mise à jour : parentName = <strong>{{ parentName }}</strong></p>
      </section>
    `
  };

  // App principale
  const App = { name: 'App', components: { OptionsDemo, CompositionDemo }, template: `<div class="grid"><OptionsDemo /><CompositionDemo /></div>` };
  createApp(App)
    .component('custom-input', CustomInput)
    .component('child-counter', ChildCounter)
    .component('user-card-bad', UserCardBad)
    .component('user-card-good', UserCardGood)
    .mount('#app');
  </script>
</body>
</html>
```

---

## 1) `v-on` (alias `@`) : Gestion des événements

### Définition
`v-on` attache un **écouteur d’événement DOM** à un élément et appelle une fonction/méthode.

### Pourquoi ?
Relier les **interactions utilisateur** (clics, saisies) à votre **logique métier**.

### Syntaxe de base
```html
<button v-on:click="doSomething">Action</button>
<!-- Équivalent -->
<button @click="doSomething">Action</button>
```

### Paramètres et objet événement
```html
<button @click="ajouter(5)">+5</button>
<button @click="handle($event)">Avec $event</button>
```

---

## 2) `v-model` : Liaison bidirectionnelle

### Définition
`v-model` synchronise **automatiquement** la valeur d’un input et une **donnée réactive**.

### Inputs natifs
- `text` → `v-model="message"`
- `checkbox` → booléen ou **tableau** (multisélection)
- `radio` → valeur unique
- `select` → valeur ou **tableau** (`multiple`)

### Modificateurs
- `.number` → convertit en **Number**
- `.trim` → supprime espaces en bord
- `.lazy` → met à jour au **blur** ou Enter

```html
<input v-model.number="age" type="number" />
<input v-model.trim="nom" />
<input v-model.lazy="recherche" />
```

---

## 3) Computed vs Methods vs Watchers

### Définition formelle
- **Computed** : fonction pure \( f : S \to D \) mémorisée (cache) dont les **dépendances** \( \mathcal{D} \subset S \) sont suivies. Réexécution **uniquement** si une dépendance varie.
- **Method** : fonction \( g : S \to R \) exécutée **à chaque appel** (dans un template, à **chaque rendu**).
- **Watcher** : observation \( w : S \to E \) qui déclenche un **effet** (IO, timers, logs) lorsque une source varie.

### Exemples
**Options API**
```js
computed: { total() { return this.qte * this.prix; } },
methods: { calcTotal() { return this.qte * this.prix; } },
watch: { recherche(nv, ov) { this.debouncedFetch(nv); } }
```
**Composition API**
```js
const total = computed(() => qte.value * prix.value);
const calcTotal = () => qte.value * prix.value;
watch(recherche, (nv, ov) => { debouncedFetch(nv); });
```

### Bonnes pratiques
- **Computed** pour les **données dérivées** affichées souvent.
- **Methods** pour les **handlers** et calculs ponctuels.
- **Watch** pour les **effets secondaires** (sauvegarde, requêtes).

**Analogie** :
- *Computed* = **mémo** intelligent;
- *Methods* = **calculatrice** naïve;
- *Watchers* = **gardien** déclencheur d’effets.

---

## 4) Modificateurs d’événements

- `@click.stop` (stop propagation), `@submit.prevent` (bloque rechargement)
- `@keyup.enter`, `@keyup.esc`, `@keyup.ctrl.enter` (raccourcis clavier)

```html
<form @submit.prevent="soumettre">
  <input @keyup.enter="valider" v-model="champ" />
</form>
```

---

## 5) **Communication parent ↔ enfant** : ne pas muter une prop dans l’enfant

### Problème (anti-pattern)
Une **prop** passée au composant enfant est **lecture seule**. **Muter** (modifier) la prop (ou un objet reçu par prop) **depuis l’enfant** crée des **effets de bord** et viole le **flux unidirectionnel**.

- Exemple : le parent passe `user` (objet). L’enfant modifie `user.name` → mutation **par référence** qui impacte directement l’état du parent et provoque un **avertissement** de Vue.

**Anti-pattern – Enfant mutateur**
```vue
<!-- Enfant -->
<script>
export default { props: { user: Object } };
</script>
<template>
  <label>Nom: <input @input="user.name = $event.target.value" /></label>
</template>
```

**Conséquence** : comportement implicite, difficile à **déboguer** ; le parent ne maîtrise pas où et quand son état change.

### Pattern correct (emit → parent met à jour)
L’enfant **n’altère pas** la prop. Il **propose** une nouvelle valeur via un **événement** ; le **parent** applique la mise à jour.

**Enfant (Options API)**
```vue
<script>
export default {
  props: { name: String },
  emits: ['update:name']
};
</script>
<template>
  <label>Nom: <input :value="name" @input="$emit('update:name', $event.target.value)" /></label>
</template>
```
**Parent (Options API)**
```vue
<template>
  <UserCardGood :name="parentName" @update:name="parentName = $event" />
</template>
<script>
export default { data() { return { parentName: 'Alice' }; } };
</script>
```

**Enfant (Composition API)**
```vue
<script setup>
import { defineProps, defineEmits } from 'vue';
const props = defineProps({ name: String });
const emit = defineEmits(['update:name']);
</script>
<template>
  <label>Nom: <input :value="props.name" @input="emit('update:name', $event.target.value)" /></label>
</template>
```
**Parent (Composition API)**
```vue
<script setup>
import { ref } from 'vue';
const parentName = ref('Bob');
</script>
<template>
  <UserCardGood :name="parentName" @update:name="parentName = $event" />
</template>
```

### Variante idiomatique : `v-model:propName`
Pour rendre l’API plus naturelle côté parent :
- Prop : `name`
- Event : `update:name`
- Usage : `<UserCardGood v-model:name="parentName" />`

```vue
<template>
  <UserCardGood v-model:name="parentName" />
</template>
```

> **À retenir** : *L’enfant n’a pas la responsabilité de muter le state du parent* ; il **émet** une intention, le parent **décide et applique**.

---

## 6) `v-model` sur composants (conventions)

- Prop par défaut : **`modelValue`**
- Événement : **`update:modelValue`**
- Variante ciblée : **`v-model:propName`** ↔ `update:propName`

```vue
<!-- Parent -->
<CustomInput v-model="pseudo" />
```
```vue
<!-- Enfant -->
<script>
export default { props: { modelValue: String }, emits: ['update:modelValue'] };
</script>
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
```

---

## 7) Erreurs courantes → Corrections

- **Oublier `return` dans `setup()`** → variables invisibles dans le template.
- **Oublier `emits`** pour `v-model` sur composant → la valeur ne remonte pas.
- **Utiliser une method pour un dérivé coûteux** → préférer **computed**.
- **Comparer des chaînes au lieu de nombres** → utiliser `.number`.

---

## 8) Exercices pratiques (progressifs)

1. **Compteur paramétrable**
   - Boutons `+1`, `+5`, `Reset`
   - `double` via **computed**, `triple` via **method**
   - **watch** sur le compteur (log des transitions)

2. **Formulaire utilisateur**
   - `nom` (trim), `age` (number), `email` (lazy)
   - Valider via `@keyup.enter` et `@submit.prevent`
   - Afficher un résumé formaté

3. **Composant `UserCardGood`**
   - Implémente `v-model:name` (prop `name`, event `update:name`)
   - Le parent met à jour un `ref` ou une donnée `data()`

4. **Recherche avec debounce**
   - `recherche` + `watch`
   - Simuler requête asynchrone (`setTimeout`) + **annulation** si nouvelle saisie

---

## 9) Résumé – Points clés
- `v-on/@` : attacher des handlers avec modificateurs utiles.
- `v-model` : liaison bidirectionnelle sur inputs et composants.
- **Computed** (mémo), **Methods** (calcul), **Watchers** (effets).
- **Parent ↔ enfant** : pas de mutation en enfant ; **emit** → **parent met à jour** ; `v-model:propName` pour API fluide.

---
