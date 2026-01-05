---
title: Module Tests E2E & Fiabilité (Complet)
tags: [testing, e2e, playwright, cypress, testcontainers, reliability, qa, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Tests E2E & Fiabilité

> [!note]
> **Objectif** : Garantir la **fiabilité** via **tests front** (Playwright/Cypress), **tests back** (Supertest), **Testcontainers** (DB), **stratégies QA** et **couverture**.

---

## Table des matières
- [1. Stratégie de test](#1-strategie-de-test)
- [2. Unitaires & composants (front)](#2-unitaires--composants-front)
- [3. E2E (Playwright/Cypress)](#3-e2e-playwrightcypress)
- [4. Backend (Supertest)](#4-backend-supertest)
- [5. Testcontainers (DB)](#5-testcontainers-db)
- [6. Coverage & CI](#6-coverage--ci)
- [7. Exercices](#7-exercices)
- [8. Checklist](#8-checklist)
- [9. Glossaire](#9-glossaire)
- [10. FAQ](#10-faq)
- [11. Ressources](#11-ressources)

---

## 1. Stratégie de test

- Pyramide : unitaires > composants > intégration > E2E.

---

## 2. Unitaires & composants (front)

- **Vitest** + **Vue Test Utils**.

```ts
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'
it('click', async () => {
  const w = mount(Button)
  await w.trigger('click')
  expect(w.emitted('click')).toBeTruthy()
})
```

---

## 3. E2E (Playwright/Cypress)

```ts
import { test, expect } from '@playwright/test'
test('home loads', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.locator('h1')).toHaveText('Accueil')
})
```

---

## 4. Backend (Supertest)

```ts
import request from 'supertest'
import { app } from '../src/app'
it('GET /health', async () => {
  const res = await request(app).get('/health')
  expect(res.status).toBe(200)
})
```

---

## 5. Testcontainers (DB)

- Démarrer **Postgres** et injecter `DATABASE_URL`.

---

## 6. Coverage & CI

- `vitest --coverage` ; seuils ; badge CI.

---

## 7. Exercices

> [!info]
> Cliquez pour afficher.

### Exercice 1 — Test de composant
**Objectif** : tester un bouton qui émet `click`.

<details><summary><strong>Correction</strong></summary>
Voir snippet Vue Test Utils.
</details>

### Exercice 2 — E2E page d’accueil
**Objectif** : vérifier titre `Accueil` avec Playwright.

<details><summary><strong>Correction</strong></summary>
Voir snippet Playwright.
</details>

---

## 8. Checklist
- [ ] Unitaires/composants écrits
- [ ] E2E critique (login, achat) couverts
- [ ] Backend HTTP testé (Supertest)
- [ ] Testcontainers pour DB
- [ ] Coverage mesuré ; CI verte

---

## 9. Glossaire
- **E2E** : test bout‑en‑bout.
- **Coverage** : proportion de code exécuté.

---

## 10. FAQ
**Playwright ou Cypress ?**
> Playwright (multi‑moteurs, rapide) ; Cypress (ecosystème riche).

---

## 11. Ressources
- Playwright : https://playwright.dev/
- Cypress : https://www.cypress.io/
- Testcontainers : https://testcontainers.com/

> [!success]
> Module **Tests E2E & Fiabilité** prêt.
