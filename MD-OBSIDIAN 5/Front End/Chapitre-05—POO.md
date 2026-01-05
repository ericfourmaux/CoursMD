
# 📘 Chapitre 5 — POO, S.O.L.I.D, MVC & Design Patterns

> 🎯 **Objectifs du chapitre**
> - Maîtriser la **POO en JavaScript** (encapsulation, héritage vs composition, polymorphisme).
> - Appliquer les **principes S.O.L.I.D** avec des exemples concrets en JS.
> - Comprendre et implémenter une **architecture MVC** côté Front (vanilla JS) avec **EventBus** et **modules**.
> - Connaître et utiliser les **design patterns** courants (Observer, Strategy, Factory, Adapter, Decorator, Proxy, Singleton – avec anti‑patterns et alternatives).
> - Concevoir un **mini‑framework MVC** et un **petit projet** (liste + filtres + état) testable et évolutif.

---

## 🧠 1. Paradigme Objet en JavaScript

### 🔍 Définition
La **programmation orientée objet (POO)** organise le code autour d’**objets** qui encapsulent **état** (données) et **comportements** (méthodes). En JS, les **classes ES6** sont un sucre syntaxique sur la **chaîne de prototypes**.

### ❓ Pourquoi
- **Lisibilité**: regroupe les responsabilités.
- **Réutilisation**: favorise la composition et la modularité.
- **Évolution**: isole l’impact des changements.

### 💡 Exemple — Encapsulation & champs privés
```js
class CompteBancaire {
  #solde = 0; // champ privé
  constructor(titulaire){ this.titulaire = titulaire; }
  deposer(montant){ if(montant <= 0) throw new Error('Montant invalide'); this.#solde += montant; }
  retirer(montant){ if(montant > this.#solde) throw new Error('Solde insuffisant'); this.#solde -= montant; }
  get solde(){ return this.#solde; }
}
const c = new CompteBancaire('Eric');
c.deposer(100); c.retirer(40);
console.log(c.solde); // 60
```

### 🗺 Schéma — objet & interface
```
[ CompteBancaire ]
  ├─ +deposer(montant)
  ├─ +retirer(montant)
  └─ +solde (getter)
```

### ✅ Bonnes pratiques
- **Encapsulation**: exposer une **API claire**; masquer l’état interne.
- **Composition > héritage** pour éviter les hiérarchies profondes.
- **Interfaces implicites**: documenter les contrats (méthodes attendues).

---

## 🧠 2. Héritage vs Composition

### 🔍 Définition
- **Héritage**: une classe dérive d’une autre (`extends`), partage API et état.
- **Composition**: un objet **contient**/assemble d’autres objets pour obtenir un comportement.

### ❓ Pourquoi privilégier la composition
- Réduit le **couplage**.
- Permet le **remplacement** de composants.
- Favorise les **tests** (mocks).

### 💡 Exemple — Composition
```js
class Logger { info(msg){ console.log('[INFO]', msg); } }
class ServiceUtilisateur {
  constructor({ logger }){ this.logger = logger; }
  creer(user){ /* ... */ this.logger.info(`Créé: ${user.name}`); }
}
const svc = new ServiceUtilisateur({ logger: new Logger() });
```

### 💡 Exemple — Héritage (à utiliser avec parcimonie)
```js
class VueBase { mount(el){ this.el = el; } }
class VueProfil extends VueBase { render(data){ this.el.textContent = data.name; } }
```

### ⚠️ Attention
L’héritage **profond** rigidifie; préférez des **petites classes** composables.

---

## 🧠 3. Polymorphisme

### 🔍 Définition
Le **polymorphisme** permet d’appeler la **même méthode** sur des **objets différents** qui respectent un **contrat**.

### 💡 Exemple — Strategy de rendu
```js
class RenduMarkdown { format(txt){ return `**${txt}**`; } }
class RenduHTML { format(txt){ return `<strong>${txt}</strong>`; } }
function afficher(txt, moteur){ return moteur.format(txt); }

afficher('Salut', new RenduMarkdown()); // **Salut**
afficher('Salut', new RenduHTML());    // <strong>Salut</strong>
```

