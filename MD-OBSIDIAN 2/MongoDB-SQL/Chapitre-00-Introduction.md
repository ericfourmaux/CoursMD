# 📘 Chapitre 0 — Introduction & feuille de route

> [!summary]
> 🎯 **Objectif** : Poser les bases (vocabulaire, posture, outils) et démarrer un environnement local reproductible pour pratiquer **SQL** (PostgreSQL) et **MongoDB**.

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
- Comprendre pourquoi on apprend **SQL** (modèle relationnel) et **MongoDB** (modèle document).
- Connaître le vocabulaire clé : *donnée*, *information*, *base de données*, *moteur*, *client*, *serveur*, *requête*, *index*, *transaction*.
- Installer et initialiser un environnement local via **Docker Compose**.
- Structurer votre **espace Obsidian** pour prendre des notes et garder une trace.

## 🧰 Outils
- **Docker** & **Docker Compose** (containers isolés et reproductibles)
- **VS Code** (éditeur), **Obsidian** (notes)
- **mongosh** (shell MongoDB), **MongoDB Compass** (GUI)
- **psql** (client Postgres)

## 🧠 Concepts clés

### 🧠 Donnée vs Information
- **Définition** :
  - *Donnée* : valeur brute (ex: `42`, `"Alice"`).
  - *Information* : donnée interprétée dans un contexte (ex: `42` = *âge*).
- **Pourquoi** : la structure (schéma) donne du sens et permet de valider, rechercher et agréger.
- **Exemple** : une chaîne `"2025-12-21"` devient une *date* quand typée et validée.

### 🧠 Base de données, moteur, client, serveur
- **Définition** :
  - *Moteur (SGBD)* : logiciel qui stocke, indexe, requête (PostgreSQL, MongoDB).
  - *Client* : outil pour envoyer des requêtes (psql, mongosh).
  - *Serveur* : processus qui expose une interface réseau.
- **Pourquoi** : séparer responsabilités (stockage vs utilisation) et sécuriser.
- **Exemple** : Docker lance `postgres` et `mongod`; vous interagissez via `psql` et `mongosh`.

### 🧠 OLTP vs OLAP
- **Définition** :
  - *OLTP* (transactions courtes, haute concurrence) — ex: e-commerce.
  - *OLAP* (analytique, agrégations lourdes) — ex: tableaux de bord.
- **Pourquoi** : choisir l’outil et le schéma adaptés.
- **Exemple** : Postgres pour commandes; MongoDB pour logs et contenu agrégé.

## 🧭 Analogie
**Bibliothèque** :
- SQL = *classeurs* parfaitement rangés (tables, relations).
- MongoDB = *dossiers* souples (documents riches) que l’on feuillette.

## 🔧 Prise en main : Environnement local avec Docker Compose

> [!note] Pré-requis
> Avoir Docker Desktop ou Docker Engine installé.

```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: dev
      MONGO_INITDB_ROOT_PASSWORD: devpass

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"

volumes:
  pgdata:
  mongodata:
```

### 🚀 Lancement
```bash
# Démarrer
docker compose up -d

# Se connecter à Postgres
docker exec -it $(docker ps -qf name=postgres) psql -U dev -d appdb

# Se connecter à MongoDB
docker exec -it $(docker ps -qf name=mongo) mongosh -u dev -p devpass
```

### 🧰 Organisation Obsidian
Créez un *vault* « MongoDB-SQL » avec :
- `index.md` (plan),
- un fichier `.md` par chapitre,
- un dossier `snippets/` pour scripts,
- tags : `#sql`, `#mongodb`, `#index`, `#transactions`, `#aggregation`.

## 💡 Exemple rapide : deux insertions

> [!example] Postgres (SQL)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO users (email) VALUES ('alice@example.com');
```

> [!example] MongoDB (mongosh)
```javascript
use appdb;
db.users.insertOne({
  email: "bob@example.com",
  createdAt: new Date()
});
```

## 🧾 Formules (JavaScript) utiles

### Estimation de réussite d'un lot d'opérations
```javascript
// p : probabilité de succès d'une opération indépendante (0..1)
// n : nombre d'opérations
const pSuccessBatch = (p, n) => 1 - Math.pow(1 - p, n);
```

### Somme cumulée (fenêtre)
```javascript
const cumulative = (arr) => arr.map((x, i) => arr.slice(0, i+1).reduce((a,b)=>a+b,0));
```

## 🏁 Quiz & Évaluation
1. *Vrai/Faux* : MongoDB impose un schéma strict. (**Faux**)  
2. *Choix* : OLTP convient le mieux pour (A) tableaux de bord mensuels (B) transactions de paiement. (**B**)
3. *Ouverte* : Pourquoi Docker est-il pertinent pour les bases de données en dev ?

## 🔎 À retenir / Checklist
- ✅ Environnement Docker prêt (Postgres + MongoDB).
- ✅ Clients accessibles (`psql`, `mongosh`).
- ✅ Vault Obsidian structuré.

## 📌 Résumé
Vous savez **lancer** vos bases, **exécuter** vos premières commandes, et **organiser** vos notes. Les prochains chapitres approfondissent les propriétés (ACID/BASE), les schémas et les requêtes.
