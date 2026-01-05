
# 📘 Chapitre 10 — POO & Asynchronisme : Promises, `async/await`

> 🎯 **Objectifs** : intégrer l’async dans des classes et patterns.

---

## 🧠 Concepts
- **Promise** : un conteneur de résultat futur (succès/échec).
- **`async/await`** : sucre syntaxique pour écrire du code async lisible.
- **Cancellation** (pattern) : utiliser des **tokens** ou des flags.

---

## 🧩 Exemple : `TaskQueue` avec retries
```js
class TaskQueue {
  constructor(concurrency=1){
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  push(task){
    this.queue.push(task);
    this._next();
  }
  async _next(){
    if(this.running >= this.concurrency || this.queue.length===0) return;
    const task = this.queue.shift();
    this.running++;
    try { await task(); } catch(e){ console.error('Task error', e); }
    finally { this.running--; this._next(); }
  }
}

const q = new TaskQueue(2);
q.push(async ()=>{ await new Promise(r=>setTimeout(r,100)); console.log('A'); });
q.push(async ()=>{ await new Promise(r=>setTimeout(r,50)); console.log('B'); });
q.push(async ()=>{ console.log('C'); });
```

---

## ⚠️ Pièges
- Oublier `await` → **promesse non attendue**.
- Exceptions non attrapées → utilisez `try/catch`.

---

## 🔗 Références
- MDN Promises: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise
- MDN async/await: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/async_function

---

## 🧭 Exercices
1. Ajoutez `retries` et `backoff` exponentiel à `TaskQueue`.
2. Créez un `CancelableTask` avec un token `{ canceled:true }`.

---

## ✅ Résumé
- Les **Promesses** modélisent des résultats futurs.
- `async/await` rend l’async **séquentiel** lisible.
