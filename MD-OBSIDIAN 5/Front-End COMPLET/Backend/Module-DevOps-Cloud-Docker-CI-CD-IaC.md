---
title: Module DevOps & Cloud — Docker, CI/CD, IaC (Complet)
tags: [devops, docker, ci-cd, github-actions, terraform, deployment, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module DevOps & Cloud — Docker, CI/CD, IaC

> [!note]
> **Objectif** : Conteneuriser, automatiser et déployer en confiance : **Docker/Compose**, **GitHub Actions**, et **IaC (Terraform — intro)**.

---

## Table des matières
- [1. Dockerfile & best practices](#1-dockerfile--best-practices)
- [2. Docker Compose (front+api+db+redis)](#2-docker-compose-frontapidbredis)
- [3. GitHub Actions (CI/CD)](#3-github-actions-cicd)
- [4. Environments & secrets](#4-environments--secrets)
- [5. IaC — Terraform (intro)](#5-iac--terraform-intro)
- [6. Exercices](#6-exercices)
- [7. Checklist](#7-checklist)
- [8. Glossaire](#8-glossaire)
- [9. FAQ](#9-faq)
- [10. Ressources](#10-ressources)

---

## 1. Dockerfile & best practices

- Image **alpine** ; `NODE_ENV=production` ; `npm ci` ; user non‑root.

```dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
USER node
EXPOSE 3000
CMD ["node","dist/index.js"]
```

---

## 2. Docker Compose (front+api+db+redis)

```yaml
version: '3.9'
services:
  api:
    build: ./api
    env_file: ./api/.env
    ports: ["3000:3000"]
    depends_on: [db, redis]
  front:
    build: ./front
    ports: ["5173:5173"]
  db:
    image: postgres:15
    environment: { POSTGRES_PASSWORD: dev }
    ports: ["5432:5432"]
  redis:
    image: redis:7
    ports: ["6379:6379"]
```

---

## 3. GitHub Actions (CI/CD)

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build
```

CD (exemple) : **deploy** vers Render/Vercel via CLI/secrets.

---

## 4. Environments & secrets

- GitHub **Environments** (staging/prod) ; protected branches ; secrets **chiffrés**.

---

## 5. IaC — Terraform (intro)

- Providers (AWS/GCP/Azure) ; `terraform init/plan/apply` ; state.

---

## 6. Exercices

> [!info]
> Cliquez pour afficher.

### Exercice 1 — Compose up
**Objectif** : `docker compose up` (front+api+db+redis).

<details><summary><strong>Correction</strong></summary>
`docker compose up --build`
</details>

### Exercice 2 — CI pipeline
**Objectif** : Lint + test + build.

<details><summary><strong>Correction</strong></summary>
Voir workflow YAML.
</details>

---

## 7. Checklist
- [ ] Dockerfile minimal, user non‑root
- [ ] Compose multi‑services opérationnel
- [ ] CI : lint/test/build ; CD protégé
- [ ] Secrets en environments ; branches protégées
- [ ] IaC envisagé pour cloud pérenne

---

## 8. Glossaire
- **IaC** : Infra as Code.
- **Environment** : contexte de déploiement (staging/prod).

---

## 9. FAQ
**Pourquoi Terraform ?**
> pérenniser l’infra, versionner, auditer.

---

## 10. Ressources
- Docker : https://docs.docker.com/
- GitHub Actions : https://docs.github.com/actions
- Terraform : https://developer.hashicorp.com/terraform/docs

> [!success]
> Module **DevOps & Cloud** prêt.
