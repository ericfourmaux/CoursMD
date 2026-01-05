
# Chapitre 11 — Sessions, Logout & cycle de vie des tokens (Revocation, Introspection) + PAR/JAR/JARM

> **Objectif** : maîtriser la **gestion de session** (IdP/RP), implémenter les **logout** modernes
> (RP‑Initiated, front‑channel, back‑channel), piloter le **cycle de vie des tokens** (revocation,
> introspection) et **durcir** les requêtes/réponses OAuth avec **PAR/JAR/JARM**.

---

## 1) Sessions : IdP vs application & implications
- Dans OIDC, il existe une **session IdP** (chez l’OP/AS) et une **session locale** (chez le RP). Elles
  sont distinctes et doivent être gérées séparément (SSO, réauth, max_age). citeturn15search626
- Chez Auth0, on distingue la **session locale** côté app et la **session** côté Authorization Server ;
  les SPAs utilisent souvent **silent auth** via iframe (prompt=none), mais les navigateurs modernes
  limitent ces mécanismes. citeturn11search468

---

## 2) Logout : les 3 grands scénarios
### 2.1 RP‑Initiated Logout (RPLC)
- Spécification **OpenID Connect RP‑Initiated Logout 1.0** : le RP demande à l’OP de terminer la
  session utilisateur (via **end_session_endpoint**). citeturn15search623
- Auth0 implémente **RPLC** via son **OIDC Logout endpoint** ; paramètres clés : `id_token_hint`
  (recommandé), `logout_hint`, `post_logout_redirect_uri`, `client_id`, `state`, `federated`. citeturn15search624
- **Allowed Logout URLs** : Auth0 **exige** que `post_logout_redirect_uri/returnTo` figure dans la
  allowlist (au niveau **application** si `client_id` est fourni, sinon **tenant**). citeturn15search642

### 2.2 Front‑Channel Logout
- **Front‑channel** : l’OP notifie les RPs via le **User Agent** (redirection/iframe) afin que chaque RP
  purge sa session (cookies/storage). citeturn15search612
- Points d’attention : blocage de contenu **tiers** (politique navigateur), enregistrement d’une
  `frontchannel_logout_uri` et directives de **cache** pour éviter réutilisation. citeturn15search612turn15search615

### 2.3 Back‑Channel Logout
- **Back‑channel** : l’OP envoie un **logout token (JWT)** par POST **direct serveur‑à‑serveur** vers les
  endpoints des RPs ; plus fiable car ne dépend pas du navigateur. citeturn15search618
- Implémentation : endpoint RP joignable par l’OP, validation du **logout_token** (`iss`, `aud`, `iat`,
  `jti`, `events`, `sid`…), puis invalidation de session côté RP. citeturn15search616

> **ISO/IEC 2024** a également publié des versions normalisées des specs **Front‑Channel** et
> **Back‑Channel Logout** (références ISO/IEC 26136 et 26137). citeturn15search613turn15search621

---

## 3) Cycle de vie des tokens : **revocation** & **introspection**
### 3.1 Revocation (RFC 7009)
- **RFC 7009** définit un **revocation endpoint** où le client envoie le token (`token`) et un
  `token_type_hint` (facultatif) ; la réponse **200** est attendue même si le token était invalide. citeturn15search600turn15search602
- Les IdP exposent ce endpoint dans leur **discovery** ; côté libs, on trouve des implémentations
  (Authlib/OAuthlib, etc.). citeturn15search604turn15search649
- Chez Auth0 : la **revocation** concerne surtout les **refresh tokens** (les access tokens JWT ne se
  "révoquent" pas, ils expirent rapidement) ; privilégier des durées courtes + rotation. citeturn15search648
- Auth0 fournit aussi un endpoint de **global token revocation** (Universal Logout) pour révoquer
  sessions cookies et refresh tokens à l’échelle d’une **connection**. citeturn15search646

### 3.2 Introspection (RFC 7662)
- **RFC 7662** permet à un **Resource Server** de vérifier en temps réel si un token est **actif** et
  d’obtenir ses **métadonnées** (`scope`, `client_id`, `username`, `exp`, etc.). citeturn15search594turn15search598
- Utile pour tokens **opaques** et pour **révocation immédiate** ; les JWT by‑value restent valides
  jusqu’à **exp** si non couplés à mécanismes additionnels. citeturn15search596turn15search603

---

## 4) Bonnes pratiques (rappel BCP OAuth 2.0)
- Le BCP **RFC 9700** recommande de **limiter** la durée des tokens, d’éviter les modes obsolètes
  (Implicit, ROPC), et d’utiliser des mécanismes anti‑rejeu/anti‑altération (**DPoP**, **PAR/JAR/JARM**). citeturn13search533

