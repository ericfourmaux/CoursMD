# 🧭 Chapitre 12 — Choisir un Pattern & Anti-patterns

> **Objectif** : savoir **quand** (et quand **ne pas**) appliquer un pattern. Construire une **démarche de sélection** objective, détecter les **smells** et **anti-patterns**, mener un **refactoring guidé**. Le tout avec **schémas ASCII**, **exemples 100% JavaScript**, **formules d’aide à la décision**, **exercices**, **solutions**, **quiz**, **checklist**.

---

## 🎯 Objectifs d’apprentissage
- Établir une **démarche** claire pour **sélectionner** un pattern (problème → caractéristiques → famille → pattern).
- Reconnaître les **anti-patterns** fréquents (God Object, Spaghetti, Lava Flow, Golden Hammer, etc.).
- Utiliser des **formules JS** pour **objectiver** le choix (complexité, couplage, cohésion, coût).
- Mener un **refactoring** sûr : **petits pas**, **tests**, **mesures**.

---

## 🧭 Démarche de sélection — Arbre ASCII
```
Problème rencontré
  ├─ Instanciation variée / familles cohérentes ? → Créationnels
  │    ├─ 1 instance globale ? → Singleton
  │    ├─ Type dépend de la sous-classe ? → Factory Method
  │    ├─ Familles cohérentes (thème) ? → Abstract Factory
  │    ├─ Construction par étapes ? → Builder
  │    └─ Dupliquer un modèle ? → Prototype
  |
  ├─ Relation d'objets / compatibilité / façade ? → Structurels
  │    ├─ Compatibiliser interfaces ? → Adapter
  │    ├─ Séparer abstraction/implémentation ? → Bridge
  │    ├─ Arbre part/whole ? → Composite
  │    ├─ Ajouter responsabilités dynamiquement ? → Decorator
  │    ├─ Simplifier sous-système ? → Facade
  │    ├─ Réduire mémoire (état partagé) ? → Flyweight
  │    └─ Contrôler l'accès (cache, lazy, remote) ? → Proxy
  |
  └─ Comportement / orchestration / variation ? → Comportementaux
       ├─ Notification multi-listeners ? → Observer
       ├─ Varier un algorithme ? → Strategy
       ├─ Comportement dépend de l'état ? → State
       ├─ Encapsuler action (+ undo) ? → Command
       ├─ Squelette avec étapes ? → Template Method
       ├─ Pipeline de handlers ? → Chain of Responsibility
       ├─ Réduire connexions en étoile ? → Mediator
       ├─ Snapshot/restore ? → Memento
       ├─ Parcours uniforme ? → Iterator
       └─ Opérations sur structure sans la modifier ? → Visitor
```

---

## 🔑 Principes de décision (règles du pouce)
- **Commencer par le problème**, jamais par "choisir un pattern".
- **Privilégier la simplicité** (KISS) avant d’ajouter des couches.
- **SOLID/GRASP** guident la **structure** (cf. Chapitre 6) avant la sélection micro.
- **Mesurer** (complexité, couplage) avant et après.
- **Tester** chaque pas (voir Chapitre 11) pour sécuriser.

---

## 🧮 Outils d’aide à la décision (JavaScript)

### 1) Score de **complexité** (approx.) vs bénéfice attendu
```js
/**
 * Estime la complexité ajoutée par un pattern
 * - layers: nombre de couches additionnelles (ex: Decorator chain)
 * - abstractions: contrats/interfaces/indirections ajoutées
 * - branches: décisions supplémentaires (alt/opt/loop)
 * Retourne un score; plus haut => plus complexe.
 */
export function complexityScore({ layers=0, abstractions=0, branches=0 }){
  const wL=2, wA=3, wB=1; // pondérations simples
  return wL*layers + wA*abstractions + wB*branches;
}

/**
 * Bénéfice attendu (maintenabilité/extensibilité) — notation heuristique
 * - extensibility: 0..5 (capacité d'ajout sans modifier)
 * - decoupling: 0..5 (réduction des dépendances directes)
 * - reuse: 0..5 (réutilisation des composants)
 */
export function benefitScore({ extensibility=0, decoupling=0, reuse=0 }){
  return extensibility + decoupling + reuse; // 0..15
}

export function decisionHint(cx, bn){
  const ratio = bn / (cx || 1);
  return ratio >= 2 ? 'Bénéfice net (pattern recommandé)'
       : ratio >= 1 ? 'Bénéfice borderline (confirmer par tests)'
                     : 'Trop coûteux (rester simple)';
}
```

