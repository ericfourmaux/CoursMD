# 🎓 Chapitre 13 — Projet Fil Rouge (E-commerce modulaire)

> **Objectif** : concevoir, modéliser et implémenter un **mini e-commerce** modulaire en **JavaScript** (front-agnostic, ES modules), documenté avec **schémas ASCII**, **UML mappé au code**, **tests Jest**, et une **stratégie de déploiement** simple. Ce chapitre sert de **capstone** et réutilise les patterns et principes étudiés.

---

## 🎯 Objectifs d’apprentissage
- Rédiger les **exigences** et **Use Cases** clairs.
- Produire les **diagrammes ASCII** (use case, séquence, classes, états, composants, déploiement).
- Implémenter une **architecture modulaire** (ports/adapters, facade, controllers, services, FSM).
- Écrire des **tests unitaires & d’intégration** (Jest) et des **mesures JS** (qualité/latence).
- Préparer une **configuration d’environnements** et un **plan de déploiement** minimal.

---

## 📜 Portée & exigences

### Fonctionnel
- **Catalogue** : lister produits, détail d’un produit.
- **Panier** : ajouter/retirer, total, formatage.
- **Checkout** : appliquer code promo, payer, notifier.
- **Historique commande** : état (créée, payée, expédiée, livrée, annulée).

### Non-fonctionnel
- **Modularité** : ports/adapters pour produits/paiement/notifications.
- **Testabilité** : suites **Jest**.
- **Documentation** : **ASCII** dans Obsidian + code commenté.

---

## 🧱 Use Cases — ASCII + texte

```
+-------------------------------------------+
|       [ Système Boutique (Front) ]        |
|                                           |
| [UC: Parcourir Catalogue]                 |
| [UC: Voir Détail Produit]                 |
| [UC: Ajouter au Panier] --include--> [UC: Recalculer total]
| [UC: Retirer du Panier]                   |
| [UC: Valider Panier] --extend--> [UC: Appliquer code promo]
| [UC: Payer]                               |
|                                           |
+-------------------------------------------+
    ^                ^                  ^
    |                |                  |
  Client      Service Produits     Service Paiement
```

### Modèle Given/When/Then — Exemple
```
Titre: Payer
Acteur principal: Client
Préconditions: panier validé, total > 0
Déclencheur: le client demande le paiement
Postconditions: si succès, commande à l'état PAID et notification envoyée
Variantes: refus paiement -> message d'erreur
```

---

## 🏗️ Diagramme de classes — ASCII
```
+-------------------+        +-------------------+
|      Produit      |        |     Panier        |
+-------------------+        +-------------------+
| + id: string      |        | - items: Ligne[]  |
| + name: string    |        | + add(p, qty)     |
| + price: number   |        | + remove(id)      |
+-------------------+        | + total(): number |
                              +-------------------+
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

<<interface>> IPayment { pay(total) }
<<interface>> IProducts { list(), get(id) }
<<interface>> INotify   { send(message) }

CheckoutFacade - - - - > IPayment
CartController  - - - - > IProducts
```

---

## 🔄 Diagrammes de séquence — ASCII

### 1) Ajouter au panier
```
UI -> CartController.add(productId)
CartController -> ProductsPort.get(id)
ProductsPort -> AdapterHTTP /products/:id
AdapterHTTP -> ProductsPort (product)
CartController -> CartService.add(product)
CartService -> (update items)
CartController -> Bus.emit('cart:updated')
```

### 2) Checkout
```
UI -> CheckoutController.pay(promo)
CheckoutController -> FSM.can('pay', { total }) [alt]
  [if false] -> Bus.emit('ui:msg:Panier vide')
  [else]
    -> CheckoutFacade.run(promo)
       CheckoutFacade -> CartService.total
       CheckoutFacade -> PaymentPort.pay(total|promo)
       [if ok] CheckoutFacade -> NotifyPort.send('Paid ...')
       --> CheckoutController receives { ok, tx }
    -> FSM.send('pay')
    -> Bus.emit('payment:done')
```

---

## 🧩 Diagramme d’états — Commande
```
           +-----------+   pay   +--------+   ship   +----------+
[CREATED]--+           +-------> |  PAID  | -------> | SHIPPED  |
           +-----------+         +--------+          +----------+
                 | cancel              | refund            | deliver
                 v                     v                   v
             +--------+            +---------+         +----------+
             |CANCELLED|            |REFUNDED |        |DELIVERED |
             +--------+            +---------+         +----------+
```