---

## 🧠 4. Principes S.O.L.I.D (avec JS)

### 🔍 S — Single Responsibility Principle (SRP)
**Définition**: Une classe doit avoir **une seule raison de changer**.
**Pourquoi**: Facilite les tests et limite les effets de bord.
**Exemple**:
```js
class RapportService { // Formatage séparé
  constructor({ repo, formatter }){ this.repo = repo; this.formatter = formatter; }
  async rapportMensuel(){ const data = await this.repo.fetchMensuel(); return this.formatter.format(data); }
}
```

### 🔍 O — Open/Closed Principle (OCP)
**Définition**: **Ouvert à l’extension**, **fermé à la modification**.
**Pourquoi**: Ajouter des fonctionnalités sans casser l’existant.
**Exemple**:
```js
class PrixFormatter { format(x){ return `${x.toFixed(2)} €`; } }
class PrixFormatterUSD extends PrixFormatter { format(x){ return `$${x.toFixed(2)}`; } }
```

### 🔍 L — Liskov Substitution Principle (LSP)
**Définition**: Les sous‑types doivent pouvoir **remplacer** le type de base **sans altérer** la logique.
**Pourquoi**: Évite des surprises (préconditions postconditions modifiées).
**Exemple (anti‑exemple)**:
```js
class Rectangle { setLargeur(w){ this.w=w; } setHauteur(h){ this.h=h; } }
class Carre extends Rectangle { setLargeur(w){ this.w=this.h=w; } setHauteur(h){ this.w=this.h=h; } }
// Carre viole LSP: changer largeur modifie hauteur.
```

### 🔍 I — Interface Segregation Principle (ISP)
**Définition**: Préférer **plusieurs petites interfaces** à une interface **grosse**.
**Pourquoi**: Évite d’imposer des méthodes inutiles.
**Exemple**:
```js
class Printable { print(){ /* ... */ } }
class Serializable { toJSON(){ /* ... */ } }
```

### 🔍 D — Dependency Inversion Principle (DIP)
**Définition**: Dépendre d’**abstractions** plutôt que d’implémentations.
**Pourquoi**: Testabilité, substitution, découplage.
**Exemple — Mini DI container en JS**:
```js
class Container {
  constructor(){ this.reg = new Map(); }
  register(token, factory){ this.reg.set(token, factory); }
  resolve(token){ const f = this.reg.get(token); if(!f) throw new Error('Not registered'); return f(this); }
}
// Usage
const C = new Container();
C.register('logger', () => ({ log: console.log }));
C.register('repo', () => ({ fetchMensuel: async () => [{ total: 100 }] }));
C.register('formatter', () => ({ format: (xs) => JSON.stringify(xs) }));
C.register('rapportService', (c) => new RapportService({ repo: c.resolve('repo'), formatter: c.resolve('formatter') }));
const service = C.resolve('rapportService');
```

---

## 🧠 5. MVC côté Front (vanilla JS)

### 🔍 Définition
**MVC** sépare **Modèle** (données/état), **Vue** (affichage) et **Contrôleur** (logique/interaction).

### ❓ Pourquoi
- **Séparation des responsabilités**.
- **Testabilité**: le modèle et les contrôleurs se testent sans DOM.
- **Évolutivité**: on remplace la Vue (ex. passer à Vue 3) tout en conservant le modèle.

### 🗺 Schéma ASCII
```
[Controller] --(actions)--> [Model]
     |                          |
 (écoute événements)       (notifie)
     v                          v
   [View] <----------------- EventBus
```

### 💡 EventBus (Observer)
```js
class EventBus {
  constructor(){ this.map = new Map(); }
  on(type, h){ const xs=this.map.get(type)||[]; xs.push(h); this.map.set(type, xs); }
  off(type, h){ const xs=this.map.get(type)||[]; this.map.set(type, xs.filter(fn=>fn!==h)); }
  emit(type, detail){ for(const h of (this.map.get(type)||[])) h(detail); }
}
```