### 2) **Couplage** & **cohésion** (estimations naïves)
```js
export function estimateCoupling(js){
  const imports=(js.match(/\bimport\b|require\(/g)||[]).length;
  const http=(js.match(/fetch\(/g)||[]).length;
  return { imports, http, score: imports+http };
}

export function approxLCOM(methodFields){
  const methods = Object.keys(methodFields);
  let shared=0, totalPairs=0;
  for(let i=0;i<methods.length;i++){
    for(let j=i+1;j<methods.length;j++){
      totalPairs++;
      const a = methodFields[methods[i]], b = methodFields[methods[j]];
      const inter = [...a].filter(x=>b.has(x)).length;
      if(inter>0) shared++;
    }
  }
  const LCOM = totalPairs - shared;
  return { totalPairs, sharedPairs: shared, LCOM };
}
```

### 3) **Arbre de choix** programmatique
```js
export function choosePattern(opts){
  const { singleInstance, families, variableType, manySteps, cloneNeeded,
          needCompatibility, needAbstractionSplit, treeStructure, dynamicResponsibilities,
          needSimplicity, memoryPressure, accessControl,
          notifyMany, varyAlgorithm, stateDependent, encapsulateAction, templateSkeleton,
          handlerPipeline, needOrchestration, needSnapshot, needIteration, needExternalOperation } = opts;

  if(singleInstance) return 'Singleton';
  if(families) return 'Abstract Factory';
  if(variableType) return 'Factory Method';
  if(manySteps) return 'Builder';
  if(cloneNeeded) return 'Prototype';

  if(needCompatibility) return 'Adapter';
  if(needAbstractionSplit) return 'Bridge';
  if(treeStructure) return 'Composite';
  if(dynamicResponsibilities) return 'Decorator';
  if(needSimplicity) return 'Facade';
  if(memoryPressure) return 'Flyweight';
  if(accessControl) return 'Proxy';

  if(notifyMany) return 'Observer';
  if(varyAlgorithm) return 'Strategy';
  if(stateDependent) return 'State';
  if(encapsulateAction) return 'Command';
  if(templateSkeleton) return 'Template Method';
  if(handlerPipeline) return 'Chain of Responsibility';
  if(needOrchestration) return 'Mediator';
  if(needSnapshot) return 'Memento';
  if(needIteration) return 'Iterator';
  if(needExternalOperation) return 'Visitor';

  return 'No pattern needed';
}
```

---

## 🚫 Anti-patterns (définitions, pourquoi, remèdes)

### 1) **God Object**
**Définition** : classe/module qui **concentre trop** de responsabilités.
**Pourquoi nocif** : couplage fort, faible cohésion, difficile à tester.
**Remède** : **SRP** (Chap. 6), **extraire** services/entités, **interfaces**.

### 2) **Spaghetti Code**
**Définition** : flux **non-structuré** (goto implicites, callbacks en cascade).
**Pourquoi** : illisible, fragile, impossible à tester.
**Remède** : **Séquence/Activité** (Chap. 4), `async/await`, **Mediator/Facade**.

### 3) **Lava Flow**
**Définition** : code **vestigial** jamais nettoyé (features mortes).
**Pourquoi** : bruit, confusion, dette technique.
**Remède** : supprimer, couvrir par tests, documenter.

### 4) **Golden Hammer**
**Définition** : utiliser **toujours** le **même** pattern/techno.
**Pourquoi** : inadaptation, surcoût.
**Remède** : **arbre de décision**, évaluer **bénéfices vs coûts**.

### 5) **Cargo Cult**
**Définition** : appliquer un pattern **sans comprendre** le problème.
**Pourquoi** : complexité inutile.
**Remède** : partir du **Use Case** et **mesures**.

