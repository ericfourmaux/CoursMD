# 📗 Chapitre 1 — Introduction à UML

> **But** : poser les bases solides d’UML (définitions précises, pourquoi, quand et comment), faire le pont avec **JavaScript**, et fournir des **schémas ASCII** qui facilitent la compréhension.

---

## 🎯 Objectifs d’apprentissage
- Comprendre **ce qu’est UML** et **ce qu’il n’est pas**.
- Distinguer **diagrammes structuraux** et **comportementaux**.
- Savoir **pourquoi** et **quand** utiliser UML dans un projet JS/Front.
- Lire et produire des **schémas ASCII** simples.
- Relier les modèles aux **implémentations JavaScript** (sans perdre le sens métier).

---

## 🔑 Définition & Positionnement

**UML (Unified Modeling Language)** est un **langage de modélisation** **standardisé** qui permet de **décrire** la structure et le comportement d’un système logiciel à l’aide de **diagrammes**. UML **n’est pas** un langage d’exécution : il **ne s’exécute pas** comme du code, mais **documente** et **communique** les intentions de conception.

### 💡 Analogie
UML est au code ce que **le plan d’architecte** est au **bâtiment** : il permet de **visualiser** et **discuter** avant de construire, de **réduire les ambiguïtés**, d’**aligner** les parties prenantes.

---

## 🧩 Panorama des familles de diagrammes

- **Structuraux** : décrivent les **éléments** et leurs **relations**.
  - Exemples : diagrammes de **classes**, **composants**, **déploiement**.
- **Comportementaux** : décrivent les **interactions**, **états** et **flux**.
  - Exemples : **use case**, **séquence**, **activité**, **état**.

### 🧩 Schéma ASCII — Vue d’ensemble
```
+-----------------------------------------+
|           UML — Vue d'ensemble          |
+----------------------+------------------+
|   Structuraux        |  Comportementaux |
|----------------------|------------------|
| Classes              | Use Cases        |
| Composants           | Séquence         |
| Déploiement          | Activité         |
| Packages/Objets      | États            |
+----------------------+------------------+
```

---

## ❓ Pourquoi UML dans un projet JavaScript ?

1. **Communication** claire entre développeurs, PO, QA, etc.
2. **Clarification** des responsabilités avant d’écrire du code.
3. **Documentation** vivante (source de vérité minimale) pour onboarding.
4. **Réduction des risques** (on voit vite les manques ou confusions).
5. **Aide aux tests** (scénarios dérivés des use cases/sequence).

### 💬 Exemple concret (JS)
On passe souvent d’un besoin « *Je veux ajouter un produit au panier* » à du code. UML aide à **structurer le raisonnement** avant l’implémentation.

Schéma Use Case (ASCII) :
```
           +---------------------------+
           |  Système Panier (Front)  |
           +---------------------------+
             ^                    ^
             |                    |
         [Client]            [Service Paiement]
             |                    |
             +--(Ajouter au panier)-->+
             +--(Valider panier)----->+
```

Implémentation JS initiale (naïve) :
```js
// cart.js
export class Cart {
  constructor() {
    this.items = []; // { id, name, price, qty }
  }
  addItem(product, qty = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) existing.qty += qty; else this.items.push({ ...product, qty });
  }
  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
}
```
UML (même simple, en ASCII) **documente les intentions** et **évite** que la logique métier se dilue.

---

## 🧮 Formules « théoriques » représentées en JavaScript

Certaines notions utiles en conception peuvent être exprimées en **formules**. Les représenter en JS aide à les **concrétiser**.

### 1) Nombre d’interactions potentielles entre N éléments
Formule classique : `N * (N - 1) / 2` (paires non ordonnées) — utile pour **estimer la complexité des communications**.
```js
/**
 * Calcule le nombre de paires d'interactions possibles entre N éléments.
 * Utile pour visualiser la complexité de communication potentielle.
 */
function interactionPairs(N) {
  if (N < 0 || !Number.isInteger(N)) throw new Error('N doit être un entier >= 0');
  return (N * (N - 1)) / 2;
}

console.log(interactionPairs(0));  // 0
console.log(interactionPairs(1));  // 0
console.log(interactionPairs(5));  // 10
```
**Interprétation UML** : plus il y a de composants/acteurs, plus il faut **structurer** (facade, mediator) pour éviter l’explosion des interactions.

### 2) Complexité cyclomatique approximative (sur un pseudo-contrôle de flux)
La **complexité cyclomatique** (idée : nombre de chemins indépendants) peut être **approchée** en comptant branches.
```js
/**
 * Approximation simple de complexité cyclomatique:
 *  base 1 + nombre de décisions (if, switch cases, &&, ||) détectés naïvement.
 *  Note: c'est une approximation illustrative, pas un analyseur complet.
 */
function cyclomaticComplexity(jsSource) {
  const decisions = (jsSource.match(/\bif\b|\bswitch\b|\?|&&|\|\|/g) || []).length;
  return 1 + decisions;
}

const sample = `
function checkout(cart, user) {
  if (!user) return false;
  if (cart.total() === 0) return false;
  const method = user.pref || 'card';
  switch (method) {
    case 'card': /* ... */ break;
    case 'paypal': /* ... */ break;
    default: /* ... */
  }
  return true;
}`;

console.log(cyclomaticComplexity(sample)); // ex: 1 (base) + décisions
```
**Lien avec UML** : les **diagrammes d’activité** et **séquence** rendent visibles les **branches**/chemins.

---

## 🧱 Notions fondamentales et vocabulaire

