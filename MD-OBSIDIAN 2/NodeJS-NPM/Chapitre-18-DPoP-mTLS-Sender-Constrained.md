
# Chapitre 18 — **DPoP (Proof‑of‑Possession)**, **mTLS** & **Sender‑Constrained Tokens**

> **Objectif** : durcir l’accès aux APIs en abandonnant les simples **Bearer tokens**
> au profit de **tokens contraints au présentateur** (sender‑constrained) : **DPoP** (couche
> applicative) et **mTLS** (couche transport). On detaille les mécanismes, les bénéfices,
> la mise en œuvre, et l’implémentation Node/TS avec **oauth4webapi**.

---

## 1) Du Bearer au **Proof‑of‑Possession** (PoP)
Les **Bearer tokens** (RFC 6750) sont utilisables par **quiconque** les détient ; ils doivent
donc être protégés en transit et au repos, mais restent vulnérables au **rejeu** si volés. citeturn23search1039turn23search1043

Les **sender‑constrained tokens** (**PoP**) lient l’usage du token à une **preuve cryptographique**
(« je possède la clé associée au token »). Deux approches standards :
- **mTLS** (RFC 8705), liaison au **certificat client** au transport. citeturn23search1084
- **DPoP** (RFC 9449), preuve **au niveau applicatif** via un **JWT** signé par la clé du client. citeturn23search1075

> En contexte réglementaire (FAPI/PSD2, e‑santé), les tokens **sender‑constrained** sont devenus
> une **pratique recommandée** pour éliminer l’utilisation d’un token volé hors de son contexte. citeturn23search1041

---

## 2) **DPoP** : mécanisme & propriétés (RFC 9449)
- Le client génère une **paire de clés** et envoie à chaque requête un **DPoP Proof JWT** dans
  l’en‑tête `DPoP`. Ce JWT contient `htm` (méthode), `htu` (URI), `jti` (UUID unique), `iat`, et
  **`ath`** (hash de l’access token) lorsqu’un token est présenté. citeturn23search1063turn23search1046
- À l’obtention du token (token endpoint), le client joint un **proof** ; l’AS **lie** le token à la clé
  (confirmation **cnf** via **JWK thumbprint**) ; le RS vérifie la correspondance token ↔ clé et **ath**. citeturn23search1065
- **Rejeu** : l’unicité de `jti` et la prise en compte éventuelle de **nonce** côté AS/RS rendent le
  **rejeu détectable** ; le serveur peut exiger un **nonce** et demander un **retry**. citeturn23search1065
- **Public vs confidential clients** : les **refresh tokens** des **public clients** doivent être liés à la clé DPoP ;
  pour les **confidential clients**, la contrainte existe déjà via l’authentification client ;
  l’AS peut **ne pas** lier le RT à la clé DPoP (flexibilité). citeturn23search1091

> Avantages : **anti‑vol** (un token volé est inutilisable sans clé), fonctionnement en **SPA/mobile**
> (sans X.509), et **protection** contre mélange méthode/URI (grâce à `htm`/`htu`). citeturn23search1077

---

## 3) **mTLS** : authentification client & tokens liés au certificat (RFC 8705)
- Le client s’authentifie en **mutual TLS** ; l’AS **encode l’empreinte** du certificat dans le token
  (claim `cnf` `x5t#S256`) ou la renvoie via **introspection** ; le RS exige **même certificat** en
  présentation. citeturn23search1084turn23search1057
- Utilisable pour **authentifier** les clients (à la place d’un secret partagé) **et** pour **lier** les
  access tokens (sender‑constraining). citeturn23search1058

> Avantages : robuste pour **clients confidentiels** et intégrations serveur↔serveur ; inconvénients :
> gestion de PKI, distribution des certificats, et compatibilité infra (terminaison TLS). citeturn23search1059

---

## 4) Choisir **DPoP vs mTLS** (ou hybrider)
- **DPoP** : idéal **SPA/mobile/public clients**, pas de PKI, preuve à chaque requête via JWT ; supporte
  **nonce** serveur et binding de code/refresh token. citeturn23search1065
- **mTLS** : idéal **confidential clients** (backend), tokens liés au **certificat** ; forte assurance au transport. citeturn23search1084
- Les deux fournissent des **sender‑constrained tokens** ; choisir selon **contexte client** et
  **capacités infra**. citeturn23search1080

---

