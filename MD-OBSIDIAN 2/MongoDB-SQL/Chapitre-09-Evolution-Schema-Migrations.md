# 📘 Chapitre 9 — Évolution de schéma & migrations

> [!summary]
> 🎯 **Objectif** : Faire évoluer le schéma **sans casser** : migrations SQL, validations MongoDB et **backfill** progressifs.

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
- DDL **versionnées** et migrations transactionnelles.
- MongoDB **Schema Validation** et migrations progressives.

## 🧠 Concepts clés

### 🧠 Migration
- **Définition** : modification du schéma et/ou des données avec **étapes** sûres.
- **Pourquoi** : permettre **évolutions** sans temps d’arrêt.

### 🧠 Backfill & Rolling changes
- **Backfill** : remplir les nouvelles colonnes/champs.
- **Rolling** : déployer par **petits pas**.

## 💡 Exemples

> [!example] PostgreSQL — Migration transactionnelle
```sql
BEGIN;
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
UPDATE users SET is_active = true WHERE is_active IS NULL;
COMMIT;
```

> [!example] MongoDB — Validation de schéma
```javascript
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email'],
      properties: {
        email: { bsonType: 'string', pattern: '^.+@.+$' },
        prefs: { bsonType: 'object' }
      }
    }
  }
});
```

## 🔧 TP — Écrire une migration sûre
1. Ajouter une contrainte `CHECK` puis effectuer un **backfill**.
2. Mettre en place une **validation** JSONSchema en MongoDB.

## 🔎 À retenir / Checklist
- ✅ Toujours prévoir **rollback**.
- ✅ Étager : déployer schéma, adapter code, migrer données.
- ✅ Journaliser et **auditer**.

## 📌 Résumé
Les migrations **disciplinées** et **testées** évitent les incidents. Combinez transactions SQL et validations MongoDB pour évoluer **en confiance**.
