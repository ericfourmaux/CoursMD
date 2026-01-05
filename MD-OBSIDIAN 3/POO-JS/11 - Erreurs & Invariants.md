
# 📘 Chapitre 11 — Gestion d’erreurs & invariants orientés objet

> 🎯 **Objectifs** : fiabiliser des objets avec **contrats** et **validations**.

---

## 🧠 Concepts
- **Erreurs** : classes d’erreurs spécifiques.
- **Invariants** : règles qui doivent toujours être vraies pour un objet.

---

## 🧩 Exemple : `Money`
```js
class CurrencyError extends Error {}
class AmountError extends Error {}

class Money {
  constructor(amount, currency){
    if(!Number.isFinite(amount)) throw new AmountError('Amount must be finite');
    if(!/^([A-Z]{3})$/.test(currency)) throw new CurrencyError('Invalid currency');
    this.amount = Math.round(amount*100)/100; // 2 decimals
    this.currency = currency;
  }
  add(other){
    if(other.currency !== this.currency) throw new CurrencyError('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
  times(factor){
    return new Money(this.amount * factor, this.currency);
  }
}
```

### Invariants en JS (formules)
```js
function invariant(cond, msg){ if(!cond) throw new Error(msg); }
// Ex: invariant(balance >= 0, 'balance < 0');
```

---

## ⚠️ Pièges
- Silencer les erreurs au lieu de les traiter.
- Cacher les erreurs dans des getters (surprise pour l’appelant).

---

## 🔗 Références
- MDN Error: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error

---

## 🧭 Exercices
1. Implémentez `Percentage` (0..100) avec invariants.
2. Créez des erreurs spécialisées pour `OrderService`.

---

## ✅ Résumé
- Utilisez des **classes d’erreurs** et des **invariants** pour la robustesse.