### 6) **Premature Optimization**
**Définition** : optimiser **avant** de mesurer.
**Pourquoi** : temps perdu, complexité.
**Remède** : **metrics**, profiler, cibler **hotspots**.

### 7) **Singleton abuse**
**Définition** : état **global** partout.
**Pourquoi** : tests difficiles, couplage caché.
**Remède** : **DIP**, injection, limiter portée, rendre immuable.

### 8) **Over-engineering**
**Définition** : trop de couches/patterns pour un problème simple.
**Pourquoi** : maintenance coûteuse, latence.
**Remède** : **KISS**, supprimer couches, prouver par **tests**.

---

## 🧰 Smells → Actions (ASCII)
```
Smell: Trop de conditions if/switch
  → Action: Strategy / State
Smell: Beaucoup d'appels circulaires
  → Action: Mediator / Facade
Smell: Doublons de construction d'objet
  → Action: Builder / Factory Method
Smell: API externe difficile
  → Action: Adapter / Facade
Smell: Mémoire élevée pour objets identiques
  → Action: Flyweight
Smell: Code UI connaît le backend
  → Action: Ports/Adapters (DIP) + Facade
```

---

## 🔧 Études de cas rapides (JS)

### Cas 1 — Trop de `if` pour calcul de prix (→ Strategy)
```js
// Avant
function price(items, mode){
  let total=items.reduce((s,x)=>s+x.price*x.qty,0);
  if(mode==='BF') total*=0.7; else if(mode==='CLEAR') total*=0.5; else if(mode==='NONE') total=total;
  return +total.toFixed(2);
}

// Après
class BlackFridayStrategy { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.7; } }
class ClearanceStrategy   { calc(items){ return items.reduce((s,x)=>s+x.price*x.qty,0) * 0.5; } }
class PriceCalculator { constructor(strategy){ this.strategy=strategy; } calc(items){ return +this.strategy.calc(items).toFixed(2); } }
```

### Cas 2 — Couplage UI ↔ HTTP (→ Ports/Adapters + Facade)
```js
// Avant (mauvais)
async function addToCart(id){ const r = await fetch('/products/'+id); const p = await r.json(); /* ... */ }

// Après
export const IProducts = { methods:['get'] };
export class ProductsHTTPAdapter { constructor(baseUrl){ this.baseUrl=baseUrl; } async get(id){ const r=await fetch(`${this.baseUrl}/products/${id}`); return r.json(); } }
export class CheckoutFacade { constructor({ cart, payment, notifier }){ this.cart=cart; this.payment=payment; this.notifier=notifier; } async pay(code){ /* orchestration */ } }
```

### Cas 3 — Multiples décorations (→ Decorator, ordre contrôlé)
```js
class PriceService { async getPrice(id){ return 20; } }
class CacheDeco { constructor(s){ this.s=s; this.c=new Map(); } async getPrice(id){ if(this.c.has(id)) return this.c.get(id); const p=await this.s.getPrice(id); this.c.set(id,p); return p; } }
class LogDeco   { constructor(s){ this.s=s; } async getPrice(id){ console.log('get', id); return this.s.getPrice(id); } }
let svc = new PriceService();
svc = new LogDeco(new CacheDeco(svc)); // log après cache ou avant selon besoin
```

---

## 🛠️ Refactoring guidé — Méthode en 7 pas
1. **Identifier** le smell (symptôme) → écrire un **test** qui échoue.
2. **Mesurer** (complexité/couplage) pour **justifier** l’action.
3. **Choisir** la **famille** puis le **pattern** via l’**arbre**.
4. **Introduire** le pattern **minimement** (petite PR).
5. **Couvrir** par tests (unitaires + intégration).
6. **Re-mesurer** (bénéfice vs coût).
7. **Documenter** (ASCII + decisions.js).

### `decisions.js` — journal de décision
```js
export const decisions = [];
export function recordDecision({ problem, pattern, rationale, metricsBefore, metricsAfter }){
  decisions.push({ problem, pattern, rationale, metricsBefore, metricsAfter, at: new Date().toISOString() });
}
```

