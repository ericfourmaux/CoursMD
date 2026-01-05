
# 📘 Chapitre 3 — JavaScript ES6+ (Fondamentaux)

> 🎯 **Objectifs du chapitre**
> - Comprendre **le langage JavaScript**: types, valeurs, variables, portée, hoisting et coercition.
> - Maîtriser les **fonctions** (déclarations, expressions, fléchées), `this`, closures et le modèle **prototype** / **classes ES6**.
> - Utiliser les **tableaux** et les **itérations** (map/filter/reduce, `for...of`, itérables/générateurs, destructuring, rest/spread).
> - Structurer le code avec les **modules ES** (imports/exports, dynamique).
> - Comprendre l’**asynchronicité** (event loop, macrotasks/microtasks, Promises, `async/await`), et mettre en place **exponential backoff** / **debounce** / **throttle**.
> - Manipuler le **DOM**: sélection, événements, délégation, formulaires.
> - Gérer les **erreurs** (try/catch, erreurs custom, rejections) et adopter des **bonnes pratiques**.

---

## 🧠 1. JavaScript: aperçu & environnement

### 🔍 Définition
**JavaScript (JS)** est un langage **interprété**, **dynamiquement typé**, exécuté dans les navigateurs et dans **Node.js**. La spécification **ECMAScript** (ES) évolue chaque année; **ES6 (ES2015)** introduit `let/const`, classes, modules, etc.

### ❓ Pourquoi
- Langage **ubiquitaire** du web côté client, et **universel** côté serveur (Node).
- Un même langage pour **interaction UI**, **outillage** et **API**.

### 💡 Exemple — Module et exécution
```js
// module.mjs (ESM)
export const VERSION = '1.0.0';
export function hello(name) { return `Bonjour ${name}`; }
// main.mjs
import { VERSION, hello } from './module.mjs';
console.log(VERSION, hello('Eric'));
```

---

## 🧠 2. Types, valeurs & coercition

### 🔍 Définition
Types **primitifs**: `string`, `number`, `bigint`, `boolean`, `null`, `undefined`, `symbol`. Tout le reste est de type **object**.

### ❓ Pourquoi
Savoir identifier les types évite les **bogues** de coercition (ex. concaténation non désirée) et facilite les **comparaisons**.

### 💡 Inspection
```js
typeof 'Texte'        // 'string'
typeof 42             // 'number'
typeof 42n            // 'bigint'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof null           // 'object' (historique)
typeof Symbol('x')    // 'symbol'
typeof {}             // 'object'
```

### ⚠️ Attention à `NaN` et aux comparaisons
```js
Number.isNaN(NaN) // true
isNaN('x')        // true (coercition vers number) → préférer Number.isNaN

0 == false   // true (coercition)
0 === false  // false (strict)
'' == 0      // true (coercition)
'' === 0     // false
```

### ✅ Bonnes pratiques
- Utiliser `===` et `!==` (comparaison **strict**).
- Tester `null` / `undefined` via **nullish coalescing** `??`.
- Préférer `Number.isNaN` à `isNaN`.

### 💡 Exemple — valeurs véridiques/falses
```js
const falsy = [false, 0, -0, 0n, '', null, undefined, NaN];
const truthy = ['a', 1, {}, [], function(){}, Infinity];
```

---

## 🧠 3. Variables, portée & hoisting

### 🔍 Définition
- `var` (historique): portée **fonction**, hoisting permissif.
- `let` / `const`: portée **bloc**, **TDZ** (Temporal Dead Zone) avant initialisation.

### ❓ Pourquoi
Écrire un JS **prévisible** et **sûr** en choisissant le bon mot‑clé et en comprenant la **portée**.

### 💡 Exemple
```js
// var hoisté (déclaré au sommet de la fonction)
console.log(a); // undefined
var a = 1;

// let/const en TDZ (ReferenceError avant initialisation)
try { console.log(b); } catch (e) { console.log('TDZ:', e.name); }
let b = 2;

const obj = { x: 1 }; // const rend la *référence* immuable, pas l’objet
obj.x = 42; // OK
```

