# 🤝 Chapitre 9 — Patterns Comportementaux (GoF)

> **Objectif** : maîtriser les **patterns comportementaux** qui structurent la **communication**, la **décision**, la **notification**, la **navigation** et la **reversibilité** du comportement d’un système. Nous couvrons **Observer**, **Strategy**, **State**, **Command**, **Template Method**, **Chain of Responsibility**, **Mediator**, **Memento**, **Iterator**, **Visitor** avec **intent**, **pourquoi**, **schémas ASCII**, **implémentations 100% JavaScript**, **pièges**, **exercices**, **solutions**, **quiz**, **checklist** et **formules JS**.

---

## 🎯 Objectifs d’apprentissage
- Comprendre l’**intent** précis de chaque pattern comportemental et **quand** l’appliquer.
- Savoir **modéliser en ASCII** et **implémenter en JavaScript** (ES modules/classes, fonctions).
- Éviter les **anti-patterns** (ordre d’événements, couplage implicite, sur-utilisation de if/switch).
- Relier les patterns au **fil rouge e-commerce** (catalogue, panier, paiement, notifications).

---

## 🧭 Carte mentale ASCII — Famille Comportementale
```
Comportementaux
  ├─ Observer        (notification des abonnés)
  ├─ Strategy        (algorithmes interchangeables)
  ├─ State           (comportement dépendant de l'état)
  ├─ Command         (encapsuler action + undo/redo)
  ├─ TemplateMethod  (algorithme avec étapes/hook)
  ├─ ChainOfResp.    (chaîne de validateurs/handlers)
  ├─ Mediator        (orchestration centralisée)
  ├─ Memento         (snapshot & restore)
  ├─ Iterator        (parcourir uniformément une collection)
  └─ Visitor         (opérations séparées sur structure)
```

---

# 9.1 — 👀 Observer

**Intent** : définir une **dépendance un-à-plusieurs** où, quand un sujet **change**, tous les **observateurs** sont **notifiés**.

**Pourquoi** : **synchro** d’UI, **réactions** à des événements, **découplage** entre émetteur et auditeurs.

**ASCII — Structure** :
```
[Subject Cart] --notify--> [Observer UI]
                 --notify--> [Observer Analytics]
```

**JavaScript — Implémentation minimale**
```js
export function createEmitter(){
  const handlers = {};
  return {
    on(evt, fn){ (handlers[evt] ||= []).push(fn); },
    off(evt, fn){ handlers[evt] = (handlers[evt]||[]).filter(h => h!==fn); },
    emit(evt, data){ (handlers[evt]||[]).forEach(fn => fn(data)); }
  };
}

// usage fil rouge
const bus = createEmitter();
bus.on('cart:updated', (cart) => console.log('UI update total=', cart.total()));
bus.on('cart:updated', (cart) => console.log('Analytics event cartSize=', cart.items.length));
```

**Pièges** :
- **Fuites de mémoire** (ne jamais `off()`), **ordre** des callbacks non garanti.
- Observateurs qui **mutent** le sujet ⇒ **boucles**.

**Formule JS — fan-out**
```js
function fanOutCost(observersCount, avgHandlerMs){ return observersCount * avgHandlerMs; }
```

---

# 9.2 — 🧠 Strategy

**Intent** : définir une **famille d’algorithmes**, les **encapsuler**, et les rendre **interchangeables**.

**Pourquoi** : **OCP** : changer l’algorithme **sans** modifier le **client**; tester/benchmark **facile**.

**ASCII — Structure** :
```
[PriceCalculator] --> uses --> [Strategy]
                               |-- BlackFriday
                               |-- Clearance
```

**JavaScript — Implémentation**
```js
export class PriceCalculator { constructor(strategy){ this.strategy = strategy; } calc(items){ return this.strategy.calc(items); } }
export class BlackFridayStrategy { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.7; } }
export class ClearanceStrategy   { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.5; } }
```

**Pièges** :
- Éparpiller la **logique** en trop de stratégies **triviales**.
- Oublier de documenter **préconditions** de chaque stratégie.

