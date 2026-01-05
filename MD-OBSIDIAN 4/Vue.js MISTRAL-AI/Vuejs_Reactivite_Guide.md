
# Guide Complet : Réactivité dans Vue.js (ref, reactive, computed, watch)

## 1. Introduction aux Types Réactifs dans Vue.js
### 1.1 Pourquoi la Réactivité est Importante ?
Dans Vue.js, la **réactivité** permet à l’interface de se mettre à jour automatiquement quand les données changent. Par exemple, si tu modifies une variable, tout ce qui dépend de cette variable (comme l’affichage) est mis à jour sans que tu aies à le faire manuellement.

### 1.2 Objectifs de ce Chapitre
À la fin de cette section, tu sauras :
- Utiliser **`data`** pour définir des données réactives.
- Comprendre la différence entre **`ref`** et **`reactive`**.
- Utiliser **`computed`** pour calculer des valeurs dérivées.
- Savoir quand utiliser **`watch`** pour réagir aux changements.

---

## 2. Bases : Les Données Réactives
### 2.1 `data` : La Base de la Réactivité
Dans Vue.js, les données réactives sont définies dans l’objet **`data`**. Quand tu modifies une propriété de `data`, Vue.js détecte le changement et met à jour l’interface.

**Exemple :**
```javascript
const app = Vue.createApp({
  data() {
    return {
      count: 0
    };
  }
});
```
- Ici, `count` est une donnée réactive. Si tu modifies `count`, l’interface se mettra à jour.

### 2.2 `ref` : Réactivité pour les Types Primitifs
Dans Vue 3, **`ref`** est une fonction qui permet de créer une référence réactive à une valeur (souvent utilisée pour les types primitifs comme `string`, `number`, `boolean`).

**Exemple :**
```javascript
import { ref } from 'vue';

const count = ref(0); // count est une référence réactive
console.log(count.value); // Pour accéder à la valeur, utilise `.value`
```
- **`ref`** retourne un objet avec une propriété **`value`** qui contient la valeur réelle.
- **Cas d’usage** : Utilise `ref` pour les variables simples (comme un compteur, un texte, etc.).

**Exercice :**
Crée une variable réactive `name` avec `ref` et affiche-la dans le template.

### 2.3 `reactive` : Réactivité pour les Objets
**`reactive`** est utilisé pour rendre un **objet** réactif. Contrairement à `ref`, tu n’as pas besoin d’utiliser `.value` pour accéder aux propriétés.

**Exemple :**
```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  name: 'Eric'
});
console.log(state.count); // Pas besoin de `.value`
```
- **`reactive`** est idéal pour les objets ou les tableaux.
- **Cas d’usage** : Utilise `reactive` quand tu as un objet avec plusieurs propriétés liées.

**Exercice :**
Crée un objet réactif `user` avec les propriétés `firstName` et `lastName`, puis affiche-les dans le template.

---

## 3. Concepts Intermédiaires : `computed` et `watch`
### 3.1 `computed` : Calculer des Valeurs Dérivées
**`computed`** permet de définir une valeur qui dépend d’autres données réactives. Cette valeur est **mise en cache** et ne se recalcule que si ses dépendances changent.

**Exemple :**
```javascript
import { ref, computed } from 'vue';

const firstName = ref('Eric');
const lastName = ref('Fourmaux');

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});
```
- `fullName` est une propriété calculée qui dépend de `firstName` et `lastName`.
- Si `firstName` ou `lastName` change, `fullName` est recalculé automatiquement.

**Exercice :**
Crée une propriété calculée `doubleCount` qui retourne le double de `count`.

### 3.2 `watch` : Réagir aux Changements
**`watch`** permet d’exécuter une fonction quand une donnée réactive change. C’est utile pour effectuer des actions secondaires (comme une requête API) en réponse à un changement.

**Exemple :**
```javascript
import { ref, watch } from 'vue';

const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log(`Le compteur est passé de ${oldValue} à ${newValue}`);
});
```
- Ici, à chaque fois que `count` change, le `console.log` s’exécute.

**Exercice :**
Utilise `watch` pour afficher une alerte quand `count` dépasse 10.

---

## 4. Applications Pratiques
### 4.1 Exemple : Panier d’Achat
Imaginons un panier d’achat où tu veux calculer le total automatiquement.

**Code :**
```javascript
import { ref, computed } from 'vue';

const items = ref([
  { id: 1, name: 'Pomme', price: 1.5 },
  { id: 2, name: 'Banane', price: 0.75 },
]);

const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0);
});
```
- `total` est une propriété calculée qui dépend de `items`.
- Si tu ajoutes ou supprimes un item, `total` est recalculé automatiquement.

**Exercice :**
Ajoute une fonction pour ajouter un item au panier et observe comment `total` se met à jour.

---

## 5. Erreurs Courantes et Pièges à Éviter
| Erreur                          | Solution                                  |
|---------------------------------|-------------------------------------------|
| Oublier `.value` avec `ref`     | Toujours utiliser `.value` pour accéder ou modifier la valeur d’un `ref`. |
| Modifier un objet `reactive` directement | Toujours modifier les propriétés de l’objet, pas l’objet lui-même. |
| Utiliser `computed` pour des effets de bord | `computed` doit être pur (pas d’effets de bord comme des requêtes API). Utilise `watch` ou `methods` pour ça. |
| Ne pas comprendre la différence entre `ref` et `reactive` | `ref` pour les types primitifs, `reactive` pour les objets. |

---

## 6. Résumé et Points Clés à Retenir
### 6.1 Tableau Récapitulatif
| Concept      | Description                                  | Cas d’Usage                          |
|--------------|----------------------------------------------|--------------------------------------|
| `data`       | Données réactives de base.                   | Variables simples dans une instance Vue. |
| `ref`        | Référence réactive pour les types primitifs. | Variables simples (string, number, etc.). |
| `reactive`   | Rend un objet réactif.                       | Objets ou tableaux avec plusieurs propriétés. |
| `computed`   | Propriété calculée et mise en cache.         | Valeurs dérivées (ex : total d’un panier). |
| `watch`      | Exécute une fonction quand une donnée change. | Actions secondaires (ex : requêtes API). |

---

## 7. Ressources pour Aller Plus Loin
- **Documentation Officielle** : [Réactivité dans Vue 3](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)

---

### Exercice Final
Crée une petite application qui :
1. Affiche un compteur (`ref`).
2. Affiche le carré du compteur (`computed`).
3. Affiche une alerte quand le compteur dépasse 5 (`watch`).
