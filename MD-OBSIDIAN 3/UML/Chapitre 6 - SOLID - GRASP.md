# 🧠 Chapitre 6 — Principes de Conception (SOLID & GRASP)

> **Objectif** : comprendre et appliquer les **principes** qui guident une conception **maintenable**, **extensible** et **testable**. Nous allons détailler **SOLID** et **GRASP**, avec **définitions précises**, **pourquoi**, **analogies**, **schémas ASCII** et **exemples 100% JavaScript**.

---

## 🎯 Objectifs d’apprentissage
- Connaître les **5 principes SOLID** et les **principes GRASP** pertinents.
- Comprendre **pourquoi** ces principes réduisent la dette technique.
- Savoir **détecter** des violations et **refactorer** en JS (modules, classes, fonctions).
- Mesurer **couplage/cohésion** avec **petites formules** en JavaScript.

---

## 🔑 SOLID — Définitions & motivations

### S — **Single Responsibility Principle (SRP)**
**Définition** : une classe/module doit avoir **une seule raison de changer** (une responsabilité **unique**).

**Pourquoi** : limiter les **effets de bord** lors des modifications; faciliter les tests et la réutilisabilité.

**Analogie** : un **outil dédié** (tournevis) plutôt qu’un **couteau suisse** pour tout faire.

**ASCII** :
```
Avant (God Object)
+---------------------------+
| OrderManager              |
| - calcTotal               |
| - applyPromo              |
| - saveToDB                |
| - sendEmail               |
+---------------------------+

Après (SRP)
+-----------+  +------------+  +--------------+  +--------------+
| Order     |  | PromoRule  |  | OrderRepo    |  | Notifier     |
+-----------+  +------------+  +--------------+  +--------------+
```

**JavaScript** :
```js
// Avant: une classe fait tout
class OrderManager {
  constructor(items) { this.items = items; }
  calcTotal() { return this.items.reduce((s,x)=>s+x.price*x.qty,0); }
  applyPromo(code) { /* ... */ }
  async saveToDB(order) { /* ... */ }
  async sendEmail(order) { /* ... */ }
}

// Après: responsabilités séparées
export class Order { constructor(items=[]) { this.items = items; } total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); } }
export class PromoRule { apply(total, code){ return code==='WELCOME10' ? +(total*0.9).toFixed(2) : total; } }
export class OrderRepo { async save(order){ /* persist */ return true; } }
export class Notifier { async email(order){ /* send */ return true; } }
```

---

### O — **Open/Closed Principle (OCP)**
**Définition** : les entités doivent être **ouvertes à l’extension**, **fermées à la modification**.

**Pourquoi** : éviter de **casser** le code existant lors de l’ajout de variantes; réduire les **régressions**.

**Analogie** : prises **modulaires** sur une multiprise : on **ajoute** sans **ouvrir** l’appareil.

**ASCII** :
```
+-------------------+
| PriceCalculator   |
+-------------------+
| + calc(items)     |
+-------------------+
      ^  ^
      |  |
  --|> BlackFridayStrategy
  --|> ClearanceStrategy
```

**JavaScript (Strategy)** :
```js
export class PriceCalculator {
  constructor(strategy) { this.strategy = strategy; }
  calc(items) { return this.strategy.calc(items); }
}

export class BlackFridayStrategy { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0)*0.7; } }
export class ClearanceStrategy   { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0)*0.5; } }
```

---

### L — **Liskov Substitution Principle (LSP)**
**Définition** : les **sous-types** doivent pouvoir **se substituer** à leur **super-type** **sans altérer** la **validité** du programme.

**Pourquoi** : préserver les **contrats** (pré/post-conditions, invariants) et éviter les surprises.

**Analogie** : une **prise** qui accepte **tout type** de chargeurs compatibles.

**ASCII** :
```
<<interface>> Payment
      ^                 ^
      |                 |
  --|> CardPayment   --|> PaypalPayment

Client code utilise Payment, indifférent à la sous-classe.
```

**JavaScript** :
```js
export const IPayment = { methods:['pay'] };
export function assertImplements(obj, iface){ const ok=iface.methods.every(m=>typeof obj[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }

export class CardPayment { pay(amount){ return { ok: amount<=100, tx:'card_'+Date.now() }; } }
export class PaypalPayment{ pay(amount){ return { ok: amount<=200, tx:'pp_'+Date.now() }; } }

export function checkout(amount, payment){ assertImplements(payment, IPayment); const r = payment.pay(amount); return r.ok; }

// LSP: CardPayment et PaypalPayment se substituent sans briser checkout()
```

