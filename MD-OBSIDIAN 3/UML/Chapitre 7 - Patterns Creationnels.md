# 🛠️ Chapitre 7 — Patterns Créationnels (GoF)

> **Objectif** : maîtriser les **patterns de création** pour **contrôler** et **structurer** l’instanciation d’objets : **Singleton**, **Factory Method**, **Abstract Factory**, **Builder**, **Prototype**. Nous détaillons **intent**, **pourquoi**, **structure ASCII**, **implémentations 100% JavaScript**, **pièges**, **exercices**, **solutions**, **quiz** et **checklist**.

---

## 🎯 Objectifs d’apprentissage
- Comprendre l’**intent** de chaque pattern de création et **quand** l’utiliser.
- Savoir les **implémenter** efficacement en **JavaScript** (ES modules/classes).
- Éviter les **anti-patterns** (global state, sur-usine, builders inutiles).
- Relier les patterns au **fil rouge e-commerce** (panier, paiement, thèmes UI).

---

## 🧭 Carte mentale ASCII — Famille Créationnelle
```
Patterns de création
  ├─ Singleton      (1 instance partagée)
  ├─ Factory Method (création déléguée à sous-classes)
  ├─ Abstract Factory (familles d'objets cohérentes)
  ├─ Builder        (construction par étapes)
  └─ Prototype      (clonage d'instances existantes)
```

---

# 7.1 — 🔒 Singleton

**Intent** : garantir **une seule instance** et fournir un **point d’accès global contrôlé**.

**Pourquoi** : centraliser **config**, **cache**, **journalisation**. Éviter les **multiples états** contradictoires.

**ASCII — Structure** :
```
[Client] --> [Singleton Config]
             ^ unique instance
```

**JavaScript — Implémentation**
> En JS, un **module** agit déjà comme un **singleton** (export unique). On peut aussi sécuriser via une **classe** et un **accès statique**.
```js
// config.js — singleton par module
const state = { env: 'dev', featureFlags: {} };
export function getConfig(){ return state; }
export function setEnv(env){ state.env = env; }

// alternative: classe singleton
export class AppConfig {
  static #instance;
  constructor(){ if(AppConfig.#instance) throw new Error('Use AppConfig.instance()'); this.env='dev'; this.flags={}; }
  static instance(){ return AppConfig.#instance ??= new AppConfig(); }
}
```

**Pièges & conseils**
- **Global mutable** = **danger** (tests difficiles, couplage caché). Préférer **immutable** ou **API contrôlée**.
- **Singleton caché** via import direct partout → injecter **config** quand c’est critique (DIP).

**Quand utiliser ?** : configuration, **bus d’événements**, **container de services** (avec parcimonie). Éviter pour données métier (panier, commande).

---

# 7.2 — 🏭 Factory Method

**Intent** : **déléguer** la **création** de produits à des **sous-classes** via une **méthode usine**.

**Pourquoi** : permettre de **varier** le **type concret** **sans modifier** le code client (**OCP**).

**ASCII — Structure** :
```
<<Creator>>
+-------------------------+
| ProductFactory          |
| + createProduct(): P    | <--- factory method
+-------------------------+
          ^
          |
  +------------------+    +------------------+
  | TShirtFactory    |    | ShoesFactory     |
  | createProduct()  |    | createProduct()  |
  +------------------+    +------------------+
```

**JavaScript — Implémentation (fil rouge)**
```js
// products/product.js
export class Product { constructor(id, name, price){ this.id=id; this.name=name; this.price=price; } }

// factory/abstract-creator.js
export class ProductFactory { createProduct(){ throw new Error('override'); } }

// factory/tshirt-factory.js
import { Product } from '../products/product.js';
export class TShirtFactory extends ProductFactory {
  createProduct(){ return new Product('tee_'+Date.now(), 'Tee-shirt', 20); }
}

// factory/shoes-factory.js
import { Product } from '../products/product.js';
export class ShoesFactory extends ProductFactory {
  createProduct(){ return new Product('sh_'+Date.now(), 'Chaussures', 50); }
}

// client
import { TShirtFactory } from './factory/tshirt-factory.js';
const factory = new TShirtFactory();
const p = factory.createProduct(); // client ignorent la concrète
```

**Variantes JS** : la **factory method** peut être une **fonction** retournant l’objet selon des **paramètres** (switch → préférer polymorphisme si nombreuses variantes).