---

## 🧱 Composants & ports — ASCII
```
+------------------------------------+
|       Front SPA (Boutique)         |
|  [Ports requis]                    |
|    - ProductsPort (IProducts) ----+------------------+
|    - PaymentPort  (IPayment) -----+----+             |
|    - NotifyPort   (INotify) ------+----+             |
+------------------------------------+    |             |
                                          |             |
                                   +------+-----+  +----+------+
                                   |  API Produits |  | API Paiement |
                                   |  [IProducts]  |  |  [IPayment]  |
                                   +--------------+  +-------------+
```

---

## 🛰️ Déploiement — ASCII
```
+----------------------+       +------------------------+       +---------------------+
|   Client (Browser)   | <---> |   Serveur API (Node)   | <---> |   Base de données   |
|  Artefacts:          |       |  Artefacts:            |       |  Artefacts:         |
|  - app.bundle.js     |       |  - api.js (Docker img) |       |  - dumps (stg)      |
|  - config.{env}.json |       |  - config.{env}.json   |       |  - prod data        |
+----------------------+       +------------------------+       +---------------------+
```

---

## 📦 Arborescence du projet (référence)
```
project/
  src/
    app.js
    ui/
      catalog.js
      cart.js
      checkout.js
    controllers/
      catalog-controller.js
      cart-controller.js
      checkout-controller.js
    domain/
      cart-service.js
      order-fsm.js
    infra/
      event-bus.js
      ports.js
      products-http-adapter.js
      payment-http-adapter.js
      notifications-http-adapter.js
    facade/
      checkout-facade.js
    config/
      env.js
  tests/
    unit/ ...
    integration/ ...
  jest.config.js
```

---

## 💻 Implémentation — Modules clés (JS uniquement)

### Event Bus (Observer)
```js
// infra/event-bus.js
export function createBus(){
  const handlers = {};
  return {
    on(evt, fn){ (handlers[evt] ||= []).push(fn); },
    off(evt, fn){ handlers[evt] = (handlers[evt]||[]).filter(h => h!==fn); },
    emit(evt, data){ (handlers[evt]||[]).forEach(fn => fn(data)); }
  };
}
```

### Ports & assert (DIP)
```js
// infra/ports.js
export const IProducts = { methods:['list','get'] };
export const IPayment  = { methods:['pay'] };
export const INotify   = { methods:['send'] };
export function assertImplements(o, iface){ const ok=iface.methods.every(m => typeof o[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }
```

### Adapters HTTP (Adapter)
```js
// infra/products-http-adapter.js
import { IProducts, assertImplements } from './ports.js';
export class ProductsHTTPAdapter {
  constructor(baseUrl){ this.baseUrl=baseUrl; }
  async list(){ const r = await fetch(`${this.baseUrl}/products`); return r.json(); }
  async get(id){ const r = await fetch(`${this.baseUrl}/products/${id}`); return r.json(); }
}
assertImplements(new ProductsHTTPAdapter('http://localhost:3000'), IProducts);

// infra/payment-http-adapter.js
import { IPayment, assertImplements } from './ports.js';
export class PaymentHTTPAdapter {
  constructor(baseUrl){ this.baseUrl=baseUrl; }
  async pay(total){ const r = await fetch(`${this.baseUrl}/pay`, { method:'POST', body: JSON.stringify({ total }) }); return r.json(); }
}
assertImplements(new PaymentHTTPAdapter('http://localhost:4000'), IPayment);

// infra/notifications-http-adapter.js
import { INotify, assertImplements } from './ports.js';
export class NotificationsHTTPAdapter {
  constructor(baseUrl){ this.baseUrl=baseUrl; }
  async send(message){ await fetch(`${this.baseUrl}/notify`, { method:'POST', body: JSON.stringify({ message }) }); return true; }
}
assertImplements(new NotificationsHTTPAdapter('http://localhost:3000'), INotify);
```

### Domaine (Classes & agrégation)
```js
// domain/cart-service.js
export class CartService {
  constructor(){ this.items=[]; }
  add(product, qty=1){ const i=this.items.findIndex(x=>x.id===product.id); if(i>=0) this.items[i].qty+=qty; else this.items.push({ id:product.id, name:product.name, price:product.price, qty }); }
  remove(id){ this.items = this.items.filter(x=>x.id!==id); }
  setQty(id, qty){ const i=this.items.findIndex(x=>x.id===id); if(i<0) throw new Error('introuvable'); this.items[i].qty=qty; }
  total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); }
}
```

