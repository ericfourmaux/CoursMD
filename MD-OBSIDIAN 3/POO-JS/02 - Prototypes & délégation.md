
# 📘 Chapitre 2 — Prototypes & délégation

> 🎯 **Objectifs** : comprendre `[[Prototype]]`, la chaîne de prototypes et la **délégation**.

---

## 🧠 Définitions précises

- **`[[Prototype]]`** : lien interne d’un objet vers un autre objet (son prototype) utilisé pour la **recherche de propriétés**.
- **Délégation** : si une propriété n’existe pas sur l’objet, JS la cherche dans son prototype, puis le prototype du prototype, etc.
- **Fonction constructeur** : une fonction utilisée avec `new` qui affecte son objet `prototype` comme `[[Prototype]]` des instances.

💡 **Analogie** : Une **bibliothèque** de fiches. Si la fiche n’est pas dans votre tiroir, vous consultez le tiroir **parent**.

---

## 🔧 Outils du langage

- `Object.create(proto)` : crée un objet dont le `[[Prototype]]` est `proto`.
- `Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, proto)` : lire/écrire le prototype.
- `Function.prototype` : utilisé par `new` pour relier instances.

---

## 🧩 Exemple : `Shape` par délégation
```js
const Shape = {
  area() { throw new Error('area() doit être implémentée'); },
  perimeter() { throw new Error('perimeter() doit être implémentée'); },
  describe() { return `${this.type} - area: ${this.area()}, perimeter: ${this.perimeter()}`; }
};

const Circle = Object.create(Shape);
Circle.type = 'Circle';
Circle.create = function(r) {
  const c = Object.create(Circle);
  c.r = r;
  return c;
};
Circle.area = function() { return Math.PI * this.r * this.r; };
Circle.perimeter = function() { return 2 * Math.PI * this.r; };

const c = Circle.create(2);
console.log(c.describe());
```

### 🧪 Avec fonction constructeur
```js
function Rectangle(w, h) { this.w = w; this.h = h; }
Rectangle.prototype.type = 'Rectangle';
Rectangle.prototype.area = function() { return this.w * this.h; };
Rectangle.prototype.perimeter = function() { return 2 * (this.w + this.h); };

const r = new Rectangle(3, 4);
console.log(r.area()); // 12
```

---

## ⚠️ Pièges

- Sur‑utiliser `__proto__` (non standard historiquement) : privilégier `Object.create`.
- Oublier `new` lors d’un appel constructeur → `this` global/undefined.

---

## 📈 Schéma (ASCII)
```
[c] --> [[Prototype]] --> [Circle] --> [[Prototype]] --> [Shape] --> [[Prototype]] --> [Object.prototype]
```

---

## 🔗 Références
- MDN Object prototypes: https://developer.mozilla.org/fr/docs/Learn/JavaScript/Objects/Object_prototypes
- MDN Object.create: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/create

---

## 🧭 Exercices

1. Implémentez `Triangle` par délégation avec `area()` (formule Heron). En JS :
```js
function heron(a,b,c) { const s = (a+b+c)/2; return Math.sqrt(s*(s-a)*(s-b)*(s-c)); }
```
2. Construisez une chaîne de prototypes `AdminUser -> User -> Object`.

---

## ✅ Résumé
- Le modèle objet JS repose sur **prototypes**.
- La **délégation** permet la réutilisation de comportement.
- `Object.create` et `prototype` des fonctions sont centraux.
