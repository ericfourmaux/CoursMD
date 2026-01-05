
# 📜 Chapitre 3 — JavaScript moderne pour Node (ES6+)

> [!NOTE] Objectifs du chapitre
> - Maîtriser les **bases ES6+** indispensables en Node : `let/const`, **portée**, **TDZ**, **arrow functions**, **destructuring**, **spread/rest**, **template literals**, **classes**.  
> - Comprendre les **modules** (ESM) dans Node : `import/export`, `type: "module"`, **top‑level `await`**.  
> - Savoir utiliser les **collections** (`Map`, `Set`, `WeakMap`, `WeakSet`) et les **itérateurs/générateurs** (sync & async).  
> - Travailler avec **Promesses** et `async/await` (patterns, erreurs, concurrence, cancellation via **AbortController**).  
> - Terminer avec une **check-list**, des **questions** et un **résumé**.

---

## 3.1 🔤 Déclarations & portée : `let`, `const`, **TDZ**

- `let` déclare des variables **réassignables** de **portée bloc** ; `const` déclare des constantes (le **binding** est constant, l’objet peut rester mutable). **Accès interdit avant la déclaration** à cause de la **Temporal Dead Zone (TDZ)**. citeturn5search75  
- La TDZ est l’intervalle entre l’entrée dans le bloc et la **déclaration** effective ; accéder à la variable pendant cette période lève `ReferenceError`. citeturn5search75turn5search80

**Exemples**
```js
// TDZ: ReferenceError
console.log(x); // ❌ Cannot access 'x' before initialization
let x = 1;

// const: binding constant (mutation interne possible)
const user = { id: 1 };
user.id = 2; // ✅ mutation autorisée
// user = {}       // ❌ TypeError: assignment to constant variable
```

> [!TIP]
> Par défaut, **préférez `const`** et utilisez `let` uniquement si **réassignation** prévue (intention explicite). citeturn5search75

---

## 3.2 🏹 Arrow functions & `this` lexical

- `this` en JavaScript dépend **de l’invocation**, pas de la définition ; les **arrow functions** n’ont **pas** leur propre `this` et capturent **lexicalement** le `this` du contexte englobant. citeturn5search36  
- On **ne peut pas** rebinder `this` d’une arrow function avec `bind/apply/call`. Elles ne sont pas des **constructeurs** (`new` interdit). citeturn5search36turn5search41

**Piège classique & correction**
```js
class Counter {
  constructor() { this.n = 0; }
  incLater() {
    setTimeout(function () { this.n++; }, 0);      // ❌ this === undefined (strict mode)
    setTimeout(() => { this.n++; }, 0);            // ✅ this lexical (instance)
  }
}
```
> [!NOTE]
> Utilisez les **arrows** pour les callbacks imbriqués afin d’éviter la perte de contexte. citeturn5search38

---

## 3.3 🧩 Destructuring, rest & spread

- **Destructuring** : extraire des sous-parties d’objets/tableaux.  
- **Rest** (`...rest`) : regrouper le **reste** des propriétés/éléments.  
- **Spread** (`...obj`) : **décomposer** (copie **superficielle**, pas profonde).

**Exemples**
```js
// Objet
const user = { id: 1, name: 'Eric', city: 'Montreal' };
const { id, name, ...meta } = user; // meta = { city: 'Montreal' }

// Tableau
const arr = [10, 20, 30];
const [first, ...others] = arr; // first=10, others=[20,30]

// Copie superficielle (références conservées)
const original = { nested: { a: 1 } };
const shallow = { ...original };
console.log(original.nested === shallow.nested); // true
```

---

## 3.4 💬 Template literals & tagged templates

- Les **template literals** (backticks \`) permettent **multi‑ligne**, **interpolation** `${expr}`, et les **tagged templates** (fonction **préfixe** qui reçoit les segments et les valeurs). citeturn5search24

**Exemples**
```js
const name = 'Eric';
console.log(`Bonjour ${name}!\nLigne suivante…`);

// Tagged template (sanitisation rudimentaire)
function safe(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (values[i] ?? ''), '');
}
console.log(safe`<p>${name}</p>`);
```
> [!INFO]
> Les **tagged templates** sont utilisées par des libs (CSS‑in‑JS, builders SQL/GraphQL) pour **contrôler** l’interpolation. citeturn5search27turn5search29

---

## 3.5 🧱 Classes, héritage & champs privés

- Les **classes** offrent une syntaxe plus claire sur le **prototype** ; supportent l’**héritage** (`extends`, `super`) et les **champs privés** `#field`. (Rappels : les arrows ne sont pas des constructeurs) citeturn5search41