### FSM Commande (State Machine)
```js
// domain/order-fsm.js
export class FSM {
  constructor({ initial, states, transitions }){ this.state=initial; this.states=new Set(states); this.transitions=transitions; }
  can(evt, ctx={}){ const t=this.transitions[this.state]?.[evt]; if(!t) return false; return !t.guard || t.guard(ctx); }
  send(evt, ctx={}){ const t=this.transitions[this.state]?.[evt]; if(!t) throw new Error('Transition absente'); if(t.guard && !t.guard(ctx)) throw new Error('Garde refusée'); this.state=t.to; return this.state; }
}

export function createOrderFSM(){
  return new FSM({
    initial:'CREATED', states:['CREATED','PAID','SHIPPED','DELIVERED','CANCELLED','REFUNDED'],
    transitions:{
      CREATED:{ pay:{ to:'PAID', guard:({ total })=> total>0 } , cancel:{ to:'CANCELLED' } },
      PAID:{ ship:{ to:'SHIPPED' }, refund:{ to:'REFUNDED' } },
      SHIPPED:{ deliver:{ to:'DELIVERED' } }
    }
  });
}
```

### Facade Checkout
```js
// facade/checkout-facade.js
export class CheckoutFacade {
  constructor({ cart, payment, notifier }){ this.cart=cart; this.payment=payment; this.notifier=notifier; }
  async run(code=null){ let total=this.cart.total(); if(code==='WELCOME10') total=+(total*0.9).toFixed(2); const r=await this.payment.pay(total); if(r.ok) await this.notifier.send(`Paid ${total}, tx=${r.tx}`); return r; }
}
```

### Controllers
```js
// controllers/cart-controller.js
export class CartController {
  constructor({ bus, cartService, productsPort }){ this.bus=bus; this.cart=cartService; this.products=productsPort; }
  async add(productId){ const p = await this.products.get(productId); this.cart.add(p,1); this.bus.emit('cart:updated', this.cart); }
  remove(productId){ this.cart.remove(productId); this.bus.emit('cart:updated', this.cart); }
}

// controllers/checkout-controller.js
export class CheckoutController {
  constructor({ bus, facade, orderFSM }){ this.bus=bus; this.facade=facade; this.fsm=orderFSM; }
  async pay(promo){ const ctx={ total:this.facade.cart.total() }; if(!this.fsm.can('pay', ctx)) { this.bus.emit('ui:msg', 'Panier vide'); return { ok:false }; } const r = await this.facade.run(promo); if(r.ok){ this.fsm.send('pay', ctx); this.bus.emit('payment:done', r); } else { this.bus.emit('ui:msg', 'Refus de paiement'); } return r; }
}
```

### UI minimal (console)
```js
// ui/catalog.js
export function CatalogPage({ controller }){
  return {
    render(list){ console.log('- Catalog'); list.forEach(p => console.log(`* ${p.name} (${p.price}€) [add:${p.id}]`)); },
    clickAdd(id){ controller.add(id); }
  };
}

// ui/cart.js
export function CartPage({ bus, cart }){
  bus.on('cart:updated', (c) => console.log(`[Cart] total=${c.total()}€`));
  return { render(){ console.log('- Cart'); cart.items.forEach(i => console.log(`* ${i.name} x${i.qty}`)); console.log(`Total=${cart.total()}€`); } };
}

// ui/checkout.js
export function CheckoutPage({ bus, controller }){
  bus.on('ui:msg', (m) => console.log('[UI]', m));
  bus.on('payment:done', (r) => console.log('[UI] payment OK tx=', r.tx));
  return { payWith(code){ controller.pay(code); } };
}
```

