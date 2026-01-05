# 📘 Chapitre 2 — Modèle relationnel (SQL) : tables, clés, normalisation

> [!summary]
> 🎯 **Objectif** : Maîtriser les **tables**, **clés** et la **normalisation** (1NF, 2NF, 3NF, BCNF) pour concevoir des schémas robustes.

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
- Comprendre les concepts de **clé primaire**, **clé étrangère**, **contraintes**.
- Appliquer la **normalisation** pour éviter redondances et anomalies.
- Concevoir un schéma e-commerce en **3NF**.

## 🧠 Concepts clés

### 🧠 Table, Ligne, Colonne
- **Définition** : structure rectangulaire ; chaque ligne respecte le schéma des colonnes.
- **Pourquoi** : garantir typage, validation, **intégrité**.
- **Exemple** : `users(id, email, created_at)`.

### 🧠 Clés
- **Clé primaire (PK)** : identifie **un** enregistrement (unique, non nul).
- **Clé étrangère (FK)** : référence une PK dans une autre table (intégrité référentielle).
- **Pourquoi** : relier les tables en **tissant** des **relations**.
- **Exemple** : `orders(user_id)` référence `users(id)`.

### 🧠 Contraintes
- `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`.
- **Pourquoi** : empêcher l’**anarchie** des données.

### 🧠 Normalisation
- **1NF** : pas de colonnes multivaluées ; valeurs atomiques.
- **2NF** : aucun attribut non-clef ne dépend d'une partie d'une clef composite.
- **3NF** : pas de dépendances **transitives** (A -> B -> C) pour attributs non-clefs.
- **BCNF** : toute dépendance fonctionnelle a une **super-clé** à gauche.
- **Pourquoi** : éviter anomalies d'insertion, de suppression, de mise à jour.

## 🧭 Analogie
**Classeurs & intercalaires** : chaque intercalaires (table) contient des fiches (lignes) avec des champs (colonnes) bien définis ; les numéros de référence (PK/FK) relient les classeurs.

## 💡 Exemple — Schéma e-commerce (3NF)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  order_id INT NOT NULL REFERENCES orders(id),
  product_id INT NOT NULL REFERENCES products(id),
  qty INT NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, product_id)
);
```

## ⚠️ Pièges courants
- Stocker plusieurs valeurs dans une seule colonne (`tags = "a,b,c"`) → **viol 1NF**.
- Oublier les **CHECK** sur quantités/prix.
- Ne pas indexer les FK très utilisées.

## 🔧 TP — Concevoir & vérifier
1. Écrivez le schéma ci-dessus, insérez des données, testez une **FK** cassée.
2. Ajoutez une table `categories` et une table de liaison `product_categories` (N–N).

## 🔎 À retenir / Checklist
- ✅ PK/FK correctement définies.
- ✅ Normalisation **jusqu’en 3NF** (dé-normaliser **si** nécessaire et justifié).
- ✅ Contraintes pour protéger les invariants.

## 📌 Résumé
Le modèle relationnel **structure** les données avec rigueur. La **normalisation** évite les anomalies et prépare des requêtes **fiables** et **performantes**.
