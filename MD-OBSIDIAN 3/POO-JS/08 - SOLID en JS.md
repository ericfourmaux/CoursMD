
# 📘 Chapitre 8 — SOLID en JavaScript (adaptation pragmatique)

> 🎯 **Objectifs** : appliquer SRP, OCP, LSP, ISP, DIP en JS moderne.

---

## 🧠 Principes
- **SRP** : une classe/module doit avoir une **responsabilité unique**.
- **OCP** : ouvert à l’extension, fermé à la modification.
- **LSP** : les sous‑types doivent respecter les contrats du parent.
- **ISP** : préférer des interfaces **spécifiques**.
- **DIP** : dépendre d’**abstractions**, pas de concret.

---

## 🧩 Étude : `UserService` monolithe → refactor
```js
class UserRepo { findById(id){ /* ... */ } save(user){ /* ... */ } }
class Emailer { sendWelcome(user){ /* ... */ } }

class UserService {
  constructor(repo = new UserRepo(), emailer = new Emailer()) {
    this.repo = repo; // DIP
    this.emailer = emailer;
  }
  register(data) { // SRP: enregistrement
    const user = { id: Date.now(), ...data };
    this.repo.save(user);
    this.emailer.sendWelcome(user); // OCP via provider
    return user;
  }
}
```

---

## ⚠️ Pièges
- Sur‑généraliser (abstractions inutiles).
- LSP violé par des sous‑types qui jettent des erreurs inattendues.

---

## 🔗 Références
- Principes SOLID (concepts généraux).

---

## 🧭 Exercices
1. Découpez un service « paiement » monolithe en repo/provider/validator.
2. Ajoutez un nouveau provider sans modifier `UserService` (OCP).

---

## ✅ Résumé
- SOLID guide la **structure** des objets/modules.
- En JS, utilisez fonctions + classes pour **découpler**.
