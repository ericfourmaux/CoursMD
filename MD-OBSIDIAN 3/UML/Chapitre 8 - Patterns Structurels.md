# 🧱 Chapitre 8 — Patterns Structurels (GoF)

> **Objectif** : maîtriser les **patterns structurels** qui organisent les **relations entre objets** et **modules** pour gagner en **compatibilité**, **extensibilité**, **simplicité**, **performance** et **encapsulation**. Nous couvrons **Adapter**, **Bridge**, **Composite**, **Decorator**, **Facade**, **Flyweight**, **Proxy** avec **intent**, **pourquoi**, **schémas ASCII**, **implémentations 100% JavaScript**, **pièges**, **exercices**, **solutions**, **quiz**, **checklist** et **formules JS**.

---

## 🎯 Objectifs d’apprentissage
- Comprendre l’**intent** précis de chaque pattern structurel et **quand** l’appliquer.
- Savoir **modéliser en ASCII** et **implémenter en JavaScript** (ES modules/classes).
- Éviter les **anti-patterns** (over-engineering, couplage caché, fuites d’état).
- Mesurer **impact performance/mémoire** (Flyweight, Proxy cache) avec **formules JS**.

---

## 🧭 Carte mentale ASCII — Famille Structurelle
```
Structurels
  ├─ Adapter    (compatibilise une interface à une autre)
  ├─ Bridge     (sépare abstraction et implémentation)
  ├─ Composite  (arbre part/whole; uniformiser feuilles/composites)
  ├─ Decorator  (ajoute des responsabilités dynamiquement)
  ├─ Facade     (simplifie un sous-système complexe)
  ├─ Flyweight  (partage état intrinsèque pour réduire mémoire)
  └─ Proxy      (substitut contrôlant l'accès: cache, lazy, remote)
```

---

# 8.1 — 🔌 Adapter

**Intent** : **convertir** l’**interface** d’un composant pour la rendre **compatible** avec un client qui attend un **contrat différent**.

**Pourquoi** : intégrer un **SDK/API** existant sans réécrire le client; **réutiliser** code.

**ASCII — Structure** :
```
[Client] --> [IProducts]
             ^
             |
     [Adapter ProductsHTTP]
             ^
             |
        [API REST /products]
```

**JavaScript — Implémentation (fil rouge)**
```js
// ports.js (contrat cible)
export const IProducts = { methods:['list','get'] };
export function assertImplements(o, iface){ const ok=iface.methods.every(m=>typeof o[m]==='function'); if(!ok) throw new Error('Contrat non respecté'); }

// adapter
export class ProductsHTTPAdapter {
  constructor(baseUrl){ this.baseUrl = baseUrl; }
  async list(){ const r = await fetch(`${this.baseUrl}/products`); return r.json(); }
  async get(id){ const r = await fetch(`${this.baseUrl}/products/${id}`); return r.json(); }
}
assertImplements(new ProductsHTTPAdapter('https://api.example'), IProducts);
```

**Pièges** :
- Adapter qui **fuit** des **détails** du backend (couple le client).
- Multiplication d’adapters redondants → favoriser **réutilisation**.

**Quand** : migration d’API, intégration tierce, compatibilité rétro.

---

# 8.2 — 🌉 Bridge

**Intent** : **découpler** une **abstraction** de son **implémentation** pour les **varier indépendamment**.

**Pourquoi** : éviter explosion de classes `AbstractionXImplY`, faciliter **switch** d’implémentation.

**ASCII — Structure (UI renderer)** :
```
<<Abstraction>> View
   |-- draw() --> uses --> <<Implementor>> Renderer
                                  |-- drawButton()
                                  |-- drawInput()
        ^                                  ^
        |                                  |
   LoginView                         CanvasRenderer / DOMRenderer
```

**JavaScript — Implémentation**
```js
// implementors
export class DOMRenderer { drawButton(){ return '<button>OK</button>'; } drawInput(){ return '<input />'; } }
export class CanvasRenderer { drawButton(){ return '[btn]'; } drawInput(){ return '[inp]'; } }

// abstraction
export class View {
  constructor(renderer){ this.renderer = renderer; }
  draw(){ /* défini par sous-classes */ }
}

export class LoginView extends View {
  draw(){ return this.renderer.drawInput() + ' ' + this.renderer.drawButton(); }
}

// usage
const viewDOM = new LoginView(new DOMRenderer());
const viewCanvas = new LoginView(new CanvasRenderer());
console.log(viewDOM.draw(), viewCanvas.draw());
```

**Pièges** :
- Glisser vers **Adapter** si l’on ne sépare pas **abstraction/implémentation**.
- Trop fine granularité des implémentors = surcharge.

**Quand** : switch de **technologie** (DOM/canvas), de **drivers** (DB), de **format** (JSON/XML).

