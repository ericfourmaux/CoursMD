
# Chapitre 12 — Authentification du client (mTLS & Private Key JWT), Sender‑Constraining des tokens, Discovery & Hardening

> **Objectif** : comprendre et implémenter des méthodes d’**authentification du client** robustes
> (mTLS, **private_key_jwt**), des **tokens contraints au détenteur** (sender‑constraining),
> publier/consommer la **metadata** (RFC 8414 / OIDC Discovery), gérer **JWKS & rotation**, et durcir
> ton app (HTTP security headers avec Helmet) en production.

---

## 1) Panorama — Authentification du **client OAuth 2.0**
Les serveurs d’autorisation supportent plusieurs méthodes :
- **client_secret_basic / client_secret_post** : secret partagé (classique, mais moins fort).
- **private_key_jwt** (**JWT** signé par la clé privée du client, envoyé dans `client_assertion`) ;
  défini par l’**Assertion Framework** et le profil **RFC 7523**. citeturn17search698turn17search689
- **mTLS** (**RFC 8705**) : authentification par **certificat X.509** + possibilité de **lier** le
  token au certificat du client (voir §2). citeturn17search710

> En 2025, le **BCP OAuth 2.0** (RFC 9700) recommande d’abandonner les vieux schémas (Implicit/ROPC)
> et de **renforcer** l’auth client (mTLS, private_key_jwt), avec **PKCE** côté redirect‑flows. citeturn17search728

---

## 2) **Sender‑Constraining** des tokens (preuve de possession)
Deux techniques principales :
- **mTLS certificate‑bound tokens** (RFC 8705) : l’AS calcule un **thumbprint** du certificat client et
  l’encode dans le token (claim `cnf` → `x5t#S256`). Le RS vérifie que le token est présenté avec le
  **même certificat**. citeturn17search710turn17search732
- **DPoP** (vu au chap. 9) : preuve au niveau applicatif via un JWT signé par le client.

mTLS peut être **utilisé indépendamment** de l’auth client ou combiné à celle‑ci ; c’est supporté par
plusieurs fournisseurs (ex. Auth0). citeturn17search714

---

## 3) **Discovery & Metadata** (interop)
- **RFC 8414** définit les **metadata du serveur d’autorisation** (endpoints, algos, auth_methods…)
  publiées généralement sous `/.well-known/oauth-authorization-server`. citeturn17search674
- **OIDC Discovery 1.0** décrit la découverte côté OpenID Provider (`/.well-known/openid-configuration`). citeturn17search722

Ces documents évitent la configuration manuelle et permettent au client de savoir si l’AS supporte
**mTLS**, **private_key_jwt**, **PAR/JAR/JARM**, etc. citeturn17search676

---

## 4) **JWKS & rotation** de clés
- Les **JWKS** (RFC 7517) exposent les **clés publiques** pour vérifier les signatures (JWT/JWS). La
  rotation se fait en **ajoutant** un nouveau `kid` puis en **retirant** l’ancien ; il n’y a pas
  d’expiration native dans le document — **cache + rafraîchissement périodique** sont requis. citeturn17search692
- Validation locale des **JWT** via JWKS est **rapide**, mais la **révocation** temps‑réel demande
  l’**introspection** (RFC 7662) ou des tokens **court‑vécus**. citeturn17search693

---

## 5) Implémentations Node.js

### 5.1 **Private Key JWT** avec `openid-client`
```ts
import { generators, Issuer, Client } from 'openid-client';
// Découverte OIDC
const issuer = await Issuer.discover('https://issuer.example.com'); // OIDC Discovery
// Construit la configuration client avec private_key_jwt
const client = new issuer.Client({
  client_id: 'client-id',
  token_endpoint_auth_method: 'private_key_jwt',
  // Publie ta clé via JWKS ou enregistres-la côté AS
});

// Génère PKCE + fait un code exchange
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);

// ... après réception du code d’authz
const tokens = await client.callback('https://app.example.com/cb', {
  code: 'AUTHZ_CODE',
  code_verifier,
});
```
> La méthode **private_key_jwt** envoie `client_assertion_type=...jwt-bearer` et un **JWT signé** par
> le client ; support décrit par **RFC 7523** et implémenté dans `openid-client`. citeturn17search698turn17search687

