
# 📘 Chapitre 7 — Polymorphisme & Duck Typing

> 🎯 **Objectifs** : programmer par **contrats** (comportements), pas par types nominaux.

---

## 🧠 Concepts
- **Polymorphisme** : capacité d’objets différents à répondre à la **même interface**.
- **Duck typing** : « si ça marche comme un canard, c’est un canard » — basé sur la **présence** des méthodes.

---

## 🧩 Exemple : Providers de paiement
```js
function processPayment(provider, amount) {
  if (typeof provider.process !== 'function') {
    throw new TypeError('Provider doit implémenter process(amount)');
  }
  return provider.process(amount);
}

const StripeProvider = { process: (a) => `Stripe ok: ${a}` };
const PaypalProvider = { process: (a) => `Paypal ok: ${a}` };

console.log(processPayment(StripeProvider, 10));
```

### Stratégie (pattern)
```js
class PriceCalculator {
  constructor(strategy) { this.strategy = strategy; }
  setStrategy(s) { this.strategy = s; }
  total(items) { return this.strategy(items); }
}

const regular = items => items.reduce((s,i)=>s+i.price,0);
const withTax = items => items.reduce((s,i)=>s+i.price*1.2,0);

const calc = new PriceCalculator(regular);
console.log(calc.total([{price:10},{price:5}]));
calc.setStrategy(withTax);
console.log(calc.total([{price:10},{price:5}]));
```

---

## ⚠️ Pièges
- Contrats **implicites** → ajoutez des **vérifications** runtime.
- Couplage aux **types concrets** au lieu d’interface.

---

## 📈 Schéma
```
[processPayment] -> exige -> provider.process(amount)
```

---

## 🔗 Références
- MDN Typeof: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/typeof
- Patterns Strategy: (GOF concept)

---

## 🧭 Exercices
1. Écrire un moteur d’export `exporter.export(data)` avec plusieurs providers.
2. Ajouter des **guards** qui donnent des messages clairs.

---

## ✅ Résumé
- Le **polymorphisme** vise les **comportements**.
- En JS, on utilise le **duck typing** avec des **guards**.