### Application (composition)
```js
// app.js
import { createBus } from './infra/event-bus.js';
import { ProductsHTTPAdapter } from './infra/products-http-adapter.js';
import { PaymentHTTPAdapter } from './infra/payment-http-adapter.js';
import { NotificationsHTTPAdapter } from './infra/notifications-http-adapter.js';
import { CartService } from './domain/cart-service.js';
import { createOrderFSM } from './domain/order-fsm.js';
import { CheckoutFacade } from './facade/checkout-facade.js';
import { CartController } from './controllers/cart-controller.js';
import { CheckoutController } from './controllers/checkout-controller.js';
import { CatalogPage } from './ui/catalog.js';
import { CartPage } from './ui/cart.js';
import { CheckoutPage } from './ui/checkout.js';

const bus = createBus();
const products = new ProductsHTTPAdapter('http://localhost:3000');
const payment  = new PaymentHTTPAdapter('http://localhost:4000');
const notify   = new NotificationsHTTPAdapter('http://localhost:3000');
const cart     = new CartService();
const fsm      = createOrderFSM();
const facade   = new CheckoutFacade({ cart, payment, notifier: notify });
const cartCtl  = new CartController({ bus, cartService: cart, productsPort: products });
const payCtl   = new CheckoutController({ bus, facade, orderFSM: fsm });

const catalogUI  = CatalogPage({ controller: cartCtl });
const cartUI     = CartPage({ bus, cart });
const checkoutUI = CheckoutPage({ bus, controller: payCtl });

(async function demo(){
  const list = await products.list();
  catalogUI.render(list);
  catalogUI.clickAdd(list[0].id);
  cartUI.render();
  checkoutUI.payWith('WELCOME10');
})();
```

---

## 🧪 Tests (Jest) — Unit & Intégration

### Unit — Strategy & Bus
```js
// tests/unit/price.strategy.spec.js
class BlackFridayStrategy { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.7; } }
class PriceCalculator { constructor(strategy){ this.strategy=strategy; } calc(items){ return this.strategy.calc(items); } }

test('BlackFridayStrategy -30%', () => {
  const calc = new PriceCalculator(new BlackFridayStrategy());
  expect(calc.calc([{ price:10, qty:2 }])).toBe(14);
});

// tests/unit/event.bus.spec.js
import { createBus } from '../../src/infra/event-bus.js';

test('bus notifie', () => {
  const bus = createBus(); const log = jest.fn();
  bus.on('cart:updated', log); bus.emit('cart:updated', { total: 10 });
  expect(log).toHaveBeenCalledWith({ total: 10 });
});
```

### Intégration — Checkout
```js
// tests/integration/checkout.facade.int.spec.js
import { CheckoutFacade } from '../../src/facade/checkout-facade.js';

test('facade appelle payment et notify', async () => {
  const cart = { total: () => 20 };
  const payment = { pay: jest.fn(async () => ({ ok: true, tx: 'tx_1' })) };
  const notifier = { send: jest.fn(async () => true) };
  const facade = new CheckoutFacade({ cart, payment, notifier });
  const r = await facade.run('WELCOME10');
  expect(r.ok).toBe(true);
  expect(payment.pay).toHaveBeenCalledWith(18);
  expect(notifier.send).toHaveBeenCalledWith('Paid 18, tx=tx_1');
});
```

---

## 🧮 Mesures & formules JS

### Latence moyenne du checkout
```js
export async function measureCheckoutLatency(facade, runs=10){ const t0=performance.now(); for(let i=0;i<runs;i++){ await facade.run(); } const t1=performance.now(); return +( (t1-t0)/runs ).toFixed(2); }
```

### Couplage simplifié (imports/HTTP)
```js
export function estimateCoupling(js){ const imports=(js.match(/\bimport\b|require\(/g)||[]).length; const http=(js.match(/fetch\(/g)||[]).length; return { imports, http, score: imports+http }; }
```

---

## 🗓️ Sprints & jalons
1. **Sprint 1** : Use Cases + ASCII + scaffolding modules.
2. **Sprint 2** : Domain + Ports/Adapters + Facade + Controllers.
3. **Sprint 3** : FSM + Séquence + Tests unitaires.
4. **Sprint 4** : Intégration + Déploiement + Mesures.

---

## 🛠️ Exercices (capstone)

### Exercice 1 — Code promo évolutif
Introduis **Strategy** pour les promos (`Welcome10`, `PercentX`, `Buy2Get1`) et refactorise `CheckoutFacade` pour l’accepter.

### Exercice 2 — Proxy cache catalogue
Ajoute un **Proxy** `ProductsCacheProxy` avec TTL et mesure le **hit rate**.

### Exercice 3 — Decorator retry paiement
Ajoute un **Decorator** `RetryPaymentDecorator` sur `PaymentHTTPAdapter` (2 retries) et teste le comportement.

### Exercice 4 — Chain validation checkout
Chaîne `QtyHandler` → `AddressHandler` → `PaymentLimitHandler` avant `CheckoutFacade.run()`.

