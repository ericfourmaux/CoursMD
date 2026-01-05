---
title: Module Base de données & ORM — PostgreSQL + Prisma (Complet)
tags: [backend, database, sql, postgres, prisma, orm, migrations, transactions, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Base de données & ORM — PostgreSQL + Prisma

> [!note]
> **Objectif** : Maîtriser la **modélisation SQL**, les **migrations**, les **transactions**, et l’**ORM Prisma** pour livrer un backend **précis, robuste et maintenable**.
>
> **Livrables** : schéma DB (`schema.prisma`), migrations, seed, connexion Node, transactions, requêtes complexes, index & performances.

---

## Table des matières
- [1. Choix & installation (PostgreSQL)](#1-choix--installation-postgresql)
- [2. Prisma — initialisation & structure](#2-prisma--initialisation--structure)
- [3. Schéma & relations](#3-schema--relations)
- [4. Migrations & seed](#4-migrations--seed)
- [5. Requêtes — CRUD & jointures](#5-requetes--crud--jointures)
- [6. Transactions & contraintes](#6-transactions--contraintes)
- [7. Index & performance](#7-index--performance)
- [8. Sécurité & conformité des données](#8-securite--conformite-des-donnees)
- [9. Exercices guidés avec corrections](#9-exercices-guides-avec-corrections)
- [10. Checklist](#10-checklist)
- [11. Glossaire](#11-glossaire)
- [12. FAQ](#12-faq)
- [13. Ressources](#13-ressources)

---

## 1. Choix & installation (PostgreSQL)

- **PostgreSQL** recommandé (ACID, JSONB, extensions, rich SQL).
- Local : Docker `postgres:15` ; variables `.env` (jamais commitées).

```bash
docker run --name pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:15
```

---

## 2. Prisma — initialisation & structure

```bash
npm i -D prisma
npm i @prisma/client
npx prisma init
```

Arborescence :
```
prisma/
  schema.prisma
src/
  db.ts
```

`schema.prisma` configure la **datasource** et le **generator**.

---

## 3. Schéma & relations

Exemple (catalogue + users + orders) :

```prisma
// prisma/schema.prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  name     String?
  orders   Order[]
  createdAt DateTime @default(now())
}

model Product {
  id        Int      @id @default(autoincrement())
  title     String
  price     Decimal  @db.Numeric(10,2)
  orders    OrderItem[]
}

model Order {
  id       Int        @id @default(autoincrement())
  userId   Int
  user     User       @relation(fields: [userId], references: [id])
  items    OrderItem[]
  total    Decimal    @db.Numeric(10,2)
  createdAt DateTime  @default(now())
}

model OrderItem {
  orderId   Int
  productId Int
  qty       Int
  price     Decimal @db.Numeric(10,2)
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  @@id([orderId, productId])
}
```

> [!warning]
> **Clés composites** (`@@id([a,b])`) pour les tables de **jonction**.

---

## 4. Migrations & seed

```bash
npx prisma migrate dev --name init
```

Seed :
```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){
  await prisma.product.createMany({ data: [
    { title:'Livre', price:'19.90' }, { title:'Stylo', price:'2.50' }
  ]})
}
main().finally(()=>prisma.$disconnect())
```

`package.json` : `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

---

## 5. Requêtes — CRUD & jointures

```ts
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

// Create user
await db.user.create({ data: { email:'a@b.com', name:'Alice' } })

// Read with relations
const order = await db.order.findUnique({
  where: { id: 1 },
  include: { items: { include: { product: true } }, user: true }
})
```

---

## 6. Transactions & contraintes

```ts
await db.$transaction(async (tx) => {
  const order = await tx.order.create({ data: { userId: 1, total:'0' } })
  const item = await tx.orderItem.create({ data: { orderId: order.id, productId: 2, qty: 1, price:'2.50' } })
  const total = await tx.orderItem.aggregate({ where: { orderId: order.id }, _sum: { price: true } })
  await tx.order.update({ where:{ id: order.id }, data:{ total: total._sum.price ?? '0' } })
})
```

> [!tip]
> Utilisez `@unique`, `@default`, `@db.*` pour **contraintes** et **types** précis.

---

## 7. Index & performance

- Champs fréquemment filtrés → `@@index([field])`.
- Mesurez via **EXPLAIN ANALYZE** côté SQL.

---

## 8. Sécurité & conformité des données

- **PG roles** & **révocation** d’accès ; **least privilege**.
- **Backups** & **migration strategy** (rollback). 
- **PII** : chiffrement applicatif si nécessaire ; **GDPR**.

---

## 9. Exercices guidés avec corrections

> [!info]
> Cliquez pour afficher.

### Exercice 1 — Schéma & relations
**Objectif** : créer `User`, `Product`, `Order`, `OrderItem`.

<details><summary><strong>Correction</strong></summary>
Voir `schema.prisma` ci‑dessus.
</details>

### Exercice 2 — Migration & seed
**Objectif** : `migrate dev` et `seed` produits.

<details><summary><strong>Correction</strong></summary>
`npx prisma migrate dev --name init` puis `npm run prisma:seed`.
</details>

### Exercice 3 — Transaction
**Objectif** : créer order + items et mettre à jour `total`.

<details><summary><strong>Correction</strong></summary>
Voir bloc `$transaction` ci‑dessus.
</details>

---

## 10. Checklist
- [ ] `schema.prisma` cohérent ; contraintes uniques/foreign keys
- [ ] Migrations versionnées ; **seed** reproductible
- [ ] Transactions pour opérations multi‑tables
- [ ] Index sur champs filtrés ; mesures SQL
- [ ] Sécurité DB (roles/privileges) ; backups

---

## 11. Glossaire
- **ACID** : propriétés de transaction.
- **Migration** : script d’évolution du schéma.
- **ORM** : mapping objets ↔ tables.
- **PII** : données personnelles identifiables.

---

## 12. FAQ
**Prisma remplace SQL ?**
> Non, Prisma **génère** des requêtes ; SQL reste la base.

**Decimal vs float ?**
> Montants → **Decimal** pour éviter pertes.

---

## 13. Ressources
- Prisma Docs : https://www.prisma.io/docs
- PostgreSQL Docs : https://www.postgresql.org/docs/

> [!success]
> Module **DB & Prisma** prêt pour la production.