**Exemple**
```js
class User {
  #secret = 'token';
  constructor(name) { this.name = name; }
  get token() { return this.#secret; }
}
class Admin extends User {
  constructor(name) { super(name); this.role = 'admin'; }
}
```

---

## 3.6 🔗 Modules modernes (ESM) dans Node

- Node supporte pleinement **ES Modules** ; on active ESM via l’extension `.mjs`, le champ `"type": "module"` ou le flag `--input-type=module`. citeturn5search31turn5search49  
- **Top‑level `await`** est **supporté** en ESM (depuis v14.8, sans flag) : utile pour initialiser des ressources **avant** d’exécuter le module. citeturn5search31

**Exemples**
```json
// package.json
{
  "type": "module"
}
```
```js
// main.js (ESM)
import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile('./config.json', 'utf8')); // top-level await ✅
```

> [!WARNING]
> Le **top‑level `await`** fait **attendre** les modules importeurs jusqu’à résolution ; ne l’utilisez que pour les **initialisations critiques**. citeturn5search33turn5search35

---

## 3.7 🗃️ Collections : `Map`, `Set`, `WeakMap`, `WeakSet`

- **Map** : paires **clé/valeur** avec **clés de tout type** ; ordre d’insertion conservé.  
- **Set** : **valeurs uniques** (de tout type).  
- **WeakMap** : clés **objets** faiblement référencées (non‑itérable, nettoyées par GC).  
- **WeakSet** : ensemble d’**objets** faiblement référencés. citeturn5search57turn5search58

**Exemples**
```js
// Map vs Object
const m = new Map();
const k1 = { id: 1 };
m.set(k1, 'val');
console.log(m.get(k1));

// WeakMap pour mémoïsation liée à la vie des objets
const cache = new WeakMap();
function expensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const r = JSON.stringify(obj).length; // simulons un calcul
  cache.set(obj, r);
  return r;
}
```

> [!TIP]
> **WeakMap/WeakSet** aident à éviter des **fuites mémoire** (pas d’énumération des clés). citeturn5search57

---

## 3.8 🔁 Itérateurs, générateurs & **async**

- Les **générateurs** (`function*`) produisent des itérateurs paresseux.  
- Les **async iterables** se consomment avec `for await...of` (en contexte `async` ou en module). citeturn5search69

**Exemples**
```js
// Générateur
function* seq() { yield 1; yield 2; }
for (const n of seq()) console.log(n);

// Async generator
async function* clock(ticks = 3) {
  for (let i = 0; i < ticks; i++) {
    await new Promise(r => setTimeout(r, 200));
    yield i;
  }
}
(async () => {
  for await (const t of clock()) console.log('tick', t);
})();
```
> [!INFO]
> `for await...of` fonctionne sur les **async iterables** et **wrap** les iterables sync si nécessaire. citeturn5search69

---

## 3.9 ⏱️ Timers promesse & scheduling

- `node:timers/promises` fournit `setTimeout`, `setImmediate`, `setInterval` **promesse/iterateur** pour `async/await`. citeturn5search42turn5search45

**Exemple**
```js
import { setTimeout as delay } from 'node:timers/promises';
await delay(200);
console.log('200ms plus tard');
```

---

## 3.10 🔐 Optional chaining `?.` & nullish coalescing `??`

- `?.` **court‑circuite** si une propriété/méthode est **null/undefined**, retournant `undefined`.  
- `??` fournit un **fallback** uniquement si la valeur est **nullish** (`null`/`undefined`), à la différence de `||` qui traite **tous** les falsy (`0`, `''`, `false`, `NaN`). citeturn5search63

**Exemples**
```js
const user = { profile: { username: '' } };
const u1 = user?.profile?.username ?? 'Guest'; // '' conservé
const qty = 0 ?? 42; // 0 (contrairement à 0 || 42 -> 42)
```

---

## 3.11 🌐 Promises, `async/await` & cancellation (AbortController)

- Les **Promesses** forment la base des opérateurs `async/await` ; `await` **suspende** la fonction async jusqu’à résolution, tout en laissant l’event loop gérer d’autres tâches. (Rappel sur micro/macro : voir Chap. 4)  
- **Combinaisons utiles** : `Promise.all`, `allSettled`, `race`, `any` (patterns de concurrence).  
- **Cancellation** : **AbortController** (signal) est **supporté** par Node et les Web APIs modernes, notamment `fetch`. citeturn5search55turn5search52