**Pièges & conseils**
- Éviter **God Factory** (switch géant). Préférer **sous-classes** ou table de **constructeurs**.
- Trop d’usines pour des objets **simples** → **over-engineering**.

**Quand utiliser ?** : quand la **logique de création** **varie** selon la **concrète** (ex. calcul d’ID, validation spécifique).

---

# 7.3 — 🧰 Abstract Factory

**Intent** : fournir une **interface** pour **créer des familles** d’objets **liés** sans spécifier leurs classes concrètes.

**Pourquoi** : **cohérence** de **thème** ou **plateforme**; **substitution** facile (Dark/Light, Mobile/Web).

**ASCII — Structure (UI Thèmes)** :
```
<<AbstractFactory>> UIThemeFactory
  |-- createButton(): IButton
  |-- createInput():  IInput
      ^                         ^
      |                         |
   +--------+              +--------+
   | Dark   |              | Light  |
   |Factory |              |Factory |
   +--------+              +--------+
      |                         |
  +--------+               +--------+
  |DarkBtn |               |LightBtn|
  +--------+               +--------+
```

**JavaScript — Implémentation (fil rouge UI)**
```js
// ui/contracts.js
export const IButton = { methods:['render'] };
export const IInput  = { methods:['render'] };
export function assertImplements(obj, iface){ const ok=iface.methods.every(m=>typeof obj[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }

// ui/dark.js
export class DarkButton { render(){ return '[DarkButton]'; } }
export class DarkInput  { render(){ return '[DarkInput]'; } }
export class DarkThemeFactory {
  createButton(){ return new DarkButton(); }
  createInput(){ return new DarkInput(); }
}

// ui/light.js
export class LightButton { render(){ return '[LightButton]'; } }
export class LightInput  { render(){ return '[LightInput]'; } }
export class LightThemeFactory {
  createButton(){ return new LightButton(); }
  createInput(){ return new LightInput(); }
}

// client
function renderLogin(themeFactory){
  const btn = themeFactory.createButton();
  const inp = themeFactory.createInput();
  console.log(inp.render(), btn.render());
}
```

**Pièges & conseils**
- **Couplage en étoile** si on **instancie** concrètes partout → **injecter** la **factory**.
- Trop de familles **minuscules** → complexité inutile.

**Quand utiliser ?** : quand plusieurs **objets sont liés** par **thème/plateforme** et doivent rester **cohérents**.

---

# 7.4 — 🧱 Builder

**Intent** : **séparer** la **construction** complexe d’un objet de sa **représentation**, en **étapes** optionnelles et **ordonnables**.

**Pourquoi** : éviter **constructeurs géants** (beaucoup de paramètres), rendre la **création lisible**, **réutiliser** des **scripts de construction** (Director).

**ASCII — Structure** :
```
[Director] --> [Builder]
    |             |-- stepA()
    |             |-- stepB()
    |             |-- build() => Product
    v
[Produit]
```

**JavaScript — Implémentation (commande)**
```js
// order/order.js
export class Order { constructor(){ this.items=[]; this.customer=null; this.address=null; this.notes=[]; }
  total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); }
}

// order/order-builder.js
import { Order } from './order.js';
export class OrderBuilder {
  constructor(){ this.order = new Order(); }
  withCustomer(c){ this.order.customer=c; return this; }
  toAddress(a){ this.order.address=a; return this; }
  addItem(p, qty=1){ this.order.items.push({ id:p.id, price:p.price, qty }); return this; }
  addNote(n){ this.order.notes.push(n); return this; }
  build(){ return this.order; }
}

// order/directors.js
import { OrderBuilder } from './order-builder.js';
export function simpleOrder(p){ return new OrderBuilder().addItem(p,1).build(); }
export function giftOrder(p, customer){ return new OrderBuilder().withCustomer(customer).addItem(p,1).addNote('gift-wrap').build(); }
```

**Pièges & conseils**
- Un **builder** pour un objet **très simple** = **sur-ingénierie**.
- Bien **valider** avant `build()` (invariants), sinon objet **incomplet**.

**Quand utiliser ?** : quand l’objet a **beaucoup d’options** / **étapes** (ex. `fetch` request, `Order` riche).

---

# 7.5 — 🧬 Prototype

**Intent** : créer de nouveaux objets en **clonant** des **instances existantes** (au lieu d’appeler un constructeur).

