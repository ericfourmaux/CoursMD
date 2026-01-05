# 🧩 Chapitre 10 — Intégration UML ↔ JS Front (SPA)

> **Objectif** : relier les **diagrammes UML** (Use Case, Séquence, Classes, États, Composants, Déploiement) à une **implémentation JavaScript** front **SPA** (Single Page Application) simple, lisible et testable. Tout est illustré par des **schémas ASCII** et du **code 100% JS**.

---

## 🎯 Objectifs d’apprentissage
- Mapper **Use Cases** → **événements & contrôleurs** UI.
- Mapper **Sequence** → **flux async** (`async/await`, bus d’événements).
- Mapper **Classes** → **modules JS**, **services**, **contrats** (duck-typing).
- Mapper **State Machine** → **états UI** (composants, transitions contrôlées).
- Mapper **Composants** → **ports/adapters** et **facades** côté front.
- Mapper **Déploiement** → **config** par environnement & **structure des artefacts**.

---

## 🧭 Vue d’architecture (ASCII)
```
+--------------------------------------+        +---------------------+
|            SPA (Front JS)            |        |       Backends      |
|  [UI Pages]                          |        |  API Produits, Paiement
|   - CatalogPage                      |        |  Notifications      |
|   - CartPage                         |        +---------------------+
|   - CheckoutPage                     |
|                                      |
|  [Controllers] ←→ [EventBus]         |
|     CatalogController                |
|     CartController                   |
|     CheckoutController               |
|                                      |
|  [Services]                          |
|     ProductsPort ← Adapter HTTP ---> Backend /products
|     PaymentPort  ← Adapter HTTP ---> Backend /pay
|     NotificationsPort ← Adapter ---> Backend /notify
|                                      |
|  [Domain]                            |
|     CartService (agrégation)         |
|     State machines (UI/Order)        |
|                                      |
|  [Facade] CheckoutFacade             |
+--------------------------------------+        +---------------------+
```

---

## 🔗 Mapping UML → Artefacts JS

### Use Case → Événements & Contrôleurs
- **UML** : acteurs + cas d’utilisation.
- **JS** : événements **UI** (`click`, `change`) → **controllers** qui orchestrent **services**.

ASCII :
```
[UC: Ajouter au panier]
UI(Button) --click--> CartController.add(productId)
Bus.emit('cart:updated') -> UI total
```

### Sequence → Async/await & bus
- **UML** : messages, `alt/opt/loop`.
- **JS** : `await` pour synchro, `if/else` pour `alt`, `for/while` pour `loop`, bus pour **notifications**.

ASCII :
```
UI -> CartService.add -> calc total -> opt(promo) -> Payment.pay -> Notif.send
```

### Classes → Modules & contrats
- **UML** : classes, attributs, opérations, interfaces.
- **JS** : `class`, `export`, **contrats** par **duck-typing** (`{ methods:[...] }`).

ASCII :
```
[Panier] -- items[]; total(); add(); remove()
<<interface>> IPayment { pay(total) }
```

### State Machine → États UI
- **UML** : états, transitions, gardes.
- **JS** : objets **State** attachés à composant (ex. `Button`), **FSM** table-driven pour **Order**.

ASCII :
```
[Button] Enabled/Disabled  ;  [Order] CREATED -> PAID -> SHIPPED -> DELIVERED
```

### Composants → Ports/Adapters/Facade
- **UML** : ports fournis/requis, dépendances.
- **JS** : **ports** via contrats; **adapters** HTTP; **facade** pour simplifier l’orchestration.

ASCII :
```
Front.UI --(ProductsPort)--> AdapterHTTP --/products--> API
Front.UI --(PaymentPort)-->  AdapterHTTP --/pay-------> API
```

### Déploiement → Artefacts & Config
- **UML** : nœuds, artefacts, connexions.
- **JS** : **bundle** `app.bundle.js`, **config** `{ baseUrl, payments }`, **fetch** HTTP.

ASCII :
```
[Browser] app.bundle.js  <--> [Node API] api.js  <--> [DB]
```

---

## 📦 Structure des modules (projet SPA minimal)
```
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
```

---

## 💻 Implémentation — Éléments clés du SPA

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

