
# Chapitre 16 — **ID Token**, **UserInfo** & **Claims** : validation côté client

> **Objectif** : savoir **valider un ID Token** OIDC, **interroger le UserInfo**, et
> **consommer les claims** de façon sûre. On couvre la norme **OIDC Core** (ID Token
> validation, `nonce`, `aud`, `iss`, `exp`…), le schéma **UserInfo**, JOSE (**JWT/JWS/JWK**),
> et une implémentation Node/TS avec **oauth4webapi**.

---

## 1) ID Token OIDC : rappel & structure
Un **ID Token** atteste l’identité de l’utilisateur authentifié par l’OP (OpenID Provider).
C’est un **JWT** signé, contenant au minimum `iss` (issuer), `sub` (subject), `aud`
(audience = `client_id`), `exp`, `iat`, et potentiellement `nonce`, `auth_time`, `acr`,
`amr`, etc. La validation est spécifiée dans **OpenID Connect Core** (sections *ID Token*
& *ID Token Validation*). citeturn21search955

Le format JWT et les **claims** enregistrés (`iss`, `aud`, `exp`, `nbf`, `iat`, `jti`)
proviennent du **RFC 7519** ; les clés publiques sont publiées via **JWKS** (**RFC 7517**)
et les signatures via **JWS** (**RFC 7515**). citeturn21search949turn21search937turn21search943

---

## 2) Validation complète d’un ID Token (côté client)
Voici les vérifications **indispensables** (Code Flow) selon OIDC Core : citeturn21search955

1. **Signature** : vérifier la signature JWS du JWT avec une **clé** du `jwks_uri` de l’OP ;
   respecter l’algorithme (`RS256`, `PS256`, `ES256`, …) annoncé par l’OP. citeturn21search943
2. **`iss` (issuer)** : doit **exactement** correspondre à l’issuer découvert (discovery). citeturn21search955
3. **`aud` (audience)** : doit **contenir** le `client_id` du RP ; rejeter s’il contient
   des audiences non‑de confiance. citeturn21search955turn21search957
4. **`exp` / `iat` / `nbf`** : vérifier horodatages (NumericDate en **secondes** depuis epoch). citeturn21search949turn21search953
5. **`nonce`** : si présent dans la requête, doit **matcher** la valeur reçue (anti‑replay). citeturn21search959
6. **`auth_time` / `max_age`** : si `max_age` demandé, vérifier `auth_time` ≤ délai (freshness). citeturn21search964
7. **`acr` / `amr`** : contrôler le **niveau** et les **méthodes** d’auth (MFA, pwd, otp…),
   surtout en cas de **step‑up**. citeturn21search960turn21search962
8. **Mix‑up defense** : utiliser l’**issuer identification** (`iss` en réponse OAuth) quand
   supporté (RFC 9207). citeturn21search931

> **Bonnes pratiques** : mettre en cache **JWKS** avec respect des en‑têtes HTTP et recharger
> sur **kid inconnu** ; éviter de « figer » des clefs en configuration. (cf. chap. 15) citeturn20search880

---

## 3) UserInfo : récupérer des **claims** consentis via access token
Le **UserInfo endpoint** est une **ressource protégée** OAuth ; il retourne des **claims**
(en JSON ou JWT signé selon configuration), en fonction des **scopes** accordés (`openid`,
`profile`, `email`, `phone`, `address`). L’URL est publiée dans `userinfo_endpoint` du
document de **discovery**. citeturn21search965turn21search966

- Les claims standards (`name`, `given_name`, `family_name`, `email`, etc.) sont définis par
  OIDC Core § 5.1 et répertoriés dans le registre IANA. citeturn21search955turn21search950
- Les implémentations (Keycloak, PingFederate, Ory, Microsoft Entra) exposent **/userinfo** et
  supportent des réponses **JSON** ou **JWT signé/chifré** selon client. citeturn21search978turn21search971turn21search981