> **⚠️ Piège LSP** : un sous-type **renforce** une précondition (exige `amount<50`) → **viol** LSP.

---

### I — **Interface Segregation Principle (ISP)**
**Définition** : préférer **plusieurs interfaces spécifiques** plutôt qu’une **grosse interface** générale.

**Pourquoi** : éviter de forcer des **implémentations inutiles**; réduire le **couplage**.

**ASCII** :
```
Grosse interface (à éviter)
<<interface>> IStore { save, load, backup, exportCsv }

Segmentation
<<interface>> ISaveLoad { save, load }
<<interface>> IBackup   { backup }
<<interface>> IExport   { exportCsv }
```

**JavaScript** :
```js
export const ISaveLoad = { methods:['save','load'] };
export const IBackup   = { methods:['backup'] };
export const IExport   = { methods:['exportCsv'] };

export class LocalStore { save(){/*...*/} load(){/*...*/} }
export class BackupService { backup(){/*...*/} }
export class CsvExporter { exportCsv(){/*...*/} }
```

---

### D — **Dependency Inversion Principle (DIP)**
**Définition** : les modules de **haut niveau** ne doivent pas dépendre des modules de **bas niveau**; tous deux dépendent d’**abstractions**.

**Pourquoi** : **découpler** pour **tester/échanger** facilement les implémentations.

**ASCII** :
```
Haut niveau -> abstractions <- Bas niveau
[CheckoutService] --> IPayment <-- [HttpPaymentAdapter]
```

**JavaScript** :
```js
export const IPayment = { methods:['pay'] };
export function assertImplements(obj, iface){ const ok=iface.methods.every(m=>typeof obj[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }

export class CheckoutService {
  constructor(payment){ assertImplements(payment, IPayment); this.payment = payment; }
  async checkout(total){ return this.payment.pay(total); }
}

// Bas niveau
export class HttpPaymentAdapter { async pay(total){ /* fetch POST */ return { ok: total<=100, tx:'tx_'+Date.now() }; } }
```

---

## 🧠 GRASP — Principes & pratiques

### Information Expert
**Définition** : attribuer une responsabilité à la **classe qui possède les informations** nécessaires.

**Pourquoi** : réduit le **couplage** et augmente la **cohésion**.

**Exemple** : `Panier.total()` dans **Panier**, pas dans **UI**.

### Creator
**Définition** : une classe **A** devrait **créer** des instances de **B** si **A** agrège/compose **B** ou a les **données** nécessaires.

**Exemple** : `Panier.add()` crée `LignePanier`.

### Controller
**Définition** : introduire un **contrôleur** pour **recevoir** les requêtes système et **déléguer** aux objets du domaine.