### Contrats (Ports)
```js
// infra/ports.js
export const IProducts = { methods:['list','get'] };
export const IPayment  = { methods:['pay'] };
export const INotify   = { methods:['send'] };
export function assertImplements(o, iface){ const ok = iface.methods.every(m => typeof o[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }
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

### Service de domaine (Classes/Agrégation)
```js
// domain/cart-service.js
export class CartService {
  constructor(){ this.items=[]; }
  add(product, qty=1){ const i=this.items.findIndex(x=>x.id===product.id); if(i>=0) this.items[i].qty+=qty; else this.items.push({ id:product.id, name:product.name, price:product.price, qty }); }
  remove(id){ this.items = this.items.filter(x=>x.id!==id); }
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
    initial:'CREATED', states:['CREATED','PAID','SHIPPED','DELIVERED','CANCELLED'],
    transitions:{
      CREATED:{ pay:{ to:'PAID', guard:({ total })=> total>0 } , cancel:{ to:'CANCELLED' } },
      PAID:{ ship:{ to:'SHIPPED' } },
      SHIPPED:{ deliver:{ to:'DELIVERED' } }
    }
  });
}
```

### Facade Checkout (Facade)
```js
// facade/checkout-facade.js
export class CheckoutFacade {
  constructor({ cart, payment, notifier }){ this.cart=cart; this.payment=payment; this.notifier=notifier; }
  async run(code=null){ let total=this.cart.total(); if(code==='WELCOME10') total=+(total*0.9).toFixed(2); const r=await this.payment.pay(total); if(r.ok) await this.notifier.send(`Paid ${total}, tx=${r.tx}`); return r; }
}
```

### Controllers (Use Case → Orchestration)
```js
// controllers/cart-controller.js
export class CartController {
  constructor({ bus, cartService, productsPort }){ this.bus=bus; this.cart=cartService; this.products=productsPort; }
  async add(productId){ const p = await this.products.get(productId); this.cart.add(p,1); this.bus.emit('cart:updated', this.cart); }
}

// controllers/checkout-controller.js
export class CheckoutController {
  constructor({ bus, facade, orderFSM }){ this.bus=bus; this.facade=facade; this.fsm=orderFSM; }
  async pay(promo){ const totalEvt={ total:this.facade.cart.total() }; if(!this.fsm.can('pay', totalEvt)) { this.bus.emit('ui:msg', 'Panier vide'); return { ok:false }; } const r = await this.facade.run(promo); if(r.ok){ this.fsm.send('pay', totalEvt); this.bus.emit('payment:done', r); } else { this.bus.emit('ui:msg', 'Refus de paiement'); } return r; }
}
```

### UI Pages (rendu minimal, ASCII-like)
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

// Démo (ASCII I/O)
(async function demo(){
  const list = await products.list();
  catalogUI.render(list);
  catalogUI.clickAdd(list[0].id);
  cartUI.render();
  checkoutUI.payWith('WELCOME10');
})();
```

---

## 🧮 Formules & métriques utiles (JS)

### 1) **Temps total** d’un flux séquentiel (Sequence)
```js
function sumSequential(...ms){ return ms.reduce((s,d)=>s+d,0); }
console.log(sumSequential(40, 120, 30)); // 190 ms
```

### 2) **Temps parallèle** (fork/join) — max des branches
```js
function parallelTime(...branches){ return Math.max(...branches); }
console.log(parallelTime(80, 200, 100)); // 200 ms
```

### 3) **Hit rate** de cache (Proxy/Decorator)
```js
function cacheHitRate(total, hits){ return total>0 ? +(hits/total*100).toFixed(2) : 0; }
```

### 4) **Couplage** simplifié (imports/HTTP) pour un module
```js
function estimateCoupling(js){ const imports=(js.match(/\bimport\b|require\(/g)||[]).length; const http=(js.match(/fetch\(/g)||[]).length; return { imports, http, score: imports+http }; }
```

---

## 🛠️ Méthode : De l’UML au code en 6 étapes
1. **Écrire** le **Use Case** (Given/When/Then) et les variantes.
2. **Tracer** le **Sequence ASCII** (messages, `alt/opt/loop`).
3. **Identifier** les **classes/services** et leurs **contrats** (ports).
4. **Définir** la **FSM** (états, transitions, gardes).
5. **Assembler** via **controllers**, **bus** et **facade**.
6. **Documenter** (schémas ASCII + liens internes Obsidian).