### 💡 Modèle, Vue, Contrôleur (exemple liste/todo)
```js
class TodoModel {
  constructor(bus){ this.bus=bus; this.items=[]; }
  add(title){ this.items.push({ id: crypto.randomUUID(), title, done:false }); this.bus.emit('model:changed', this.items); }
  toggle(id){ const it=this.items.find(x=>x.id===id); if(it){ it.done=!it.done; this.bus.emit('model:changed', this.items); } }
}

class TodoView {
  constructor(root, bus){ this.root=root; this.bus=bus; bus.on('model:changed', (items)=>this.render(items)); }
  render(items){
    this.root.innerHTML = `<ul class="todos">${items.map(i=>`
      <li class="todo" data-id="${i.id}">
        <label><input type="checkbox" ${i.done?'checked':''}/> ${i.title}</label>
      </li>`).join('')}</ul>`;
  }
}

class TodoController {
  constructor(model, view){ this.model=model; this.view=view; }
  bind(root){
    root.addEventListener('submit', (e)=>{ e.preventDefault(); const title=e.target.elements.title.value.trim(); if(title) this.model.add(title); e.target.reset(); });
    root.addEventListener('change', (e)=>{ const item=e.target.closest('.todo'); if(!item) return; this.model.toggle(item.dataset.id); });
  }
}
```

### 💡 Bootstrap
```html
<form id="app"><input name="title" placeholder="Ajouter" /><button>Ajouter</button><div id="list"></div></form>
<script type="module">
  const bus = new EventBus();
  const model = new TodoModel(bus);
  const view = new TodoView(document.getElementById('list'), bus);
  const ctrl = new TodoController(model, view);
  ctrl.bind(document.getElementById('app'));
</script>
```

### ✅ Bonnes pratiques MVC
- **Unidirectionnel**: contrôleur → modèle → (notifie) → vue.
- **Vue passive**: pas de logique métier dans la vue.
- **Bus d’événements**: éviter les couplages directs.

---

## 🧠 6. Design Patterns en JS

### 📦 Observer
**Définition**: notifie des observateurs d’un changement d’état.
**Pourquoi**: Découple l’émetteur des consommateurs.
**Exemple**: `EventBus` ci‑dessus, ou `EventTarget` natif.

### 📦 Strategy
**Définition**: encapsule des **algorithmes** interchangeables.
**Pourquoi**: Remplacer un algo sans toucher aux usages.
**Exemple**: Rendu Markdown/HTML (plus haut), ou tri avec comparateurs.
```js
function sortBy(xs, cmp){ return xs.slice().sort(cmp); }
const byName = (a,b)=>a.name.localeCompare(b.name);
const byAge  = (a,b)=>a.age-b.age;
sortBy(users, byName); sortBy(users, byAge);
```

### 📦 Factory / Abstract Factory
**Définition**: centralise la **création** d’objets.
**Pourquoi**: masquer la complexité; faciliter les **tests**.
```js
function createRepo(env){
  if(env==='prod') return { get: async(id)=>{/* API */} };
  return { get: async(id)=>({ id, mock:true }) }; // dev
}
```

### 📦 Adapter
**Définition**: **adapte** une API à une autre forme.
**Pourquoi**: réutiliser du code ou des libs avec une interface commune.
```js
class LegacyCache { put(k,v){ /* ... */ } get(k){ /* ... */ } }
class ModernCacheAdapter {
  constructor(legacy){ this.legacy=legacy; }
  set(k,v){ this.legacy.put(k,v); }
  get(k){ return this.legacy.get(k); }
}
```

### 📦 Decorator
**Définition**: **ajoute** dynamiquement des responsabilités sans modifier la classe.
**Pourquoi**: composition de fonctionnalités.
```js
function withLog(fn){ return (...args)=>{ console.time('fn'); const r=fn(...args); console.timeEnd('fn'); return r; }; }
const compute = withLog((x)=>x*x);
```

