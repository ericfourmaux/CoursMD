
# Chapitre 15 — Discovery & Dynamic Client Registration (DCR)

> **Objectif** : automatiser l’intégration des clients **OAuth/OIDC** avec
> — la **découverte** des métadonnées (RFC **8414** + OIDC Discovery),
> — l’**enregistrement dynamique des clients** (**RFC 7591**) et la **gestion** (**RFC 7592**),
> — la **rotation** des clés via **JWKS** et les bonnes pratiques de cache.
> Nous verrons aussi la mise en œuvre avec **oauth4webapi** et des exemples fournisseurs
> (Keycloak, Auth0, Okta).

---

## 1) Discovery — métadonnées du serveur d’autorisation
- **RFC 8414** standardise un document JSON de **métadonnées** (endpoints, capacités, algorithmes, `jwks_uri`, etc.) publié en **well-known** (p. ex. `/.well-known/oauth-authorization-server`). Les clients y trouvent ce qui est nécessaire pour parler à l’AS. citeturn20search874turn20search876
- **OIDC Discovery 1.0** définit le **`/.well-known/openid-configuration`** et la découverte de l’OP (via WebFinger au besoin), très utilisée par les déploiements OIDC/OpenID. citeturn20search868
- La lib **oauth4webapi** expose `discoveryRequest()` et `processDiscoveryResponse()` pour récupérer et valider ces métadonnées (mode **oidc** par défaut ou **oauth2** selon RFC 8414). citeturn20search904turn20search905

> **Note** : Les métadonnées peuvent aussi référencer **JWKS** (`jwks_uri`) pour les clés publiques de l’AS, et **registration_endpoint** pour le DCR. citeturn20search877

---

## 2) DCR — Dynamic Client Registration (**RFC 7591**) & Management (**RFC 7592**)
- **RFC 7591** permet aux clients de s’**enregistrer par API** auprès de l’AS, en soumettant un **JSON de métadonnées** (p. ex. `redirect_uris`, `grant_types`, `response_types`, `token_endpoint_auth_method`, `jwks_uri`, etc.). L’AS renvoie `client_id` et métadonnées finales. citeturn20search916turn20search920
- **RFC 7592** ajoute la **lecture/mise à jour/suppression** d’un client via un **client configuration endpoint**, typiquement avec un **registration access token**. citeturn20search898turn20search903
- Les profils de **sécurité élevés** (FAPI, écosystèmes régulés) imposent souvent des **Software Statements** (JWT signé) dans la requête DCR — champ `software_statement` de **RFC 7591** — ou des mécanismes équivalents (SPIFFE/VC en travail IETF). citeturn20search863turn20search862turn20search867

### 2.1 Exemples éditeurs
- **Keycloak** : service de **client registration** avec jetons **initial access** et politiques, support **OIDC Client Metadata** ; endpoints `/realms/{realm}/clients-registrations/{provider}`. citeturn20search886turn20search889turn20search890
- **Auth0** : **Management API v2** pour **créer des clients** (`POST /v2/clients`), configurer méthodes d’auth client (client_secret_* ou **private_key_jwt**) et métadonnées ; il remonte dans le **Dashboard**. citeturn20search910turn20search914
- **Okta** : API **Dynamic Client Registration** (`/oauth2/v1/clients`) pour lister/créer/mettre à jour des apps OIDC ; documentation d’API détaillée. citeturn20search892

---

## 3) JWKS — rotation des clés & cache
- Le document **JWKS** publié via `jwks_uri` permet aux clients/RS de **valider signatures** ou **chiffrer** ; la rotation se fait en ajoutant/supprimant des JWK avec `kid` distincts, et les consommateurs doivent **rafraîchir/cache** selon **Cache-Control** pour éviter les échecs au changement de clé. citeturn20search883turn20search880
- Les bonnes pratiques : **cache respectueux des headers**, **rafraîchissement périodique** et **re‑fetch en cas d’erreur de vérification (`kid` inconnu)** ; ne pas durcir à la main les clés (risque de rupture). citeturn20search881
- Ex. **Auth0** : le **discovery doc** contient plusieurs clés (courante, suivante, précédente non révoquée) pour une rotation **sans interruption** ; prévoyez la prise en charge de toutes les clés présentes. citeturn20search885

