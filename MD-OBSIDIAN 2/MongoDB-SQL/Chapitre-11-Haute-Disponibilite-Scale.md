# 📘 Chapitre 11 — Haute disponibilité & scale

> [!summary]
> 🎯 **Objectif** : Construire des systèmes **résilients** : réplication, partitions, sharding.

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
- SQL : **réplication**, **partitionnement**, (selon moteur) **sharding**.
- MongoDB : **Replica Sets**, **Sharding**.

## 🧠 Concepts clés

### 🧠 Réplication
- **Définition** : copier les données sur plusieurs nœuds.
- **Pourquoi** : **disponibilité** et **lecture** à grande échelle.

### 🧠 Partitionnement / Sharding
- **Définition** : distribuer par **clé** ; équilibrage.
- **Pourquoi** : dépasser la capacité d’un seul nœud.

## 💡 Exemples

> [!example] MongoDB — Replica Set (local)
```bash
mongod --replSet rs0
mongosh --eval "rs.initiate()"
```

> [!example] PostgreSQL — Partition
```sql
CREATE TABLE events (
  id BIGSERIAL, created_at TIMESTAMPTZ, payload JSONB
) PARTITION BY RANGE (created_at);
```

## 🔧 TP — Failover
1. Montez un **replica set** et arrêtez le primaire pour observer le **failover**.
2. Créez des **partitions** par date et mesurez les **plans**.

## 🔎 À retenir / Checklist
- ✅ Choix de clé de shard **stable**.
- ✅ Surveiller **lag** de réplication.
- ✅ CAP : compromis assumé.

## 📌 Résumé
La haute disponibilité repose sur la **duplication** et la **distribution**. Comprenez vos **compromis** et testez les **pannes**.