**Formule JS — benchmark simple**
```js
export async function benchStrategy(strategy, items, runs=100){
  const calc = new PriceCalculator(strategy);
  const t0 = performance.now();
  for(let i=0;i<runs;i++) calc.calc(items);
  const t1 = performance.now();
  return +(t1 - t0).toFixed(2);
}
```

---

# 9.3 — 🔄 State (Pattern)

**Intent** : permettre à un objet de **modifier** son **comportement** quand son **état interne** change.

**Pourquoi** : éviter les **if/switch** partout; regrouper comportement par **états**.

**ASCII — Structure (UI Button)** :
```
[Button]
  ├─ [DisabledState]
  └─ [EnabledState]
```

**JavaScript — Implémentation**
```js
export class Button {
  constructor(){ this.state = new DisabledState(this); }
  setState(s){ this.state = s; }
  click(){ return this.state.click(); }
}
export class DisabledState { constructor(ctx){ this.ctx = ctx; } click(){ return '[no-op]'; } }
export class EnabledState  { constructor(ctx){ this.ctx = ctx; } click(){ /* action réelle */ return '[clicked]'; } }

// usage
const btn = new Button();
btn.setState(new EnabledState(btn));
console.log(btn.click()); // '[clicked]'
```

**Pièges** :
- Trop d’états **minimes** → complexité.
- États qui **connaissent** trop le **contexte**.

---

# 9.4 — ⌨️ Command

**Intent** : encapsuler une **requête** (action) en objet avec `execute()` et **optionnellement** `undo()`.

**Pourquoi** : **historique**, **undo/redo**, **queue** d’actions, **macro**-commandes.

**ASCII — Structure (Panier)** :
```
[Invoker] -> [Command AddItem] -> [Receiver Cart]
             [Command RemoveItem] -> [Cart]
[History Stack] <-- push/pop --> [Invoker]
```

**JavaScript — Implémentation (undo/redo)**
```js
export class AddItemCommand {
  constructor(cart, product){ this.cart=cart; this.product=product; }
  execute(){ this.cart.add(this.product, 1); }
  undo(){ this.cart.remove(this.product.id); }
}
export class RemoveItemCommand {
  constructor(cart, productId){ this.cart=cart; this.productId=productId; }
  execute(){ this.cart.remove(this.productId); }
  undo(){ /* impossible si quantité perdue, ex demo */ }
}

export class Invoker {
  constructor(){ this.history=[]; this.redoStack=[]; }
  run(cmd){ cmd.execute(); this.history.push(cmd); this.redoStack=[]; }
  undo(){ const c=this.history.pop(); if(c && c.undo) c.undo(); }
  redo(){ const c=this.redoStack.pop(); if(c) c.execute(); }
}
```

**Pièges** :
- **Undo** non symétrique ⇒ **incohérences**.
- Commandes qui **connaissent trop** le receiver.

**Formule JS — profondeur historique max**
```js
function maxHistoryMemory(cmdSizeBytes, depth){ return cmdSizeBytes * depth; }
```

---

# 9.5 — 🧩 Template Method

**Intent** : définir le **squelette** d’un **algorithme** dans une **superclasse**, en laissant des **étapes** (hooks) aux sous-classes.

**Pourquoi** : réutiliser un **processus** commun avec des **variations contrôlées**.

**ASCII — Structure (Paiement)** :
```
[PaymentProcess]
  run()
   ├─ validate()
   ├─ computeTotal()
   ├─ pay()
   └─ notify()
```

**JavaScript — Implémentation**
```js
export class PaymentProcess {
  run(){ this.validate(); const total=this.computeTotal(); const ok=this.pay(total); if(ok) this.notify(total); return ok; }
  validate(){ throw new Error('override'); }
  computeTotal(){ throw new Error('override'); }
  pay(){ throw new Error('override'); }
  notify(){ /* optional */ }
}

export class CardPaymentProcess extends PaymentProcess {
  constructor(cart, notifier){ super(); this.cart=cart; this.notifier=notifier; }
  validate(){ if(this.cart.total()<=0) throw new Error('empty'); }
  computeTotal(){ return this.cart.total(); }
  pay(total){ return total<=100; }
  notify(total){ this.notifier(`Paid ${total}`); }
}
```

