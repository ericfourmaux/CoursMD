# 📘 Chapitre 6 — Indexation & performance : B-Tree, Hash, Text, Geo

> [!summary]
> 🎯 **Objectif** : Accélérer les requêtes en construisant des **index** adaptés et en lisant les **plans d’exécution**.

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
- Comprendre **B-Tree**, index composés, **covering** et **partial** index.
- Index **texte** et **géospatial** (MongoDB 2dsphere).
- Interpréter `EXPLAIN` (SQL) et `db.collection.explain()` (MongoDB).

## 🧠 Concepts clés

### 🧠 B-Tree
- **Définition** : structure arborescente équilibrée pour recherche par **préfixe** et **range**.
- **Pourquoi** : accélère `WHERE`, `ORDER BY`, `JOIN` sur clés.
- **Exemple** : `CREATE INDEX ON users(email);`

### 🧠 Index composés & ordre des colonnes
- **Définition** : `(a, b)` couvre `a` et `a+b` mais pas `b` seul.
- **Pourquoi** : ordre **critique** pour performance.

### 🧠 Covering & Partial index
- **Covering** : l’index contient tous les champs nécessaires → évite lecture table.
- **Partial** : index sur sous-ensemble (`WHERE active = true`).

### 🧠 Texte & Geo
- **SQL** : `GIN` pour `tsvector` (texte intégral, PostgreSQL).
- **MongoDB** : `text` et `2dsphere` pour requêtes géo.

## 💡 Exemples

> [!example] SQL — Index texte (PostgreSQL)
```sql
ALTER TABLE posts ADD COLUMN body_tsv tsvector;
UPDATE posts SET body_tsv = to_tsvector('french', body);
CREATE INDEX idx_posts_tsv ON posts USING GIN (body_tsv);
SELECT * FROM posts WHERE body_tsv @@ plainto_tsquery('french', 'performance index');
```

> [!example] MongoDB — Index géo
```javascript
db.places.createIndex({ location: '2dsphere' });
db.places.find({
  location: { $near: { $geometry: { type: 'Point', coordinates: [-73.56, 45.51] }, $maxDistance: 5000 } }
});
```

## 🧾 Formules (JavaScript)

### Coût d’écriture approximatif avec k index
```javascript
// nWrites : nombre d'écritures ; k : nb d'index ; c : coût unitaire
const writeCost = (nWrites, k, c=1) => nWrites * k * c;
```

## 🔧 TP — Lire des plans
1. Créez des index simples et composés ; comparez `EXPLAIN ANALYZE`.
2. Testez un **covering index** avec projection limitée.

## ⚠️ Piège courant
- Index composé mal ordonné → requêtes **non** accélérées.

## 🔎 À retenir / Checklist
- ✅ Index **pensés** pour vos requêtes **réelles**.
- ✅ Mesurer via `EXPLAIN ANALYZE`.
- ✅ Attention au **coût d’écriture** et à la **taille**.

## 📌 Résumé
Les index sont des **accélérateurs** : bien choisis, ils transforment une requête lente en requête **interactive**. Mais ils **coûtent** en écriture et mémoire — **mesurez**.
