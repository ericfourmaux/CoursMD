---
title: Module Authentification & Sécurité Web (Complet)
tags: [auth, security, jwt, oauth2, oidc, csrf, cors, csp, rate-limit, module]
created: 2025-12-23
updated: 2025-12-23
obsidian: true
---

# Module Authentification & Sécurité Web

> [!note]
> **Objectif** : Mettre en place une **auth** pratique et sûre (JWT/sessions, OAuth2/OIDC), et durcir l’API via **CORS, CSRF, CSP, rate‑limit**, **validation** et gestion des **secrets**.

---

## Table des matières
- [1. JWT vs sessions](#1-jwt-vs-sessions)
- [2. Flux OAuth2/OIDC](#2-flux-oauth2oidc)
- [3. Cookies sécurisés & refresh tokens](#3-cookies-securises--refresh-tokens)
- [4. CORS & CSRF](#4-cors--csrf)
- [5. CSP & headers de sécurité](#5-csp--headers-de-securite)
- [6. Rate limiting & bruteforce](#6-rate-limiting--bruteforce)
- [7. Validation & sanitization](#7-validation--sanitization)
- [8. Gestion de secrets](#8-gestion-de-secrets)
- [9. Exercices](#9-exercices)
- [10. Checklist](#10-checklist)
- [11. Glossaire](#11-glossaire)
- [12. FAQ](#12-faq)
- [13. Ressources](#13-ressources)

---

## 1. JWT vs sessions

- **JWT** stateless pour APIs ; **sessions** stateful (store Redis) si révocation stricte.

```ts
import jwt from 'jsonwebtoken'
const token = jwt.sign({ sub:user.id, roles:['user'] }, process.env.JWT_SECRET!, { expiresIn:'15m' })
```

---

## 2. Flux OAuth2/OIDC

- Autorisation (Code Flow + PKCE) ; **ID Token** (OIDC) ; scopes.

---

## 3. Cookies sécurisés & refresh tokens

- `Secure`, `HttpOnly`, `SameSite=strict` ; **rotation** des refresh.

```ts
res.cookie('refresh', rt, { httpOnly:true, secure:true, sameSite:'strict', maxAge: 7*24*3600_000 })
```

---

## 4. CORS & CSRF

- **CORS** : whitelist origines, `credentials` contrôlés.
- **CSRF** : token synchronizer ou double submit cookie.

---

## 5. CSP & headers de sécurité

- **CSP** : sources autorisées (`script-src`, `style-src`) ; **HSTS** ; X‑CTO.

```ts
import helmet from 'helmet'
app.use(helmet({
  contentSecurityPolicy: { useDefaults: true, directives: { 'script-src':["'self'"], 'object-src':["'none'"] } }
}))
```

---

## 6. Rate limiting & bruteforce

- Limiter par IP/clé ; **exponentiel** sur login.

---

## 7. Validation & sanitization

- **zod/joi** ; normaliser emails/cas ; refuser payloads inconnus.

---

## 8. Gestion de secrets

- `.env` local ; environments cloud (GitHub, Vercel/Render) ; **rotation**.

---

## 9. Exercices

> [!info]
> Cliquez pour afficher.

### Exercice 1 — JWT access + refresh
**Objectif** : émettre `access` (15 min) + `refresh` (7 jours) en cookies.

<details><summary><strong>Correction</strong></summary>
Voir snippets `jwt.sign` + `res.cookie`.
</details>

### Exercice 2 — Helmet CSP
**Objectif** : CSP minimal `script-src 'self'`.

<details><summary><strong>Correction</strong></summary>
Voir snippet `helmet`.
</details>

---

## 10. Checklist
- [ ] Flow auth défini (JWT/sessions/OAuth2)
- [ ] Cookies sécurisés ; rotation des refresh
- [ ] CORS strict ; CSRF protégé
- [ ] CSP + HSTS + X‑CTO ; Helmet actif
- [ ] Rate‑limit ; logs de tentatives
- [ ] Validation/sanitization de toutes les entrées
- [ ] Secrets gérés ; rotation

---

## 11. Glossaire
- **PKCE** : mécanisme de sécurité OAuth2.
- **HSTS** : forcer HTTPS.
- **SameSite** : protection CSRF via cookies.

---

## 12. FAQ
**JWT en local storage ?**
> Préférez **cookies HttpOnly** pour diminuer l’exposition XSS.

---

## 13. Ressources
- OAuth 2.0 : https://oauth.net/2/
- Helmet : https://helmetjs.github.io/

> [!success]
> Module **Auth & Sécurité** prêt.