**Pièges** :
- Hooks **non documentés** ⇒ implémentations fragiles.
- Sous-classes qui **contournent** le squelette.

---

# 9.6 — ⛓️ Chain of Responsibility

**Intent** : permettre à **plusieurs handlers** de **tenter** de traiter une requête, en **chaîne**, jusqu’à ce que l’un **réussisse**.

**Pourquoi** : éviter **switch** monolithique; **composer** validations.

**ASCII — Structure (Validation commande)** :
```
[QtyHandler] -> [StockHandler] -> [AddressHandler] -> [PaymentLimitHandler]
```

**JavaScript — Implémentation**
```js
export class Handler {
  setNext(next){ this.next = next; return next; }
  handle(req){ if(this.next) return this.next.handle(req); return { ok:true }; }
}
export class QtyHandler extends Handler { handle(req){ if(req.totalQty<=0) return { ok:false, reason:'QTY' }; return super.handle(req); } }
export class AddressHandler extends Handler { handle(req){ if(!req.address || !req.address.city) return { ok:false, reason:'ADDR' }; return super.handle(req); } }
export class PaymentLimitHandler extends Handler { handle(req){ if(req.total>200) return { ok:false, reason:'LIMIT' }; return super.handle(req); } }

// chain
const h = new QtyHandler(); h.setNext(new AddressHandler()).setNext(new PaymentLimitHandler());
const r = h.handle({ totalQty:2, address:{ city:'MTL' }, total:150 }); // { ok:true }
```

**Pièges** :
- Ordre des handlers **critique**.
- Handler qui **ne délègue** jamais.

**Formule JS — probabilité de succès**
```js
function chainSuccess(probs){ // probs: [p1, p2, ...] prob de passer chaque handler
  return probs.reduce((p, x) => p * x, 1);
}
```

---

# 9.7 — 🛸 Mediator

**Intent** : **centraliser** la **communication** entre objets pour éviter **références directes** multiples.

**Pourquoi** : réduire **couplage** et **connaissance mutuelle**; faciliter **orchestration**.

**ASCII — Structure** :
```
[UI] -> [Mediator] <- [Cart]
         ^    ^
         |    |
      [Payment] [Notifier]
```

**JavaScript — Implémentation**
```js
export class Mediator {
  constructor({ cart, payment, notifier }){ this.cart=cart; this.payment=payment; this.notifier=notifier; }
  async checkout(){ const total=this.cart.total(); const r=await this.payment.pay(total); if(r.ok) await this.notifier.email({ total, tx:r.tx }); return r; }
}
```

**Pièges** :
- Mediator **tentaculaire** (devient God Object).
- **Responsabilités** mal réparties (grain trop fin/gros).

**Formule JS — réduction d’interactions**
```js
function interactionsNoMediator(n){ return n*(n-1)/2; } // pairs directes
function interactionsWithMediator(n){ return n; }       // n vers médiateur
```

---

# 9.8 — 🧳 Memento

**Intent** : **capturer** et **restaurer** l’état interne d’un objet **sans** violer l’**encapsulation**.

**Pourquoi** : **undo**, **checkpoint**, **rollback**.

**ASCII — Structure (Panier)** :
```
[Cart] --createMemento()--> [Memento]
[Cart] <--restore(memento)-- [Memento]
```

**JavaScript — Implémentation**
```js
export class Cart {
  constructor(){ this.items=[]; }
  add(p, qty=1){ const i=this.items.findIndex(x=>x.id===p.id); if(i>=0) this.items[i].qty+=qty; else this.items.push({ id:p.id, price:p.price, qty }); }
  remove(id){ this.items = this.items.filter(x=>x.id!==id); }
  total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); }
  createMemento(){ return JSON.stringify(this.items); }
  restore(m){ this.items = JSON.parse(m); }
}
```

**Pièges** :
- **Deep copy** vs **référence** (ne jamais partager le tableau interne).
- Taille mémoire **excessive** (memento sous forme JSON volumineux).