---

# 8.3 — 🌲 Composite

**Intent** : composer des objets en **structure arborescente** (partie-tout) et **uniformiser** l’accès aux **feuilles** et **composites**.

**Pourquoi** : manipuler **indifféremment** un **groupe** ou un **élément** simple.

**ASCII — Structure (menu UI)** :
```
[Menu] (Composite)
  ├─ [Item: Accueil] (Leaf)
  ├─ [Item: Boutique] (Leaf)
  └─ [Sous-menu] (Composite)
       ├─ [Item: Panier]
       └─ [Item: Commandes]
```

**JavaScript — Implémentation**
```js
export class MenuComponent { render(){ throw new Error('abstract'); } }
export class MenuItem extends MenuComponent { constructor(label){ super(); this.label=label; } render(){ return `* ${this.label}`; } }
export class MenuComposite extends MenuComponent {
  constructor(label){ super(); this.label=label; this.children=[]; }
  add(child){ this.children.push(child); }
  render(){ return ['- '+this.label, ...this.children.map(c=>c.render())].join('\n'); }
}

// usage
const root = new MenuComposite('Menu');
root.add(new MenuItem('Accueil'));
root.add(new MenuItem('Boutique'));
const sub = new MenuComposite('Plus');
sub.add(new MenuItem('Panier')); sub.add(new MenuItem('Commandes'));
root.add(sub);
console.log(root.render());
```

**Pièges** :
- Remonter des **détails** spécifiques des feuilles au composite (casse l’uniformité).
- **Cycles** (un composite enfant de lui-même) → valider à l’ajout.

**Quand** : menus, arbres DOM virtuels, catégories/produits hiérarchiques.

---

# 8.4 — 🎨 Decorator

**Intent** : attacher **dynamiquement** des **responsabilités** à un objet **sans modifier** son code.

**Pourquoi** : **étendre** comportement (log, cache, validation, thème) **à la volée**.

**ASCII — Structure** :
```
[Service] <- [Decorator: Logging] <- [Decorator: Cache]
   ^                                     ^
   |                                     |
  client -------------------------------> |
```

**JavaScript — Implémentation (fil rouge)**
```js
// service de prix
export class PriceService { async getPrice(productId){ return 20; } }

// decorators
export class LoggingDecorator {
  constructor(service){ this.service = service; }
  async getPrice(productId){ console.log('[LOG] price for', productId); return this.service.getPrice(productId); }
}

export class CacheDecorator {
  constructor(service){ this.service = service; this.cache = new Map(); }
  async getPrice(productId){ if(this.cache.has(productId)) return this.cache.get(productId); const p = await this.service.getPrice(productId); this.cache.set(productId, p); return p; }
}

// composition
let svc = new PriceService();
svc = new LoggingDecorator(svc);
svc = new CacheDecorator(svc);
```

**Pièges** :
- Ordre des decorators **important** (cache avant/après log).  
- Empilement excessif ⇒ **latence**.

**Quand** : ajouter **concernes transverses** sans toucher au service.

---

# 8.5 — 🧰 Facade

**Intent** : fournir une **interface simplifiée** à un **sous-système complexe**.

**Pourquoi** : réduire le **couplage** et **masquer** la complexité.

**ASCII — Structure** :
```
[Client] --> [Facade Checkout]
               |
               +--> [Cart] + [Payment] + [Notifier] + [Promo]
```

**JavaScript — Implémentation (fil rouge)**
```js
export class CheckoutFacade {
  constructor({ cart, payment, notifier, promo }){ this.cart=cart; this.payment=payment; this.notifier=notifier; this.promo=promo; }
  async pay(code){ let total=this.cart.total(); total=this.promo.apply(total, code); const r=await this.payment.pay(total); if(r.ok) await this.notifier.email({ total, tx:r.tx }); return r; }
}
```

**Pièges** :
- Facade qui **refait** toute la logique ⇒ duplications. Garder **orchestration**.

**Quand** : exposer un **API** propre au front, simplifier intégration.

---

# 8.6 — 🪶 Flyweight

**Intent** : **partager** l’**état intrinsèque** entre objets pour **réduire la mémoire**; l’état **extrinsèque** est **fourni** au moment de l’utilisation.

**Pourquoi** : éviter **milliers d’objets** identiques qui dupliquent les mêmes données.

**ASCII — Structure** :
```
[FlyweightFactory] --get(key)--> [Flyweight] (intrinsic)
    usage: operation(context extrinsic)
```

