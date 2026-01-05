
# 📘 Chapitre 1 — Prérequis JavaScript & philosophie POO

> 🎯 **Objectifs** : consolider les bases (ES6+), comprendre ce que la POO résout, et pourquoi la POO en JS est particulière (prototype vs classes).

---

## 🧠 Concepts clés

- **Valeurs vs Références** : les types primitifs (number, string, boolean, null, undefined, symbol, bigint) sont copiés **par valeur** ; les objets/arrays/fonctions sont passés **par référence**.
- **Scope & Closures** : le scope lexical détermine la visibilité des variables. Une **closure** capture un environnement lexical pour créer de l’**encapsulation**.
- **Modules ESM (`import/export`)** : isolent le code, évitent la pollution de l’espace global, exposent une API claire.
- **Strict mode (`'use strict'`)** : durcit les règles (erreurs sur variables non déclarées), utile pour la fiabilité.

💡 **Analogie** : *Valeur* ≈ photocopie d’un document ; *référence* ≈ y aller avec le **document original**. Une closure est une **boîte scellée** contenant des outils (variables) accessibles seulement via la trappe (fonctions).

---

## 📎 Pourquoi ces bases pour la POO ?

La POO vise à **modéliser** des domaines en **objets** ayant **état** et **comportement**. En JS, la POO s’appuie sur :

- La **délégation par prototype** et le sucre syntaxique `class`.
- Les **modules** et **closures** pour encapsuler.
- Les **références** (mutabilité) pour partager ou isoler l’état.

Comprendre ces mécanismes évite des **fuites d’état**, des **couplages forts** et des **bugs de contexte** (`this`).

---

## 🧩 Exemples concrets

### 🧪 Valeur vs Référence
```js
'use strict';
let a = 1;
let b = a; // copie par valeur
b++;
console.log(a, b); // 1, 2

const o1 = { count: 0 };
const o2 = o1; // référence partagée
o2.count++;
console.log(o1.count); // 1 (même objet)
```

### 🔒 Encapsulation par closure (module pattern minimal)
```js
// Counter module avec API publique mais état privé
export function createCounter() {
  let value = 0; // privé
  return {
    inc() { value++; },
    dec() { value--; },
    get() { return value; }
  };
}

const c = createCounter();
c.inc();
console.log(c.get()); // 1
console.log(c.value);  // undefined (privé)
```

### 📦 Modules ESM
```js
// math.js
export const add = (x, y) => x + y;
export default function square(n) { return n * n; }

// main.js
import square, { add } from './math.js';
console.log(add(2, 3));      // 5
console.log(square(4));      // 16
```

---

## ⚠️ Pièges courants

- Muter des objets partagés **sans protocole** → effets de bord.
- Oublier `'use strict'` et créer des variables implicites.
- Mélanger **CommonJS** et **ESM** sans plan clair.

---

## 📈 Schéma (ASCII)

```
[Module] --exports--> [API publique]
   | (closure)
   v
[Etat privé]
```

---

## 🔗 Références
- MDN Scope & closures: https://developer.mozilla.org/fr/docs/Web/JavaScript/Closures
- MDN Modules: https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules
- MDN Strict mode: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Strict_mode

---

## 🧭 Exercices

1. Écrire un module `stack` avec `push`, `pop`, `size` qui cache son tableau interne.
2. Montrer la différence entre copie par valeur et par référence avec `Array`.
3. Activer strict mode dans un fichier et provoquer une erreur volontaire (variable non déclarée).

---

## ✅ Résumé
- JS distingue **valeur** vs **référence**.
- Les **closures** et **modules** permettent l’**encapsulation**.
- La POO en JS s’appuie sur prototypes ; `class` est un **sucre syntaxique**.