**Formule JS — estimation mémoire memento**
```js
function estimateMementoBytes(itemsCount, bytesPerItem){ return itemsCount * bytesPerItem; }
```

---

# 9.9 — 🔁 Iterator

**Intent** : fournir une manière **uniforme** de **parcourir** les éléments d’une collection **sans** exposer sa **représentation**.

**Pourquoi** : **compatibilité** avec `for...of`, **encapsulation**.

**ASCII — Structure** :
```
[Cart] --[Symbol.iterator]--> yields { id, price, qty }
```

**JavaScript — Implémentation**
```js
export class CartIterable {
  constructor(items){ this.items = items; }
  [Symbol.iterator](){ let i=0; const arr=this.items; return { next(){ if(i < arr.length) return { value: arr[i++], done:false }; return { done:true }; } }; }
}

// usage
const it = new CartIterable([{id:'p1', price:20, qty:1},{id:'p2', price:10, qty:2}]);
for(const line of it){ console.log(line.id, line.qty); }
```

**Pièges** :
- **Mutations** pendant l’itération (consistance).
- Itérateur **non réentrant** (partage index).

---

# 9.10 — 🧑‍🔧 Visitor

**Intent** : représenter une **opération** à effectuer sur les **éléments** d’une structure sans **modifier** leurs classes.

**Pourquoi** : ajouter des **opérations** (ex. export, pricing) **sans** toucher aux classes de la structure.

**ASCII — Structure (Catalog)** :
```
[Visitor] --visit(Product)--> op
          --visit(Category)--> op
[ProductLeaf] <--accept(visitor)
[Category]    <--accept(visitor)
```

**JavaScript — Implémentation**
```js
export class CatalogComponent { accept(v){ throw new Error('abstract'); } }
export class ProductLeaf extends CatalogComponent { constructor(name, price){ super(); this.name=name; this.price=price; } accept(v){ return v.visitProduct(this); } }
export class Category extends CatalogComponent { constructor(name){ super(); this.name=name; this.children=[]; } add(c){ this.children.push(c); } accept(v){ return v.visitCategory(this); } }

export class PricingVisitor {
  constructor(){ this.total=0; }
  visitProduct(p){ this.total += p.price; }
  visitCategory(cat){ cat.children.forEach(ch => ch.accept(this)); }
}

// usage
const root = new Category('Root');
root.add(new ProductLeaf('Tee', 20));
const sub = new Category('Sub'); sub.add(new ProductLeaf('Hoodie', 45));
root.add(sub);
const v = new PricingVisitor();
root.accept(v);
console.log('TOTAL=', v.total);
```

**Pièges** :
- **Double dispatch** manquant (visitor incomplet).
- Structure très **volatile** ⇒ visitor rapidement obsolète.

---

## 🔗 Choisir le bon pattern — Arbre ASCII
```
Notification à plusieurs listeners ?        → Observer
Varier un algorithme facilement ?           → Strategy
Comportement dépend de l'état interne ?     → State
Undo/Redo ou macro-operations ?             → Command
Squelette commun avec étapes variables ?    → Template Method
Pipeline de validations/handlers ?          → Chain of Responsibility
Réduire couplage des interactions ?         → Mediator
Sauvegarder & restaurer l'état ?            → Memento
Parcourir sans exposer la structure ?       → Iterator
Ajouter des opérations sur une structure ?  → Visitor
```

---

## 💻 Intégration fil rouge

### 1) Observer + State
```
[Cart] --emit('cart:updated')--> [UI]
[UI Button] --state--> Enabled/Disabled selon total
```

### 2) Strategy pour promos
```
[PriceCalculator] --BlackFriday/Clearance--> total
```

### 3) Command pour panique (undo)
```
[Invoker] push AddItem/RemoveItem -> [Cart]
```

### 4) Mediator pour checkout
```
[UI] -> [Mediator] -> [Cart, Payment, Notifier]
```

### 5) Memento pour snapshot
```
[Cart] createMemento/restore
```

---