### 🗺 Schéma — portée et TDZ
```
Bloc {
  // TDZ pour let/const avant la ligne d'initialisation
  let x = 1; // fin TDZ, x assigné
}
```

### ✅ Bonnes pratiques
- **Toujours** préférer `const` par défaut, `let` si mutation nécessaire.
- Éviter `var` sauf pour compatibilité legacy.
- Déclarer les variables **près de leur usage**.

---

## 🧠 4. Fonctions, `this`, closures & fléchées

### 🔍 Définition
- **Déclaration**: `function f() {}` (hoistée).
- **Expression**: `const f = function() {};`.
- **Fléchée**: `const f = () => {};` (sans `this` propre; **lexical**).

### ❓ Pourquoi
Les fonctions sont des **premières classes** (passables en arguments, retournables) et structurent la **logique**.

### 💡 `this` et `bind`
```js
const obj = {
  x: 10,
  normal() { return this.x; },
  arrow: () => { try { return this.x; } catch { return undefined; } },
};
obj.normal(); // 10 (this = obj)
obj.arrow();  // undefined (this lexical, ici global/undefined en module)

const detache = obj.normal;
console.log(detache());        // undefined (this perdu)
console.log(detache.call(obj)) // 10 (fixer this)
```

### 🧪 Closure (capturer un état)
```js
function compteur() {
  let n = 0;
  return {
    inc() { n++; return n; },
    get() { return n; }
  };
}
const c = compteur();
console.log(c.inc(), c.inc(), c.get()); // 1, 2, 2
```

### ✅ Bonnes pratiques
- Utiliser les **fléchées** pour callbacks et fonctions **petites**.
- Utiliser `function` quand vous avez besoin d’un **prototype**/`this` propre (ex. méthodes d’objets).

---

## 🧠 5. Prototypes & Classes ES6

### 🔍 Définition
JS repose sur une **chaîne de prototypes**. Les **classes ES6** sont un **sucre syntaxique** sur les prototypes.

### 💡 Exemple — prototype vs classe
```js
// Prototype "manuel"
function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.norme = function() { return Math.hypot(this.x, this.y); };

// Classe ES6
class Vecteur {
  #id = Math.random().toString(36).slice(2); // champ privé
  constructor(x, y) { this.x = x; this.y = y; }
  get norme() { return Math.hypot(this.x, this.y); }
  static zero() { return new Vecteur(0, 0); }
}
const v = new Vecteur(3, 4);
console.log(v.norme); // 5
```

### 🗺 Schéma — chaîne de prototypes
```
instance → Classe.prototype → Object.prototype → null
```

### ✅ Bonnes pratiques
- **Composition** > héritage profond.
- Champs **privés** `#` pour encapser un état interne.
- Méthodes **statics** pour fabrique utilitaire (ex. `Vecteur.zero()`).

---

## 🧠 6. Tableaux, itérables, destructuring & generators

### 🔍 Définition
Les **tableaux** sont des objets indexés. Un **itérable** implémente `Symbol.iterator`. Les **générateurs** produisent une suite pausable.

### 💡 Méthodes courantes
```js
const xs = [1,2,3,4];
xs.map(x => x*2);        // [2,4,6,8]
xs.filter(x => x%2===0); // [2,4]
xs.reduce((s,x)=>s+x,0); // 10
xs.find(x => x>2);       // 3
xs.some(x=>x<0);         // false
```

### 💡 Destructuring & rest/spread
```js
const user = { name: 'Eric', job: 'Intégrateur' };
const { name, job: role, age = 0 } = user; // alias + default

const [first, ...rest] = [10,20,30]; // rest
const ys = [...xs, 5];               // spread
```

### 💡 Générateur
```js
function* idGen(start = 0) {
  let i = start;
  while(true) yield i++;
}
const g = idGen(1);
console.log(g.next().value, g.next().value); // 1, 2
```

### ✅ Bonnes pratiques
- Préférer **fonctions pures** (ex. `map`, `filter`) aux mutations (ex. `splice`) si possible.
- Utiliser `for...of` sur les itérables.

