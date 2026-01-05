
# 📘 Chapitre 6 — Héritage vs Composition

> 🎯 **Objectifs** : choisir entre **is-a** (héritage) et **has-a** (composition).

---

## 🧠 Principes
- **Héritage** : réutiliser et spécialiser un **type**.
- **Composition** : assembler des **comportements**.
- En JS : favoriser la **composition** pour limiter le couplage.

💡 **Analogie** : Hériter des **gènes** vs assembler une **trousse à outils**.

---

## 🧩 Exemple : `Logger` composé
```js
class Logger { log(msg) { console.log(`[LOG] ${msg}`); } }

class Service {
  constructor(dep, logger = new Logger()) {
    this.dep = dep;
    this.logger = logger; // composition
  }
  run() {
    this.logger.log('start');
    this.dep();
    this.logger.log('end');
  }
}
```

### Contre‑exemple par héritage
```js
class LoggingService extends Logger {
  constructor(dep) { super(); this.dep = dep; }
  run() { this.log('start'); this.dep(); this.log('end'); }
}
```

---

## ⚠️ Pièges
- Héritage pour **partager utils** → préférez **modules**/
  composition.
- Cassure LSP en surchargant des préconditions/postconditions.

---

## 📈 Schéma
```
[Service] --has-a--> [Logger]
```

---

## 🔗 Références
- Favor composition over inheritance: (Concept général, voir patterns GOF)
- MDN Classes `extends`: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Classes/extends

---

## 🧭 Exercices
1. Refactorisez une hiérarchie `Animal -> Bird -> Eagle` vers composition (modules de vol/chasse).
2. Créez un décorateur `withTiming(service)` qui mesure `run()`.

---

## ✅ Résumé
- **Composition** réduit le couplage et augmente la flexibilité.
- L’**héritage** reste utile pour des **sous‑types** clairs.
