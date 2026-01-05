
# 📘 Chapitre 9 — Design Patterns (création, structure, comportement)

> 🎯 **Objectifs** : connaître et implémenter les patterns majeurs en JS.

---

## 🧩 Sélection de patterns

### 🎛️ Factory
```js
function createUser(type, name){
  const base = { name };
  if(type==='admin') return { ...base, role:'admin', canDelete:true };
  return { ...base, role:'user', canDelete:false };
}
```

### 🧰 Builder
```js
class QueryBuilder {
  constructor(){ this._parts = []; }
  where(c){ this._parts.push(`WHERE ${c}`); return this; }
  orderBy(f){ this._parts.push(`ORDER BY ${f}`); return this; }
  build(){ return this._parts.join(' '); }
}
```

### 🚨 Singleton (avec prudence)
```js
const Config = (function(){
  let instance;
  return {
    get(){ if(!instance) instance = { env:'prod' }; return instance; }
  };
})();
```

### 🧱 Facade
```js
function startApp(db, http){ db.connect(); http.listen(3000); }
```

### 🔌 Adapter
```js
function csvAdapter(rows){ return rows.map(r=>r.join(',')); }
```

### 🎭 Decorator
```js
function withCache(fn){
  const cache = new Map();
  return (...args)=>{
    const k = JSON.stringify(args);
    if(cache.has(k)) return cache.get(k);
    const res = fn(...args); cache.set(k,res); return res;
  };
}
```

### 👁️ Observer
```js
class EventEmitter {
  constructor(){ this._events = new Map(); }
  on(evt, fn){ const list = this._events.get(evt)||[]; list.push(fn); this._events.set(evt,list); }
  emit(evt, ...args){ (this._events.get(evt)||[]).forEach(fn=>fn(...args)); }
}
```

### 🎮 Command
```js
class Command { execute(){ throw new Error('abstract'); } }
class PrintCommand extends Command { constructor(msg){ super(); this.msg=msg; } execute(){ console.log(this.msg); } }
```

### 🔀 Strategy
(voir chapitre 7)

### 🔁 State
```js
class TrafficLight {
  constructor(){ this.state='red'; }
  next(){ this.state = this.state==='red' ? 'green' : this.state==='green' ? 'yellow' : 'red'; }
}
```

---

## 📈 Schéma Observer
```
[Emitter] --on(evt,fn)--> [Listeners]
           --emit(evt)--> triggers
```

---

## 🔗 Références
- Patterns GOF (concepts généraux).
- MDN Proxy/Reflect: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Proxy

---

## 🧭 Exercices
1. Implémentez `withRetry(fn, times)` (Decorator).
2. Créez `FileReader` avec `read` Command et `undo`.

---

## ✅ Résumé
- Les patterns sont des **boîtes à outils** réutilisables.
- JS les implémente avec **fonctions**, **objets**, **classes**.