**JavaScript — Implémentation (catalogue)**
```js
// flyweight/product-factory.js
export class ProductFlyweightFactory {
  constructor(){ this.pool = new Map(); }
  get(base){ const key = JSON.stringify(base); if(!this.pool.has(key)) this.pool.set(key, { ...base }); return this.pool.get(key); }
}

// usage: même base partagée, état extrinsèque au besoin
const f = new ProductFlyweightFactory();
const base = { name:'Tee', price:20, tags:['basic'] };
const shared = f.get(base);
const items = Array.from({ length: 1000 }, (_,i) => ({ ...shared, id:'tee_'+i }));
```

**Pièges** :
- Confondu avec **cache**; ici on **partage** l’état intrinsèque, pas forcément mémoriser le résultat.
- Mauvaise séparation **intrinsèque/extrinsèque** ⇒ bénéfice réduit.

**Quand** : icônes/tiles UI, caractères, particules, catalogue base répété.

**Formule JS — Estimation gain mémoire**
```js
function estimateFlyweightSavings(itemCount, intrinsicBytes, extrinsicBytes){
  // Sans flyweight: itemCount * (intrinsic + extrinsic)
  // Avec flyweight: 1 * intrinsic + itemCount * extrinsic
  const noFly = itemCount * (intrinsicBytes + extrinsicBytes);
  const withFly = intrinsicBytes + itemCount * extrinsicBytes;
  const saved = noFly - withFly;
  return { noFly, withFly, saved, savingPct: +(saved / noFly * 100).toFixed(2) };
}
console.log(estimateFlyweightSavings(1000, 500, 50)); // ex.
```

---

# 8.7 — 🛡️ Proxy

**Intent** : fournir un **substitut** contrôlant l’**accès** à un objet; typiques : **Cache**, **Lazy**, **Remote**, **Protection**.

**Pourquoi** : **performances**, **contrôle d’accès**, **retard** d’instanciation, **communication distante**.

**ASCII — Structure (cache)** :
```
[Client] --> [Proxy: ProductsCache] --> [RealSubject: ProductsHTTP]
```

**JavaScript — Implémentation (cache fetch)**
```js
export class ProductsHTTP { constructor(baseUrl){ this.baseUrl=baseUrl; } async list(){ const r = await fetch(`${this.baseUrl}/products`); return r.json(); } }
export class ProductsCacheProxy {
  constructor(real){ this.real = real; this.cache = null; this.ttlMs = 5_000; this.last = 0; }
  async list(){ const now = Date.now(); if(this.cache && (now - this.last) < this.ttlMs) return this.cache; const data = await this.real.list(); this.cache = data; this.last = now; return data; }
}
```

**Pièges** :
- Cache **stale** (TTL mal réglé), **invalidation** manquante.
- Proxy qui **fuit** l’implémentation réelle (retourne types internes).

**Formule JS — Taux de hit cache**
```js
function cacheHitRate(totalRequests, hits){ if(totalRequests<=0) return 0; return +(hits/totalRequests*100).toFixed(2); }
console.log(cacheHitRate(100, 63));
```

**Quand** : appels HTTP, accès fichiers, images, calculs coûteux.

---

## 🔗 Choisir le bon pattern — Arbre ASCII
```
Compatibilité d'interface ?          → Adapter
Abstraction ≠ Implémentation ?        → Bridge
Structure en arbre part/whole ?       → Composite
Ajout dynamique de responsabilités ?  → Decorator
API trop complexe côté client ?       → Facade
Trop d'objets identiques ?            → Flyweight
Besoin de contrôler l'accès ?         → Proxy
```

---

## 💻 Intégration fil rouge

### 1) Facade + Adapter
```js
// facade Checkout + adapters IProducts/IPayment pour isoler le front
```

### 2) Decorator + Proxy
```js
// Decorator pour logging + Proxy cache sur accès catalogue
```

### 3) Bridge pour le rendu UI
```js
// Vue abstraite (LoginView) + Renderers (DOM/Canvas)
```

---

## 🚫 Anti-patterns transverses
- **Facade God** : facade qui **refait** toute la logique métier.
- **Decorator spaghetti** : trop de couches, difficile à tracer.
- **Composite sur-détaillé** : profondeur inutile.
- **Bridge inutile** : si une seule implémentation est prévue.
- **Adapter paresseux** : expose l’API **exacte** du backend (aucun gain).

---

## ✍️ Atelier — Pratique guidée

### Exercice 1 — Adapter
Écrire `ReviewsHTTPAdapter` qui adapte l’API `/reviews?productId=...` au contrat `IReviews { listByProduct(id) }`.

### Exercice 2 — Bridge
Créer `ReportView` abstraite avec deux implémentations `PDFRenderer` (string `"[PDF ..]"`) et `HTMLRenderer` (string `"<div>..</div>"`).

### Exercice 3 — Composite
Construire une arborescence `Category` (composite) et `ProductLeaf` (feuille) avec méthode `render()` uniformisée.