---

## 🧠 7. Modules ES — import/export

### 🔍 Définition
Les **modules ES** permettent d’isoler le code et de partager des API via `export`/`import`.

### 💡 Exemple
```js
// util.js
export const PI = Math.PI;
export default function aire(r) { return PI * r * r; }

// main.js (navigateur via <script type="module">)
import aire, { PI } from './util.js';
console.log('Aire:', aire(3));
```

### 💡 Import dynamique
```js
// Chargement conditionnel (code splitting)
if (location.hash === '#chart') {
  const mod = await import('./chart.js');
  mod.renderChart();
}
```

### ✅ Bonnes pratiques
- Favoriser les **exports nommés** pour la clarté.
- `default` si le module a **un rôle principal**.

---

## 🧠 8. Asynchronicité — Event loop, Promises & `async/await`

### 🔍 Définition
- **Event loop**: orchestre la pile d’appels et les **queues** de tâches.
- **Macrotasks**: `setTimeout`, I/O.
- **Microtasks**: **Promises** (`.then`), prioritaires après le stack.

### 💡 Ordre d’exécution
```js
console.log('A');
setTimeout(()=>console.log('B'), 0); // macrotask
Promise.resolve().then(()=>console.log('C')); // microtask
console.log('D');
// Sortie: A, D, C, B
```

### 💡 Promises & `async/await`
```js
function fetchJSON(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

async function getUsers() {
  try {
    const users = await fetchJSON('/api/users');
    return users;
  } catch (e) {
    console.error('Erreur API:', e.message);
    return [];
  }
}
```

### 🧮 Formule JS — **Exponential Backoff** pour retry réseau
```js
async function retry(fn, max = 5, baseMs = 200, factor = 2) {
  // délai = baseMs * factor^tentative + jitter
  for (let attempt = 0; attempt < max; attempt++) {
    try { return await fn(); } catch (e) {
      const jitter = Math.random() * 50;
      const delay = baseMs * Math.pow(factor, attempt) + jitter;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Échecs répétés');
}
// Usage: retry(() => fetchJSON('/api/data'))
```

### 🛠 `Promise.all` vs `Promise.allSettled`
```js
// Parallèle avec échec global
await Promise.all([fetchJSON('/a'), fetchJSON('/b')]);// rejette dès le 1er échec
// Parallèle tolérant
await Promise.allSettled([fetchJSON('/a'), fetchJSON('/b')]);// renvoie statut de chaque promesse
```

### 💡 Debounce & Throttle (contrôle de fréquence)
```js
// Debounce: différer l'exécution tant que les appels se répètent
function debounce(fn, ms = 200) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
}
// Throttle: exécuter au plus une fois par intervalle
function throttle(fn, ms = 200) {
  let last = 0; return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}
```

---

## 🧠 9. DOM, événements & délégation

### 🔍 Définition
Le **DOM** représente le document comme un **arbre**. On manipule les **nœuds** (éléments) et écoute des **événements**.

### 💡 Sélection & modification
```js
const btn = document.querySelector('#save');
btn.textContent = 'Sauvegarder';
btn.classList.add('primary');
```

### 💡 Événements & délégation
```js
// Délégation: écouter sur un parent et filtrer la cible
const list = document.querySelector('#todos');
list.addEventListener('click', (e) => {
  const item = e.target.closest('.todo');
  if (!item) return;
  item.classList.toggle('done');
});
```

### 💡 Formulaire & data attributes
```js
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  console.log('Form payload:', payload);
});
```

---

## 🧠 10. Gestion des erreurs & robustesse

### 🔍 Définition
Les erreurs peuvent être **synchrones** (throw) ou **asynchrones** (Promise rejetée).

### 💡 Erreurs custom
```js
class ValidationError extends Error {
  constructor(msg, field) { super(msg); this.name = 'ValidationError'; this.field = field; }
}
function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('Email invalide', 'email');
}
```

### 💡 Capturer rejections globales (navigateur)
```js
window.addEventListener('unhandledrejection', (e) => {
  console.error('Rejet non géré:', e.reason);
});
```

