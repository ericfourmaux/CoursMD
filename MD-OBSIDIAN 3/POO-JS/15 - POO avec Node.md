
# 📘 Chapitre 15 — POO côté Node.js : EventEmitter, Streams, services

> 🎯 **Objectifs** : tirer parti des APIs Node orientées objet.

---

## 🧠 Concepts
- **EventEmitter** : Observer natif Node.
- **Streams** : lecture/écriture en flux.

---

## 🧩 Exemple : `FileImportService`
```js
const { EventEmitter } = require('events');
class FileImportService extends EventEmitter {
  async import(lines){
    let ok=0, ko=0;
    for(const line of lines){
      try { /* parse */ ok++; this.emit('row', line); }
      catch(e){ ko++; this.emit('error', e); }
    }
    this.emit('done', { ok, ko });
  }
}
```

---

## 🔗 Références
- Node EventEmitter: https://nodejs.org/api/events.html
- Node Streams: https://nodejs.org/api/stream.html

---

## 🧭 Exercices
1. Écoutez `row/error/done` pour logger et métriques.
2. Remplacez le tableau par un Stream de lecture.

---

## ✅ Résumé
- Node fournit des **objets** pour événements et flux.
- Les **services** OO orchestrent ces APIs.
