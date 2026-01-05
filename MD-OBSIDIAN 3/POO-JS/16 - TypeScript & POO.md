
# 📘 Chapitre 16 — TypeScript pour renforcer les contrats (bonus)

> 🎯 **Objectifs** : introduire types, interfaces, classes abstraites.

---

## 🧠 Concepts
- **Interfaces structurelles** : TypeScript match par **forme** (duck typing).
- **Classes abstraites** : imposent des méthodes à implémenter.
- **Generics** : réutilisables et sûrs.

---

## 🧩 Exemple (TS, pour idée)
```ts
interface Provider { process(amount:number): string; }
class OrderService {
  constructor(private provider: Provider) {}
  place(total:number){ return this.provider.process(total); }
}
```

---

## 🔗 Références
- TS Handbook: https://www.typescriptlang.org/docs/

---

## 🧭 Exercices
1. Définissez une interface `Repository<T>` et implémentez‑la.

---

## ✅ Résumé
- TS formalise les **contrats** et aide à prévenir des erreurs.
