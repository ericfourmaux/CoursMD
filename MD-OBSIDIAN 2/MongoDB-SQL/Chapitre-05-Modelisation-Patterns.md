# 📘 Chapitre 5 — Modélisation des données : SQL vs MongoDB (patterns)

> [!summary]
> 🎯 **Objectif** : Choisir entre **embedding** et **referencing**, comprendre les cardinalités et éviter les anti-patterns.

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
- Identifier **1–1**, **1–N**, **N–N**.
- Maîtriser **embedding** vs **referencing**.
- Connaître les patterns MongoDB (Bucket, Polymorphic) et pièges.

## 🧠 Concepts clés

### 🧠 Cardinalités
- **Définition** : nombre de liens entre entités.
- **Pourquoi** : dicter la **forme** du modèle.
- **Exemple** : un `user` a N `orders` (1–N).

### 🧠 Embedding vs Referencing
- **Embedding** : inclure les sous-objets dans le document parent.
  - **Pourquoi** : lecture **rapide** sans jointure.
  - **Exemple** : `post` avec `comments` **embarqués**.
- **Referencing** : stocker des IDs et résoudre via `$lookup` ou côté application.
  - **Pourquoi** : éviter les documents **géants**, partage/reutilisation.
  - **Exemple** : `order_items` référencent `products` (SQL), `comments` séparés (Mongo).

### 🧠 Anti-patterns
- Documents > 16MB (limite MongoDB).
- Tableaux immenses non indexés.
- Dénormalisation sans stratégie de **mise à jour**.

## 💡 Exemple — Commentaires & Likes
- **SQL** : `comments(post_id FK)` ; `likes(user_id, post_id)` avec PK composite.
- **MongoDB** : `posts` **embedding** des 10 derniers commentaires + **referencing** pour l’historique.

## 🧾 Formules (JavaScript)

### Estimation taille et seuil d’alerte
```javascript
const estimateDocSize = (doc) => JSON.stringify(doc).length;
const exceedsLimit = (doc, limit=16*1024*1024) => estimateDocSize(doc) > limit;
```

## 🔧 TP — Double modélisation
1. Modélisez un **blog** en SQL (tables `posts`, `comments`, `tags`, jonctions N–N).
2. Modélisez le même domaine en MongoDB (embedding partiel + referencing).

## 🔎 À retenir / Checklist
- ✅ Choix **embedding** quand lecture **centrée** sur le parent.
- ✅ Choix **referencing** quand **réutilisation** et **volume** élevé.
- ✅ Indices sur les champs d’array.

## 📌 Résumé
La modélisation dicte la **performance** et la **simplicité** des requêtes. Un bon modèle **réduit** les jointures ou lookups **coûteux** et **limite** la duplication.
