
# 📘 Chapitre 5 — Encapsulation : closures, modules, champs privés `#`, getters/setters

> 🎯 **Objectifs** : cacher l’état, exposer une API propre, garantir des invariants.

---

## 🔒 Encapsulation en JS
- **Closures** : variables privées via portée lexicale.
- **Champs privés `#`** : confidentialité au niveau classe.
- **Getters/Setters** : contrôle d’accès et de mutation.

---

## 🧩 Exemple : `SafeCounter`
```js
class SafeCounter {
  #value = 0;
  constructor(initial = 0) {
    this.value = initial; // passer par setter
  }
  get value() { return this.#value; }
  set value(v) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) throw new Error('Doit être entier >= 0');
    this.#value = n;
  }
  inc() { this.#value++; }
  dec() { if (this.#value > 0) this.#value--; }
}
```

### Module pattern avec closure
```js
export function createVault() {
  let secret = 'key';
  return {
    setSecret(s) { secret = String(s); },
    getSecretHash() { return secret.length * 31; }
  };
}
```

---

## ⚠️ Pièges
- Fuite d’état via objet retourné (exposer des références mutables).
- Getters avec **effets de bord**.

---

## 📈 Schéma
```
[Classe] --#privé--> [Etat caché]
[Getter/Setter] -> [Validation]
```

---

## 🔗 Références
- Getters/Setters: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/get
- Champs privés: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes/Private_class_fields

---

## 🧭 Exercices
1. Écrire `SafeArray` qui empêche `undefined`.
2. Créer un module `bankVault` avec `deposit/withdraw/balance` encapsulé.

---

## ✅ Résumé
- JS offre **closures** et **champs privés** pour l’encapsulation.
- Les **accessors** permettent de valider et protéger l’état.