## 🚫 Anti-patterns transverses
- **Observer spaghetti** (événements en cascade non maîtrisés).
- **Strategy hyper-fragmentée** (algos trivialement identiques).
- **State sur-ingénierie** (trop d’états sans valeur).
- **Command sans undo** utile.
- **Template Method** trop rigide; préférer Strategy parfois.
- **Chain** circulaire ou ordre mal choisi.
- **Mediator** God Object.
- **Memento** volumineux (snapshot systématique).
- **Iterator** non robuste aux mutations.
- **Visitor** pour structure qui change chaque sprint.

---

## ✍️ Atelier — Pratique guidée

### Exercice 1 — Observer
Implémente un **bus** d’événements avec `on/off/emit`. Crée des listeners pour `cart:updated` et `payment:done`.

### Exercice 2 — Strategy
Écris deux stratégies de **tri** (`ByPriceAsc`, `ByNameAsc`) et un **client** qui applique l’une ou l’autre au catalogue.

### Exercice 3 — State
Crée un `Toggle` avec états **On/Off** et méthode `flip()`.

### Exercice 4 — Command
Crée `ChangeQtyCommand` (avec `undo()` symétrique).

### Exercice 5 — Template Method
Crée `ExportProcess` avec `validate()`, `gather()`, `format()`, `save()` et une sous-classe `CsvExportProcess`.

### Exercice 6 — Chain of Responsibility
Chaîne `AuthHandler` → `RoleHandler` → `QuotaHandler`.

### Exercice 7 — Mediator
Médiateur `ChatMediator` pour relier plusieurs utilisateurs (`send(user, message)` route vers les autres).

### Exercice 8 — Memento
Snapshots successifs du `Cart` et **restore**.

### Exercice 9 — Iterator
Itérer sur une structure en arbre (pré-ordre) via `[Symbol.iterator]`.

### Exercice 10 — Visitor
`DiscountVisitor` qui applique -10% sur tous les `ProductLeaf`.

---

## ✅ Solutions (suggestions)

### Sol. 2 — Strategy tri
```js
export class ByPriceAsc { apply(list){ return [...list].sort((a,b)=>a.price-b.price); } }
export class ByNameAsc  { apply(list){ return [...list].sort((a,b)=>a.name.localeCompare(b.name)); } }
export function sortWith(strategy, list){ return strategy.apply(list); }
```

### Sol. 3 — State Toggle
```js
export class Toggle { constructor(){ this.state = new OffState(this); } flip(){ this.state.flip(); } }
export class OffState { constructor(ctx){ this.ctx = ctx; } flip(){ this.ctx.state = new OnState(this.ctx); } }
export class OnState  { constructor(ctx){ this.ctx = ctx; } flip(){ this.ctx.state = new OffState(this.ctx); } }
```

### Sol. 4 — ChangeQtyCommand
```js
export class ChangeQtyCommand {
  constructor(cart, pid, delta){ this.cart=cart; this.pid=pid; this.delta=delta; }
  execute(){ const i=this.cart.items.findIndex(x=>x.id===this.pid); if(i>=0) this.cart.items[i].qty += this.delta; }
  undo(){ const i=this.cart.items.findIndex(x=>x.id===this.pid); if(i>=0) this.cart.items[i].qty -= this.delta; }
}
```

### Sol. 5 — Template Export CSV
```js
export class ExportProcess { run(){ this.validate(); const data=this.gather(); const out=this.format(data); return this.save(out); } validate(){ throw new Error('override'); } gather(){ throw new Error('override'); } format(){ throw new Error('override'); } save(){ throw new Error('override'); } }
export class CsvExportProcess extends ExportProcess { constructor(cart){ super(); this.cart=cart; } validate(){ if(this.cart.items.length===0) throw new Error('empty'); } gather(){ return this.cart.items; } format(items){ return items.map(i=>`${i.id},${i.qty},${i.price}`).join('\n'); } save(str){ console.log('CSV saved:', str.length); return true; } }
```

