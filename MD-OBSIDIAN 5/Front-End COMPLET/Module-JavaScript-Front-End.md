---
title: Module JavaScript — Développement Front‑End (Complet)
tags: [front-end, javascript, formation, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module JavaScript — Complet et Opérationnel

> [!note]
> **Objectif** : Maîtriser **JavaScript moderne (ES6+) côté navigateur** pour créer des interfaces **dynamiques, fiables, accessibles et performantes**. 
>
> **À la fin de ce module, vous saurez :**
> - Écrire du JS **clair** (variables, types, fonctions, modules) et comprendre **this, scope, hoisting, closures**.
> - Manipuler le **DOM**, gérer les **événements**, travailler avec les **APIs Web** (Fetch, Storage, Observers…).
> - Maîtriser l’**asynchronisme** (promises, `async/await`, event loop, micro/macro‑tâches).
> - Optimiser **performance**, **accessibilité**, **sécurité** et diagnostiquer avec **DevTools**.
> - Structurer le code (patterns, architecture), tester, et packager (NPM/bundlers).

---

## Table des matières

- [1. Pourquoi JavaScript ?](#1-pourquoi-javascript)
- [2. Environnement et outils](#2-environnement-et-outils)
- [3. Syntaxe et bases du langage](#3-syntaxe-et-bases-du-langage)
- [4. Types et structures de données](#4-types-et-structures-de-donnees)
- [5. Opérateurs essentiels](#5-operateurs-essentiels)
- [6. Contrôle de flux](#6-controle-de-flux)
- [7. Fonctions, this et closures](#7-fonctions-this-et-closures)
- [8. Objets, prototypes et classes](#8-objets-prototypes-et-classes)
- [9. Modules ES (ESM)](#9-modules-es-esm)
- [10. Collections et utilitaires](#10-collections-et-utilitaires)
- [11. Date, heure et internationalisation](#11-date-heure-et-internationalisation)
- [12. DOM : sélection et manipulation](#12-dom-selection-et-manipulation)
- [13. Événements et délégation](#13-evenements-et-delegation)
- [14. APIs Web majeures](#14-apis-web-majeures)
- [15. Asynchronisme et event loop](#15-asynchronisme-et-event-loop)
- [16. Performance et mémoire](#16-performance-et-memoire)
- [17. Sécurité côté client](#17-securite-cote-client)
- [18. Accessibilité pilotée par JS](#18-accessibilite-pilotee-par-js)
- [19. Tests, qualité et typage](#19-tests-qualite-et-typage)
- [20. Debugging avec DevTools](#20-debugging-avec-devtools)
- [21. Patterns et architecture](#21-patterns-et-architecture)
- [22. Build, bundlers et NPM](#22-build-bundlers-et-npm)
- [23. Progressive enhancement](#23-progressive-enhancement)
- [24. Exercices guidés avec corrections](#24-exercices-guides-avec-corrections)
- [25. Checklist de référence](#25-checklist-de-reference)
- [26. Glossaire rapide](#26-glossaire-rapide)
- [27. FAQ](#27-faq)
- [28. Références & ressources](#28-references--ressources)

---

## 1. Pourquoi JavaScript ?

JavaScript est le langage **universel du web** côté client. Les navigateurs implémentent son moteur pour rendre l’interface **interactive** : manipuler le DOM, écouter les événements, appeler des APIs.

> [!tip]
> JS n’est pas uniquement côté navigateur : **Node.js** permet d’utiliser JS côté serveur, mais ce module se concentre sur le **front‑end**.

---

## 2. Environnement et outils

- Navigateur moderne (Chrome, Firefox, Safari, Edge) avec **DevTools**.
- Éditeur (VS Code) avec ESLint/Prettier.
- Serveur local (ex. `vite` ou `http-server`) pour tester modules ES.

Arborescence simple :

```
project/
├─ index.html
├─ js/
│  ├─ main.js
│  └─ utils/
│     └─ format.js
└─ assets/
```

---

## 3. Syntaxe et bases du langage

### 3.1. Déclarations

```js
var x = 1;      // porté au scope fonction (évitez)
let y = 2;      // porté au bloc
const z = 3;    // constante (valeur mutable possible si objet)
```

### 3.2. Littéraux

Strings (guillemets ou template) :

```js
const nom = "Alice";
const salut = `Bonjour ${nom}!`;
```

Objets & tableaux :

```js
const user = { id: 1, nom: "Alice" };
const tags = ["js", "web"];
```

---

## 4. Types et structures de données

Types primitifs : `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`.

```js
typeof 42;           // "number"
typeof 42n;          // "bigint"
typeof Symbol();     // "symbol"
```

> [!warning]
> `NaN` est un `number`. Utilisez `Number.isNaN()` au lieu de `isNaN()`.

Objets, tableaux, `Map`, `Set`, `WeakMap`, `WeakSet`.

---

## 5. Opérateurs essentiels

- Comparaison stricte : `===`, `!==` (préférer à `==`).
- Logiques : `&&`, `||`, `!`.
- Nullish coalescing : `??`.
- Optional chaining : `?.`.
- Spread/rest : `...arr`, `function f(...args){}`.

```js
const titre = config?.titre ?? "Sans titre";
```

---

## 6. Contrôle de flux

`if/else`, `switch`, `for`, `for..of`, `for..in` (clés d’objet), `while`, `do..while`, `break`, `continue`, `try/catch/finally`.

```js
for (const item of liste) {
  if (!item) continue;
}
```

---

## 7. Fonctions, this et closures

### 7.1. Déclaration vs expression vs arrow

```js
function somme(a, b) { return a + b; }
const mul = function(a,b){ return a*b; };
const sub = (a,b) => a - b; // this lexical
```

### 7.2. `this`

- `this` dépend **du contexte d’appel**.
- Arrow functions n’ont pas leur propre `this`.

```js
const obj = {
  x: 1,
  getX() { return this.x; }
};
const getX = obj.getX;
getX(); // undefined en strict mode (this = undefined)
```

### 7.3. Hoisting & TDZ

- Déclarations `var` **hissées** ; `let/const` ont une **zone morte temporelle**.

### 7.4. Closures

```js
function makeCounter(){
  let c = 0;
  return () => ++c;
}
const inc = makeCounter();
inc(); // 1
inc(); // 2
```

---

## 8. Objets, prototypes et classes

### 8.1. Prototypes

```js
const a = {};
Object.getPrototypeOf(a) === Object.prototype; // true
```

### 8.2. Classes

```js
class Person {
  #id; // champ privé
  constructor(nom){ this.nom = nom; this.#id = crypto.randomUUID(); }
  get id(){ return this.#id; }
  parler(){ console.log(`Je suis ${this.nom}`); }
  static from(obj){ return new Person(obj.nom); }
}
class Dev extends Person {
  constructor(nom, stack){ super(nom); this.stack = stack; }
}
```

---

## 9. Modules ES (ESM)

```html
<script type="module" src="/js/main.js"></script>
```

```js
// main.js
import { format } from "./utils/format.js";
console.log(format(new Date()));
```

- Import dynamique : `const mod = await import("./mod.js");`
- Top‑level `await` autorisé **dans les modules**.
- **Import maps** (HTML) pour alias (selon support navigateur).

---

## 10. Collections et utilitaires

### 10.1. Tableaux

`map`, `filter`, `reduce`, `find`, `some`, `every`, `flat`, `flatMap`, `sort` (attention au comparator).

```js
const total = items.map(i=>i.prix).reduce((a,b)=>a+b,0);
```

### 10.2. Objet

`Object.keys/values/entries`, `structuredClone`, `JSON.parse/stringify`.

### 10.3. Map/Set

```js
const s = new Set([1,2,2]); // {1,2}
const m = new Map([["clé", 123]]);
```

---

## 11. Date, heure et internationalisation

`Date` pour horodatage ; **Intl** pour formatage.

```js
const fmt = new Intl.DateTimeFormat("fr-CA", { dateStyle: "long" });
fmt.format(new Date());
```

`Intl.NumberFormat`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`.

> [!tip]
> Évitez de manipuler manuellement les fuseaux ; préférez **Intl** et côté serveur pour calculs complexes.

---

## 12. DOM : sélection et manipulation

Sélection : `querySelector(All)`, `getElementById`, `closest`.

```js
const btn = document.querySelector("button.primary");
btn.textContent = "Envoyer";
btn.classList.toggle("is-loading", true);
btn.dataset.state = "ready";
```

Créer/injecter : `createElement`, `append`, `prepend`, `before/after`, `replaceWith`, `DocumentFragment`, `<template>`.

---

## 13. Événements et délégation

- **Bubbling** / **capturing** ; `addEventListener(type, handler, { capture })`.
- **Délégation** : écouter sur un parent et filtrer la cible.

```js
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-track]");
  if (!a) return;
  e.preventDefault();
  console.log("Track", a.href);
});
```

`preventDefault`, `stopPropagation`, **keyboard & pointer events**, **focus management**.

---

## 14. APIs Web majeures

### 14.1. Fetch API

```js
const ac = new AbortController();
const res = await fetch("/api/products", { signal: ac.signal });
if (!res.ok) throw new Error(res.statusText);
const data = await res.json();
```

### 14.2. FormData, URL et Storage

```js
const fd = new FormData(document.querySelector("form"));
const url = new URL(window.location);
localStorage.setItem("prefs", JSON.stringify({ theme: "dark" }));
```

### 14.3. Observers & Workers

- `IntersectionObserver` (lazy‑loading, analytics)
- `MutationObserver` (écouter changements DOM)
- `ResizeObserver` (layout adaptatif)
- `Web Worker` pour tâches coûteuses hors thread UI

---

## 15. Asynchronisme et event loop

### 15.1. Promises & async/await

```js
async function load(){
  try {
    const [u, p] = await Promise.all([
      fetch("/api/user").then(r=>r.json()),
      fetch("/api/posts").then(r=>r.json())
    ]);
    return { u, p };
  } catch (err){
    console.error(err);
  }
}
```

### 15.2. Event loop, microtasks, macrotasks

- **Microtasks** : `Promise` callbacks.
- **Macrotasks** : `setTimeout`, IO.

```mermaid
sequenceDiagram
  participant Loop
  participant TaskQueue as Macrotasks
  participant MicroQueue as Microtasks
  Loop->>TaskQueue: Exécute une tâche (ex. setTimeout)
  Loop->>MicroQueue: Vide toutes les microtâches (Promises)
  Loop->>Render: Reflow/Repaint
```

---

## 16. Performance et mémoire

- Éviter le **layout thrashing** (lire puis écrire).
- **Debounce/Throttle** pour événements fréquents.
- `requestAnimationFrame` pour animations manuelles.
- **Performance API** (mesures) et **Coverage** (code inutilisé) dans DevTools.
- Nettoyer les **listeners** et références pour éviter **fuites mémoire**.

```js
function debounce(fn, wait=200){
  let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}
```

---

## 17. Sécurité côté client

- Éviter l’**injection HTML** non‑échappée ; préférer `textContent`.
- Si contenu HTML externe : **sanitiser** (ex. DOMPurify côté client).
- `rel="noopener noreferrer"` pour liens `target="_blank"`.
- Respecter la **CSP** (en-têtes serveur) ; éviter inline JS si politique stricte.
- Comprendre **CORS** (réponses serveur), **same‑origin policy**.

---

## 18. Accessibilité pilotée par JS

- Gérer le **focus** (ex. ouverture modale → focus sur titre ou action primaire).
- **ARIA** : mettre à jour `aria-expanded`, `aria-live` pour contenus dynamiques.
- `prefers-reduced-motion` → réduire animations.

```js
button.addEventListener("click", () => {
  panel.hidden = !panel.hidden;
  button.setAttribute("aria-expanded", String(!panel.hidden));
});
```

---

## 19. Tests, qualité et typage

- **ESLint** (qualité) + **Prettier** (format).
- **Vitest/Jest** (unitaires) ; **Playwright/Cypress** (E2E).
- **TypeScript** ou **JSDoc** pour le typage.

```js
/**
 * Additionne deux nombres.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a,b){ return a+b; }
```

---

## 20. Debugging avec DevTools

- **Sources** : breakpoints, **conditional** / **XHR** breakpoints.
- **Network** : status, timings, payloads.
- **Performance** : profiler, flamegraph.
- **Memory** : snapshots, retainer graph.
- **Coverage** : pour code inutilisé.

---

## 21. Patterns et architecture

- **Module** (ESM), **Pub/Sub**, **Observer**, **Factory**, **Singleton (rare)**.
- Organisation **feature‑first** ; logique séparée du DOM ; **immutabilité** pour l’état.
- **Functional thinking** : pure functions, composition.

---

## 22. Build, bundlers et NPM

- **NPM scripts** : `npm run dev`, `npm run build`.
- **Vite** pour dev rapide ; **Rollup/Webpack** pour cas avancés.
- **Babel** si besoin de compatibilité large.
- **Import maps** (HTML) pour alias sans bundler (selon support).

---

## 23. Progressive enhancement

- **HTML/CSS** fournissent la base ; JS enrichit.
- Fonctionnalités non critiques doivent **gracieusement dégrader**.
- Utiliser `<noscript>` pour informer.

---

## 24. Exercices guidés avec corrections

> [!info]
> Les **corrections** sont **repliables**. Cliquez pour afficher.

### Exercice 1 — Sélection et manipulation du DOM
**Objectif** : Remplacer le texte d’un bouton et lui ajouter une classe.

<details>
<summary><strong>Correction</strong></summary>

```html
<button id="send">Envoyer</button>
```

```js
const btn = document.getElementById("send");
btn.textContent = "Envoyer maintenant";
btn.classList.add("is-primary");
```

</details>

---

### Exercice 2 — Événement et délégation
**Objectif** : Écouter les clics sur des liens et prévenir la navigation si `data-confirm`.

<details>
<summary><strong>Correction</strong></summary>

```html
<nav>
  <a href="/supprimer" data-confirm>Supprimer</a>
  <a href="/profil">Profil</a>
</nav>
```

```js
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-confirm]");
  if (!link) return;
  e.preventDefault();
  if (confirm("Confirmer ?")) window.location.assign(link.href);
});
```

</details>

---

### Exercice 3 — Fetch API et gestion d’erreur
**Objectif** : Charger des données JSON et afficher un message en cas d’échec.

<details>
<summary><strong>Correction</strong></summary>

```html
<div id="status" role="status" aria-live="polite"></div>
<ul id="list"></ul>
```

```js
async function load(){
  const status = document.getElementById("status");
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error(res.statusText);
    const items = await res.json();
    const list = document.getElementById("list");
    list.innerHTML = items.map(i=>`<li>${i.name}</li>`).join("");
    status.textContent = "Chargement réussi";
  } catch (err){
    status.textContent = "Échec du chargement";
  }
}
load();
```

</details>

---

### Exercice 4 — Promises vs async/await
**Objectif** : Réécrire un code basé sur `.then()` en `async/await`.

<details>
<summary><strong>Correction</strong></summary>

```js
// Avant
fetch("/api/user")
  .then(r=>r.json())
  .then(u=> console.log(u))
  .catch(console.error);

// Après
async function getUser(){
  try {
    const r = await fetch("/api/user");
    const u = await r.json();
    console.log(u);
  } catch (e){ console.error(e); }
}
```

</details>

---

### Exercice 5 — Debounce sur input
**Objectif** : Limiter la fréquence d’une recherche pendant la saisie.

<details>
<summary><strong>Correction</strong></summary>

```html
<input id="q" placeholder="Rechercher…">
```

```js
function debounce(fn, wait=300){
  let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}
const search = debounce((term)=>{
  console.log("Recherche:", term);
}, 300);
document.getElementById("q").addEventListener("input", e => search(e.target.value));
```

</details>

---

### Exercice 6 — Modale accessible
**Objectif** : Ouvrir/fermer une modale avec gestion du focus et ARIA.

<details>
<summary><strong>Correction</strong></summary>

```html
<button id="open">Ouvrir</button>
<dialog id="modal" aria-modal="true">
  <h2 id="title">Titre</h2>
  <p>Contenu…</p>
  <button id="close">Fermer</button>
</dialog>
```

```js
const modal = document.getElementById("modal");
const openBtn = document.getElementById("open");
const closeBtn = document.getElementById("close");
openBtn.addEventListener("click", () => { modal.showModal(); closeBtn.focus(); });
closeBtn.addEventListener("click", () => modal.close());
modal.addEventListener("cancel", () => modal.close());
```

</details>

---

## 25. Checklist de référence

- [ ] `let/const` (éviter `var`) ; compréhension de **TDZ** et hoisting
- [ ] `===`/`!==` ; `?.` et `??` au besoin
- [ ] Fonctions pures quand possible ; éviter side effects non maîtrisés
- [ ] **Closures** comprises ; `this` maîtrisé
- [ ] Modules ES (`type="module"`) ; imports/exports clairs
- [ ] DOM manipulé via APIs sûres (`textContent`, `classList`, `dataset`)
- [ ] Événements gérés avec **délégation** et nettoyage des handlers
- [ ] Asynchronisme : `async/await`, `Promise.all`, `AbortController`
- [ ] Performance : debounce/throttle, rAF, éviter layout thrashing
- [ ] Accessibilité : focus, ARIA, `prefers-reduced-motion`
- [ ] Sécurité : no injection, CSP, `noopener noreferrer`
- [ ] Qualité : ESLint/Prettier, tests, DevTools

---

## 26. Glossaire rapide

- **Closure** : fonction capturant son environnement lexical.
- **Hoisting** : remontée des déclarations dans le scope.
- **Event loop** : orchestration des tâches/microtâches et rendu.
- **Promise** : valeur asynchrone ; états `pending`, `fulfilled`, `rejected`.
- **Module ES** : fichier isolé avec imports/exports.

---

## 27. FAQ

**Q : Dois‑je utiliser `var` ?**
> Non. Utilisez `let`/`const`. `var` introduit des comportements inattendus (scope fonction, hoisting).

**Q : Que faire des erreurs asynchrones ?**
> Entourez de `try/catch` dans `async/await`, et gérez les cas `!res.ok` pour `fetch`.

**Q : Faut‑il jQuery ?**
> Inutile dans les navigateurs modernes : le DOM et `fetch` couvrent la plupart des besoins.

**Q : TypeScript ou JS ?**
> TypeScript améliore la robustesse, mais JS + JSDoc est un bon compromis minimal.

---

## 28. Références & ressources

- MDN Web Docs (JS) : https://developer.mozilla.org/fr/docs/Web/JavaScript
- Web APIs — MDN : https://developer.mozilla.org/fr/docs/Web/API
- Guide asynchronisme — MDN : https://developer.mozilla.org/fr/docs/Learn/JavaScript/Asynchronous
- Chrome DevTools : https://developer.chrome.com/docs/devtools/
- web.dev (Google) : https://web.dev/ 

> [!success]
> Vous disposez maintenant d’un **module JavaScript complet**, prêt à l’emploi et à la production.