### ✅ Bonnes pratiques
- Toujours **try/catch** autour des `await` critiques.
- Préférer des **erreurs explicites** (messages, codes).

---

## 🧠 11. Styles de code & patterns utiles

### 🔍 Définition
- **Immutabilité**: éviter les mutations inattendues.
- **Fonctions pures**: plus testables.

### 💡 Exemples
```js
// Immutabilité avec spread
const state = { items: [1,2] };
const next = { ...state, items: [...state.items, 3] };

// Observer simple avec EventTarget
const bus = new EventTarget();
function on(type, handler) { bus.addEventListener(type, handler); }
function emit(type, detail) { bus.dispatchEvent(new CustomEvent(type, { detail })); }

on('add', e => console.log('Ajouté:', e.detail));
emit('add', { id: 1 });
```

---

## 🧠 12. Outils (aperçu) — Lint & format

### 🛠 Outils
- **ESLint**: détecter les anti‑patterns.
- **Prettier**: formater de façon standard.

> Configuration détaillée à venir dans le Chapitre 7 (Tooling Pro).

---

## 🧪 13. Exercices guidés

1. **Coercition**: Expliquez pourquoi `[] + {}` donne `"[object Object]"` et `{} + []` peut produire `0` en contexte global.
2. **Portée**: Transformez une fonction utilisant `var` en version `let/const` sans effet de bord.
3. **Closure**: Écrivez une fabrique `makeCounter(step)` (incrémentation personnalisée).
4. **Classes**: Créez une classe `Rectangle` avec champs privés, getters, et une méthode `aire()`.
5. **Array**: Implémentez une somme via `reduce`, puis une version immuable d’ajout d’élément.
6. **Async**: Utilisez `retry()` pour robustifier un `fetch` instable.
7. **Debounce**: Appliquez `debounce` à une recherche live pour éviter les requêtes à chaque frappe.
8. **DOM**: Implémentez la délégation d’événements sur une liste de tâches.

---

## ✅ 14. Check‑list JS rapide

- [ ] `const` par défaut, `let` si mutation nécessaire.
- [ ] Éviter `var`.
- [ ] Comparaisons **strictes** (`===`/`!==`).
- [ ] Gérer `null`/`undefined` via `??` et `?.` (optional chaining).
- [ ] Fonctions petites, pures quand possible.
- [ ] Classes pour modèles objet; privilégier **composition**.
- [ ] `Promise` + `async/await` avec **try/catch**.
- [ ] Debounce/throttle pour les actions répétées.
- [ ] Délégation d’événements pour listes dynamiques.

---

## 📦 Livrable du chapitre
Une **page interactive**:
- Entrée texte **recherches** avec **debounce**.
- Liste **todos** avec **délégation d’événements** et **immutabilité** du state.
- Module `utils.js` exportant `retry`, `debounce`, `throttle`.

---

## 🔚 Résumé essentiel du Chapitre 3
- JS est **dynamiquement typé**; maîtriser **types** et **coercition** évite les pièges.
- Préférer `const`/`let` (portée **bloc**, **TDZ**) à `var`.
- Les **fonctions fléchées** ont un `this` **lexical**; utiliser `bind` pour corriger `this` sur les méthodes détachées.
- Les **classes ES6** simplifient le modèle **prototype**; privilégier **composition** et utiliser les **champs privés**.
- Les **arrays** se manipulent efficacement avec `map`, `filter`, `reduce`, **destructuring** et **spread**.
- Les **modules ES** structurent le code via `import/export`, avec possibilité d’**import dynamique**.
- L’**event loop** ordonne **microtasks** et **macrotasks**; utiliser `async/await`, `Promise.all`, **exponential backoff**.
- Le **DOM** se manipule via `querySelector`, **délégation** et **FormData**; penser **accessibilité** (focus, `aria-*`).

---

> Prochain chapitre: **Algorithmique & Structures de Données** — mesures de complexité, structures courantes (pile, file, map, set) et algorithmes de tri/recherche.
