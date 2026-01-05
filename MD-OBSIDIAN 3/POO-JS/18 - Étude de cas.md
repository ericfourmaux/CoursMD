
# 📘 Chapitre 18 — Étude de cas : mini‑application orientée objet

> 🎯 **Objectifs** : consolider tout le cours par un **projet fil rouge**.

---

## 🧠 Domaine : Gestion de commandes
- **Entités** : `Product`, `Customer`, `Order`, `Payment`.
- **Services** : `OrderService`, `PaymentProvider`, `InventoryService`.
- **UI** : MVC minimal (chap. 14).

---

## 🧩 Squelettes de code
```js
class Product { constructor(id, name, price){ Object.assign(this,{id,name,price}); } }
class Customer { constructor(id, name){ Object.assign(this,{id,name}); } }
class Order { constructor(id, customer){ this.id=id; this.customer=customer; this.items=[]; }
  add(product, qty=1){ this.items.push({product, qty}); }
  get total(){ return this.items.reduce((s,i)=> s + i.product.price*i.qty, 0); }
}

class InventoryService { hasStock(product, qty){ return true; } }
class PaymentProvider { process(amount){ return `paid:${amount}`; } }
class OrderService {
  constructor(inv=new InventoryService(), pay=new PaymentProvider()) { this.inv=inv; this.pay=pay; }
  place(order){ for(const it of order.items){ if(!this.inv.hasStock(it.product, it.qty)) throw new Error('no stock'); }
    const receipt = this.pay.process(order.total); return { status:'paid', receipt }; }
}
```

---

## 📈 Schéma global
```
[OrderService] --uses--> [InventoryService]
[OrderService] --uses--> [PaymentProvider]
[Order] --has-a--> [Items] --has-a--> [Product]
```

---

## 🧭 Exercices (capstone)
1. Ajoutez des tests unitaires (chap. 12).
2. Créez une UI minimaliste (chap. 14) pour passer des commandes.
3. Ajoutez un provider de paiement alternatif (chap. 7/9).

---

## ✅ Résumé
- Le projet intègre **domain modeling**, **services**, **tests** et **UI**.