### Exercice 4 — Decorator
Ajouter un `RetryDecorator` autour d’un service HTTP (`getPrice`) pour **réessayer** 2 fois avant échec.

### Exercice 5 — Flyweight
Factoriser des `Tile` de carte (couleur/texture intrinsèques) avec `TileFlyweightFactory`.

### Exercice 6 — Proxy
Créer `ImageProxy` avec **lazy loading** (`load()` déclenche effectivement le fetch au premier accès seulement).

---

## ✅ Solutions (suggestions)

### Sol. 1 — Adapter Reviews
```js
export const IReviews = { methods:['listByProduct'] };
export class ReviewsHTTPAdapter {
  constructor(baseUrl){ this.baseUrl=baseUrl; }
  async listByProduct(id){ const r = await fetch(`${this.baseUrl}/reviews?productId=${id}`); return r.json(); }
}
```

### Sol. 2 — Bridge ReportView
```js
export class HTMLRenderer { renderSection(t){ return `<section>${t}</section>`; } }
export class PDFRenderer  { renderSection(t){ return `[PDF:${t}]`; } }
export class ReportView {
  constructor(renderer){ this.renderer=renderer; }
  render(title){ return this.renderer.renderSection(title); }
}
```

### Sol. 3 — Composite Category/Product
```js
export class CatalogComponent { render(){ throw new Error('abstract'); } }
export class ProductLeaf extends CatalogComponent { constructor(name){ super(); this.name=name; } render(){ return `* ${this.name}`; } }
export class Category extends CatalogComponent { constructor(name){ super(); this.name=name; this.children=[]; } add(c){ this.children.push(c); } render(){ return ['- '+this.name, ...this.children.map(x=>x.render())].join('\n'); } }
```

### Sol. 4 — Decorator Retry
```js
export class RetryDecorator {
  constructor(service, max=2){ this.service=service; this.max=max; }
  async getPrice(productId){ for(let i=0;i<=this.max;i++){ try{ return await this.service.getPrice(productId); } catch(e){ if(i===this.max) throw e; } } }
}
```

### Sol. 5 — Flyweight Tile
```js
export class TileFlyweightFactory { constructor(){ this.pool=new Map(); } get(base){ const k=JSON.stringify(base); if(!this.pool.has(k)) this.pool.set(k, base); return this.pool.get(k); } }
```

### Sol. 6 — Proxy Image lazy
```js
export class Image { constructor(url){ this.url=url; this.data=null; } async load(){ /* fetch... */ this.data = `[DATA:${this.url}]`; return this.data; } }
export class ImageProxy { constructor(url){ this.real=null; this.url=url; } async load(){ if(!this.real){ this.real=new Image(this.url); } return this.real.load(); } }
```

---

## 🧾 Checklist — Chapitre 8
- [ ] Je sais **quand** appliquer Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.
- [ ] Je peux dessiner les **structures ASCII**.
- [ ] Je sais **implémenter en JS** chaque pattern.
- [ ] J’identifie les **pièges** et **bonnes pratiques**.
- [ ] Je peux **estimer** gains mémoire/cache via **formules JS**.

---

## 🧠 Mini Quiz
1. Quelle différence clé entre **Adapter** et **Facade** ?
2. Pourquoi **Bridge** évite l’explosion de classes ?
3. Quel est l’**état intrinsèque** en **Flyweight** ? Donne un exemple.
4. Citez **deux** usages typiques du **Proxy**.
5. Quel piège courant avec **Decorator** ?

> Réponses attendues : 1) Adapter **convertit** une interface; Facade **simplifie** un sous-système 2) Abstraction et implémentation évoluent **indépendamment** 3) Partie **partagée** immuable/extrinsèque fourni à l’usage (ex. style d’icône) 4) Cache, Lazy, Remote, Protection 5) Ordre et empilement entraînent **latence** et complexité.

---

## 🗂️ Références internes
- Cf. **Chapitre 6** (SOLID/GRASP) pour les **principes** (OCP/DIP) qui motivent ces patterns.
- Cf. **Chapitre 7** (Créationnels) et **Chapitre 9** (Comportementaux) pour combiner proprement.
- Cf. **Chapitre 11** (Tests) pour vérifier **cache**, **composition**, **décoration**.

---

## 📚 Résumé — Points clés du Chapitre 8
- Les **patterns structurels** organisent les **relations** et **interconnexions**.
- **Adapter** compatibilise, **Bridge** sépare abstraction/implémentation, **Composite** uniformise un arbre, **Decorator** ajoute des responsabilités, **Facade** simplifie, **Flyweight** économise la mémoire, **Proxy** contrôle l’accès.
- Les **implémentations JS** (modules/classes) facilitent ces patterns avec peu de code.
- Des **formules JS** aident à **quantifier** les gains (Flyweight) et **observabilité** (Proxy cache).
