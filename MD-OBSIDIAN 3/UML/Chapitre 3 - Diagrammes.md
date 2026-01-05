# 🏗️ Chapitre 3 — Diagrammes de classes

> **Objectif** : maîtriser la **notation UML des classes**, la **visibilité** des membres, les **relations** (association, agrégation, composition, dépendance, généralisation, réalisation), les **multiplicités**, **rôles**, **navigabilité**, **qualificateurs** et **classes d’association**. Le tout, avec **schémas ASCII** et implémentations **100% JavaScript**.

---

## 🎯 Objectifs d’apprentissage
- Savoir **lire et écrire** un diagramme de classes UML.
- Comprendre **quand** modéliser en classes (structure stable, invariants).
- Maîtriser les **relations** et **multiplicités**.
- Mapper un diagramme de classes vers du **code JavaScript** (ES6 classes, modules, closures, #privés).
- Éviter les **anti-patterns** (God Object, dépendances circulaires).

---

## 🔑 Définitions & Notation

### Classe
Une **classe** modélise une **structure** (attributs) et des **comportements** (opérations/méthodes) d’objets **ayant la même responsabilité**.

**Notation UML (ASCII simplifiée)** :
```
+-----------------------------+
|         <<stéréotype>>      |
|        NomDeLaClasse        |
+-----------------------------+
| - attributPrivé: Type       |
| # attributProtégé: Type     |
| ~ attributPackage: Type     |
| + attributPublic: Type      |
+-----------------------------+
| + operationPublique(p: T): R|
| - operationPrivée(): void   |
+-----------------------------+
```

**Visibilités** : `+` **public**, `-` **privé**, `#` **protégé**, `~` **package** (portée du module en JS).  
**Stéréotypes utiles** : `<<interface>>`, `<<abstract>>`, `<<service>>`, `<<entity>>`.

### Attributs & Opérations
- **Attribut** : donnée **persistée** par l’objet.
- **Opération** : **contrat** (signature) exposé par la classe.

### Instances & Invariants
- **Instance** : objet créé à partir de la classe.
- **Invariant** : propriété qui doit **toujours** être vraie (ex. total >= 0).

---

## 🔗 Relations entre classes

### 1) Association (lien sémantique)
Relie deux classes qui **collaborent**.
```
[Produit] <---- associé à ----> [LignePanier]
```
**Multiplicités** au bout des liens (ex. `1`, `0..1`, `1..*`, `0..*`).

### 2) Agrégation (partie-tout, faible)
Le **tout** possède des **parties**, mais les parties peuvent **exister** sans le tout.
```
[Panier] o---- contient ----* [LignePanier]
          ^ agrégation (losange vide)
```

### 3) Composition (partie-tout, forte)
Les **parties** n’existent **pas** sans le **tout** (cycle de vie lié).
```
[Commande] ■---- compose ----* [ArticleCommande]
           ^ composition (losange plein)
```

### 4) Généralisation (héritage)
Une classe **spécialisée** hérite du **contrat** d’une classe **générale**.
```
[Utilisateur] --|> [Client]
        triangle (|>) vers la classe générale
```

### 5) Réalisation (implémentation d’une interface)
Une classe **implémente** une **interface**.
```
<<interface>> [IPaiement]
        ^ ^
        | |
     --|>  --|>  (réalisation)
     [PaiementCarte]  [PaiementPaypal]
```

### 6) Dépendance (utilisation ponctuelle)
Une classe **utilise** une autre **sans la posséder** (paramètre, variable locale).
```
[CheckoutService] - - - - > [IPaiement]
      (flèche en pointillés)
```

---

## 🔢 Multiplicités, rôles & navigabilité

### Multiplicités
- `1` exactement une instance
- `0..1` zéro ou une
- `1..*` au moins une
- `0..*` zéro, une ou plusieurs
- `m..n` entre **m** et **n**

### Rôles
Nom donné à **chaque extrémité** d’une association pour clarifier la **responsabilité**.
```
[Panier] -- lignes --> [LignePanier]
[Produit] -- item --> [LignePanier]
```

### Navigabilité
Sens de **connaissance** (qui peut **référencer** qui).
```
[Panier] --> [LignePanier]  (Panier connaît ses lignes)
[Produit]     [LignePanier]  (pas de flèche: LignePanier connaît Produit via id)
```

### Qualificateurs & Classe d’association
- **Qualificateur** : clé pour **résoudre** une association (ex. `productId`).
- **Classe d’association** : porte **attributs** du **lien**.
```
[Panier] -- (qualif: productId) --> [Produit]
[Panier] ---- [LignePanier] ---- [Produit]
       \__ classe d'association avec qty, priceAtAdd
```

---

## 🧩 Exemple fil rouge (ASCII) — Boutique
```
+-------------------+        +-------------------+
|      Produit      |        |     Panier        |
+-------------------+        +-------------------+
| + id: string      |        | - items: Ligne[]  |
| + name: string    |        | + add(p, qty)     |
| + price: number   |        | + total(): number |
+-------------------+        +-------------------+
         ^                          |
         |                          |  o agrégation
         |                          v
+-------------------+        +-------------------+
|   LignePanier     |<-------o      (items)     |
+-------------------+        +-------------------+
| + productId: str  |
| + qty: number     |
| + priceAtAdd: num |
+-------------------+

<<interface>> IPaiement
   ^            ^
   |            |
 --|> PaiementCarte      --|> PaiementPaypal

CheckoutService - - - - > IPaiement
```

---

## 🔧 Mapping UML → JavaScript

### Classes & attributs
- UML **classe** → `class` JS (ES6).  
- **Attribut privé** UML (`-`) → champ **privé** JS `#attr` ou via **closure**.
- **Attribut protégé** UML (`#`) → **convention** (ex. `_attr`) + documentation.

### Interfaces & abstractions
- UML `<<interface>>` → **contrat** par **duck-typing** : vérifier **présence** des méthodes.
- UML `<<abstract>>` → classe JS avec méthodes **non implémentées** (lèvent une erreur).

### Associations, agrégations, compositions
- **Association** → garder une **référence**.
- **Agrégation** → liste d’objets, mais **créés/possédés** ailleurs possible.
- **Composition** → **création** et **destruction** gérées par le **tout**.

### Dépendance
- Paramètre de **méthode** ou **injection** de service.

### Réalisation
- Vérifier qu’un objet **implémente** le contrat **attendu** avant usage.

---

## 💻 Implémentation JavaScript — Fil rouge

### Entités de base
```js
// produit.js
export class Produit {
  #id; #name; #price;
  constructor(id, name, price) {
    if (!id || price < 0) throw new Error('Produit invalide');
    this.#id = id; this.#name = name; this.#price = price;
  }
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
}

// ligne-panier.js (classe d'association)
export class LignePanier {
  constructor(productId, qty, priceAtAdd) {
    if (qty <= 0) throw new Error('Quantité invalide');
    this.productId = productId; // qualificateur
    this.qty = qty;
    this.priceAtAdd = priceAtAdd;
  }
  subtotal() { return this.qty * this.priceAtAdd; }
}
```

### Agrégation (Panier → Lignes)
```js
// panier.js
import { LignePanier } from './ligne-panier.js';

export class Panier {
  #items = []; // agrégation: détient des lignes

  add(produit, qty = 1) {
    const i = this.#items.findIndex(x => x.productId === produit.id);
    if (i >= 0) this.#items[i].qty += qty;
    else this.#items.push(new LignePanier(produit.id, qty, produit.price));
  }

  total() {
    return this.#items.reduce((s, li) => s + li.subtotal(), 0);
  }

  remove(productId) {
    this.#items = this.#items.filter(li => li.productId !== productId);
  }

  clear() { this.#items = []; }

  get items() { return [...this.#items]; }
}
```

### Interfaces & Réalisation (Paiement)
```js
// paiement-interface.js
export const IPaiement = {
  methods: ['payer'],
};

export function assertImplements(obj, iface) {
  const ok = iface.methods.every(m => typeof obj[m] === 'function');
  if (!ok) throw new Error('Contrat non respecté');
}

// paiement-carte.js
export class PaiementCarte {
  payer(montant) { return { ok: montant <= 100, txId: 'card_' + Date.now() }; }
}

// paiement-paypal.js
export class PaiementPaypal {
  payer(montant) { return { ok: montant <= 200, txId: 'pp_' + Date.now() }; }
}
```

### Dépendance (CheckoutService → IPaiement)
```js
// checkout-service.js
import { assertImplements, IPaiement } from './paiement-interface.js';

export class CheckoutService {
  #panier; #paiement;
  constructor(panier, paiement) {
    this.#panier = panier; this.#paiement = paiement;
    assertImplements(paiement, IPaiement); // réalisation
  }
  payer() {
    const total = this.#panier.total();
    const r = this.#paiement.payer(total);
    if (!r.ok) return { ok: false };
    return { ok: true, transactionId: r.txId };
  }
}
```

---

## 🧮 Formules & garde-fous en JavaScript

### 1) Vérifier une multiplicité
```js
/**
 * Vérifie si count ∈ [min, max] (max peut être Infinity).
 */
export function enforceMultiplicity(count, min = 0, max = Infinity) {
  if (count < min) return false;
  if (count > max) return false;
  return true;
}

// Exemples
console.log(enforceMultiplicity(0, 1, Infinity)); // false (au moins 1)
console.log(enforceMultiplicity(3, 0, 5));        // true
```

### 2) Invariant de composition (détruire les parties avec le tout)
```js
// commande.js (composition forte)
export class Commande {
  #articles = []; #status = 'CREATED';
  addArticle(prodId, qty, unitPrice) {
    this.#articles.push({ prodId, qty, unitPrice });
  }
  cancel() {
    // composition: destruction des parties avec le tout
    this.#articles = []; // libère les articles intrinsèques
    this.#status = 'CANCELLED';
  }
}
```

### 3) Contrat interface (duck-typing) — sécurité minimale
```js
export function requiresInterface(obj, methods) {
  const missing = methods.filter(m => typeof obj[m] !== 'function');
  if (missing.length) throw new Error('Manque: ' + missing.join(','));
}
```

---

## 🧭 Conseils de modélisation
- **Nommer** clairement (substantifs pour classes, verbes pour opérations).
- **Isoler les invariants** (ex. `total >= 0`) et les **règles**.
- **Limiter** les associations **bidirectionnelles** (couplage). Préférer **navigabilité unidirectionnelle**.
- Choisir **composition** vs **agrégation** selon le **cycle de vie** des parties.
- Interfaces pour **varier** les implémentations sans toucher aux **clients**.

---

## 🚫 Anti-patterns
- **God Object** : une classe qui fait tout.
- **Dépendances circulaires** : modules qui s’importent mutuellement.
- **Anemic Domain Model** : classes sans comportement (tout en services).
- **Fausse abstraction** : interface inutilement générale.

---

## ✍️ Atelier — du modèle au code

### Schéma ASCII (départ)
```
[Panier] --> [LignePanier]
[Panier] - - - - > [IPaiement]
[IPaiement] --|> [PaiementCarte]
[IPaiement] --|> [PaiementPaypal]
```

### Étapes
1. Implémenter `Panier` et `LignePanier` (agrégation).  
2. Créer `IPaiement` + `assertImplements`.  
3. Étendre avec `PaiementCarte` & `PaiementPaypal`.  
4. Injecter dans `CheckoutService` et payer.

---

## 🛠️ Exercices

### Exercice 1 — Multiplicités & invariants
Ajoute à `Panier` une opération `setQty(productId, qty)` qui **refuse** `qty <= 0` et **valide** que la multiplicité des lignes est **1..***.

### Exercice 2 — Interface & réalisation
Crée une interface `ILogging` (méthode `log(msg)`) et une classe `ConsoleLogger`. Modifie `CheckoutService` pour **dépendre** de `ILogging` et **logguer** les paiements.

### Exercice 3 — Composition
Crée `Commande` qui **compose** `ArticleCommande` (avec `prodId, qty, unitPrice`). Assure que l’appel `cancel()` vide les articles.

---

## ✅ Solutions (suggestions)

### Sol. 1 — setQty & multiplicité
```js
setQty(productId, qty) {
  if (qty <= 0) throw new Error('Quantité invalide');
  const i = this.#items.findIndex(li => li.productId === productId);
  if (i < 0) throw new Error('Produit introuvable');
  this.#items[i].qty = qty;
  if (!enforceMultiplicity(this.#items.length, 1, Infinity)) {
    throw new Error('Le panier doit contenir au moins une ligne');
  }
}
```

### Sol. 2 — ILogging + injection
```js
export const ILogging = { methods: ['log'] };
export class ConsoleLogger { log(msg) { console.log(msg); } }

// CheckoutService
constructor(panier, paiement, logger) {
  this.#panier = panier; this.#paiement = paiement; this.#logger = logger;
  assertImplements(paiement, IPaiement);
  assertImplements(logger, ILogging);
}

payer() {
  const total = this.#panier.total();
  const r = this.#paiement.payer(total);
  this.#logger.log(`Paiement ${r.ok ? 'OK' : 'KO'}: ${total}`);
  return r.ok ? { ok: true, transactionId: r.txId } : { ok: false };
}
```

### Sol. 3 — Composition Commande
```js
export class ArticleCommande { constructor(prodId, qty, unitPrice){ this.prodId=prodId; this.qty=qty; this.unitPrice=unitPrice; } }
export class Commande { #articles=[]; cancel(){ this.#articles=[]; } }
```

---

## 🧾 Checklist — Chapitre 3
- [ ] Je sais **lire/écrire** une classe UML (visibilités, stéréotypes).
- [ ] Je comprends **association/agrégation/composition** et **quand** les utiliser.
- [ ] Je sais modéliser **héritage** (généralisation) et **interfaces** (réalisation).
- [ ] Je maîtrise **multiplicités**, **rôles**, **navigabilité**.
- [ ] Je mappe vers **JavaScript** (ES6, #privé, modules, duck-typing).

---

## 🧠 Mini Quiz
1. Différence clé entre **agrégation** et **composition** ?
2. Que signifie `1..*` sur une extrémité d’association ?
3. Comment représenter une **interface** en JavaScript ?
4. Quel est le **risque** des associations bidirectionnelles ?

> Réponses attendues: 1) Cycle de vie lié en composition, indépendant en agrégation 2) Au moins une instance 3) Duck-typing + vérification des méthodes 4) Couplage fort et complexité accrue.

---

## 🗂️ Références internes
- Cf. Chapitre **2** (Use Cases) pour le **contexte métier**.
- Cf. Chapitre **4** pour détailler les **interactions** (séquence/activité).

---

## 📚 Résumé — Points clés du Chapitre 3
- Le **diagramme de classes** fixe la **structure** et les **contrats**.
- Les **relations** (association, agrégation, composition…) expriment le **couplage** et le **cycle de vie**.
- Les **multiplicités** donnent les **contraintes de cardinalité**.
- Le **mapping JS** utilise classes ES6, `#privé`, modules et **duck-typing** pour interfaces.
