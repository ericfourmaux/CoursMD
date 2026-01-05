# 📄 Chapitre 2 — Use Case (Cas d’utilisation)

> **Objectif** : apprendre à identifier les **acteurs**, définir la **frontière du système**, rédiger des **scénarios** (principal & alternatifs), et utiliser les **relations** `include`, `extend`, `generalization`. Tout est illustré avec **schémas ASCII** et **JavaScript**.

---

## 🎯 Objectifs d’apprentissage
- Définir **acteur**, **cas d’utilisation**, **système** et **relations** (`include`, `extend`, `generalization`).
- Savoir **pourquoi** commencer par les **Use Cases** et **comment** les écrire.
- Produire des **schémas ASCII** lisibles et **scénarios textuels** (Given/When/Then).
- Relier les Use Cases à du **code JavaScript** (fonctions métier, composition).
- Éviter les **anti-patterns** (sur-détail UI, mélange technique/métier).

---

## 🔑 Définitions précises

- **Acteur** : entité **externe** (humain, système, service) qui **interagit** avec le système.
- **Cas d’utilisation (Use Case)** : **scénario** décrivant une **interaction** qui produit une **valeur** pour un acteur.
- **Frontière du système** : **périmètre** (ce qui appartient au système vs ce qui est externe).
- **Relations** :
  - `include` : un Use Case **inclut** un autre, **obligatoire** (factorisation de logique **commune**).
  - `extend` : un Use Case **peut être étendu** par un autre, **optionnel** (variante **contextuelle**).
  - `generalization` : **spécialisation** d’un acteur ou d’un Use Case (héritage de comportement).

### 💡 Pourquoi commencer par les use cases ?
- Ils **capturent la valeur** côté **utilisateur** sans imposer d’implémentation.
- Ils **alignent** parties prenantes (métier, dev, test) sur le **quoi** avant le **comment**.
- Ils servent de **base** aux **tests** (scénarios = cas de test) et aux diagrammes **séquence/activité**.

---

## 🧩 Notation ASCII — Système, acteurs, cas

> Les ovals UML sont représentés par `[UC: Nom]` et les acteurs par `[Acteur]`. La frontière du système est un **cadre**.

```
+-----------------------------------------------+
|           [ Système Boutique (Front) ]        |
|                                               |
|   [UC: Parcourir Catalogue]                   |
|   [UC: Ajouter au panier] --include--> [UC: Recalculer total]
|   [UC: Valider panier] --extend--> [UC: Appliquer code promo] (optionnel)
|   [UC: Payer]                                 |
|                                               |
+-----------------------------------------------+
    ^                      ^                 ^
    |                      |                 |
 [Client]            [Service Paiement]  [Service Promo]
```

**Conventions** :
- `--include-->` = inclusion **obligatoire** (réutilisation).
- `--extend-->` = extension **optionnelle**, déclenchée par une **condition**.
- Les acteurs **hors** du cadre.

---

## 🧭 Granularité & règles de nommage
- **Verbe d’action** + **complément** : « *Ajouter au panier* », « *Payer* ».
- **Focus valeur** : éviter les détails UI (« *Cliquer sur le bouton bleu* »). Préférer « *Sélectionner un produit* ».
- **Granularité** stable : un Use Case doit être **testable** et **rejouable**.

---

## ✍️ Modèle textuel (Given/When/Then)
> Structure simple pour décrire le scénario principal et les variantes.

```
Titre: Ajouter au panier
Acteur principal: Client
Préconditions (Given):
  - Le client voit un produit dans le catalogue
Déclencheur (When):
  - Le client demande l'ajout du produit au panier
Postconditions (Then):
  - Le panier contient le produit avec la quantité mise à jour
  - Le total est recalculé
Variantes/Exceptions:
  - Produit indisponible -> message d'erreur
  - Quantité > stock -> quantité limitée
```

---

## 🔗 Relations `include`, `extend`, `generalization` — ASCII

### `include` (obligatoire, réutilisation)
```
[UC: Ajouter au panier] --include--> [UC: Recalculer total]
```

### `extend` (optionnel, conditionnel)
```
[UC: Valider panier] --extend--> [UC: Appliquer code promo]
(condition: le client saisit un code promo valide)
```

### `generalization` (spécialisation)
```
[Acteur: Client] --|> [Acteur: Client Premium]
[UC: Payer] --|> [UC: Payer avec points fidélité]
```

---

## 🧪 Formules & estimations en JavaScript

### 1) Estimer le **nombre de chemins** d’un Use Case
Si un scénario principal contient `S` **étapes** et que chaque étape a en moyenne `A` **alternatives** (y compris « zéro alternative »), une **approximation grossière** du nombre de chemins est:

```js
/**
 * Approximation: chemins ~= S * (1 + A)
 * - S: nombre d'étapes du scénario principal
 * - A: alternatifs moyens par étape (0 => pas d'alternative)
 * NB: approximation pour sensibiliser aux variations; pas un calcul exhaustif.
 */
function estimatePaths(S, A) {
  if (S < 0 || A < 0) throw new Error('S et A >= 0');
  return S * (1 + A);
}

console.log(estimatePaths(5, 0)); // 5
console.log(estimatePaths(5, 1)); // 10
console.log(estimatePaths(6, 2)); // 18
```

### 2) **Couverture minimale** de tests par alternatifs
Avec `A_total` **alternatifs distincts** identifiés, viser au moins **`minTests = 1 + A_total`** (1 parcours principal + 1 par alternatif).
```js
function minTestCount(alternativesCount) {
  if (!Number.isInteger(alternativesCount) || alternativesCount < 0) {
    throw new Error('alternativesCount doit être un entier >= 0');
  }
  return 1 + alternativesCount; // 1 main flow + each alternative
}

console.log(minTestCount(0)); // 1
console.log(minTestCount(3)); // 4
```

---

## 🔧 Du Use Case au JavaScript

### Principes de mapping
- **Chaque Use Case** devient une **fonction** (ou module) qui **orchestrer** des **services**.
- `include` ⇒ **composition fonctionnelle** (appel systématique du cas inclus).
- `extend` ⇒ **branche conditionnelle** (appel si condition satisfaite).

### Implémentation — Fil rouge e-commerce
```js
// services/cart.js
export class CartService {
  constructor() { this.items = []; }
  add(product, qty = 1) {
    const i = this.items.findIndex(x => x.id === product.id);
    if (i >= 0) this.items[i].qty += qty; else this.items.push({ ...product, qty });
  }
  total() { return this.items.reduce((s, x) => s + x.price * x.qty, 0); }
}

// services/promo.js
export function applyPromo(total, code) {
  if (!code) return total; // aucun code = pas d'extension
  // simple règle illustrative
  if (code === 'WELCOME10') return +(total * 0.9).toFixed(2); // -10%
  return total;
}

// usecases/addToCart.js
export function UC_AddToCart(cartService, product, qty = 1) {
  // include: recalculer total (obligatoire)
  cartService.add(product, qty);
  const total = cartService.total();
  return { ok: true, total };
}

// usecases/checkout.js
export function UC_Checkout(cartService, opts = { promoCode: null }) {
  const baseTotal = cartService.total();
  // extend: appliquer code promo (optionnel)
  const finalTotal = applyPromo(baseTotal, opts.promoCode);
  return { ok: true, total: finalTotal };
}
```

### Scénarios (Given/When/Then) → Asserts JS
```js
// helpers/assert.js
export function assert(cond, msg = 'Assertion failed') {
  if (!cond) throw new Error(msg);
}

// tests rudimentaires (sans Jest, pour le chapitre 2)
import { CartService } from './services/cart.js';
import { UC_AddToCart, UC_Checkout } from './usecases/addToCart.js';

const cart = new CartService();
const p = { id: 'p1', name: 'Tee-shirt', price: 20 };

// Given: catalogue affiche p1; When: ajouter; Then: total = 20
let r = UC_AddToCart(cart, p, 1);
assert(r.total === 20, 'Total après ajout doit être 20');

// Given: panier avec p1; When: checkout sans code; Then: total = 20
r = UC_Checkout(cart, { promoCode: null });
assert(r.total === 20, 'Checkout sans code promo doit rester 20');

// When: checkout avec code; Then: total réduit
r = UC_Checkout(cart, { promoCode: 'WELCOME10' });
assert(r.total === 18, 'Code WELCOME10 doit appliquer -10%');
```

---

## 🧭 Pas-à-pas — Comment modéliser un Use Case
1. **Nommer** l’objectif en langage **métier** (verbe + complément).
2. **Identifier** l’**acteur principal** et les **acteurs secondaires** (services, systèmes).
3. **Tracer** le **scénario principal** (sans UI détaillée).
4. **Lister** les **alternatifs** / **exceptions** pertinentes.
5. **Relier** aux autres Use Cases via `include`/`extend` si utile.
6. **Valider** la **valeur** et la **testabilité** (Given/When/Then).

---

## 🚫 Anti-patterns à éviter
- **Détails d’interface** dans le Use Case (« cliquer », « couleur du bouton »).
- **Mélange technique** (HTTP, DB) au lieu de l’**intention métier**.
- **Sur-factorisation** avec `include`/`extend` qui **fragmente** trop.
- **Use Cases géants** non testables (privilégier granularité raisonnable).

