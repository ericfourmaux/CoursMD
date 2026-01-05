# 📘 Chapitre 1 — Fondamentaux des bases de données

> [!summary]
> 🎯 **Objectif** : Comprendre les propriétés **ACID**, **BASE**, et le théorème **CAP** pour orienter vos choix techniques entre SQL et MongoDB.

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
- Définir précisément **ACID**, **BASE**, **CAP**.
- Savoir **quand** chaque propriété est indispensable.
- Simuler les effets de **transactions** et de **cohérence éventuelle**.

## 🧠 Concepts clés

### 🧠 ACID
- **Définition** :
  - **Atomicity** : tout ou rien.
  - **Consistency** : respecter les contraintes du schéma avant/après.
  - **Isolation** : absence d'interférence entre transactions concurrentes.
  - **Durability** : persistance malgré crash (journal, fsync).
- **Pourquoi** : garantir la **fiabilité** pour les opérations critiques (paiements, stocks).
- **Exemple** : Transfert bancaire `A -> B` : débit et crédit doivent réussir ensemble (transaction).

### 🧠 BASE
- **Définition** :
  - **Basically Available** : disponibilité même sous partitions.
  - **Soft state** : état intermédiaire possible.
  - **Eventual consistency** : cohérence **éventuelle** avec le temps.
- **Pourquoi** : permettre la **scalabilité** et la tolérance de pannes dans des systèmes distribués.
- **Exemple** : Compteur de vues sur un réseau social — cohérence parfaite non critique.

### 🧠 CAP (Consistency, Availability, Partition tolerance)
- **Définition** : en présence de **partitions** réseau, choix entre **C** et **A**.
- **Pourquoi** : orienter l’architecture (cluster SQL, replica set MongoDB).
- **Exemple** : Système en lecture disponible (A+P) mais la cohérence peut tarder (NoSQL).

## 🧭 Analogie
**Banque vs Réseau social** : la banque (ACID) ne tolère aucun écart ; un réseau social (BASE) peut afficher un nombre de likes approximatif et corriger ensuite.

## 💡 Exemples

> [!example] SQL — Transaction atomique (PostgreSQL)
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- ROLLBACK en cas d'erreur
```

> [!example] MongoDB — Cohérence éventuelle
```javascript
// Ecriture sur primaire, lecture possible sur réplique avec readPreference 'secondary'
db.views.updateOne({postId: 123}, {$inc: {count: 1}}, {upsert: true});
// Une lecture sur une réplique peut "voir" l'état N-1 pendant la réplication
```

## 🧾 Formules (JavaScript)

### Probabilité de réussite d'un lot de n opérations indépendantes
```javascript
const pSuccessBatch = (p, n) => 1 - Math.pow(1 - p, n);
```

### Contention (approximation)
```javascript
// threads : nombre de transactions concurrentes
// pConflict : probabilité d'un conflit par transaction
const contention = (threads, pConflict) => threads * pConflict;
```

## 🔧 TP — Simuler isolation et cohérence
1. Créez deux sessions SQL et essayez `UPDATE` sur la même ligne sous `READ COMMITTED`.
2. En MongoDB, écrivez sur la primaire puis lisez sur une secondaire pour observer le **lag**.

## 🔎 À retenir / Checklist
- ✅ ACID pour opérations **critiques**.
- ✅ BASE pour systèmes **scalables** avec métriques **approximatives**.
- ✅ CAP guide les compromis en cas de **partition** réseau.

## 📌 Résumé
ACID garantit la **sécurité transactionnelle** ; BASE favorise la **disponibilité** et l’**évolutivité**. CAP explique que l’on ne peut pas tout avoir en cas de partition : il faut **choisir**.