**Exemples**
```js
// Concurrence contrôlée
async function withLimit(urls, limit, fetchFn) {
  const res = [];
  const queue = urls.slice();
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const u = queue.shift();
      res.push(await fetchFn(u));
    }
  });
  await Promise.all(workers);
  return res;
}

// Cancellation avec AbortController (Node >=15 / stable)
const controller = new AbortController();
const { signal } = controller;
setTimeout(() => controller.abort(new Error('Timeout')), 2000);
try {
  const r = await fetch('https://example.com', { signal });
  console.log(await r.text());
} catch (e) {
  if (e.name === 'AbortError') console.log('Requête annulée');
}
```
> [!TIP]
> Pour des **lots parallèles** robustes, privilégiez `Promise.allSettled` si une erreur **ne doit pas** annuler tous les résultats. citeturn5search53

---

## 3.12 🧮 Mini‑théories & petites "formules" en JavaScript

### 3.12.1 **Latence parallèle** approximative (I/O indépendantes)
```js
const cpu = 5;               // ms de travail CPU
const io = [120, 80, 100];   // latences I/O indépendantes
const total = Math.max(...io) + cpu; // ≈ 125 ms
```

### 3.12.2 **Throughput** avec lot limité
```js
function batches(n, batchSize) {
  return Math.ceil(n / batchSize); // nb de vagues
}
```

### 3.12.3 **Précision flottante** (EPSILON)
```js
function almostEqual(a, b, eps = Number.EPSILON) {
  return Math.abs(a - b) < eps;
}
```

### 3.12.4 **Temps d’exécution** simple
```js
const t0 = performance.now?.() ?? Date.now();
// ... votre code ...
const t1 = performance.now?.() ?? Date.now();
console.log('ms =', t1 - t0);
```

---

## 3.13 ⚠️ Pièges fréquents & bonnes pratiques

- **TDZ** : ne pas accéder aux variables `let/const` avant déclaration. citeturn5search75  
- **`this`** : dans les callbacks, utiliser des **arrow functions** pour capturer le contexte. citeturn5search36  
- **ESM/CommonJS** : choisir **un seul format** par projet ; ESM pour le moderne (`type: "module"`). citeturn5search31  
- **Top‑level `await`** : utile mais peut **retarder** l’initialisation globale des modules importeurs. citeturn5search33  
- **WeakMap/WeakSet** : pas d’itération — **normal**, lié au **GC** ; utiliser Map/Set si vous devez énumérer. citeturn5search57  
- **Timers** : préférez `node:timers/promises` pour le code async lisible (`await setTimeout`). citeturn5search42

---

## 3.14 🧭 Questions de compréhension

1) Expliquez la **TDZ** et son effet sur `let`/`const`. citeturn5search75  
2) Pourquoi les **arrow functions** simplifient la gestion de `this` ? citeturn5search36  
3) Comment activer **ESM** dans Node et quel est l’intérêt du **top‑level `await`** ? citeturn5search31  
4) Différences d’usage entre **Map/Set** et **WeakMap/WeakSet** ? citeturn5search57  
5) À quoi sert `node:timers/promises` ? Donnez un exemple. citeturn5search42

---

## 3.15 🧩 Check‑list de fin de chapitre

- [x] Je sais utiliser `let/const` et j’évite la **TDZ**.  
- [x] Je comprends le `this` **lexical** des **arrow functions**.  
- [x] Je peux écrire un module **ESM** avec **top‑level `await`**.  
- [x] Je sais choisir la bonne **collection** (`Map/Set` vs `WeakMap/WeakSet`).  
- [x] J’utilise `node:timers/promises` pour des délais en `async/await`.  
- [x] Je sais **annuler** une opération avec **AbortController**.

---

## 3.16 📘 Résumé des points essentiels

- **Portée & TDZ** : `let/const` sont **bloc‑scopés** ; accès avant déclaration ⇒ `ReferenceError`. citeturn5search75  
- **Arrows** : `this` **lexical**, pas de `bind/new` ; idéales pour callbacks. citeturn5search36  
- **ESM** dans Node : activer via `.mjs` / `type: "module"` ; **top‑level `await`** disponible en ESM. citeturn5search31  
- **Collections** : `Map/Set` pour énumération ; `WeakMap/WeakSet` pour données liées au **cycle de vie** des objets. citeturn5search57  
- **Async moderne** : `for await...of`, timers **promesse**, **AbortController** pour cancel. citeturn5search69turn5search42turn5search55

---

### 📎 Téléchargement (Chapitre 3)
- **Fichier Obsidian** : `03-js-moderne-pour-node.md` (ce document).

