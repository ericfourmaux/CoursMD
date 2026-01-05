# 📘 Chapitre 4 — Modèle document (MongoDB) : JSON/BSON, collections & CRUD

> [!summary]
> 🎯 **Objectif** : Comprendre le modèle **document**, manipuler les collections et maîtriser le **CRUD** en MongoDB.

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
- Documents **JSON/BSON**, `_id`, schéma **flexible**.
- Opérations CRUD (`insertOne`, `find`, `updateOne`, `deleteOne`).
- Opérateurs (`$set`, `$inc`, `$push`, `$in`, `$regex`).

## 🧠 Concepts clés

### 🧠 Document & Collection
- **Définition** : un document est un **objet JSON** enrichi (BSON) ; une collection regroupe des documents.
- **Pourquoi** : capturer des **structures riches** (objets, tableaux) sans éclater en plusieurs tables.
- **Exemple** : profil utilisateur avec préférences et adresses **embarquées**.

### 🧠 `_id`
- **Définition** : identifiant unique du document (ObjectId par défaut).
- **Pourquoi** : accès direct, référence.

## 💡 Exemples CRUD
```javascript
// Create
db.users.insertOne({ email: 'alice@example.com', prefs: { theme: 'dark' }, addresses: [] });

// Read
db.users.find({ email: /@example\.com$/ }, { email: 1, 'prefs.theme': 1 });

// Update
db.users.updateOne(
  { email: 'alice@example.com' },
  { $set: { 'prefs.lang': 'fr' }, $push: { addresses: { city: 'Montréal', zip: 'H2X' } } }
);

// Delete
db.users.deleteOne({ email: 'alice@example.com' });
```

## 🧭 Analogie
**Dossier avec sous-pages** : un document est un dossier complet ; on y ajoute des sous-pages (tableaux) et des champs.

## 🧾 Formules (JavaScript)

### Estimer la taille d’un document (approx.)
```javascript
const estimateDocSize = (doc) => JSON.stringify(doc).length;
```

## 🔧 TP — Posts, tags, commentaires
1. Créez `posts` avec `{ title, body, tags: [], comments: [] }`.
2. Requêtes : par tag (`$in`), par texte (`$regex`), projection (`{title:1, tags:1}`).
3. Mise à jour : `$push` un commentaire.

## 🔎 À retenir / Checklist
- ✅ `_id` géré par MongoDB (ObjectId).
- ✅ Projections pour limiter la charge.
- ✅ Opérateurs adaptés (`$set`, `$push`, `$inc`).

## 📌 Résumé
MongoDB propose un modèle **souple** qui colle à la forme **native** des objets d’application. Le CRUD et les opérateurs permettent des mises à jour **expressives**.
