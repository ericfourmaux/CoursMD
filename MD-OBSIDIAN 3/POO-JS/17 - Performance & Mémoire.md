
# 📘 Chapitre 17 — Performance, mémoire & garbage collector

> 🎯 **Objectifs** : éviter sur‑allocation, fuites, cycles de référence.

---

## 🧠 Concepts
- **GC** : libère la mémoire des objets non référencés.
- **`WeakMap`/`WeakSet`** : références faibles pour caches.
- **Immutabilité** : limite effets de bord.

---

## 🧩 Exemple : Cache avec `WeakMap`
```js
const cache = new WeakMap();
function getData(obj){
  if(cache.has(obj)) return cache.get(obj);
  const v = compute(obj); // lourd
  cache.set(obj, v);
  return v;
}
```

---

## ⚠️ Pièges
- Retenir des listeners (fuite mémoire).
- Créer des **objets temporaires** dans des boucles serrées.

---

## 🔗 Références
- MDN WeakMap: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

---

## 🧭 Exercices
1. Implémentez `withAutoRemove(emitter, evt, fn)` qui supprime le listener.
2. Mesurez allocations d’un algorithme (profiling).

---

## ✅ Résumé
- Utilisez `WeakMap` pour caches sur objets.
- Nettoyez les **listeners** et évitez la sur‑allocation.