### 📦 Proxy (ES6 `Proxy`)
**Définition**: intercepte les **accès** à un objet.
**Pourquoi**: validation, **réactivité** (comme Vue), caches.
```js
const state = { count: 0 };
const reactive = new Proxy(state, {
  set(obj, key, val){ console.log('set', key, val); obj[key]=val; return true; }
});
reactive.count++;
```

### 📦 Singleton (⚠️ Anti‑pattern)
**Définition**: instance **unique** globale.
**Pourquoi**: peut créer **couplage** fort, **tests** difficiles.
**Alternative**: passer les dépendances via **DI**/constructeur (voir DIP).
```js
// Éviter:
class GlobalConfig { static instance = new GlobalConfig(); }
// Préférer:
class Config { constructor(data){ this.data=data; } }
```

---

## 🧠 7. Cohésion, Couplage & Mesures (formules JS simplifiées)

### 🔍 Définition
- **Cohésion**: unité logique des responsabilités d’un module.
- **Couplage**: degré d’**interdépendance** entre modules.

### 💡 Estimation simple du couplage (sur un graphe d’imports)
```js
// Graphe: { module: [deps...] }
function couplingIndex(graph){
  let edges = 0; const nodes = Object.keys(graph).length;
  for(const deps of Object.values(graph)) edges += deps.length;
  const density = edges / (nodes * (nodes-1)); // 0..1 (approx)
  return density; // plus proche de 1 → couplage élevé
}
```

---

## 🧠 8. Mini‑framework MVC — Livrable

### 📦 Objectif
Construire un **mini‑framework MVC** vanilla JS (liste + filtres + état), testable (contrôleur et modèle séparés).

### 💡 Structure des fichiers
```
src/
  bus.js
  model.js
  view.js
  controller.js
  index.html
```

### 💡 bus.js
```js
export class EventBus { constructor(){ this.map = new Map(); }
  on(t,h){ const xs=this.map.get(t)||[]; xs.push(h); this.map.set(t,xs); }
  emit(t,d){ for(const h of (this.map.get(t)||[])) h(d); }
}
```

### 💡 model.js
```js
import { EventBus } from './bus.js';
export class Store {
  constructor(bus){ this.bus=bus; this.items=[]; this.filter='ALL'; }
  add(title){ this.items.push({ id: crypto.randomUUID(), title, done:false }); this.bus.emit('store:update', this.state()); }
  toggle(id){ const it=this.items.find(x=>x.id===id); if(it){ it.done=!it.done; this.bus.emit('store:update', this.state()); } }
  setFilter(f){ this.filter=f; this.bus.emit('store:update', this.state()); }
  state(){ return { items: this.items.slice(), filter: this.filter }; }
}
```

### 💡 view.js
```js
export class View {
  constructor(root, bus){ this.root=root; this.bus=bus; bus.on('store:update', s=>this.render(s)); }
  render({ items, filter }){
    const filtered = items.filter(i=> filter==='ALL' ? true : (filter==='DONE'? i.done : !i.done));
    this.root.innerHTML = `
      <div class="filters">
        <button data-f="ALL">Tous</button>
        <button data-f="DONE">Faits</button>
        <button data-f="TODO">À faire</button>
      </div>
      <ul class="todos">${filtered.map(i=>`
        <li class="todo" data-id="${i.id}">
          <label><input type="checkbox" ${i.done?'checked':''}/> ${i.title}</label>
        </li>`).join('')}</ul>`;
  }
}
```

### 💡 controller.js
```js
export class Controller {
  constructor(store, view){ this.store=store; this.view=view; }
  bind(root){
    root.addEventListener('submit', (e)=>{ e.preventDefault(); const title=e.target.elements.title.value.trim(); if(title) this.store.add(title); e.target.reset(); });
    root.addEventListener('change', (e)=>{ const li=e.target.closest('.todo'); if(li) this.store.toggle(li.dataset.id); });
    root.addEventListener('click', (e)=>{ const b=e.target.closest('button[data-f]'); if(b) this.store.setFilter(b.dataset.f); });
  }
}
```

