
# Chapitre 17 — **Introspection**, **Révocation**, gestion des **erreurs OAuth** & design **scopes/audience**

> **Objectif** : savoir **valider des tokens** à l’exécution (RFC **7662**),
> **révoquer** proprement (RFC **7009**), **renvoyer et gérer les erreurs** conformément à
> **RFC 6749/6750**, et **concevoir scopes/audience** avec **Resource Indicators (RFC 8707)**.
> On termine par une implémentation Node/TS avec **oauth4webapi**.

---

## 1) Pourquoi l’**introspection** (RFC 7662) ?
Lorsque le **resource server** ne peut pas valider localement un token (opaque, règles dynamiques,
revocation immédiate), il peut interroger l’AS via l’**introspection** pour obtenir `active` et
les **métadonnées** (scope, sub, client_id, exp, etc.). citeturn22search999turn22search1001

- **Spécification** : endpoint **POST** `application/x-www-form-urlencoded` avec `token` (et
  `token_type_hint` facultatif), réponse JSON avec `active` et claims complémentaires. citeturn22search999
- **Cas d’usage** : tokens opaques, besoin d’**invalidations instantanées**, vérification fine des
  **scopes** et contexte en microservices. citeturn22search1002
- **Sécurité** : l’endpoint n’est **pas public** ; authentifier le client (Basic, private_key_jwt,
  mTLS, etc.) et interdire **GET** pour éviter fuites en logs. citeturn22search999turn22search1023

---

## 2) **Révocation** (RFC 7009) : couper l’accès proprement
La **revocation** ajoute un endpoint où un client peut invalider un **access** ou **refresh token**.
La demande inclut `token` (obligatoire) et éventuellement `token_type_hint` ; succès → HTTP 200
corps vide. citeturn22search993turn22search996

- Effets : révoquer un **refresh token** invalide souvent l’**ensemble des access tokens** issus
  du même grant ; pour **JWT access tokens** déjà émis, la révocation n’est vue que si les APIs
  utilisent **introspection** ou listes de révocation. citeturn22search993turn22search998
- Authentification du client requise ; l’AS peut retourner `unsupported_token_type` si
  non pris en charge. citeturn22search993

---

## 3) **Bearer tokens** & erreurs normalisées (RFC 6750 / RFC 6749)
- **Utilisation** : `Authorization: Bearer <token>` (préféré), sinon **body** ou **query** (moins
  sûrs). Protéger contre divulgation en transit et stockage. citeturn22search1010
- **WWW-Authenticate** : en cas d’échec, inclure `error`, `error_description`, `error_uri`, éventuellement
  `scope` et `realm`. citeturn22search1010
- **Codes d’erreur** (exemples) : `invalid_token`, `insufficient_scope` (RFC 6750) ; `invalid_request`,
  `invalid_grant`, `unauthorized_client`, `unsupported_response_type`, `server_error`,
  `temporarily_unavailable` (RFC 6749). citeturn22search1010turn22search1016turn22search1021

> **Attention** : l’**authorization code** dans la redirection ne doit pas être **double encodé** ;
> respecter § 4.1.2 de RFC 6749 (un encodage URL). citeturn22search1016turn22search1020

---

## 4) **Scopes** & **Audience** : précision avec **Resource Indicators** (RFC 8707)
Le paramètre **`resource`** permet d’indiquer **l’API cible** lors de la demande d’autorisation ou
au token endpoint ; l’AS peut alors **mînt** un token **audience‑spécifique**, chiffré ou profilé
pour ce **resource server**. citeturn22search1025

- Bénéfices : éviter les **tokens passe‑partout**, restreindre `aud`, adapter contenu/format, et
  améliorer la sécurité dans multi‑API/tenants. citeturn22search1025turn22search1026
- Pratique : demander **un token par resource** ; gérer l’erreur `invalid_target` si le resource
  n’est pas reconnu. citeturn22search1025turn22search1028

---