---

## 🚫 Anti-patterns & écueils
- **Tout dans l’UI** : logique métier mélangée à la vue.
- **Couplage direct** aux APIs : ignorer les **ports/adapters**.
- **Transitions d’état implicites** : modifier l’état sans FSM.
- **Bus d’événements bavard** : événements non maîtrisés (spaghetti).
- **Sur-ingénierie** : patterns utilisés sans besoin.

---

## ✍️ Atelier — Intégration guidée

### Exercice 1 — Ajouter le **port `IShipping`**
Crée `IShipping { ship(orderId) }` et un adapter HTTP. Intègre-le dans la **FSM** (transition `ship`) via `CheckoutController`.

### Exercice 2 — Message UI global
Ajoute un **decorator** de notification qui loggue tout message `ui:msg` avec un timestamp.

### Exercice 3 — Mesure de latence
Écris une fonction `measureCheckoutLatency()` qui exécute `facade.run()` **N fois** et calcule la **moyenne**.

---

## ✅ Solutions (suggestions)

### Sol. 1 — Port Shipping
```js
export const IShipping = { methods:['ship'] };
export class ShippingHTTPAdapter { constructor(baseUrl){ this.baseUrl=baseUrl; } async ship(orderId){ const r = await fetch(`${this.baseUrl}/ship`, { method:'POST', body: JSON.stringify({ orderId }) }); return r.json(); } }
```

### Sol. 2 — Decorator UI message
```js
export function decorateUIMessages(bus){ const origEmit = bus.emit; bus.emit = (evt, data) => { if(evt==='ui:msg') console.log(`[MSG @${new Date().toISOString()}]`, data); origEmit(evt, data); }; }
```

### Sol. 3 — measureCheckoutLatency
```js
export async function measureCheckoutLatency(facade, runs=10){ const t0=performance.now(); for(let i=0;i<runs;i++){ await facade.run(); } const t1=performance.now(); return +( (t1-t0)/runs ).toFixed(2); }
```

---

## 🧾 Checklist — Chapitre 10
- [ ] Je sais mapper **UML → JS** (Use Case, Sequence, Classes, États, Composants, Déploiement).
- [ ] Je sais composer **controllers**, **services**, **FSM**, **ports/adapters**, **facade**.
- [ ] Je maîtrise le **bus** (Observer) et `async/await`.
- [ ] J’identifie et évite les **anti-patterns** courants.
- [ ] Je peux **mesurer** et **documenter** la solution (ASCII + JS).

---

## 🧠 Mini Quiz
1. Quelle différence entre **Adapter** et **Facade** côté front ?
2. Pourquoi une **FSM** côté UI/commande ?
3. Comment représenter `alt/opt/loop` d’un **Sequence** en JS ?
4. Quel est l’intérêt des **ports** pour le front ?
5. Donne un exemple d’**anti-pattern** dans une SPA.

> Réponses attendues : 1) Adapter convertit un **contrat**; Facade **oriente**/simplifie l’orchestration 2) Garantir la **validité** des transitions 3) `if/else` (alt), `if` conditionnel (opt), `for/while` (loop) + `await` 4) Découpler du backend, testabilité et substitution 5) Logique métier dans l’UI, couplage direct aux APIs.

---

## 🗂️ Références internes
- Cf. **Chapitres 2–5** pour Use Case, Classe, Séquence/Activité, États/Composants/Déploiement.
- Cf. **Chapitres 6–9** pour principes et patterns utilisés.
- Cf. **Chapitre 11** pour la mise en place des **tests** (Jest) des controllers/services.

---

## 📚 Résumé — Points clés du Chapitre 10
- **UML** n’est pas un ornement; c’est la **carte** qui guide une **implémentation JS** claire.
- **Use Cases** → actions utilisateurs & **controllers**; **Sequence** → `async/await` & bus.
- **Classes** → services/modules; **FSM** → robustesse des transitions; **Composants** → ports/adapters; **Déploiement** → artefacts & config.
- En **SPA**, viser **découplage**, **cohésion**, **testabilité** et **documentation** (ASCII + JS) pour une conception durable.
