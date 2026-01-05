
# Guide Complet : Les Slots dans Vue.js

---

## 1. Introduction aux Slots
### 1.1 Qu'est-ce qu'un Slot ?
Les **slots** dans Vue.js sont des "emplacements" dans un composant où tu peux injecter du contenu depuis le composant parent. Ils permettent de créer des composants **flexibles** et **réutilisables**, en laissant le parent décider du contenu à afficher.

### 1.2 Pourquoi Utiliser des Slots ?
- **Réutilisabilité** : Un même composant peut afficher différents contenus selon le contexte.
- **Flexibilité** : Le parent contrôle ce qui est affiché dans le composant enfant.
- **Composition** : Permet de combiner plusieurs composants de manière dynamique.

---

## 2. Slots par Défaut
### 2.1 Utilisation de Base
Un slot par défaut est un emplacement où le contenu du parent est inséré.

**Exemple :**
```javascript
// Composant enfant (ChildComponent.vue)
export default {
  template: `<div><slot></slot></div>`
};
```

**Utilisation dans le parent :**
```html
<child-component>
  <p>Ce contenu sera affiché dans le slot par défaut.</p>
</child-component>
```

### 2.2 Contenu de Replacement
Si le composant enfant a un contenu par défaut dans le slot, il sera remplacé par le contenu du parent.

**Exemple :**
```javascript
// Composant enfant
export default {
  template: `<div><slot>Contenu par défaut</slot></div>`
};
```

**Utilisation dans le parent :**
```html
<child-component>
  <p>Ce contenu remplace le contenu par défaut.</p>
</child-component>
```

---

## 3. Slots Només
### 3.1 Introduction aux Slots Només
Les **slots només** permettent de définir plusieurs emplacements dans un composant, chacun avec un nom unique. Cela offre plus de contrôle sur la disposition du contenu.

### 3.2 Utilisation des Slots Només
**Exemple :**
```javascript
// Composant enfant
export default {
  template: `
    <div>
      <header>
        <slot name="header"></slot>
      </header>
      <main>
        <slot></slot> <!-- Slot par défaut -->
      </main>
      <footer>
        <slot name="footer"></slot>
      </footer>
    </div>
  `
};
```

**Utilisation dans le parent :**
```html
<child-component>
  <template v-slot:header>
    <h1>En-tête personnalisé</h1>
  </template>
  
  <p>Contenu principal.</p>
  
  <template v-slot:footer>
    <p>Pied de page personnalisé</p>
  </template>
</child-component>
```

### 3.3 Syntaxe Abbréviée
Tu peux utiliser la syntaxe abbréviée `#` pour les slots només.

**Exemple :**
```html
<child-component>
  <template #header>
    <h1>En-tête personnalisé</h1>
  </template>
</child-component>
```

---

## 4. Slots avec Portée (Scoped Slots)
### 4.1 Introduction aux Scoped Slots
Les **scoped slots** permettent de passer des données du composant enfant au parent. Cela est utile pour afficher des données dynamiques dans le parent.

### 4.2 Utilisation des Scoped Slots
**Exemple :**
```javascript
// Composant enfant
export default {
  data() {
    return {
      items: ['Pomme', 'Banane', 'Cerise']
    };
  },
  template: `
    <ul>
      <li v-for="item in items" :key="item">
        <slot :item="item"></slot>
      </li>
    </ul>
  `
};
```

**Utilisation dans le parent :**
```html
<child-component>
  <template v-slot:default="slotProps">
    <span>{{ slotProps.item }}</span>
  </template>
</child-component>
```

### 4.3 Syntaxe Abbréviée pour Scoped Slots
Tu peux utiliser la syntaxe abbréviée pour les scoped slots.

**Exemple :**
```html
<child-component v-slot="{ item }">
  <span>{{ item }}</span>
</child-component>
```

---

## 5. Cas d'Usage Courants
### 5.1 Composants de Liste
Les slots sont souvent utilisés pour créer des composants de liste personnalisables.

**Exemple :**
```javascript
// Composant List.vue
export default {
  props: ['items'],
  template: `
    <ul>
      <li v-for="item in items" :key="item.id">
        <slot :item="item"></slot>
      </li>
    </ul>
  `
};
```

**Utilisation dans le parent :**
```html
<list :items="products" v-slot="{ item }">
  <div>
    <h3>{{ item.name }}</h3>
    <p>{{ item.price }} €</p>
  </div>
</list>
```

### 5.2 Modales et Boîtes de Dialogue
Les slots permettent de créer des modales flexibles où le contenu est défini par le parent.

**Exemple :**
```javascript
// Composant Modal.vue
export default {
  template: `
    <div class="modal">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  `
};
```

**Utilisation dans le parent :**
```html
<modal>
  <h2>Titre de la modale</h2>
  <p>Contenu personnalisé de la modale.</p>
</modal>
```

---

## 6. Bonnes Pratiques
### 6.1 Nommage des Slots
- Utilise des noms de slots **clairs et descriptifs** (ex : `header`, `footer`, `item`).
- Évite les noms trop génériques comme `slot1`, `slot2`.

### 6.2 Documentation
- Documente les slots disponibles dans tes composants pour faciliter leur utilisation par d'autres développeurs.

### 6.3 Contenu par Défaut
- Fournis un contenu par défaut dans tes slots pour une meilleure expérience utilisateur.

### 6.4 Évite la Logique Complexe
- Garde la logique dans le composant enfant simple. Utilise les slots pour la présentation, pas pour la logique métier.

---

## 7. Exercices Pratiques
### 7.1 Exercice : Créer un Composant de Carte
Crée un composant `Card` avec les slots suivants :
- `header` : Pour le titre de la carte.
- `default` : Pour le contenu principal.
- `footer` : Pour le pied de page.

**Indice :**
- Utilise des slots només pour `header` et `footer`.
- Le slot par défaut n'a pas besoin d'être nommé.

### 7.2 Exercice : Liste avec Scoped Slots
Crée un composant `UserList` qui affiche une liste d'utilisateurs. Utilise un scoped slot pour permettre au parent de personnaliser l'affichage de chaque utilisateur.

**Indice :**
- Passe l'objet utilisateur au slot avec `v-slot:default="{ user }"`.
- Dans le parent, utilise le scoped slot pour afficher les propriétés de l'utilisateur.

---

## 8. Résumé et Points Clés à Retenir
| Concept               | Description                                                                 | Cas d’Usage                          |
|-----------------------|-----------------------------------------------------------------------------|--------------------------------------|
| **Slots par défaut**  | Emplacement pour injecter du contenu depuis le parent.                     | Composants génériques.              |
| **Slots només**       | Plusieurs emplacements nommés pour plus de flexibilité.                    | Layouts complexes (en-tête, pied de page). |
| **Scoped slots**      | Passer des données du composant enfant au parent.                          | Listes dynamiques, affichage personnalisé. |

---

## 9. Ressources pour Aller Plus Loin
- **Documentation Officielle** : [Slots dans Vue 3](https://vuejs.org/guide/components/slots.html)
- **Tutoriel Vidéo** : [Vue.js Slots Explained](https://www.youtube.com/watch?v=...) (à rechercher)