## 5) Implémentation Node/TS avec **oauth4webapi**
### 5.1 Introspection (côté resource server)
```ts
import * as oauth from 'oauth4webapi';

// as: AuthorizationServer découvert (/.well-known)
// client: métadonnées du RS ou du client autorisé à introspecter

// Faire une requête d'introspection
const res = await oauth.introspectionRequest(as, client, {
  token: accessToken, // string à vérifier
  token_type_hint: 'access_token'
});

// Valider la réponse
const tokenInfo = await oauth.processIntrospectionResponse(as, client, res);
if (!tokenInfo.active) throw new Error('Token inactif');
// tokenInfo.scope, tokenInfo.sub, tokenInfo.exp, etc.
```
> La lib fournit `introspectionRequest()` et `processIntrospectionResponse()` dans le
> **pattern** requête/validation. citeturn22search1006turn22search1008

### 5.2 Révocation
```ts
// Révoquer un access/refresh token
const revokeRes = await oauth.revocationRequest(as, client, {
  token: refreshToken,
  token_type_hint: 'refresh_token'
});
await oauth.processRevocationResponse(revokeRes); // undefined si succès
```
> `revocationRequest()` + `processRevocationResponse()` gèrent l’endpoint RFC 7009
en respectant les erreurs protocolaires. citeturn22search987turn22search989

### 5.3 Erreurs & Bearer
```ts
// Exemple de réponse d’API en cas d’insuffisance de scopes
res.status(403).set('WWW-Authenticate',
  'Bearer error="insufficient_scope", scope="write:posts"');
```
> Utiliser `WWW-Authenticate` avec codes RFC 6750 (`invalid_token`, `insufficient_scope`, …). citeturn22search1010

### 5.4 Audience ciblée
```ts
// Demande client_credentials pour une API précise
const tokenRes = await oauth.clientCredentialsGrantRequest(as, client, {
  resource: 'https://api.example.com'
});
// Le token renvoyé doit cibler l’audience de cette API
```
> Le paramètre **`resource`** vient de **RFC 8707** pour contraindre l’audience/format du token. citeturn22search1025

---

## 6) JWT vs **opaque** : quel modèle de validation ?
- **JWT access token** : validation **locale** (signature JWKS, claims) → performance ; pour une
  **révocation immédiate**, prévoir **introspection** ou liste noire. citeturn22search1010turn22search1037
- **Opaque token** : nécessite **introspection** ; idéal quand l’AS veut garder le **contrôle**
  centralisé (rotations, révocations, attributs dynamiques). citeturn22search999
- Patterns hybrides (**phantom token** via introspection `Accept: application/jwt`) existent selon
  l’AS (ex. Curity), et font débat côté éditeurs. citeturn22search998turn22search1034

---

## 7) Bonnes pratiques de prod
1. **Protéger** introspection/révocation (auth client, ACL réseau, POST uniquement). citeturn22search999turn22search1023
2. **Journaliser** sans fuite : ne jamais mettre le token en **query** ; préférer **Authorization**. citeturn22search1010
3. **Limiter scopes** (principe de moindre privilège) et **fixer audience** via `resource`. citeturn22search1025
4. **Mettre en cache** JWKS côté API et **ré‑fetch** sur `kid` inconnu (cf. chap. 15). citeturn22search1010
5. **Tests d’erreurs** : couvrir tous les codes **RFC 6749/6750** et headers `WWW-Authenticate`. citeturn22search1016turn22search1010

---

## 8) Exercices
1. **Introspection** : implémente `introspectionRequest()` et refuse les appels si `active=false` ou scope manquant. citeturn22search1006
2. **Révocation** : ajoute `/oauth/revoke` dans ton mock AS et teste `refresh_token` + cas `unsupported_token_type`. citeturn22search993
3. **Erreurs Bearer** : fais répondre l’API aux erreurs de scopes avec `WWW-Authenticate`/`insufficient_scope`. citeturn22search1010
4. **Audience ciblée** : consomme `resource` au token endpoint et vérifie que `aud` du token correspond à l’API ciblée. citeturn22search1025

---

## 9) Références
- **Introspection** : RFC 7662, guides OAuth.net & OAuth.com. citeturn22search999turn22search1001turn22search1024
- **Révocation** : RFC 7009, overview OAuth.net. citeturn22search993turn22search996
- **Bearer** & **erreurs** : RFC 6750. citeturn22search1010
- **Framework** : RFC 6749 (codes d’erreur de base). citeturn22search1016
- **Resource Indicators** : RFC 8707 et tutoriels. citeturn22search1025turn22search1026
- **Lib** : **oauth4webapi** (introspection/revocation). citeturn22search1006turn22search987
