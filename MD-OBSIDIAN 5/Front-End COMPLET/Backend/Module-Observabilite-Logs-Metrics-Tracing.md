---
title: Module Observabilité — Logs, Metrics & Tracing (Complet)
tags: [observability, logging, metrics, tracing, prometheus, opentelemetry, grafana, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Observabilité — Logs, Metrics & Tracing

> [!note]
> **Objectif** : Instrumenter l’app pour diagnostiquer et améliorer : **logs JSON**, **metrics** (Prometheus), **traces** (OpenTelemetry), **dashboards** (Grafana), **health/readiness**.

---

## Table des matières
- [1. Logging structuré](#1-logging-structure)
- [2. Correlation (request-id)](#2-correlation-request-id)
- [3. Metrics Prometheus](#3-metrics-prometheus)
- [4. Tracing OpenTelemetry](#4-tracing-opentelemetry)
- [5. Dashboards & alerting](#5-dashboards--alerting)
- [6. Health/readiness/liveness](#6-healthreadinessliveness)
- [7. Exercices](#7-exercices)
- [8. Checklist](#8-checklist)
- [9. Glossaire](#9-glossaire)
- [10. FAQ](#10-faq)
- [11. Ressources](#11-ressources)

---

## 1. Logging structuré

```ts
import pino from 'pino'
export const log = pino({ level: 'info' })
log.info({ route:'/health', ok:true }, 'health checked')
```

---

## 2. Correlation (request-id)

- Générer **UUID v4** par requête ; inclure dans logs et réponses.

---

## 3. Metrics Prometheus

- Compteurs, histogrammes ; exposer `/metrics`.

```ts
import client from 'prom-client'
const httpRequests = new client.Counter({ name:'http_requests_total', help:'total http' })
httpRequests.inc()
```

---

## 4. Tracing OpenTelemetry

- Exporter traces vers **OTLP** ; spans sur routes/DB.

---

## 5. Dashboards & alerting

- **Grafana** : dashboards ; alertes sur latence/erreurs.

---

## 6. Health/readiness/liveness

- `/health` (disponible), `/ready` (dépendances OK), `/live` (process vivant).

---

## 7. Exercices

> [!info]
> Cliquez pour afficher.

### Exercice 1 — Pino + request-id
**Objectif** : logger chaque requête avec `requestId`.

<details><summary><strong>Correction</strong></summary>
Middleware qui ajoute `req.id` puis `log.info({ id:req.id })`.
</details>

### Exercice 2 — `/metrics`
**Objectif** : exposer compteur `http_requests_total`.

<details><summary><strong>Correction</strong></summary>
Voir snippet `prom-client`.
</details>

---

## 8. Checklist
- [ ] Logs JSON ; niveaux gérés
- [ ] `request-id` propagé
- [ ] `/metrics` exposé ; histogrammes pertinents
- [ ] Traces OTLP ; spans sur routes/DB
- [ ] Health/Readiness/Liveness actifs

---

## 9. Glossaire
- **OTLP** : protocole d’export OpenTelemetry.
- **Histogramme** : distribution de latences.

---

## 10. FAQ
**Pourquoi JSON logs ?**
> Structurés, parsables, filtrables.

---

## 11. Ressources
- OpenTelemetry : https://opentelemetry.io/
- Prometheus : https://prometheus.io/
- Grafana : https://grafana.com/

> [!success]
> Module **Observabilité** prêt.