### 5.2 **mTLS** (concept / infra)
Pour activer mTLS côté Node/Reverse proxy :
- Terminer TLS avec **client cert required** (Nginx/Envoy) et **forwarder** le certificat validé
  vers l’AS ; beaucoup d’AS supportent mTLS **auth client** et/ou **binding** de token. citeturn17search714
- L’implémentation suit **RFC 8705** (auth + certificate‑bound tokens). citeturn17search710

### 5.3 **oauth4webapi** (low‑level, flows sécurisés)
La librairie **oauth4webapi** expose des fonctions request/response pour OAuth/OIDC **PKCE**,
**Client Credentials**, **PAR/JAR/JARM**, **introspection/revocation**, **DPoP**, etc. citeturn17search704turn17search707

---

## 6) **Hardening** HTTP (Helmet + OWASP)
Ajoute **Helmet** à Express pour définir des en‑têtes de sécurité (CSP, HSTS, Referrer‑Policy,
X‑Content‑Type‑Options, COOP/CORP…). citeturn17search680
```js
import express from 'express';
import helmet from 'helmet';
const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
}));
```
OWASP recommande une **CSP stricte**, **HSTS**, **Referrer‑Policy**, **X‑Content‑Type‑Options** et
**frame‑ancestors** pour prévenir XSS/clickjacking/MITM. citeturn17search716

---

## 7) Bonnes pratiques (prod)
- Utilise **PKCE** systématiquement pour les redirect‑flows ; évite **Implicit/ROPC**. citeturn17search728turn17search730
- Privilégie **private_key_jwt** ou **mTLS** pour l’auth client ; consomme **RFC 8414/Discovery** pour
  auto‑configurer le client. citeturn17search698turn17search710turn17search674
- **JWKS cache + rotation** (nouveau `kid` → publier, puis retirer l’ancien) ; tokens **court‑vécus**,
  introspection pour les besoins de révocation immédiate. citeturn17search692turn17search693
- Durcissement HTTP (Helmet) + **CSP/HSTS** suivant la **OWASP Cheat Sheet**. citeturn17search716

---

## 8) Exercices
1. **private_key_jwt** : configure `openid-client` avec `token_endpoint_auth_method='private_key_jwt'`,
   génère un **client_assertion** et échange un **code** avec **PKCE**.
2. **mTLS (concept)** : prépare un reverse proxy qui **exige** le certificat client, renvoie les
   requêtes valides vers `/oauth/token` ; observe le **bind** du token (claim `cnf`). citeturn17search714
3. **Discovery** : récupère `/.well-known/openid-configuration` et `/.well-known/oauth-authorization-server` ;
   alimente auto ta config client. citeturn17search722turn17search674
4. **JWKS rotation** : simule l’ajout d’un nouveau `kid`, rafraîchis le cache JWKS, vérifie que les
   **JWT** signés avec l’ancien `kid` ne sont plus acceptés après retrait. citeturn17search692
5. **Hardening** : ajoute **Helmet** et une **CSP** stricte ; vérifie via DevTools que les en‑têtes
   sont présents. citeturn17search680turn17search716

---

## 9) Références
- **mTLS** & certificate‑bound tokens : **RFC 8705** ; guides Auth0 & Authlete. citeturn17search710turn17search714turn17search712
- **Private Key JWT** : **RFC 7523** ; docs oauth.net ; `openid-client`. citeturn17search698turn17search689turn17search687
- **BCP OAuth 2.0** : **RFC 9700** ; résumés pratiques. citeturn17search728turn17search729
- **Discovery & Metadata** : **RFC 8414** ; OIDC Discovery 1.0. citeturn17search674turn17search722
- **JWKS & rotation** : discussions & guides (StackOverflow, comparatifs JWKS vs introspection). citeturn17search692turn17search693
- **Helmet** & **OWASP** Security Headers. citeturn17search680turn17search716
- **oauth4webapi** (API bas niveau multi‑runtime). citeturn17search704turn17search707
