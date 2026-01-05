# 📘 Chapitre 13 — Intégration Node.js/TypeScript

> [!summary]
> 🎯 **Objectif** : Connecter une application Node.js/TypeScript à **PostgreSQL** et **MongoDB** (drivers, ORMs/ODMs), gérer pool, transactions et tests.

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
- Drivers : `pg`, `mongodb`.
- ORMs/ODMs : **Prisma** (SQL), **Mongoose** (MongoDB).
- Pooling, transactions, requêtes **préparées**.
- Tests unitaires avec **Jest** (mocks DB).

## 🧠 Concepts clés

### 🧠 Pooling
- **Définition** : réutiliser connexions.
- **Pourquoi** : performance et limites de ressources.

### 🧠 ORM/ODM
- **Définition** : mappage entre modèles et tables/collections.
- **Pourquoi** : productivité, validations.

## 💡 Exemples

> [!example] Prisma — CRUD `User`
```bash
npm i prisma @prisma/client
npx prisma init
```
```prisma
model User { id Int @id @default(autoincrement()) email String @unique createdAt DateTime @default(now()) }
```
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.user.create({ data: { email: 'alice@example.com' } });
```

> [!example] Mongoose — CRUD `User`
```bash
npm i mongoose
```
```typescript
import mongoose from 'mongoose';
const User = mongoose.model('User', new mongoose.Schema({ email: { type: String, unique: true } }));
await User.create({ email: 'bob@example.com' });
```

## 🧾 Formules (JavaScript)

### Estimer latence moyenne avec retries
```javascript
const expectedLatency = (latencies) => latencies.reduce((a,b)=>a+b,0)/latencies.length;
```

## 🔧 TP — API REST CRUD
- Implémentez endpoints `users` en SQL **et** MongoDB.
- Ajoutez tests Jest (mocks pour DB).

## 🔎 À retenir / Checklist
- ✅ Pool **configuré**.
- ✅ Requêtes **paramétrées**.
- ✅ Tests automatisés.

## 📌 Résumé
Node.js/TS s’intègre naturellement via drivers ou ORM/ODM. Les **pools**, **transactions** et **tests** rendent votre service **fiable**.
