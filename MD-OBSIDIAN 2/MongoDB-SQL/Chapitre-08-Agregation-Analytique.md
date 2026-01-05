# 📘 Chapitre 8 — Agrégation & analytique : GROUP BY, fenêtres & pipelines

> [!summary]
> 🎯 **Objectif** : Produire des **KPIs** via `GROUP BY`/fonctions **fenêtres** en SQL et via le **pipeline d’agrégation** MongoDB.

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
- SQL : `GROUP BY`, `HAVING`, **fenêtres** (`ROW_NUMBER`, `SUM OVER`).
- MongoDB : `$match`, `$group`, `$project`, `$sort`, `$lookup`, `$facet`, `$setWindowFields`.

## 🧠 Concepts clés

### 🧠 Fenêtres (SQL)
- **Définition** : calculs sur un **partitionnement** avec **ordre**.
- **Pourquoi** : classements, cumuls, moyennes mobiles.

### 🧠 Aggregation pipeline (MongoDB)
- **Définition** : enchaînement de **stages** transformant le flux de documents.
- **Pourquoi** : flexibilité et **expressivité** côté serveur.

## 💡 Exemples

> [!example] SQL — Classement des ventes
```sql
SELECT p.title,
       SUM(oi.qty) AS units,
       RANK() OVER (ORDER BY SUM(oi.qty) DESC) AS r
FROM products p
JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.title
ORDER BY units DESC;
```

> [!example] MongoDB — Pipeline de KPIs
```javascript
db.orders.aggregate([
  { $match: { createdAt: { $gte: ISODate('2025-01-01') } } },
  { $lookup: { from: 'order_items', localField: '_id', foreignField: 'orderId', as: 'items' } },
  { $unwind: '$items' },
  { $group: { _id: '$items.productId', units: { $sum: '$items.qty' } } },
  { $sort: { units: -1 } },
  { $limit: 10 }
]);
```

## 🧾 Formules (JavaScript)

### Moyenne mobile
```javascript
const movingAverage = (arr, w) => arr.map((_, i) => {
  const slice = arr.slice(Math.max(0, i-w+1), i+1);
  return slice.reduce((a,b)=>a+b,0) / slice.length;
});
```

## 🔧 TP — Équivalences
1. Produisez un **top produits** en SQL, puis en MongoDB.
2. Comparez performances et cardinalité après **filtrage** précoce (`$match`, `WHERE`).

## ⚠️ Piège
- `$lookup` volumineux → mieux **pré-agréger** ou dénormaliser.

## 🔎 À retenir / Checklist
- ✅ Fenêtres pour classements et cumuls.
- ✅ Pipelines pour transformations riches.
- ✅ Optimiser l’ordre des **stages** et des **filtres**.

## 📌 Résumé
SQL et MongoDB offrent des outils analytiques puissants : gardez le **push-down** des filtres, le **tri**, et la **cardinalité** en tête pour des performances **optimales**.
