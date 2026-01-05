
# Chapitre 14 — PAR, JAR & JARM : sécuriser les **requêtes** et **réponses** d’autorisation

> **Objectif** : durcir la phase *la plus attaquée* d’un flow OAuth/OIDC — la **requête** et la
> **réponse** d’autorisation — avec trois extensions clés :
> **PAR** (Pushed Authorization Requests), **JAR** (JWT‑Secured Authorization Request) et
> **JARM** (JWT‑Secured Authorization Response Mode). Tu verras aussi leur rôle en **FAPI** et des
> exemples Node avec **oauth4webapi**.

---

## 1) Pourquoi PAR/JAR/JARM ?
Dans un flow classique, les paramètres d’*authorization request* passent en **query** via le navigateur.
Ils peuvent être **modifiés** par des intermédiaires, et leur provenance n’est pas authentifiée ; c’est
exactement ce que **JAR** corrige en encapsulant la requête dans un **JWT** signé (et optionnellement
chiffré). **PAR** pousse la requête **par back‑channel** au serveur d’autorisation qui renvoie un
`request_uri` de référence ; et **JARM** renvoie la **réponse d’autorisation** (code, état, erreurs) sous
forme de **JWT** signé/chiffré, ce qui apporte intégrité, authentification de l’émetteur et audience
(`aud=client_id`). citeturn19search833turn19search832turn19search827turn19search851

> Le **BCP OAuth 2.0** (RFC 9700, janvier 2025) recommande de renforcer les **redirect‑flows**, et
> PAR/JAR/JARM font partie des contre‑mesures modernes contre le *request tampering*, *mix‑up* et fuites. citeturn19search855turn19search856

---

## 2) **PAR** — Pushed Authorization Requests (RFC 9126)
- Le client envoie **par POST** au **PAR endpoint** la charge de la requête d’autorisation (ex. `response_type`, `client_id`, `redirect_uri`, `scope`, `code_challenge`), **authentifiée** côté client ; l’AS renvoie un **`request_uri`** et une **expiration**. À l’étape `/authorize`, le client ne passe que ce `request_uri`. citeturn19search827
- Avantages : protection d’intégrité/confidentialité des paramètres, compatibilité avec **SPA/mobile** (construction serveur), URL courte, et pré‑requis **FAPI** (souvent PAR **obligatoire**). citeturn19search828turn19search845

---

## 3) **JAR** — JWT‑Secured Authorization Request (RFC 9101)
- La requête est encapsulée dans un **JWT** (Request Object) **signé** (**JWS**) et éventuellement **chiffré** (**JWE**). On peut l’envoyer **par valeur** via le paramètre `request` ou **par référence** via `request_uri`. L’AS vérifie la signature, assemble/valide les paramètres et traite la requête. citeturn19search833
- JAR comble les failles de la requête *via navigateur* (intégrité, source, confidentialité). Il est largement utilisé par **FAPI**. citeturn19search837
- Attention aux **différences** avec le **Request Object** d’**OIDC Core** (fusion/ignorer les paramètres du query, claims obligatoires) ; certains fournisseurs exposent des modes compatibles et des paramètres de politique. citeturn19search864turn19search861

---

## 4) **JARM** — JWT‑Secured Authorization Response Mode (OIDF, Final 2025)
- La **réponse** de l’AS (code, `state`, ou erreur) est retournée en **JWT signé** (et optionnellement chiffré) via `response_mode=query.jwt|fragment.jwt|form_post.jwt|jwt`. Le JWT contient au moins `iss`, `aud` (client_id), `exp` et les paramètres de réponse (ex. `code`, `state`). citeturn19search851turn19search854
- Bénéfices : intégrité, authentification de l’émetteur, **audience** restreinte au client, **mix‑up defense** ; fréquemment utilisé en **FAPI**. citeturn19search852turn19search845

---

## 5) Rôle dans **FAPI** (Financial‑grade API)
- **FAPI 1.0 Advanced** : impose **PKCE**, forte auth client (**private_key_jwt** ou **mTLS**), requêtes signées (**JAR**, parfois via **PAR**), et peut exiger **JARM** côté réponse. citeturn19search845
- **FAPI 2.0** : **PAR** devient la norme ; **DPoP** ou mTLS pour le token binding ; **response_type=code**, et **JARM** est recommandé/mandaté selon profil. citeturn19search847turn19search850

---

## 6) Implémentations Node.js — **oauth4webapi**
La librairie **oauth4webapi** fournit des exemples pour **PAR/JAR/JARM**, conformes aux BCP/FAPI. citeturn19search821turn19search823

