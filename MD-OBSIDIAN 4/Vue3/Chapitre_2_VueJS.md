# Chapitre 2 : Les bases du fonctionnement

## 1. L’Instance Vue

### Définition
Une **instance Vue** est le cœur de votre application. Elle relie :
- **Les données** (state)
- **Les méthodes** (fonctions)
- **Le DOM** (interface)

En Vue 3, on crée une instance avec `createApp()`.

---

### Options API
```javascript
const app = Vue.createApp({
  data() {
    return {
      message: 'Bonjour Vue !',
      compteur: 0
    }
  },
  methods: {
    incrementer() {
      this.compteur++;
    }
  }
});
app.mount('#app');
```

### Composition API
```javascript
import { createApp, ref } from 'vue';

const App = {
  setup() {
    const message = ref('Bonjour Vue !');
    const compteur = ref(0);
    const incrementer = () => compteur.value++;
    return { message, compteur, incrementer };
  }
};

createApp(App).mount('#app');
```

**Différence :**
- `ref()` crée une donnée réactive.
- On retourne les variables et fonctions pour les rendre accessibles dans le template.

---

## 2. Le système réactif
Vue observe les propriétés définies dans `data()` ou via `ref()`. Quand elles changent :
- Vue met à jour le **DOM virtuel**.
- Puis synchronise avec le **DOM réel**.

**Analogie :** Imaginez un **miroir magique** : vous changez votre apparence (données), le reflet (interface) s’adapte instantanément.

---

## 3. Interpolation et directives

### Interpolation
Utilisez `{{ variable }}` pour afficher une donnée :
```html
<p>{{ message }}</p>
```

### Directives
Les directives sont des **instructions spéciales** dans le HTML, précédées de `v-`.

#### v-bind
```html
<img v-bind:src="imageUrl">
<!-- Raccourci -->
<img :src="imageUrl">
```

#### v-if / v-show
```html
<p v-if="compteur > 0">Compteur positif</p>
<p v-show="compteur > 0">Visible mais caché via CSS</p>
```

#### v-for
```html
<li v-for="item in items">{{ item }}</li>
```

---

## ✅ Résumé des points essentiels
- Une instance Vue relie données, méthodes et DOM.
- Réactivité = mise à jour automatique du DOM.
- Interpolation avec `{{ }}`.
- Directives : `v-bind`, `v-if`, `v-show`, `v-for`.

---

## Exercices pratiques
1. Créez une instance Vue avec un compteur et un bouton pour l’incrémenter.
2. Ajoutez une condition avec `v-if` pour afficher un message si le compteur > 5.
3. Créez une liste d’éléments et affichez-la avec `v-for`.

---

### 🔜 Prochain chapitre : Gestion des événements et des données