### Exercice 5 — Visitor pricing
Applique un **Visitor** sur un `Catalog` composite pour calculer la **valeur totale**.

---

## ✅ Solutions (suggestions)

### Sol. 1 — Strategy promos
```js
export class Welcome10 { apply(total){ return +(total*0.9).toFixed(2); } }
export class PercentX { constructor(x){ this.x=x; } apply(total){ return +(total*(1-this.x)).toFixed(2); } }
export class Buy2Get1 { apply(total){ /* simplifié */ return total; } }
```

### Sol. 2 — Proxy cache
```js
export class ProductsCacheProxy {
  constructor(real, ttlMs=5000){ this.real=real; this.ttl=ttlMs; this.cache=null; this.last=0; this.hits=0; this.total=0; }
  async list(){ this.total++; const now=Date.now(); if(this.cache && now-this.last < this.ttl){ this.hits++; return this.cache; } const data=await this.real.list(); this.cache=data; this.last=now; return data; }
  hitRate(){ return this.total ? +(this.hits/this.total*100).toFixed(2) : 0; }
}
```

### Sol. 3 — Decorator retry
```js
export class RetryPaymentDecorator {
  constructor(adapter, max=2){ this.adapter=adapter; this.max=max; }
  async pay(total){ for(let i=0;i<=this.max;i++){ try{ return await this.adapter.pay(total); } catch(e){ if(i===this.max) throw e; } } }
}
```

### Sol. 4 — Chain validation
```js
export class Handler { setNext(n){ this.next=n; return n; } handle(req){ return this.next ? this.next.handle(req) : { ok:true }; } }
export class QtyHandler extends Handler { handle(req){ if(req.totalQty<=0) return { ok:false, reason:'QTY' }; return super.handle(req); } }
export class AddressHandler extends Handler { handle(req){ if(!req.address || !req.address.city) return { ok:false, reason:'ADDR' }; return super.handle(req); } }
export class PaymentLimitHandler extends Handler { handle(req){ if(req.total>200) return { ok:false, reason:'LIMIT' }; return super.handle(req); } }
```

### Sol. 5 — Visitor pricing
```js
export class CatalogComponent { accept(v){ throw new Error('abstract'); } }
export class ProductLeaf extends CatalogComponent { constructor(name, price){ super(); this.name=name; this.price=price; } accept(v){ return v.visitProduct(this); } }
export class Category extends CatalogComponent { constructor(name){ super(); this.name=name; this.children=[]; } add(c){ this.children.push(c); } accept(v){ return v.visitCategory(this); } }
export class PricingVisitor { constructor(){ this.total=0; } visitProduct(p){ this.total+=p.price; } visitCategory(cat){ cat.children.forEach(ch => ch.accept(this)); } }
```

---

## 🧾 Checklist — Chapitre 13
- [ ] Exigences & Use Cases rédigés.
- [ ] Diagrammes ASCII complets (use case, séquence, classes, états, composants, déploiement).
- [ ] Architecture implémentée (ports/adapters, facade, controllers, services, FSM).
- [ ] Tests Jest (unitaires & intégration) passants.
- [ ] Mesures & qualités (latence, couplage) effectuées.
- [ ] Documentation Obsidian cohérente.

---

## 🧠 Mini Quiz
1. Pourquoi séparer **ports/adapters** dans une SPA ?
2. Que garantit la **FSM** de commande ?
3. Quels patterns sont utilisés dans **CheckoutFacade** ?
4. Comment éviter la **sur-ingénierie** dans le projet ?
5. Donne une mesure utile pour évaluer la **qualité** du flux checkout.

> Réponses attendues : 1) Découplage du backend, testabilité 2) Validité des transitions (pay, ship…) 3) Facade + DIP via ports, éventuellement Strategy promo 4) KISS, mesurer, introduire les patterns à **besoin avéré** 5) Latence moyenne, taux de hit cache, complexité cyclomatique.

---

## 📚 Résumé — Points clés du Chapitre 13
- Le projet **fil rouge** intègre **UML** (ASCII) et **JS** de bout en bout.
- Les **patterns** consolident la conception (Facade, Adapter, Strategy, State, Observer, Chain, Proxy, Decorator, Visitor).
- Les **tests** et **mesures** assurent la **qualité** et guident le **refactoring**.
- La **documentation** (Obsidian) est la **source vivante** des décisions et de l’architecture.