### Sol. 6 — Chain Auth/Role/Quota
```js
export class AuthHandler extends Handler { handle(req){ if(!req.user) return { ok:false, reason:'AUTH' }; return super.handle(req); } }
export class RoleHandler extends Handler { handle(req){ if(!req.user.roles || !req.user.roles.includes('buyer')) return { ok:false, reason:'ROLE' }; return super.handle(req); } }
export class QuotaHandler extends Handler { handle(req){ if(req.user.quota<=0) return { ok:false, reason:'QUOTA' }; return super.handle(req); } }
```

### Sol. 7 — ChatMediator
```js
export class ChatMediator { constructor(){ this.users=new Set(); }
  add(u){ this.users.add(u); }
  send(from, msg){ this.users.forEach(u => { if(u!==from) u.receive(from, msg); }); }
}
export class User { constructor(name, mediator){ this.name=name; this.mediator=mediator; mediator.add(this); }
  receive(from, msg){ console.log(`[${this.name}] ${from.name}: ${msg}`); }
  say(msg){ this.mediator.send(this, msg); }
}
```

### Sol. 8 — Memento
```js
const cart = new Cart(); cart.add({id:'p1', price:10}, 1); const m1 = cart.createMemento(); cart.add({id:'p2', price:5}, 2); const m2 = cart.createMemento(); cart.restore(m1); console.log('restored total=', cart.total());
```

### Sol. 9 — Iterator pré-ordre
```js
export class TreeNode { constructor(value){ this.value=value; this.children=[]; } add(ch){ this.children.push(ch); }
  [Symbol.iterator](){ const stack=[this]; return { next(){ if(!stack.length) return { done:true }; const node=stack.pop(); for(let i=node.children.length-1;i>=0;i--) stack.push(node.children[i]); return { value: node.value, done:false }; } }; }
}
```

### Sol. 10 — DiscountVisitor
```js
export class DiscountVisitor { visitProduct(p){ p.price = +(p.price * 0.9).toFixed(2); } visitCategory(cat){ cat.children.forEach(ch => ch.accept(this)); } }
```

---

## 🧾 Checklist — Chapitre 9
- [ ] Je sais **quand** appliquer Observer, Strategy, State, Command, Template Method, Chain, Mediator, Memento, Iterator, Visitor.
- [ ] Je peux dessiner les **structures ASCII**.
- [ ] Je sais **implémenter en JS** chaque pattern.
- [ ] J’identifie les **pièges** et **bonnes pratiques**.
- [ ] Je peux **composer** plusieurs patterns dans le fil rouge.

---

## 🧠 Mini Quiz
1. Différence principale entre **Observer** et **Mediator** ?
2. Pourquoi **Strategy** aide le **testing** ?
3. Donne un exemple où **State** remplace un grand `switch`.
4. À quoi sert **Memento** vs **Command undo** ?
5. Quand préférer **Template Method** à **Strategy** ?

> Réponses attendues : 1) Observer = notification **pub/sub**, Mediator = **orchestration** centralisée 2) On teste **chaque algorithme** isolément 3) UI enable/disable avec classes d’état 4) Memento capture **état**; Command undo rejoue **actions inverses** 5) Quand le **squelette** est **fixe** avec **étapes** à personnaliser.

---

## 🗂️ Références internes
- Cf. **Chapitre 6** (SOLID/GRASP) : choix motivés (OCP, Low Coupling).
- Cf. **Chapitre 7** (Créationnels) : factories pour fournir participants.
- Cf. **Chapitre 8** (Structurels) : combiner avec Decorator/Facade/Proxy.
- Cf. **Chapitre 11** (Tests) : tests unitaires pour Observer/Strategy/Command.

---

## 📚 Résumé — Points clés du Chapitre 9
- Les **patterns comportementaux** modulent **qui fait quoi, quand et comment**.
- **Observer** notifie, **Strategy** varie l’algorithme, **State** conditionne le comportement, **Command** encapsule l’action (undo/redo), **Template Method** fixe un squelette extensible.
- **Chain** compose des handlers, **Mediator** réduit les connexions en étoile, **Memento** sauvegarde l’état, **Iterator** parcours uniformément, **Visitor** ajoute des opérations sans modifier les classes.
- **JavaScript** (modules/classes, fonctions, `Symbol.iterator`, JSON) permet des implémentations **directes** et **lisibles**.