### 6.1 PAR — pousser la requête
```ts
import * as oauth from 'oauth4webapi';

// as: metadata de l’AS (issuer, endpoints) ; client: metadata du client (client_id, auth method)
// Construire la requête (PKCE recommandé) puis l’envoyer au PAR endpoint
const parResponse = await oauth.pushedAuthorizationRequest(
  as, client,
  new URLSearchParams({
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: 'https://app.example.com/cb',
    scope: 'openid profile api.read',
    code_challenge: pkceChallenge,
    code_challenge_method: 'S256',
    state,
    nonce
  })
);
const { request_uri, expires_in } = await oauth.processPushedAuthorizationResponse(as, client, parResponse);
// Ensuite, rediriger l’utilisateur vers /authorize avec uniquement request_uri
const authzUrl = new URL(as.authorization_endpoint);
authzUrl.searchParams.set('client_id', client.client_id);
authzUrl.searchParams.set('request_uri', request_uri);
```
> Pattern conforme au **RFC 9126** (construction back‑channel, réception d’un `request_uri`). citeturn19search832

### 6.2 JAR — signer la requête
```ts
// Créer un Request Object (JWT signé) contenant les paramètres, puis l’envoyer en `request`
const requestObject = await oauth.issueRequestObject(as, client, {
  response_type: 'code',
  client_id: client.client_id,
  redirect_uri: 'https://app.example.com/cb',
  scope: 'openid profile api.read',
  state,
  nonce
});
const url = new URL(as.authorization_endpoint);
url.searchParams.set('client_id', client.client_id);
url.searchParams.set('request', requestObject);
// Rediriger l’utilisateur vers `url`
```
> **JAR** encapsule la requête dans un **JWT** signé/chiffré ; l’AS vérifie et traite. citeturn19search833turn19search836

### 6.3 JARM — valider une réponse JWT
```ts
// Après redirection vers notre callback, on reçoit `response` (JWT) au lieu de `code`/`state`
const params = new URLSearchParams(callbackUrl.split('?')[1]);
const validated = await oauth.validateJwtAuthResponse(as, client, params, expectedState);
// `validated` contient les paramètres (ex. code) issus de la JARM ; poursuivre l’échange de code
```
> **oauth4webapi** apporte `validateJwtAuthResponse()` pour **JARM** (vérification algos, signature,
> claims `iss/aud/exp`, extraction des paramètres). citeturn19search822

---

## 7) Intégration & compatibilité fournisseurs
- **Auth0** documente la configuration **JAR** (claims/algos requis, usage avec `/authorize` ou `/oauth/par`). citeturn19search836
- **Connect2id/Nimbus** montre la prise en charge **JARM** et **JAR** (métadonnées, `response_mode=*.jwt`, exemples). citeturn19search854turn19search866

---

## 8) Bonnes pratiques & BCP
- Utiliser **PKCE** + **state/nonce** ; éviter Implicit/ROPC ; valider **redirect URI** et déployer **issuer identification** (RFC 9207). citeturn19search855
- En **haute assurance** (finance/santé), combiner : **PAR** (obligatoire), **JAR** (requêtes signées), **JARM** (réponses signées), + **DPoP/mTLS** et **private_key_jwt** pour l’auth client. citeturn19search845turn19search847

---

## 9) Exercices
1. **Activer PAR** côté AS et pousser une requête avec **PKCE** ; vérifier le `request_uri` et l’expiration. citeturn19search827
2. **Signer une requête JAR** (RS256) et l’envoyer en `request` ; observer la validation côté AS. citeturn19search833
3. **JARM** : demander `response_mode=jwt`, puis **valider** la réponse via `validateJwtAuthResponse()` ; contrôler `iss/aud/exp`. citeturn19search851turn19search822
4. **FAPI** : configurer un profil **FAPI 1.0 Advanced** ou **FAPI 2.0** et montrer ce qui change (PAR, JAR/JARM, auth client). citeturn19search845turn19search847

---

## 10) Références
- **PAR** : RFC 9126 & ressources complémentaires. citeturn19search827turn19search828turn19search832
- **JAR** : RFC 9101 & guides d’implémentation. citeturn19search833turn19search836turn19search838
- **JARM** : Spécification OIDF (Final 2025) & docs éditeurs. citeturn19search851turn19search854turn19search852
- **FAPI** : profils et synthèses. citeturn19search845turn19search849turn19search850
- **BCP** : RFC 9700. citeturn19search855
- **oauth4webapi** : exemples JAR/JARM/PAR. citeturn19search821turn19search823
