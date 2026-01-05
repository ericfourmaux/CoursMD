# Chapitre 1 : Comprendre Vue.js

## 1. Qu’est-ce que Vue.js ?

### Définition
Vue.js est un **framework JavaScript progressif** conçu pour construire des interfaces utilisateur interactives. Il se concentre sur la **vue** (la partie visible de l’application), mais peut être étendu pour gérer des applications complexes grâce à des outils comme **Vue Router** et **Vuex**.

- **Progressif** : commencez petit et évoluez vers des applications SPA.
- **Réactif** : lorsque vos données changent, l’interface se met à jour automatiquement.

### Pourquoi Vue.js ?
- **Simplicité** : Syntaxe intuitive.
- **Flexibilité** : Projets simples ou complexes.
- **Performance** : Léger et rapide.
- **Communauté active**.

**Comparaison rapide :**
- React : Basé sur JSX.
- Angular : Plus complet mais complexe.
- Vue : Équilibre entre simplicité et puissance.

---

## 2. Le concept de réactivité
Vue utilise un **système d’observation** : chaque propriété définie dans `data()` ou `reactive()` est surveillée. Quand elle change, Vue met à jour le DOM virtuel.

**Analogie :** Imaginez un **tableau blanc interactif** : chaque fois que vous modifiez une donnée, Vue réécrit la partie concernée.

---

## 3. Installation et mise en place

### Option 1 : Via CDN
```html
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<div id="app">{{ message }}</div>
<script>
const app = Vue.createApp({
  data() {
    return { message: 'Bonjour Vue !' }
  }
});
app.mount('#app');
</script>
```

### Option 2 : Via CLI
```bash
npm install -g @vue/cli
vue create mon-projet
npm run serve
```

---

## 4. Structure d’un projet Vue
- `src/main.js` : Point d’entrée.
- `App.vue` : Composant racine.
- `components/` : Composants réutilisables.

---

## 5. Options API vs Composition API

### Options API
```javascript
const app = Vue.createApp({
  data() {
    return { message: 'Hello Options API' }
  },
  methods: {
    direBonjour() {
      alert(this.message);
    }
  }
});
```

### Composition API
```javascript
import { createApp, ref } from 'vue';

const App = {
  setup() {
    const message = ref('Hello Composition API');
    const direBonjour = () => alert(message.value);
    return { message, direBonjour };
  }
};

createApp(App).mount('#app');
```

**Différence clé :**
- Options API : Organisé par options (`data`, `methods`).
- Composition API : Organisé par logique.

---

## ✅ Résumé des points essentiels
- Vue.js = Framework progressif pour interfaces réactives.
- Réactivité = Mise à jour automatique du DOM.
- Installation : CDN ou CLI.
- Deux syntaxes : Options API et Composition API.
- Structure projet : `main.js`, `App.vue`, `components/`.

---

### 🔜 Prochain chapitre : Les bases du fonctionnement
