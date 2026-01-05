# 📘 Chapitre 12 — Outillage & workflow Dev

> [!summary]
> 🎯 **Objectif** : Travailler efficacement avec clients, observabilité, Docker et **seeds**.

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
- Utiliser `psql`, `mongo`, **mongosh**, **MongoDB Compass**.
- Observer via `EXPLAIN ANALYZE`, profiler, logs.
- Docker Compose pour un env **dev** reproductible ; **seeds**.

## 🧠 Concepts clés

### 🧠 Observabilité
- **Définition** : comprendre **ce qui se passe**.
- **Pourquoi** : performance et fiabilité.

### 🧠 Seed & fixtures
- **Définition** : données initiales **reproductibles**.
- **Pourquoi** : tests **cohérents**.

## 💡 Exemples

> [!example] Script de seed (Node.js)
```javascript
import { MongoClient } from 'mongodb';
import pg from 'pg';

// ... insérer quelques users/products et relier
```

## 🔧 TP — Compose complet
Créez `postgres + mongo + adminer`, ajoutez des scripts **seed**.

## 🔎 À retenir / Checklist
- ✅ Scripts **réutilisables**.
- ✅ Mesure avant optimisation.
- ✅ Logs **centralisés**.

## 📌 Résumé
Un bon outillage rend les problèmes **visibles** et les solutions **répétables**. Compose + seeds + observabilité = 
workflow **efficace**.
