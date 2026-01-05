
# Guide Complet : Watch, Props, Émit et Bonnes Pratiques dans Vue.js

---

## 1. Watch : Observer les Changements
### 1.1 Introduction à `watch`
`watch` est une fonctionnalité de Vue.js qui permet d'observer les changements d'une donnée réactive et d'exécuter une fonction en réponse à ces changements. C'est particulièrement utile pour effectuer des actions secondaires, comme des appels API ou des mises à jour de l'interface utilisateur.

### 1.2 Utilisation de Base
Pour utiliser `watch`, tu dois importer la fonction depuis Vue et l'appliquer à une référence réactive (`ref`) ou un objet réactif (`reactive`).

**Exemple :**
```javascript
import { ref, watch } from 'vue';

const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log(`Le compteur est passé de ${oldValue} à ${newValue}`);
});
```
- Ici, chaque fois que `count` change, la fonction de rappel (`callback`) est exécutée avec les valeurs ancienne et nouvelle.

### 1.3 Observer Plusieurs Sources
Tu peux aussi observer plusieurs sources de données en utilisant un tableau.

**Exemple :**
```javascript
const firstName = ref('Eric');
const lastName = ref('Fourmaux');

watch([firstName, lastName], ([newFirstName, newLastName], [oldFirstName, oldLastName]) => {
  console.log(`Nom complet changé de ${oldFirstName} ${oldLastName} à ${newFirstName} ${newLastName}`);
});
```

### 1.4 Options de `watch`
Tu peux passer un objet de configuration en troisième argument pour contrôler le comportement de `watch`.

**Exemple :**
```javascript
watch(count, (newValue, oldValue) => {
  console.log(`Nouvelle valeur : ${newValue}`);
}, {
  immediate: true // Exécute la fonction de rappel immédiatement
});
```

### 1.5 Cas d'Usage Courants
- **Appels API** : Mettre à jour des données en fonction d'une recherche utilisateur.
- **Validation de Formulaires** : Vérifier la validité d'un champ quand il change.
- **Effets Secondaires** : Mettre à jour un graphique ou une animation.

---

## 2. Props et Émit : Communication entre Composants
### 2.1 Introduction aux Props
Les **props** sont utilisées pour passer des données d'un composant parent à un composant enfant. Elles sont déclarées dans l'objet `props` du composant enfant.

**Exemple :**
```javascript
// Composant enfant
const ChildComponent = {
  props: ['message'],
  template: '<p>{{ message }}</p>'
};

// Composant parent
const app = Vue.createApp({
  components: {
    'child-component': ChildComponent
  },
  data() {
    return {
      parentMessage: 'Bonjour depuis le parent !'
    }
  }
});
```

### 2.2 Utilisation des Props
Les props sont passées comme des attributs au composant enfant.

**Exemple :**
```html
<child-component :message="parentMessage"></child-component>
```

### 2.3 Validation des Props
Tu peux valider les props pour t'assurer qu'elles sont du bon type.

**Exemple :**
```javascript
props: {
  message: {
    type: String,
    required: true
  }
}
```

### 2.4 Introduction à `emit`
Les **événements personnalisés** (via `$emit`) permettent à un composant enfant de communiquer avec son parent.

**Exemple :**
```javascript
// Composant enfant
const ChildComponent = {
  methods: {
    notifyParent() {
      this.$emit('notify', 'Message depuis l’enfant');
    }
  },
  template: '<button @click="notifyParent">Notifier le parent</button>'
};

// Composant parent
const app = Vue.createApp({
  components: {
    'child-component': ChildComponent
  },
  methods: {
    handleNotify(message) {
      console.log(message);
    }
  }
});
```

### 2.5 Utilisation de `emit`
Dans le parent, écoute l'événement émis par l'enfant.

**Exemple :**
```html
<child-component @notify="handleNotify"></child-component>
```

---

## 3. Bonnes Pratiques
### 3.1 Utilisation des Props
- **Évite de modifier les props** : Les props doivent être traitées comme immuables. Si tu as besoin de les modifier, utilise une `data` ou une `computed` locale.
- **Valide toujours tes props** : Utilise la validation des props pour éviter les erreurs.

### 3.2 Utilisation de `emit`
- **Nomme clairement tes événements** : Utilise des noms d'événements explicites pour faciliter la compréhension du code.
- **Évite les événements trop génériques** : Préfère des noms d'événements spécifiques à leur contexte.

### 3.3 Utilisation de `watch`
- **Évite les effets de bord complexes** : Garde les fonctions de rappel de `watch` simples et claires.
- **Utilise `immediate` avec parcimonie** : Seule une utilisation judicieuse de `immediate: true` est recommandée.

### 3.4 Organisation du Code
- **Sépare les responsabilités** : Chaque composant doit avoir une responsabilité claire.
- **Utilise des noms clairs** : Pour les composants, les props et les événements.

---

## 4. Exercices Pratiques
### 4.1 Exercice avec `watch`
Crée un composant qui observe un champ de texte et affiche sa longueur en temps réel.

**Indice :** Utilise `ref` pour le champ de texte et `watch` pour observer ses changements.

### 4.2 Exercice avec Props et Émit
Crée un composant enfant qui reçoit une prop `initialCount` et émet un événement `increment` quand un bouton est cliqué.

**Indice :**
- Dans l'enfant, utilise `this.$emit('increment')` pour émettre l'événement.
- Dans le parent, écoute l'événement avec `@increment` et mets à jour le compteur.

---

## 5. Résumé et Points Clés à Retenir
| Concept      | Description                                  | Cas d’Usage                          |
|--------------|----------------------------------------------|--------------------------------------|
| `watch`      | Observe les changements de données réactives. | Actions secondaires (appels API, validation). |
| `props`      | Passe des données du parent à l’enfant.      | Communication parent-enfant.        |
| `emit`       | Émet des événements de l’enfant au parent.   | Communication enfant-parent.        |

---

## 6. Ressources pour Aller Plus Loin
- **Documentation Officielle** : [Watch dans Vue 3](https://vuejs.org/guide/essentials/watchers.html)
- **Documentation Officielle** : [Props dans Vue 3](https://vuejs.org/guide/components/props.html)
- **Documentation Officielle** : [Événements dans Vue 3](https://vuejs.org/guide/components/events.html)
