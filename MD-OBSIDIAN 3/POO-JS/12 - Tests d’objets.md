
# 📘 Chapitre 12 — Tests unitaires d’objets (Jest) & TDD léger

> 🎯 **Objectifs** : tester méthodes, isoler dépendances, mock/stub/spies.

---

## 🧠 Concepts
- **Tests de comportement** (sorties/effets) vs **d’état**.
- **Mock** (remplace dépendance), **spy** (observe appels).

---

## 🧩 Exemple : `OrderService`
```js
class PaymentProvider { process(amount){ return `ok:${amount}`; } }
class OrderService {
  constructor(provider=new PaymentProvider()) { this.provider = provider; }
  place(order){ const res = this.provider.process(order.total); return { status:'paid', receipt:res }; }
}
```

### Tests (pseudo Jest)
```js
test('place() utilise provider.process', () => {
  const calls = [];
  const mockProvider = { process: (a) => { calls.push(a); return 'ok'; } };
  const svc = new OrderService(mockProvider);
  const out = svc.place({ total: 10 });
  expect(calls[0]).toBe(10);
  expect(out.status).toBe('paid');
});
```

---

## ⚠️ Pièges
- Tester l’**implémentation** plutôt que le **contrat**.
- Tests fragiles dépendants de l’ordre.

---

## 🔗 Références
- Jest: https://jestjs.io/fr/docs/getting-started

---

## 🧭 Exercices
1. Mockez `Emailer` et testez `UserService.register`.
2. Ajoutez des tests d’erreurs pour `Money`.

---

## ✅ Résumé
- Les tests assurent le **contrat** des objets.
- Mock/spy isolent les **dépendances**.