**Pourquoi** : **répliquer rapidement** des **configurations**; **performances** si la construction est coûteuse; **éviter** dépendances aux classes concrètes.

**ASCII — Structure** :
```
[Prototype] --clone()--> [Nouvelle Instance]
```

**JavaScript — Implémentation**
```js
// prototype/product-prototype.js
export class ProductPrototype {
  constructor(base){ this.base = base; }
  clone(overrides={}){
    const copy = { ...this.base, ...overrides };
    // deep details à considérer; JSON clone simple si objets imbriqués
    return JSON.parse(JSON.stringify(copy));
  }
}

// usage
const proto = new ProductPrototype({ id:'tmpl', name:'Tee', price:20, tags:['basic'] });
const p1 = proto.clone({ id:'tee_001' });
const p2 = proto.clone({ id:'tee_002', price:18 });
```

**Pièges & conseils**
- **Clonage profond** vs **superficiel** : `JSON.parse(JSON.stringify(...))` perd **méthodes**/Date. Pour des classes, implémenter une **méthode `clone()`** manuelle.
- Attention aux **références partagées** (mutations inattendues).

**Quand utiliser ?** : **templates** produit, **config** par défaut clonable.

---

## 🔗 Comparatif rapide — Quand choisir quoi ?
```
Besoin d'une seule instance globale ?       → Singleton
Besoin de varier l'objet créé (par type) ?  → Factory Method
Besoin de familles cohérentes (thèmes) ?    → Abstract Factory
Création complexe par étapes ?               → Builder
Copier un objet existant (template) ?        → Prototype
```

---

## 💻 Intégration fil rouge (exemples chaînés)

### 1) Choisir thème via **Abstract Factory** + **Singleton Config**
```js
import { DarkThemeFactory } from './ui/dark.js';
import { LightThemeFactory } from './ui/light.js';
import { getConfig } from './config.js';

function themeFactoryFromConfig(){
  const { env, featureFlags } = getConfig();
  if(featureFlags.darkMode) return new DarkThemeFactory();
  return new LightThemeFactory();
}
```

### 2) Construire une commande via **Builder** puis payer via **Factory Method**
```js
import { OrderBuilder } from './order/order-builder.js';
import { TShirtFactory } from './factory/tshirt-factory.js';

const product = new TShirtFactory().createProduct();
const order = new OrderBuilder().withCustomer({ id:'c1' }).toAddress({ city:'MTL' }).addItem(product, 2).build();
```

### 3) Dupliquer un **template** produit via **Prototype**
```js
import { ProductPrototype } from './prototype/product-prototype.js';
const baseProto = new ProductPrototype({ id:'base', name:'Hoodie', price:45 });
const hoodies = [1,2,3].map(i => baseProto.clone({ id: 'hood_'+i }));
```

---

## 🧮 Formules & garde-fous en JavaScript

### 1) **Décision arborescente** pour choisir un pattern
```js
function chooseCreationalPattern({ singleInstance, families, variableType, manyOptions, cloneNeeded }){
  if(singleInstance) return 'Singleton';
  if(families) return 'Abstract Factory';
  if(variableType) return 'Factory Method';
  if(manyOptions) return 'Builder';
  if(cloneNeeded) return 'Prototype';
  return 'No pattern needed';
}
```

### 2) **Validation** du Builder (invariants avant build)
```js
export function validateOrderBuilder(builder){
  const o = builder.order;
  const errs = [];
  if(!o.customer) errs.push('customer manquant');
  if(!o.address)  errs.push('address manquante');
  if(o.items.length===0) errs.push('aucun item');
  return { ok: errs.length===0, errors: errs };
}
```

---

## 🚫 Anti-patterns (à surveiller)
- **Singleton omniprésent** (état partagé difficile à tester).
- **Usines partout** pour logic simple → **complexité** inutile.
- **Builder** pour 2 champs → **over-engineering**.
- **Prototype** mal cloné (références partagées).

---

## ✍️ Atelier — Pratique guidée

### Exercice 1 — Singleton Config
Crée un **singleton** pour la **configuration** (env, flags). Ajoute une méthode `enable(flag)` qui active un flag.

### Exercice 2 — Factory Method Paiement
Crée un **creator** `PaymentFactory` et deux sous-classes `CardPaymentFactory`, `PaypalPaymentFactory` qui retournent des implémentations `pay(total)`.