## 5) Implémentation Node/TS avec **oauth4webapi**
### 5.1 Activer **DPoP** (preuve côté token request & resource request)
```ts
import * as oauth from 'oauth4webapi';

// 1) Génère une paire de clés (WebCrypto) et crée un handle DPoP
const keyPair = await oauth.generateKeyPair('ES256');
const dpop = oauth.DPoP(client, keyPair);

// 2) Échange d’autorisation avec DPoP (token endpoint)
const tokenRes = await oauth.authorizationCodeGrantRequest(as, client, {
  code, code_verifier, redirect_uri,
}, { DPoP: dpop });
const tokens = await oauth.processAuthorizationCodeResponse(as, client, tokenRes);

// 3) Appel d’une ressource protégée avec DPoP
const rsRes = await oauth.protectedResourceRequest(as, client, tokens.access_token, {
  url: new URL('https://api.example.com/data'), method: 'GET',
}, { DPoP: dpop });

// 4) Gestion des erreurs nonce (RFC 9449 § 8)
if (oauth.isDPoPNonceError(rsRes)) {
  // relancer avec le nouveau nonce mémorisé par dpop
}
```
> La lib fournit `DPoP()` et `isDPoPNonceError()` pour gérer preuves et **nonces** serveur. citeturn23search1045turn23search1047

### 5.2 Idées pour **mTLS** (côté AS & RS)
- **AS** : activer l’authentification **mTLS** (RFC 8705) pour les clients, et la **liaison** des access tokens (`cnf.x5t#S256`). citeturn23search1084
- **RS** : n’accepter l’API que sur **mutual TLS** et **comparer** l’empreinte du certificat présenté
  avec celle contenue dans le token ou via **introspection**. citeturn23search1057turn23search1062

---

## 6) Menaces & contre‑mesures
- **Vol/rejeu de token** : basculer vers **sender‑constrained tokens** (DPoP/mTLS) plutôt que Bearer. citeturn23search1043
- **Rejeu de preuve DPoP** : vérifier `jti` **unique**, **`htm`/`htu`**, `ath`, et appliquer **nonce**
  côté AS/RS, avec **retry** contrôlé. citeturn23search1065
- **Downgrade DPoP** : refuser l’absence de nonce lorsqu’exigé ; protéger stockage de la **clé privée** (WebCrypto, IndexedDB non‑extractible). citeturn23search1065turn23search1067
- **Token Binding (TLS)** : standards **tokbind** ont été **abandonnés** côté navigateur ; privilégier **DPoP** ou **mTLS**. citeturn23search1069turn23search1070

---

## 7) Bonnes pratiques de déploiement
1. **Choisir** DPoP pour **public clients** (SPA/mobile) ; **mTLS** pour **confidential clients**. citeturn23search1080
2. **Court‑vies** access tokens ; **RT** liés (DPoP pour publics, authentification client pour confidentiels). citeturn23search1091
3. **Journaliser** et refuser `jti` réutilisé ; activer **nonce** côté AS/RS si exigence FAPI. citeturn23search1065
4. **Documenter** l’usage de **sender‑constrained tokens** dans tes specs (OpenAPI + guides). citeturn23search1082
5. **PKI** : rotation & révocation de certificats ; **introspection** expose `cnf` pour vérif RS. citeturn23search1062

---

## 8) Exercices
1. **DPoP** : génère une paire de clés, active `DPoP()` sur ta demande de token et sur l’accès API ;
   simule un **nonce** RS et gère `isDPoPNonceError()`. citeturn23search1045turn23search1047
2. **mTLS** : configure un client mTLS et émet un token avec `cnf.x5t#S256` ; refuse les requêtes sans
   certificat correspondant. citeturn23search1084turn23search1057
3. **Comparatif** : mesure latence et échecs sur DPoP vs mTLS ; trace les rejeux (jti du proof). citeturn23search1065

---

## 9) Références
- **DPoP** : RFC 9449 (standard, nonce, claims `htm/htu/jti/ath`). citeturn23search1063
- **mTLS** : RFC 8705 (auth client & tokens liés au certificat). citeturn23search1084
- **Bearer** : RFC 6750 (limites & erreurs). citeturn23search1039
- **oauth4webapi** : DPoP & gestion des **nonces**. citeturn23search1045turn23search1047
- **Guides pratiques** : Curity (mTLS), Auth0 (mTLS & DPoP), Spring Security (DPoP). citeturn23search1057turn23search1058turn23search1088
