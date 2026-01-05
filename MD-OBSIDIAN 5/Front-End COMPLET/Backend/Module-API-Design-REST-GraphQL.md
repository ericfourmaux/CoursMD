---
title: Module Design d’API — REST & GraphQL (Complet)
tags: [api, rest, graphql, openapi, schema, pagination, versioning, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Design d’API — REST & GraphQL

> [!note]
> **Objectif** : Concevoir des **API claires** et **prévisibles** en **REST** et **GraphQL** : contrats, pagination, filtres, erreurs, documentation (**OpenAPI**), schéma GraphQL, resolvers et **DataLoader**.

---

## Table des matières
- [1. Principes REST](#1-principes-rest)
- [2. Contrats & OpenAPI](#2-contrats--openapi)
- [3. Pagination, filtres & tri](#3-pagination-filtres--tri)
- [4. Erreurs & codes HTTP](#4-erreurs--codes-http)
- [5. Versionning & compatibilité](#5-versionning--compatibilite)
- [6. GraphQL : schéma & resolvers](#6-graphql--schema--resolvers)
- [7. DataLoader & performance](#7-dataloader--performance)
- [8. Sécurité API](#8-securite-api)
- [9. Exercices avec corrections](#9-exercices-avec-corrections)
- [10. Checklist](#10-checklist)
- [11. Glossaire](#11-glossaire)
- [12. FAQ](#12-faq)
- [13. Ressources](#13-ressources)

---

## 1. Principes REST

- **Ressources** (noms pluriels) : `/products`, `/orders/{id}`.
- **Verbes HTTP** : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **HATEOAS** (optionnel) : liens dans réponses.

---

## 2. Contrats & OpenAPI

Déclarer endpoints, schémas, exemples.

```yaml
openapi: 3.0.3
info: { title: API, version: 1.0.0 }
paths:
  /products:
    get:
      parameters:
        - in: query
          name: page
          schema: { type: integer, minimum: 1 }
      responses:
        '200':
          description: Liste paginée
```

---

## 3. Pagination, filtres & tri

- Pagination : `page` + `pageSize` ou **cursor**.
- Filtres : `?q=keyword&minPrice=10` ; Tri : `?sort=price:asc`.
- Inclure **meta** (`total`, `page`, `pageSize`, `links`).

---

## 4. Erreurs & codes HTTP

- `400` invalid, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict, `422` unprocessable, `500` server.
- Corps d’erreur : `code`, `message`, `details`.

---

## 5. Versionning & compatibilité

- **URI** (`/v1/...`) ou **header**. Préférer **compatibilité ascendante**.

---

## 6. GraphQL : schéma & resolvers

```graphql
type Query {
  products(page: Int, pageSize: Int): ProductPage!
  product(id: ID!): Product
}

type Product { id: ID!, title: String!, price: Float! }

type ProductPage { items: [Product!]!, total: Int!, page: Int!, pageSize: Int! }
```

Resolver Node :
```ts
const resolvers = {
  Query: {
    products: async (_, { page = 1, pageSize = 20 }, { db }) => {
      const [items, total] = await Promise.all([
        db.product.findMany({ skip:(page-1)*pageSize, take:pageSize }),
        db.product.count()
      ])
      return { items, total, page, pageSize }
    }
  }
}
```

---

## 7. DataLoader & performance

Éviter **N+1** : grouper les requêtes par clés.

```ts
import DataLoader from 'dataloader'
const productById = new DataLoader(async (ids:number[]) => {
  const rows = await db.product.findMany({ where:{ id:{ in: ids } } })
  const map = new Map(rows.map(r => [r.id, r]))
  return ids.map(id => map.get(id)!)
})
```

---

## 8. Sécurité API

- **Auth** (JWT/sessions), **CORS**, **rate‑limit**, **validation** stricte (zod).
- Éviter **overfetch** en GraphQL (auth dans resolvers).

---

## 9. Exercices avec corrections

> [!info]
> Cliquez pour afficher.

### Exercice 1 — OpenAPI de listing
**Objectif** : décrire `GET /products` paginé.

<details><summary><strong>Correction</strong></summary>
Voir snippet YAML plus haut.
</details>

### Exercice 2 — Resolver pagination
**Objectif** : implémenter `products(page,pageSize)`.

<details><summary><strong>Correction</strong></summary>
Voir `resolvers.Query.products` ci‑dessus.
</details>

### Exercice 3 — DataLoader
**Objectif** : créer un DataLoader par `id`.

<details><summary><strong>Correction</strong></summary>
Voir implémentation `productById`.
</details>

---

## 10. Checklist
- [ ] Contrats clairs (OpenAPI) + exemples
- [ ] Pagination/tri/filtres cohérents
- [ ] Codes/erreurs standardisés
- [ ] Versionning conservatif (compat asc)
- [ ] GraphQL : schéma, resolvers, DataLoader
- [ ] Sécurité : auth, CORS, rate‑limit, validation

---

## 11. Glossaire
- **OpenAPI** : spec pour documenter APIs REST.
- **Resolver** : fonction qui répond à un champ GraphQL.
- **DataLoader** : batching/cache pour éviter N+1.

---

## 12. FAQ
**REST ou GraphQL ?**
> REST (simplicité, cache HTTP natif) ; GraphQL (flexible, un seul endpoint, éviter sous/sur‑fetch). 

---

## 13. Ressources
- OpenAPI : https://www.openapis.org/
- GraphQL : https://graphql.org/

> [!success]
> Module **API Design** prêt.