---

## 🛠️ Exercices

### Exercice 1 — Rédaction de Use Case
Rédige le Use Case **« Valider panier »** avec **préconditions**, **déclencheur**, **postconditions** et **variantes** (ex. panier vide, article indisponible).

### Exercice 2 — Schéma ASCII
Dessine un schéma avec la **frontière du système**, les acteurs **Client**, **Service Paiement**, et les Use Cases **« Payer »**, **« Appliquer code promo »** (`extend`), **« Recalculer total »** (`include`).

### Exercice 3 — JavaScript
Implémente `UC_Payer(cartService, paymentGateway)` qui **retourne** `{ ok: boolean, transactionId?: string }`. Ajoute une **variante** (refus de paiement) et un **test rudimentaire** avec `assert`.

---

## ✅ Solutions (suggestions)

### Solution 1 — Use Case (texte)
```
Titre: Valider panier
Acteur principal: Client
Préconditions:
  - Le panier contient au moins un article
Déclencheur:
  - Le client demande la validation du panier
Postconditions:
  - Le panier est marqué "validé" (prêt pour paiement)
Variantes/Exceptions:
  - Panier vide -> message d'erreur
  - Article en rupture -> notification et proposition de suppression
```

### Solution 2 — ASCII relations
```
+-------------------------------------------+
|        [ Système Boutique (Front) ]       |
|                                           |
| [UC: Payer] --include--> [UC: Recalculer total]
| [UC: Payer] --extend--> [UC: Appliquer code promo]
|                                           |
+-------------------------------------------+
    ^                 ^                 ^
    |                 |                 |
 [Client]     [Service Paiement]   [Service Promo]
```

### Solution 3 — JS paiement
```js
// services/payment.js
export class PaymentGateway {
  pay(amount) {
    // simulation naive: refus si amount > 100
    if (amount > 100) return { ok: false, reason: 'Limit exceeded' };
    const id = 'tx_' + Math.random().toString(36).slice(2, 8);
    return { ok: true, transactionId: id };
  }
}

// usecases/pay.js
import { applyPromo } from './services/promo.js';
export function UC_Payer(cartService, paymentGateway, opts = { promoCode: null }) {
  const base = cartService.total();
  const total = applyPromo(base, opts.promoCode);
  const result = paymentGateway.pay(total);
  return result.ok ? { ok: true, transactionId: result.transactionId }
                   : { ok: false };
}

// tests rudimentaires
import { CartService } from './services/cart.js';
import { PaymentGateway } from './services/payment.js';
import { assert } from './helpers/assert.js';

const cart = new CartService();
cart.add({ id: 'p1', name: 'Sac', price: 60 }, 1);
const gateway = new PaymentGateway();
let r = UC_Payer(cart, gateway, { promoCode: 'WELCOME10' });
assert(r.ok === true && r.transactionId, 'Paiement devrait réussir avec -10%');

cart.add({ id: 'p2', name: 'Chaussures', price: 50 }, 1);
r = UC_Payer(cart, gateway, { promoCode: null });
assert(r.ok === false, 'Paiement devrait échouer (>100)');
```

---

## 🧾 Checklist — Chapitre 2
- [ ] Je sais **définir** acteur, Use Case, frontière, `include`, `extend`, `generalization`.
- [ ] Je peux écrire un **scénario Given/When/Then**.
- [ ] Je sais dessiner un **schéma ASCII** avec acteurs et cas.
- [ ] Je mappe un Use Case vers **fonctions JS** (composition pour `include`, condition pour `extend`).
- [ ] J’évite les **anti-patterns** (détails UI/techniques).

---

## 🧠 Mini Quiz
1. À quoi sert `include` ?
2. Quand utiliser `extend` ?
3. Donne un exemple de **précondition** pour « Payer ».
4. Pourquoi éviter les **détails UI** dans un Use Case ?

> Réponses attendues: 1) Factoriser logique commune obligatoire 2) Variante optionnelle, conditionnelle 3) Panier validé et non vide 4) Garder la valeur métier, stabilité et testabilité.

---

## 🗂️ Références internes
- Voir Chapitre **3** pour la **structure** (classes) liée aux Use Cases.
- Voir Chapitre **4** pour les **interactions temporelles** (séquence) des scénarios.

---

## 📚 Résumé — Points clés du Chapitre 2
- Les **Use Cases** capturent la **valeur métier** sans imposer la technique.
- `include` = **réutilisation obligatoire**, `extend` = **variante conditionnelle**, `generalization` = **spécialisation**.
- Schémas **ASCII** + scénarios **Given/When/Then** assurent la **clarté**.
- Mapping **JavaScript** : **fonctions orchestratrices** + **composition**.