**Exemple** : `CheckoutController` orchestre **paiement**/**notification**.

### Low Coupling & High Cohesion
- **Low Coupling** : réduire les **dépendances** entre classes.
- **High Cohesion** : regrouper des **responsabilités liées**.

**ASCII** :
```
Low Coupling
[UI] - - - - > [Controller] --> [Domain]

High Cohesion
[Cart] { total, add, remove }  (cohérent autour du panier)
```

### Polymorphism
**Définition** : **remplacer** des **tests conditionnels** par des **variantes** polymorphes.

**Exemple** : stratégies de prix (cf. OCP) plutôt que `if (type==='BF') ...`.

### Pure Fabrication
**Définition** : créer une classe **service** pour regrouper une responsabilité **transverse** qui ne correspond à aucune entité du domaine.

**Exemple** : `Repository`, `Notifier`, `Logger`.

### Indirection
**Définition** : introduire un **intermédiaire** pour séparer composants (ex. **Adapter**, **Mediator**).

### Protected Variations
**Définition** : **isoler** les points **susceptibles de varier** derrière des **interfaces**.

**Exemple** : `IPayment` protège du changement d’API.

---

## 💻 GRASP en JavaScript — Extraits fil rouge
```js
// Information Expert & Creator
export class Panier {
  #items = [];
  add(produit, qty=1){
    const i = this.#items.findIndex(x=>x.id===produit.id);
    if(i>=0) this.#items[i].qty += qty; else this.#items.push({ id: produit.id, price: produit.price, qty });
  }
  total(){ return this.#items.reduce((s,x)=>s+x.price*x.qty,0); }
}

// Controller
export class CheckoutController {
  constructor(cart, payment, notifier){ this.cart=cart; this.payment=payment; this.notifier=notifier; }
  async run(){ const total=this.cart.total(); const r=await this.payment.pay(total); if(r.ok){ await this.notifier.email({ total, tx:r.tx }); return { ok:true }; } return { ok:false }; }
}

// Protected Variations via interface
export const IPayment = { methods:['pay'] };
export function assertImplements(o, iface){ const ok=iface.methods.every(m=>typeof o[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }
```

---

## 🧮 Mesures simples en JavaScript (illustratives)

### 1) **Couplage** (imports/références externes) — estimation
```js
function estimateCoupling(jsSource){
  const imports = (jsSource.match(/\bimport\b|require\(/g)||[]).length;
  const httpCalls = (jsSource.match(/fetch\(|axios\(/g)||[]).length;
  return { imports, httpCalls, couplingScore: imports + httpCalls };
}
```

### 2) **Cohésion** (LCOM approximé) — méthodes qui partagent des champs
```js
function approxLCOM(methodFields){
  // methodFields: { methodName: Set(fields) }
  const methods = Object.keys(methodFields);
  let shared = 0, totalPairs = 0;
  for(let i=0;i<methods.length;i++){
    for(let j=i+1;j<methods.length;j++){
      totalPairs++;
      const a = methodFields[methods[i]], b = methodFields[methods[j]];
      const inter = [...a].filter(x=>b.has(x)).length;
      if(inter>0) shared++;
    }
  }
  const lcom = totalPairs - shared; // plus grand => moins cohésif
  return { totalPairs, sharedPairs: shared, LCOM: lcom };
}

// Exemple Panier: méthodes utilisent 'items'
console.log(approxLCOM({ total: new Set(['items']), add: new Set(['items']), remove: new Set(['items']) }));
```

### 3) **Violation SRP** détectable naïvement (trop de domaines)
```js
function detectSRPViolation(names){
  // names: noms de méthodes → heuristique par mots-clés
  const buckets = { calc:0, save:0, send:0, render:0 };
  names.forEach(n=>{
    if(/calc|compute/i.test(n)) buckets.calc++;
    if(/save|persist/i.test(n)) buckets.save++;
    if(/send|email|notify/i.test(n)) buckets.send++;
    if(/render|ui|view/i.test(n)) buckets.render++;
  });
  const nonZero = Object.values(buckets).filter(x=>x>0).length;
  return { buckets, suspectedViolation: nonZero >= 2 }; // plusieurs domaines → soupçon
}
```

---

## 🧭 Méthodologie de refactoring guidé par principes
1. **Identifier** la responsabilité principale (SRP).
2. **Séparer** variantes via **polymorphisme** (OCP/Polymorphism).
3. **Vérifier** **substituabilité** (LSP) avec assertions/contrats.
4. **Segmenter** les **interfaces** (ISP) et **injecter** des **abstractions** (DIP).
5. **Appliquer GRASP** : Information Expert, Creator, Controller, Low Coupling, High Cohesion…
6. **Mesurer** rapidement (couplage, LCOM) et **itérer**.

---

## 🚫 Anti-patterns & smells (liés aux principes)
- **God Object** (violation SRP, Low Cohesion).
- **Shotgun Surgery** (pas de SRP → modifications partout).
- **Interface Grosse** (violation ISP).
- **Dépendances Fortes** (violation DIP, Low Coupling).
- **Switch Enchaînés** (violation OCP → préférer polymorphisme).

---

## ✍️ Atelier — Appliquer SOLID/GRASP au fil rouge

### Départ — Code à améliorer
```js
class Checkout {
  constructor(items){ this.items=items; }
  async run(code){
    // calc
    let total = this.items.reduce((s,x)=>s+x.price*x.qty,0);
    if(code==='WELCOME10') total = +(total*0.9).toFixed(2);
    // paiement HTTP
    const ok = total<=100; // simplifié
    // notification
    if(ok) console.log('Email envoyé');
    return ok;
  }
}
```

### Cible — SRP + OCP + DIP + Controller
```js
class Order { constructor(items=[]){ this.items=items; } total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); } }
class PromoRule { apply(total, code){ return code==='WELCOME10' ? +(total*0.9).toFixed(2) : total; } }
const IPayment = { methods:['pay'] };
function assertImplements(o, iface){ const ok=iface.methods.every(m=>typeof o[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }
class PaymentAdapter { async pay(total){ return { ok: total<=100, tx:'tx_'+Date.now() }; } }
class Notifier { async email(order){ console.log('Email envoyé'); return true; } }

class CheckoutController {
  constructor(order, promo, payment, notifier){ assertImplements(payment, IPayment); this.order=order; this.promo=promo; this.payment=payment; this.notifier=notifier; }
  async run(code){ let total=this.order.total(); total=this.promo.apply(total, code); const r=await this.payment.pay(total); if(r.ok) await this.notifier.email({ total, tx:r.tx }); return r.ok; }
}
```

---

## 🛠️ Exercices

### Exercice 1 — LSP
Créer un nouveau `GiftCardPayment` qui **respecte** `IPayment`. Écrire un test (avec `assert`) qui prouve la **substitution** dans `CheckoutController`.

### Exercice 2 — ISP
Diviser une grosse interface `IUserService { create, delete, list, exportCsv, sendEmail }` en **interfaces spécifiques** (création/suppression, listing, export, notification).

### Exercice 3 — DIP & Protected Variations
Créer `IStorage { save(obj), load(id) }` et une implémentation **MemoryStorage** + **HttpStorage**. Injecter dans un service de domaine `OrderRepo`.

---

## ✅ Solutions (suggestions)

### Sol. 1 — LSP
```js
export class GiftCardPayment { pay(amount){ return { ok: amount<=50, tx: 'gc_'+Date.now() }; } }
import { assert } from './helpers/assert.js';

const controller = new CheckoutController(new Order([{price:20,qty:1}]), new PromoRule(), new GiftCardPayment(), new Notifier());
assert(await controller.run(null) === true, 'GiftCard substituable et valide');
```

### Sol. 2 — ISP
```js
export const IUserAdmin = { methods:['create','delete'] };
export const IUserQuery = { methods:['list'] };
export const IUserExport = { methods:['exportCsv'] };
export const IUserNotify = { methods:['sendEmail'] };
```

### Sol. 3 — DIP
```js
export const IStorage = { methods:['save','load'] };
export class MemoryStorage { constructor(){ this.db=new Map(); } save(obj){ const id='id_'+Date.now(); this.db.set(id, obj); return id; } load(id){ return this.db.get(id); } }
export class HttpStorage { async save(obj){ /* POST */ return 'id_http'; } async load(id){ /* GET */ return { id }; } }
export class OrderRepo { constructor(storage){ assertImplements(storage, IStorage); this.storage=storage; } save(order){ return this.storage.save(order); } load(id){ return this.storage.load(id); } }
```

---

## 🧾 Checklist — Chapitre 6
- [ ] Je sais définir les **5 SOLID** et les **principes GRASP**.
- [ ] Je sais **pourquoi** ils réduisent le **couplage** et augmentent la **cohésion**.
- [ ] J’ai vu des **exemples JS** pour chaque principe (SRP, OCP, LSP, ISP, DIP).
- [ ] Je sais mesurer **grossièrement** couplage/cohésion (formules JS).
- [ ] Je peux **refactorer** un module en respectant SOLID & GRASP.

---

## 🧠 Mini Quiz
1. Que signifie **« une seule raison de changer »** (SRP) ?
2. Comment **étendre** sans **modifier** (OCP) en JS ?
3. Donne un exemple de **violation LSP**.
4. Pourquoi **segmenter** les interfaces (ISP) ?
5. Comment appliquer **DIP** avec des **ports** en JS ?

> Réponses attendues : 1) Une responsabilité unique par classe/module 2) Polymorphisme (Strategy, etc.) 3) Renforcer une précondition dans un sous-type 4) Éviter couplage/implémentations inutiles 5) Contrats via objets `{ methods:[...] }` + injection d’implémentations.

---

## 🗂️ Références internes
- Cf. **Chapitre 3** (Classes) pour structurer les entités/services.
- Cf. **Chapitres 7–9** (Patterns) : patterns qui **matérialisent** ces principes.
- Cf. **Chapitre 11** (Tests) pour vérifier substituabilité et régressions.

---

## 📚 Résumé — Points clés du Chapitre 6
- **SOLID** : SRP (responsabilité unique), OCP (extension sans modification), LSP (substitution sûre), ISP (interfaces spécifiques), DIP (dépendre d’abstractions).
- **GRASP** : Information Expert, Creator, Controller, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations.
- **JavaScript** : classes ES6, **duck-typing** pour interfaces, **injection** pour DIP, **polymorphisme** (Strategy) pour OCP.
- **Mesures JS** : couplage et cohésion (approx) pour guider le refactoring.