### Exercice 3 — Abstract Factory Thème
Crée une **factory** de thème `MobileThemeFactory` (bouton & input)
qui rend des chaînes `"[MobileButton]"`, `"[MobileInput]"`.

### Exercice 4 — Builder Requête HTTP
Crée `HttpRequestBuilder` avec `withUrl()`, `withHeaders()`, `withBody()`, `build()` qui renvoie `{ url, headers, body }`.

### Exercice 5 — Prototype Produit
Crée un **prototype** pour `{ id, name, price, meta }` et clone-le en changeant `id`.

---

## ✅ Solutions (suggestions)

### Sol. 1 — Singleton Config
```js
const config = { env:'dev', flags:{} };
export const Config = { get(){ return config; }, enable(f){ config.flags[f]=true; } };
```

### Sol. 2 — Factory Method Paiement
```js
class PaymentFactory { create(){ throw new Error('override'); } }
class CardPayment { pay(total){ return { ok: total<=100, tx:'card_'+Date.now() }; } }
class PaypalPayment{ pay(total){ return { ok: total<=200, tx:'pp_'+Date.now() }; } }
export class CardPaymentFactory extends PaymentFactory { create(){ return new CardPayment(); } }
export class PaypalPaymentFactory extends PaymentFactory { create(){ return new PaypalPayment(); } }
```

### Sol. 3 — Abstract Factory Mobile
```js
export class MobileButton { render(){ return '[MobileButton]'; } }
export class MobileInput  { render(){ return '[MobileInput]'; } }
export class MobileThemeFactory { createButton(){ return new MobileButton(); } createInput(){ return new MobileInput(); } }
```

### Sol. 4 — Builder HTTP
```js
export class HttpRequestBuilder {
  constructor(){ this.url=''; this.headers={}; this.body=null; }
  withUrl(u){ this.url=u; return this; }
  withHeaders(h){ Object.assign(this.headers, h); return this; }
  withBody(b){ this.body=b; return this; }
  build(){ return { url:this.url, headers:this.headers, body:this.body }; }
}
```

### Sol. 5 — Prototype Produit
```js
export class ProductProto { constructor(base){ this.base=base; }
  clone(overrides={}){ return JSON.parse(JSON.stringify({ ...this.base, ...overrides })); }
}
```

---

## 🧾 Checklist — Chapitre 7
- [ ] Je sais **quand** utiliser Singleton, Factory Method, Abstract Factory, Builder, Prototype.
- [ ] Je peux dessiner les **structures ASCII**.
- [ ] Je sais **implémenter en JS** (ES modules/classes) chaque pattern.
- [ ] Je connais les **pièges** et **bonnes pratiques**.
- [ ] Je sais les **intégrer** dans un cas réel (fil rouge e-commerce).

---

## 🧠 Mini Quiz
1. Pourquoi un **module ES** agit-il souvent comme un **singleton** en JS ?
2. Quand préférer **Factory Method** à un simple `switch` ?
3. Quel est l’avantage d’**Abstract Factory** pour les **thèmes UI** ?
4. Quand un **Builder** est-il **inapproprié** ?
5. Quel piège majeur avec **Prototype** en JS ?

> Réponses attendues : 1) Les exports d’un module sont **cachés et partagés** (instance unique par chargeur) 2) Quand il existe **plusieurs variantes évolutives**; permet **OCP** 3) **Cohérence** des familles d’objets et **substitution** globale (Dark/Light) 4) Objets **simples** (peu d’options) 5) **Clonage profond** vs **superficiel**, perte des **méthodes**.

---

## 🗂️ Références internes
- Cf. **Chapitre 6** (SOLID/GRASP) — liens forts : OCP/DIP/Polymorphism.
- Cf. **Chapitres 8–9** (Structurels/Comportementaux) — combiner avec Adapter/Strategy/State.
- Cf. **Chapitre 11** (Tests) — valider création et invariants.

---

## 📚 Résumé — Points clés du Chapitre 7
- Les patterns de création **organisent** et **sécurisent** l’**instanciation**.
- **Singleton** : une instance partagée (à utiliser avec **prudence**).
- **Factory Method** : déléguer la création aux **sous-classes**.
- **Abstract Factory** : **familles** d’objets **cohérentes**.
- **Builder** : construction en **étapes** pour objets **complexes**.
- **Prototype** : **cloner** des instances **modèle**.