---

## 5) Durcir les requêtes/réponses : **PAR/JAR/JARM**
### 5.1 PAR — *Pushed Authorization Requests* (RFC 9126)
- Le client **pousse** la charge de la requête d’autorisation vers l’AS au **PAR endpoint** et reçoit un
  `request_uri` de référence, évitant la construction d’URL exposées dans le navigateur. citeturn15search640turn15search635

### 5.2 JAR — *JWT‑Secured Authorization Request* (RFC 9101)
- La requête est encapsulée dans un **JWT signé** (et optionnellement chiffré), envoyé **par valeur**
  (`request`) ou **par référence** (`request_uri`). Protége **intégrité**, **source**, **confidentialité**. citeturn15search630turn15search629
- Auth0 documente l’usage **JAR** avec Authorization Code (génération du JWT : `iss`, `aud`, alg). citeturn15search634

### 5.3 JARM — *JWT‑Secured Authorization Response Mode* (OIDF)
- L’AS renvoie la **réponse** d’autorisation dans un **JWT signé** (et chiffré) via `response_mode`
  (`query.jwt`, `fragment.jwt`, `form_post.jwt`, `jwt`) pour protéger contre **mix‑up**, altération et
  fuite des paramètres. citeturn15search606
- Exemples & support éditeurs (Connect2id, WSO2, libs) et validation des claims (`iss`, `aud`, `exp`). citeturn15search608turn15search611

---

## 6) Implémenter dans ton mini‑projet Express
### 6.1 RP‑Initiated Logout avec Auth0
- Configure **Allowed Logout URLs** (Dashboard) et utilise le **OIDC Logout endpoint** avec
  `id_token_hint` + `post_logout_redirect_uri`. citeturn15search624turn15search642

### 6.2 Front‑channel / Back‑channel (selon l’IdP)
- **Front‑channel** : fournis un endpoint **GET** qui purge la session (cookies) lorsque l’OP charge ton
  `frontchannel_logout_uri` (iframe). citeturn15search612
- **Back‑channel** : exposes un endpoint **POST** qui valide le **logout_token** et invalide la session
  sans interaction navigateur. citeturn15search618turn15search616

### 6.3 Revocation & Introspection
- Ajoute un client **confidentiel** pour appeler `revocation_endpoint` (RFC 7009) et `introspection_endpoint`
  (RFC 7662) ; vérifie la présence de ces endpoints en **discovery**. citeturn15search600turn15search594

---

## 7) Exercices
1. **RPLC** : implémente un bouton “Se déconnecter” qui appelle l’**end_session_endpoint** avec
   `id_token_hint` et redirige vers une **Allowed Logout URL**. citeturn15search623turn15search624turn15search642
2. **Front‑channel** : enregistre `frontchannel_logout_uri` et purge tes cookies/session lorsque
   l’OP charge l’iframe; teste blocages 3rd‑party. citeturn15search612
3. **Back‑channel** : crée un endpoint `/backchannel-logout` qui valide le `logout_token` et coupe la
   session ; journalise `iss/aud/sid`. citeturn15search618turn15search616
4. **Revocation** : appelle le `revocation_endpoint` pour un **refresh token** ; vérifie qu’un 200 est
   renvoyé même si le token était déjà invalide. citeturn15search600
5. **Introspection** : interroge `introspection_endpoint` pour un token **opaque** et applique la
   décision `active=false` côté API. citeturn15search594
6. **PAR/JAR/JARM** (bonus) : génère une requête **JAR** (`request` signé) et demande une réponse
   **JARM** (`response_mode=form_post.jwt`) ; observe les claims `iss/aud/exp`. citeturn15search629turn15search606

---

## 8) Références
- **Sessions & Logout** : RP‑Initiated Logout (OIDC), Auth0 OIDC Logout endpoint, Session management. citeturn15search623turn15search624turn15search626
- **Front‑Channel / Back‑Channel** : specs OIDC + guides (LDAPWiki, authentik). citeturn15search612turn15search618turn15search615turn15search616
- **Revocation** : RFC 7009, guides oauth.net/Curity, libs. citeturn15search600turn15search602turn15search603
- **Introspection** : RFC 7662, ressources. citeturn15search594turn15search598
- **Auth0** : Allowed Logout URLs & app settings. citeturn15search642turn15search645
- **PAR/JAR/JARM** : RFC 9126, RFC 9101, docs Auth0 (JAR), JARM (OIDF/WSO2/Connect2id). citeturn15search640turn15search635turn15search630turn15search629turn15search634turn15search606turn15search611turn15search608