### 💡 index.html (bootstrap)
```html
<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MVC Mini‑framework</title>
<style>body{font-family:system-ui,sans-serif} .todos{list-style:none;padding:0} .filters{display:flex;gap:.5rem;margin:.5rem 0}</style>
</head><body>
  <form id="app">
    <input name="title" placeholder="Ajouter une tâche" required />
    <button>Ajouter</button>
    <div id="list"></div>
  </form>
  <script type="module">
    import { EventBus } from './bus.js';
    import { Store } from './model.js';
    import { View } from './view.js';
    import { Controller } from './controller.js';

    const bus = new EventBus();
    const store = new Store(bus);
    const view = new View(document.getElementById('list'), bus);
    const ctrl = new Controller(store, view);
    ctrl.bind(document.getElementById('app'));
  </script>
</body></html>
```

### ✅ Points clés du livrable
- **Séparation stricte**: `Store` (modèle), `View`, `Controller`, `EventBus`.
- **Flux unidirectionnel** et **vue passive**.
- **Testabilité**: `Store` et `Controller` testables sans DOM.

---

## 🧪 9. Exercices guidés

1. **SRP**: Refactorisez un module qui fait chargement **et** formatage en deux modules.
2. **OCP**: Ajoutez un formatteur **JPY** sans modifier le code existant.
3. **LSP**: Corrigez l’anti‑exemple Rectangle/Carre (utilisez **composition**).
4. **DIP**: Injectez un repo **mock** dans `RapportService` pour tests.
5. **MVC**: Ajoutez un **champ de recherche** qui filtre côté `Store`.
6. **Observer**: Remplacez l’EventBus maison par `EventTarget`.
7. **Decorator**: Ajoutez un décorateur de **retries** sur une fonction `fetchJSON`.
8. **Proxy**: Créez un state réactif qui loggue **lecture** et **écriture** (traps `get`/`set`).

---

## ✅ 10. Check‑list Architecture & Patterns

- [ ] **Encapsulation**: champs privés `#`, API claire.
- [ ] **Composition > Héritage**.
- [ ] **S.O.L.I.D** appliqué (SRP/OCP/LSP/ISP/DIP).
- [ ] **MVC** avec **flux unidirectionnel** et vie passive.
- [ ] **Observer/Bus** pour décorréler les composants.
- [ ] **Factory/Adapter/Decorator/Proxy** utilisés à bon escient.
- [ ] **Singleton évité**; préférer DI et injection par constructeur.
- [ ] **Tests** possibles sans DOM (modèle/contrôleur) et avec DOM (vue).

---

## 📦 Livrable du chapitre
Un **mini‑framework MVC** vanilla JS (liste + filtres + état) et une **démo** HTML; code organisé et prêt à être typé **TypeScript** au Chapitre 6.

---

## 🔚 Résumé essentiel du Chapitre 5
- La **POO** en JS repose sur **prototypes** et **classes**; privilégier **encapsulation** et **composition**.
- Les **principes S.O.L.I.D** guident des designs **testables** et **évolutifs** (SRP, OCP, LSP, ISP, DIP).
- **MVC** sépare modèle/contrôleur/vue et **découple** via un **EventBus**.
- Les **patterns** (Observer, Strategy, Factory, Adapter, Decorator, Proxy) résolvent des problèmes récurrents; **Singleton** est à manier avec prudence.
- Le livrable montre un **flux unidirectionnel**, une **vue passive** et un **store** testable — base idéale pour Vue 3/TypeScript.

---

> Prochain chapitre: **TypeScript Fondamentaux & Migration depuis JS** — typage strict, generics, `tsconfig`, et migration de notre mini‑framework.
