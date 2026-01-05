
# 📘 Chapitre 3 — Classes ES6 (sucre sur prototypes)

> 🎯 **Objectifs** : maîtriser `class`, `constructor`, `extends`, `super`, méthodes d’instance et statiques.

---

## 🧠 Définitions
- **`class`** : syntaxe pour définir des prototypes et méthodes.
- **`constructor`** : fonction d’initialisation appelée avec `new`.
- **`extends`** : crée une relation prototype entre classes.
- **`super`** : appelle le constructeur ou méthodes du parent.
- **Méthodes statiques** : attachées à la **classe**, pas à l’instance.

💡 **Analogie** : Une **fiche de plan** (classe) pour fabriquer des **objets** (instances).

---

## 🧩 Exemple complet : `Account`
```js
class Account {
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new Account(data.owner, data.balance ?? 0);
  }
  #balance = 0; // champ privé
  constructor(owner, initial = 0) {
    this.owner = owner;
    this.#balance = Number(initial);
  }
  deposit(amount) {
    if (amount <= 0) throw new Error('Montant invalide');
    this.#balance += amount;
    return this.#balance;
  }
  withdraw(amount) {
    if (amount <= 0 || amount > this.#balance) throw new Error('Montant invalide');
    this.#balance -= amount;
    return this.#balance;
  }
  get balance() { return this.#balance; }
}

class SavingsAccount extends Account {
  constructor(owner, initial = 0, rate = 0.02) {
    super(owner, initial);
    this.rate = rate;
  }
  accrue() { return this.deposit(this.balance * this.rate); }
}

const a = new SavingsAccount('Alice', 100);
a.accrue();
console.log(a.balance);
```

---

## ⚠️ Pièges
- `class` n’introduit pas d’**interfaces** ni d’**overload**.
- Les champs `#privés` ne sont pas accessibles hors classe.

---

## 📈 Schéma (ASCII)
```
[SavingsAccount] --extends--> [Account]
   | methods (accrue)            | methods (deposit, withdraw)
   | fields (rate)               | private #balance
```

---

## 🔗 Références
- MDN Classes: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes
- Champs privés: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes/Private_class_fields

---

## 🧭 Exercices
1. Ajoutez une méthode statique `Account.sum(...accounts)` qui additionne les soldes.
2. Créez `CheckingAccount` avec `fee` lors des retraits.

---

## ✅ Résumé
- `class` encapsule le modèle **prototype**.
- `extends`/`super` structurent l’héritage.
- Les **champs privés** garantissent l’encapsulation.
