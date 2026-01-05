---
title: Sommaire Global — Cursus Full‑Stack (Vue 3 + TypeScript + Node.js)
tags: [sommaire, full-stack, vue3, typescript, node, prisma, nuxt, devops]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Sommaire Global — Cursus Full‑Stack

> [!note]
> **But** : Centraliser et **orchestrer** tous les modules du cursus **Full‑Stack Vue 3 + TypeScript + Node.js**. Ce sommaire propose un **parcours progressif**, des **liens wiki Obsidian** entre modules, et une **todo‑list** de progression.

---

## 📚 Index des modules (liens wiki)

### Outils & Qualité
- [[Module-Outils-Workflow-Front-End]]
- [[Module-Markdown-Obsidian]]
- [[Module-TypeScript-Front-End]]

### Front‑End (Vue & Nuxt)
- [[Module-Vue3-Front-End]]
- [[Module-Accessibilite-Front-End]]
- [[Module-Performance-SEO-Front-End]]
- [[Module-Nuxt3-SSR-SSG]]

### Back‑End (Node & API)
- [[Module-JS-Backend-Node]]
- [[Module-DB-Prisma-PostgreSQL]]
- [[Module-API-Design-REST-GraphQL]]
- [[Module-Auth-Securite-Web]]
- [[Module-Observabilite-Logs-Metrics-Tracing]]
- [[Module-DevOps-Cloud-Docker-CI-CD-IaC]]
- [[Module-Tests-E2E-Fiabilite]]

### Projet & Fondamentaux JS
- [[Module-Projet-Final-Vue3-TypeScript]]
- [[Module-POO-JavaScript-Front-End]]

### Références transversales
- [[Glossaire-Global-Dev-Web]]

> [!tip]
> Place tous ces fichiers dans le **même vault Obsidian**. Les **WikiLinks** fonctionneront automatiquement.

---

## 🧭 Parcours recommandé (progressif)

1. **Outils & Qualité** → TypeScript → Markdown/Obsidian
2. **Front** : Vue 3 (SFC, `<script setup>`) → Accessibilité → Performance & SEO
3. **Back** : Node (Express/Fastify) → DB (PostgreSQL + Prisma) → Design API (REST & GraphQL)
4. **Auth & Sécurité** : JWT/sessions, OAuth2/OIDC, CORS/CSRF, CSP
5. **SSR/SSG** : Nuxt 3 (pages, data‑fetch, meta/SEO, Pinia)
6. **DevOps & Cloud** : Docker/Compose, CI/CD (GitHub Actions), Secrets/Environments, IaC (Terraform — intro)
7. **Observabilité** : Logs/Metrics/Tracing, Health/Readiness/Liveness
8. **Tests & Fiabilité** : Unitaires/Composants, E2E (Playwright/Cypress), Supertest, Testcontainers
9. **Projet Final** : intégration complète, déploiement, documentation, audit

---

## ✅ Suivi de progression (checklist globale)

### Outils & Qualité
- [ ] Git/GitHub + protection de branches + PRs
- [ ] TypeScript (`strict: true`) opérationnel
- [ ] Markdown/Obsidian maîtrisé (frontmatter, wikilinks, callouts)

### Front‑End
- [ ] Vue 3 (SFC, réactivité, Pinia) maîtrisé
- [ ] A11y (WCAG AA) intégré
- [ ] Perf (Core Web Vitals) ≥ objectifs
- [ ] Nuxt 3 (SSR/SSG) en place (pages, data‑fetch, meta)

### Back‑End
- [ ] Node (Express/Fastify) opérationnel
- [ ] PostgreSQL + Prisma (migrations, seed, transactions)
- [ ] Design API REST (OpenAPI) + GraphQL (schéma, resolvers, DataLoader)
- [ ] Auth & Sécurité (JWT/sessions, OAuth2/OIDC, CORS/CSRF, CSP, rate‑limit)

### DevOps & Observabilité
- [ ] Dockerfile & Compose (front + api + db + redis)
- [ ] CI/CD (lint, test, build, deploy) + secrets/environments
- [ ] Logs (JSON), Metrics (Prometheus), Traces (OTLP), health/readiness

### Tests & Projet Final
- [ ] Tests unitaires/composants/E2E + coverage
- [ ] Projet Final intégré, déployé et documenté

---

## 🧪 Projet final (récap)
- **Front SSR** (Nuxt 3 + Vue 3/TS + Pinia + SEO/meta)
- **API Node** (REST + GraphQL, Prisma/PostgreSQL, Redis, queues)
- **Auth** (JWT + refresh, OAuth2/OIDC, cookies sécurisés)
- **DevOps** (Docker Compose, CI/CD GitHub Actions), **Observabilité** (logs/metrics/traces)
- **Tests** (unitaires/E2E), **Docs** (OpenAPI), **audit Lighthouse**

---

## 🔗 Liens rapides (téléchargements)

- Outils & Qualité : [[Module-Outils-Workflow-Front-End]] · [[Module-TypeScript-Front-End]] · [[Module-Markdown-Obsidian]]
- Front : [[Module-Vue3-Front-End]] · [[Module-Accessibilite-Front-End]] · [[Module-Performance-SEO-Front-End]] · [[Module-Nuxt3-SSR-SSG]]
- Back : [[Module-JS-Backend-Node]] · [[Module-DB-Prisma-PostgreSQL]] · [[Module-API-Design-REST-GraphQL]] · [[Module-Auth-Securite-Web]]
- DevOps/Obs/Tests : [[Module-DevOps-Cloud-Docker-CI-CD-IaC]] · [[Module-Observabilite-Logs-Metrics-Tracing]] · [[Module-Tests-E2E-Fiabilite]]
- Projet/Glossaire : [[Module-Projet-Final-Vue3-TypeScript]] · [[Glossaire-Global-Dev-Web]] · [[Module-POO-JavaScript-Front-End]]

---

## 🛠️ Notes & bonnes pratiques
- **Standardise** le gestionnaire de paquets (NPM ou PNPM), la version de Node (`.nvmrc`), et les conventions de code (ESLint/Prettier/Stylelint).
- **Securise** les secrets via **environments** (GitHub/Vercel/Render), jamais dans le repo.
- **Mesure** (Lighthouse, web‑vitals) et **observe** (logs/metrics/traces) avant d’optimiser.
- **Documente** tout (OpenAPI, README, CHANGELOG, décisions d’architecture).

> [!success]
> Ce sommaire est votre **tableau de bord** : parcourez, cochez, et livrez votre produit **Full‑Stack** avec confiance.
