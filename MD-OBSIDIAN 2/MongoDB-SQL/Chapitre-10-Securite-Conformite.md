# 📘 Chapitre 10 — Sécurité & conformité

> [!summary]
> 🎯 **Objectif** : Protéger les données : **authentification**, **rôles**, **chiffrement**, et **RLS**.

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
- Configurer rôles et permissions.
- Chiffrement **au repos** et **en transit**.
- **Row-Level Security** (PostgreSQL) ; **Field Level Encryption** (MongoDB).

## 🧠 Concepts clés

### 🧠 Auth & Rôles
- **Définition** : contrôler qui peut faire quoi.
- **Pourquoi** : principe du **moindre privilège**.

### 🧠 Chiffrement
- **Au repos** : disques/volumes.
- **En transit** : TLS/SSL.
- **Champ par champ** : FLE MongoDB pour PII.

### 🧠 RLS (Row-Level Security)
- **Définition** : règles par ligne selon l’utilisateur.
- **Pourquoi** : multi-tenant sécurisé.

## 💡 Exemples

> [!example] PostgreSQL — RLS
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_orders ON orders
USING (user_id = current_setting('app.user_id')::int);
```

> [!example] MongoDB — Rôle personnalisé
```javascript
db.createRole({
  role: 'appReader',
  privileges: [ { resource: { db: 'appdb', collection: '' }, actions: ['find'] } ],
  roles: []
});
```

## 🔧 TP — Sécuriser
1. Mettre en place TLS (local) et utilisateurs à rôles limités.
2. Appliquer RLS sur une table **multi-tenant**.

## 🔎 À retenir / Checklist
- ✅ Secrets dans `.env`.
- ✅ Rotation des clés & audit.
- ✅ Principe du moindre privilège.

## 📌 Résumé
La sécurité n’est pas un **ajout** mais une **exigence**. Rôles, chiffrement, et RLS/FLE structurent une **défense** solide.
