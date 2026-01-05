# 📘 Chapitre 7 — Concurrence & transactions : isolation, verrous, MVCC

> [!summary]
> 🎯 **Objectif** : Écrire sûr en multi-utilisateurs : niveaux d’**isolation**, **verrous**, et **MVCC**.

## 🧭 Légende des icônes

- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 💡 **Exemple**
- 🧭 **Analogie**
- 🔧 **Pratique / TP**
- 🧰 **Outils**
- 🔎 **À retenir / Checklist**
- ⚠️ **Piège courant**
- 🧪 **Mini-projet**
- 🏁 **Quiz & Évaluation**
- 🧾 **Formule (JavaScript)**

## 🎯 Objectifs
- Connaître les niveaux d’isolation (`READ COMMITTED` → `SERIALIZABLE`).
- Comprendre **locks** vs **MVCC** et les **deadlocks**.
- Utiliser transactions MongoDB multi-documents, `writeConcern`, `readConcern`.

## 🧠 Concepts clés

### 🧠 MVCC (Multi-Version Concurrency Control)
- **Définition** : chaque transaction voit un **snapshot** cohérent.
- **Pourquoi** : réduire la **contention**.

### 🧠 Deadlock
- **Définition** : deux transactions se bloquent mutuellement.
- **Pourquoi** : imposer un **ordre** d’accès.

### 🧠 Niveaux d’isolation
- `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`.

## 💡 Exemples

> [!example] PostgreSQL — Isolation & deadlock
```sql
BEGIN;
UPDATE inventory SET qty = qty - 1 WHERE product_id = 10; -- T1
-- T2 met à jour dans ordre inversé → risque de deadlock
```

> [!example] MongoDB — Transaction multi-docs
```javascript
const session = db.getMongo().startSession();
session.startTransaction();
try {
  const coll = session.getDatabase('appdb').getCollection('orders');
  coll.updateOne({ _id: 1 }, { $set: { status: 'paid' } });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
}
```

## 🧾 Formules (JavaScript)

### Contention estimée
```javascript
const contention = (threads, pConflict) => threads * pConflict;
```

## 🔧 TP — Simuler concurrence
1. Deux sessions SQL qui mettent à jour les mêmes lignes : observez verrous.
2. Transactions MongoDB avec `writeConcern: 'majority'` et lecture `readConcern: 'majority'`.

## 🔎 À retenir / Checklist
- ✅ Choisir le **niveau d’isolation** adapté.
- ✅ Stratégie d’accès pour éviter **deadlocks**.
- ✅ Idempotence et **retries**.

## 📌 Résumé
La concurrence impose **discipline** et **stratégie** : isolation choisie, ordre d’accès, et gestion des **reprises** (retries) assurent la **fiabilité**.