---

## ✍️ Atelier — Exercices

### Exercice 1 — Sélection
Écris une fonction `selectForCheckout(context)` qui retourne le **pattern** le plus pertinent (`Facade`, `Mediator`, `Chain`) selon : `{ manyServices, branching, needSimplicity }`.

### Exercice 2 — Smell → Action
Pour un module avec **imports** nombreux et du **fetch** direct dans l’UI, propose un refactoring vers **Ports/Adapters + Facade**, et calcule le **couplage** avant/après.

### Exercice 3 — Anti-pattern
Transforme un **God Object** `ShopManager` (qui calcule, paie, notifie, exporte) en 4 modules SRP (`Order`, `PromoRule`, `Payment`, `Notifier`).

---

## ✅ Solutions (suggestions)

### Sol. 1 — Sélection
```js
export function selectForCheckout({ manyServices, branching, needSimplicity }){
  if(needSimplicity) return 'Facade';
  if(manyServices && !branching) return 'Mediator';
  if(branching) return 'Chain of Responsibility';
  return 'No pattern needed';
}
```

### Sol. 2 — Couplage avant/après
```js
const before = `import x from 'y';\nfetch('/api/pay');\nfetch('/api/products');`;
const after = `import { IPayment, IProducts } from './ports.js';\nimport { PaymentHTTPAdapter } from './payment-http-adapter.js';\nimport { ProductsHTTPAdapter } from './products-http-adapter.js';`;
console.log('before:', estimateCoupling(before));
console.log('after:', estimateCoupling(after));
```

### Sol. 3 — God Object → SRP
```js
class Order { constructor(items=[]){ this.items=items; } total(){ return this.items.reduce((s,x)=>s+x.price*x.qty,0); } }
class PromoRule { apply(total, code){ return code==='WELCOME10' ? +(total*0.9).toFixed(2) : total; } }
class Payment { async pay(total){ return { ok: total<=100, tx:'tx_'+Date.now() }; } }
class Notifier { async email(data){ console.log('Email', data); return true; } }
```

---

## 🧾 Checklist — Chapitre 12
- [ ] Je pars du **problème**, pas du pattern.
- [ ] Je sais naviguer la **famille** puis le **pattern**.
- [ ] Je reconnais les **anti-patterns** et je sais proposer un **remède**.
- [ ] J’utilise **mesures JS** pour objectiver le choix.
- [ ] Je refactorise **par petits pas**, avec **tests** et **journal** de décision.

---

## 🧠 Mini Quiz
1. Différence entre **Adapter** et **Facade** dans un contexte front ?
2. Quand préférer **Strategy** plutôt que des `if/switch` ?
3. Quel anti-pattern est typique d’un **état global** mal maîtrisé ?
4. Comment détecter un **God Object** ?
5. Que signifie **over-engineering** et comment l’éviter ?

> Réponses attendues : 1) Adapter **convertit** un contrat; Facade **oriente** / simplifie l’orchestration 2) Quand l’algo varie souvent et doit être **interchangeable** 3) **Singleton abuse** 4) Trop de responsabilités, métriques (LCOM élevé), tests difficiles 5) Ajouter des couches sans besoin; appliquer **KISS**, mesurer et tester.

---

## 🗂️ Références internes
- Cf. **Chapitre 6** (SOLID/GRASP) pour les **principes**.
- Cf. **Chapitres 7–9** pour les **familles de patterns**.
- Cf. **Chapitre 11** pour la **méthode de test**.
- Cf. **Chapitre 10** pour **ports/adapters/facade** côté front.

---

## 📚 Résumé — Points clés du Chapitre 12
- **Choisir un pattern** = **répondre** à un **problème spécifique** (instanciation, structure, comportement), pas une fin en soi.
- Les **anti-patterns** signalent des **symptômes** (couplage fort, complexité, global state, flux confus) — **remèdes** via principes & patterns.
- Les **formules JS** aident à **objectiver** la décision (complexité, couplage, cohésion, bénéfice).
- Un **refactoring guidé** et **testé** réduit la dette technique **sans** sur-ingénierie.