> Astuce : si l’**ID Token** contient déjà tous les **claims** nécessaires, l’appel
> **UserInfo** peut être évité (latence), sinon appeler **/userinfo** avec le **access token**
> et les **scopes** adéquats (`profile`, `email`, …). citeturn21search966

---

## 4) Implémentation Node/TS avec **oauth4webapi**

### 4.1 Valider un ID Token reçu au **token endpoint**
```ts
import * as oauth from 'oauth4webapi';

// Après échange de code via processAuthorizationCodeResponse(),
// extraire & valider les claims de l'ID Token
const tokenResponse = await oauth.processAuthorizationCodeResponse(as, client, response);
const idToken = oauth.getValidatedIdTokenClaims(tokenResponse);
if (!idToken) throw new Error('Aucun ID Token');

// (Optionnel) valider la signature applicative si nécessaire
// await oauth.validateApplicationLevelSignature(idToken, /* …options… */);

// Contrôles additionnels : nonce, acr/amr, auth_time/max_age… selon ta politique
```
> `getValidatedIdTokenClaims()` retourne les **claims** décodés de l’ID Token ; voir aussi
> `validateApplicationLevelSignature` et les flags de tolérance (`clockSkew`, `clockTolerance`). citeturn21search925turn21search928

### 4.2 Appeler **UserInfo** (JSON ou JWT)
```ts
// Récupérer les claims UserInfo avec l'access token
const userInfoRes = await oauth.userInfoRequest(as, client, accessToken);
const userInfo = await oauth.processUserInfoResponse(as, client, userInfoRes);

console.log(userInfo.sub, userInfo.name, userInfo.email);
```
> La paire `userInfoRequest()` / `processUserInfoResponse()` implémente le **pattern**
> requête/validation de la lib. citeturn21search928

---

## 5) Modèle de **claims** & personnalisation
- **Claims standards** : `name`, `given_name`, `family_name`, `preferred_username`, `email`,
  `email_verified`, `address`, `phone_number`, etc. citeturn21search950
- **Claims d’auth** : `auth_time` (fraîcheur), `acr` (niveau), `amr` (méthodes) ; utiles pour
  **step‑up** (voir RFC 9470) ou **max_age**. citeturn21search961
- **Custom claims** : préférez des **namespaces URI** pour éviter collisions ; exposer via
  **ID Token** (consent) ou **UserInfo** selon besoins. citeturn21search965

---

## 6) Sécurité & durcissement
- **Toujours** vérifier `iss`, `aud`, `exp/nbf/iat`, `nonce` ; **refuser** tokens hors fenêtre
  temporelle ou audience incorrecte. citeturn21search955
- **Signer/Chiffrer** si nécessaire : OIDC autorise **ID Token** et **UserInfo** en **JWS/JWE** ;
  choisir algos adaptés (`RS256`, `PS256`, `ES256`; chiffrement JWE si confidentialité requise). citeturn21search943
- **Issuer identification** (RFC 9207) pour contrer **mix‑up** en environnements multi‑OP. citeturn21search931

---

## 7) Exercices
1. **Validation ID Token** : implémente la vérification `iss`, `aud`, `exp`, `nonce`, `auth_time` sur l’ID Token de ton OP. citeturn21search955
2. **UserInfo** : appelle `userinfo_endpoint` avec un **access token** (`openid profile email`) et affiche `name`, `email`. citeturn21search966
3. **Acr/Amr** : demande `acr_values` + `max_age` et vérifie les claims retournés ; simule une **step‑up**. citeturn21search962
4. **JWS/JWKS** : valide une signature RS256 contre le `jwks_uri` ; implémente un cache respectant **Cache‑Control**. citeturn21search943turn21search937

---

## 8) Références
- **OIDC Core** (ID Token & UserInfo). citeturn21search955
- **JWT/JWS/JWK** : RFC 7519 / RFC 7515 / RFC 7517. citeturn21search949turn21search943turn21search937
- **UserInfo** (guides & implémentations). citeturn21search965turn21search966
- **acr/amr & step‑up** (OIDC & RFC 9470). citeturn21search960turn21search961
- **Issuer identification** (RFC 9207). citeturn21search931