- **Acteur** : entité externe qui **interagit** avec le système (humain ou service).
- **Cas d’utilisation (Use Case)** : scénario qui **produit de la valeur** pour un acteur.
- **Système** : frontière qui **délimite** ce qui est **à modéliser**.
- **Relation (aperçu)** : lien entre éléments (association, dépendance…). Les détails viendront aux chapitres dédiés.
- **Multiplicité (aperçu)** : cardinalités (`1`, `0..1`, `1..*`).

### 🧩 Schéma ASCII — Frontière & acteurs
```
+---------------------------------------+
|         [ Système Boutique ]          |
|  +-------------------------------+    |
|  |   Cas: Ajouter au panier      |    |
|  +-------------------------------+    |
+---------------------------------------+
       ^                         ^
       |                         |
     Client                Service Paiement
```

---

## 🔍 Lire et écrire un diagramme ASCII simple

### Règles pratiques
- Utiliser `+---+`, `|` et `-` pour **cadres**.
- Flèches `-->`, `<--`, `^`, `v` pour **flux** ou **direction**.
- Mettre des **titres** pour chaque bloc.

### Exemple — Interaction d’ajout au panier
```
Client --> [ UI Produit ] --> [ Panier ] --> [ Afficher Total ]
    \
     \__> [ Auth ] --(si non connecté)--> [ Login ]
```

---

## 🔧 Du modèle à l’implémentation JavaScript

### Étapes suggérées
1. **Use Case** : écrire le scénario texte.
2. **Séquence ASCII** : messages et décisions clés.
3. **Classes (plus tard)** : identifier **responsabilités** et **données**.
4. **Implémentation JS** : coding des modules et fonctions.
5. **Tests** : dériver des scénarios pour vérifier.

### Mini exemple
```
[Use Case] Ajouter au panier
  - Préconditions: produit existant
  - Scénario: clic -> panier.add(product); UI total
```
```js
// product.js
export const Product = (id, name, price) => ({ id, name, price });

// cart.js
export class Cart {
  constructor() { this.items = []; }
  add(product, qty = 1) {
    const i = this.items.findIndex(x => x.id === product.id);
    if (i >= 0) this.items[i].qty += qty;
    else this.items.push({ ...product, qty });
  }
  total() { return this.items.reduce((s, x) => s + x.price * x.qty, 0); }
}

// ui.js
export function addToCartUI(cart, product) {
  cart.add(product);
  console.log('Total:', cart.total());
}
```

---

## 🧠 Bons réflexes dès l’introduction
- **Nommer clairement** acteurs et cas : éviter jargon inutile.
- **Tracer les flux principaux** avant les exceptions.
- **Limiter** le dessin au **nécessaire** (éviter la sur-documentation).
- **Synchroniser** la doc avec le code (Obsidian + commits).

---

## 🛠️ Exercices

### Exercice 1 — Use Case texte
Rédige un **use case** pour « **Créer un compte client** » avec **scénario principal** et **alternatif** (erreur email déjà utilisé).

### Exercice 2 — Schéma ASCII
Propose un schéma ASCII du **checkout** (panier → paiement → confirmation) avec une branche « paiement refusé ».

### Exercice 3 — JS
Écris une fonction JS `formatTotal(cart)` qui renvoie une **string** formatée `"Total: 12.34 €"`.

---

## ✅ Solutions (suggestions)

### Solution 1 — Use Case (texte)
```
Titre: Créer un compte client
Acteur principal: Visiteur
Scénario principal:
  1. Le visiteur ouvre la page d'inscription.
  2. Il saisit email et mot de passe.
  3. Le système crée le compte et confirme.
Scénario alternatif (email déjà utilisé):
  A1. Le système détecte l'email existant.
  A2. Affiche un message d'erreur et propose la connexion.
```

### Solution 2 — ASCII checkout
```
[ Panier ] --> [ Paiement ] --> [ Confirmation ]
      \
       \__x [ Refus ] --> [ Réessayer ]
```

### Solution 3 — JS `formatTotal`
```js
export function formatTotal(cart) {
  const total = cart.total ? cart.total() : 0;
  return `Total: ${total.toFixed(2)} €`;
}
```

---

## 🧾 Checklist — Chapitre 1
- [ ] Je sais **définir UML** et sa **finalité**.
- [ ] Je distingue **structuraux** vs **comportementaux**.
- [ ] Je peux faire un **schéma ASCII** simple.
- [ ] Je relie un **use case** à du **JS** minimal.
- [ ] Je comprends **pourquoi** UML aide (communication, clarté, testabilité).

---

## 🧠 Mini Quiz
1. UML est-il **exécutable** ? (Oui/Non)
2. Cite **deux** diagrammes **comportementaux**.
3. À quoi sert un **use case** ?
4. Pourquoi éviter la sur-documentation ?

> Réponses attendues: 1) Non 2) Use Case, Séquence, Activité, État 3) Décrire un scénario à valeur pour un acteur 4) Garder la doc utile et vivante.

---

## 🗂️ Références internes
- Voir Chapitres **2** (Use Case), **3** (Classes), **4** (Séquence/Activité), **5** (États/Composants/Déploiement).

---

## 📚 Résumé — Points clés du Chapitre 1
- UML **décrit** (ne s’exécute pas), structure la **communication**.
- Deux familles : **structuraux** vs **comportementaux**.
- **Schémas ASCII**: suffisent pour exprimer l’essentiel.
- **JS**: relier modèles aux implémentations minimales.
- Préparer le terrain pour les prochains chapitres (use case, classes, séquence, activité, état).
