
# 📘 Chapitre 4 — `this`, `bind`, `call`, `apply`

> 🎯 **Objectifs** : maîtriser le **contexte d’exécution** et éviter la perte de `this`.

---

## 🧠 Règles de `this`
- Appel **méthode** : `this` = receveur.
- Appel **fonction** : `this` = `undefined` (strict) ou global (non strict).
- **Arrow functions** : `this` **lexical** (hérité du scope parent).

---

## 🧩 Exemples
```js
const obj = {
  x: 42,
  getX() { return this.x; }
};

const f = obj.getX;
// f(); // TypeError en strict: this undefined

const bound = obj.getX.bind(obj);
console.log(bound()); // 42
```

### `call` / `apply`
```js
function sum(a, b) { return a + b; }
console.log(sum.call(null, 2, 3)); // 5
console.log(sum.apply(null, [2, 3])); // 5
```

### Arrow et `this` DOM (analogie badge)
```js
class ButtonCounter {
  constructor(el) {
    this.el = el;
    this.count = 0;
    // Arrow garde this de la classe
    this.el.addEventListener('click', () => {
      this.count++;
      this.el.textContent = `Clicks: ${this.count}`;
    });
  }
}
```

---

## ⚠️ Pièges
- Passer une méthode comme callback **sans** bind → perte de `this`.
- Utiliser une arrow **comme méthode de prototype** (peut empêcher `super`).

---

## 📈 Schéma
```
[fonction] --bind(obj)--> [fonction liée] (this=obj)
```

---

## 🔗 Références
- MDN this: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/this
- MDN bind/call/apply: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Function

---

## 🧭 Exercices
1. Corriger un gestionnaire d’événements avec `bind`.
2. Écrire un wrapper `invoke(fn, ctx, args)` utilisant `apply`.

---

## ✅ Résumé
- `this` dépend **de l’appel**, pas de la définition.
- `bind` fixe le contexte, `call`/`apply` l’injectent à l’appel.
- Les **arrows** capturent lexicalement `this`.
