# 📘 Chapitre 3 — Langage SQL : DDL, DML, DQL & jointures

> [!summary]
> 🎯 **Objectif** : Savoir **créer**, **modifier**, **insérer** et **requêter** des données, maîtriser les **jointures** et les **agrégations**.

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
- DDL (`CREATE`, `ALTER`, `DROP`) ; DML (`INSERT`, `UPDATE`, `DELETE`) ; DQL (`SELECT`).
- Jointures (`INNER`, `LEFT`, `RIGHT`, `FULL`), `GROUP BY`, `HAVING`, `CTE`.
- Éviter l’**injection SQL** (requêtes préparées).

## 🧠 Concepts clés

### 🧠 DDL
- **Définition** : opérations sur le schéma.
- **Pourquoi** : versionner et migrer.
- **Exemple** : `ALTER TABLE products ADD COLUMN weight NUMERIC;`.

### 🧠 DML
- **Définition** : opérations sur les données.
- **Pourquoi** : gérer le cycle de vie.
- **Exemple** : `INSERT INTO products(title, sku, price) VALUES (...)`.

### 🧠 DQL
- **Définition** : `SELECT` pour lire.
- **Pourquoi** : extraire **l’information**.
- **Exemple** : `SELECT title, price FROM products WHERE price > 100;`.

### 🧠 JOINS
- **INNER** (intersection), **LEFT/RIGHT** (préserver côté gauche/droit), **FULL** (union).
- **Pourquoi** : naviguer entre **relations**.

## 💡 Exemples

> [!example] Jointure & agrégation
```sql
WITH sales AS (
  SELECT oi.product_id, SUM(oi.qty) AS units
  FROM order_items oi
  GROUP BY oi.product_id
)
SELECT p.title, s.units
FROM products p
JOIN sales s ON p.id = s.product_id
ORDER BY s.units DESC
LIMIT 10;
```

> [!example] Préparer une requête (Node.js pg)
```javascript
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', ['alice@example.com']);
```

## 🧾 Formules (JavaScript)

### Somme cumulée (fenêtre)
```javascript
const cumulative = (arr) => arr.map((x, i) => arr.slice(0, i+1).reduce((a,b)=>a+b,0));
```

## 🔧 TP — 10 requêtes clés
1. TOP N produits par ventes.
2. Chiffre d'affaires par jour (`GROUP BY date_trunc('day', created_at)`).
3. Clients sans commandes (**LEFT JOIN** + `WHERE orders.id IS NULL`).
4. Panier moyen (`SUM(price*qty)/COUNT(DISTINCT order_id)`).
5. `CTE` pour filtrer puis joindre.

## 🔎 À retenir / Checklist
- ✅ Jointures maîtrisées.
- ✅ Agrégations et `CTE`.
- ✅ Paramétrage contre l’**injection**.

## 📌 Résumé
SQL offre un langage **déclaratif puissant** : vous exprimez **quoi** obtenir ; l’optimiseur choisit **comment**. Les jointures relient vos tables ; les agrégations transforment les données en **insights**.