---

## 4) Mise en œuvre avec **oauth4webapi** (Node/TS)
### 4.1 Discovery
```ts
import * as oauth from 'oauth4webapi';

const issuer = new URL('https://auth.example.com');
const res = await oauth.discoveryRequest(issuer, { algorithm: 'oauth2' }); // ou 'oidc'
const as = await oauth.processDiscoveryResponse(issuer, res);
// as contient authorization_endpoint, token_endpoint, jwks_uri, registration_endpoint, etc.
```
> `discoveryRequest()`/`processDiscoveryResponse()` implémentent la **découverte** OIDC/RFC 8414. citeturn20search904

### 4.2 **DCR** — enregistrement dynamique
```ts
// Enregistrer un client en utilisant le registration_endpoint découvert
const registration = new URL(as.registration_endpoint!);
const reqBody = {
  client_name: 'demo-app',
  redirect_uris: ['https://app.example.com/callback'],
  grant_types: ['authorization_code'],
  response_types: ['code'],
  token_endpoint_auth_method: 'private_key_jwt',
  jwks_uri: 'https://app.example.com/jwks.json'
};

const dcrRes = await oauth.dynamicClientRegistrationRequest(as, registration, reqBody, {
  // optionnel : authorization pour politiques d’AS (initial access token, etc.)
  headers: { Authorization: `Bearer ${initialAccessToken}` }
});
const client = await oauth.processDynamicClientRegistrationResponse(as, dcrRes);
// client.client_id, client.token_endpoint_auth_method, etc.
```
> La lib fournit **DCR** (requête + traitement) et permet d’inclure `jwks_uri` ou un **software_statement** selon politiques AS. citeturn20search904

### 4.3 Gestion (RFC 7592)
```ts
// Lire/mettre à jour/supprimer via le client configuration endpoint (si supporté par l’AS)
// Utilise le registration access token renvoyé lors du DCR
```
> Voir les principes **RFC 7592** pour lecture/update/delete du client. citeturn20search898

---

## 5) Sécurité & gouvernance
- **Limiter** les DCR anonymes ; préférer **initial access tokens** ou **software statements** signés (autorité de confiance), en particulier en environnements **FAPI** et plateformes ouvertes. citeturn20search886turn20search863
- **Aligner** les métadonnées client avec les politiques AS (auth client forte : **private_key_jwt**/**mTLS** ; grant/response types autorisés). citeturn20search916
- **Surveiller** la rotation des clés, et **tester** les consommateurs lors des changements (staging, fenêtre de coexistence). citeturn20search885

---

## 6) Exercices
1. **Discovery** : consommer `/.well-known/openid-configuration` d’un OP (Keycloak/Okta/Auth0) et valider `issuer`, endpoints et `jwks_uri`. citeturn20search868turn20search874
2. **DCR** : enregistrer un client via le `registration_endpoint` (grant `authorization_code`, `private_key_jwt`) ; injecter `jwks_uri`. citeturn20search916
3. **Gestion (7592)** : mettre à jour les `redirect_uris` puis supprimer le client via le client configuration endpoint (si dispo). citeturn20search898
4. **JWKS rotation** : simuler une rotation côté AS, vérifier le re‑fetch (`kid`), et respecter **Cache‑Control**. citeturn20search880turn20search883

---

## 7) Références
- **Discovery** : RFC 8414, overview OAuth.net ; OIDC Discovery 1.0. citeturn20search874turn20search875turn20search868
- **DCR** : RFC 7591 (protocol), RFC 7592 (management), overview OAuth.net. citeturn20search916turn20search898turn20search918
- **JWKS** : best practices de cache/rotation ; tutoriels et docs éditeurs. citeturn20search880turn20search883
- **Fournisseurs** : Keycloak (client registration), Auth0 (Management API), Okta (DCR API). citeturn20search886turn20search910turn20search892
- **Lib** : **oauth4webapi** (discovery, DCR). citeturn20search904turn20search907
