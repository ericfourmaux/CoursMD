---
title: Glossaire Global — Développement Web (Front & Back)
tags: [glossaire, definitions, web, frontend, backend, devops]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Glossaire Global — Développement Web

> [!note]
> **But** : Référencer les **termes clés** du développement **front‑end** et **back‑end** (architecture, sécurité, performance, DevOps). Les définitions sont **synthétiques**, avec **exemples** si utile.

---

## A
- **ACID** : Attributs des transactions en DB (Atomicité, Cohérence, Isolation, Durabilité).
- **Adapter (pattern)** : Convertit une interface en une autre.
- **API** : Interface d’exposition de fonctionnalités (HTTP/REST/GraphQL).
- **Axios** : Client HTTP (JS) pour requêtes côté front/back.

## B
- **Backpressure** : Régulation du débit dans les **streams** pour éviter la saturation.
- **Bcrypt/Argon2** : Fonctions de hachage de mots de passe (sécurité).
- **Blue/Green** : Stratégie de déploiement avec deux environnements (switch instantané).
- **Buffer** : Zone mémoire binaire (Node).

## C
- **CAP** : Cohérence, Disponibilité, Tolérance au partitionnement (systèmes distribués).
- **CDN** : Réseau de distribution de contenu (cache proche des utilisateurs).
- **CI/CD** : Intégration/Déploiement continu (pipelines automatisés).
- **CORS** : Partage de ressources entre origines (headers, sécurité navigateur).
- **CSRF** : Attaque par requête intersite frauduleuse (tokens anti-CSRF).
- **CSP** : Politique de sécurité de contenu (bloque scripts/styles non autorisés).

## D
- **DDD** : Domain‑Driven Design (modélisation métier, Ubiquitous Language).
- **DLQ** : Dead‑Letter Queue (messages en échec, file dédiée).
- **Docker** : Conteneurisation d’applications.
- **DTO** : Data Transfer Object (contrats de données).

## E
- **ESM/CommonJS** : Systèmes de modules en Node/JS.
- **Event Loop** : Boucle d’événements (exécute callbacks asynchrones).
- **Express/Fastify/Koa** : Frameworks HTTP Node.

## F
- **Feature Flag** : Activation conditionnelle de fonctionnalités.
- **FID/INP** : Indicateurs d’interactivité (Core Web Vitals ; INP remplace FID).
- **Firestore/MongoDB** : Bases NoSQL orientées documents.

## G
- **GC (Garbage Collector)** : Recyclage mémoire (V8).
- **GraphQL** : Langage de requêtes & runtime pour APIs (schéma, resolvers).
- **Gzip/Brotli** : Compression de ressources.

## H
- **HSTS** : Force l’HTTPS via header.
- **HTTP/2/3** : Protocoles réseau (multiplexage, QUIC).
- **Helmet** : Middleware Node pour headers de sécurité.

## I
- **Idempotence** : Opération répétée qui garde le même effet.
- **IoC/DI** : Inversion de contrôle / Injection de dépendances.
- **ISO 8601** : Format de date/temps standard.

## J
- **Jest/Vitest** : Frameworks de tests JS/TS.
- **JWT** : JSON Web Token (auth stateless).
- **JSDoc** : Commentaires de typage pour JS (outils TS).

## K
- **k6/Artillery** : Outils de test de charge.
- **Kubernetes** : Orchestration de conteneurs (pods, services, ingress).
- **Keep‑Alive** : Réutilisation de connexions HTTP.

## L
- **LCP/CLS/INP** : Core Web Vitals (affichage, stabilité, interactivité).
- **Libuv** : Bibliothèque C pour I/O multiforme derrière Node.
- **LTS** : Long Term Support (versions Node supportées à long terme).

## M
- **Microservices** : Architecture de services déployés indépendamment.
- **Middleware** : Intercepteurs de requêtes (validation, auth).
- **MQ** : Message Queue (Kafka, RabbitMQ, SQS).

## N
- **Nginx** : Reverse proxy / load balancer.
- **NPM/PNPM/Yarn** : Gestionnaires de paquets JS.
- **Node.js** : Runtime JS côté serveur (V8, libuv).

## O
- **OAuth2/OIDC** : Protocoles d’autorisation/authentification.
- **OpenAPI** : Spécification de contrat d’API (Swagger).
- **OpenTelemetry** : Standard de **tracing**/metrics/logs.

## P
- **PM2** : Process manager pour Node (cluster, monitoring).
- **Prisma/TypeORM/Mongoose** : ORM/ODM.
- **PWA** : Progressive Web App (manifest, service worker).

## Q
- **QUIC** : Transport UDP fiable pour **HTTP/3**.
- **Query Params** : Paramètres d’URL pour filtrage/requêtes.

## R
- **Rate Limiting** : Limitation du débit par IP/clé.
- **Redis** : Cache en mémoire/clé‑valeur (sessions, queues).
- **REST** : Style d’API basé sur ressources/verb HTTP.

## S
- **SAGA** : Orchestration de transactions distribuées.
- **Serverless** : Fonctions managées (Lambda, Cloud Functions).
- **SSR/SSG** : Rendu côté serveur / génération statique.
- **Swagger UI** : UI de documentation OpenAPI.

## T
- **TLS** : Chiffrement transport (HTTPS).
- **Tracing** : Corrélation de requêtes (A→B→C) pour debuggage.
- **Terraform** : IaC pour provisionnement cloud.
- **TypeScript** : Surcouche typée de JavaScript.

## U
- **ULID/UUID** : Identifiants uniques (temps/space).
- **UV threads** : Threads de libuv (I/O) vs **worker_threads** (CPU).

## V
- **V8** : Moteur JS de Chrome/Node.
- **Validation** : zod/joi / JSON Schema.
- **Vitest** : Test runner rapide compatible Vite.

## W
- **WebSocket** : Canal bidirectionnel temps réel.
- **Worker Threads** : Threads Node pour tâches CPU.
- **Winston/Pino** : Loggers JSON pour Node.

## X
- **XML** : Format textuel hiérarchique (héritage de SOAP).
- **X‑Content‑Type‑Options** : Header pour empêcher MIME sniffing.

## Y
- **YAML** : Format humain pour config/frontmatter.
- **Yarn** : Gestionnaire de paquets alternatif à NPM.

## Z
- **Zod/Joi** : Librairies de validation de schémas.
- **Zlib** : Compression bas niveau (Node `zlib`).

> [!success]
> Glossaire prêt : ajoutez des termes spécifiques à vos projets au fil du temps.
