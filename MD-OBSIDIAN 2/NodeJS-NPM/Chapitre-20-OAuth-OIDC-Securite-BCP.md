
# Chapitre 20 — **Sécurité avancée OAuth/OIDC** : BCP (RFC 9700), menaces & contre‑mesures

> **Objectif** : consolider tes déploiements OAuth/OIDC avec les **Bonnes Pratiques Courantes**
> (BCP) publiées début **2025** (RFC 9700), et maîtriser les attaques récentes (mix‑up,
> code/ID token injection, token theft, CSRF) ainsi que les contre‑mesures **PKCE**, **nonce/state**,
> **exact matching des redirect URIs**, **rotations de refresh tokens**, et **patterns BFF**.

---

## 1) Panorama des **BCP** (RFC 9700)
Le RFC **9700** (janvier 2025) regroupe les recommandations de sécurité pour OAuth 2.0 et **met à jour** 6749/6750/6819 ; il **déprécie** des modes moins sûrs (p. ex. **implicit grant**) et renforce les exigences sur les **redirections**, **rejouage de tokens** et **restriction de privilèges**. citeturn25search1174turn25search1213

Principaux points :
- **Toujours** utiliser **Authorization Code + PKCE** (tous clients, y compris SPA/mobile). citeturn25search1174
- **Interdire l’Implicit** (`response_type=token`) et l’usage de **bearer token dans l’URL**. citeturn25search1174
- **Exact matching** (comparaison **octet‑à‑octet**) des **redirect URIs** ; pas de wildcards. citeturn25search1174
- **Limiter privilèges** (audience/scopes), tokens **court‑vécus**, et **sender‑constrained** quand possible (mTLS ou DPoP). citeturn25search1174

> Ces recommandations sont reprises et vulgarisées dans des guides récents destinés aux devs. citeturn25search1176turn25search1175

---

## 2) **PKCE** (RFC 7636) — anti interception & injection
**PKCE** ajoute `code_challenge`/`code_verifier` pour lier la demande d’auth à l’échange de code. 
Empêche l’**interception** du code et l’**injection** d’un code volé, notamment pour **SPA/native**. citeturn25search1188

> PKCE est **recommandé pour tous les clients** (même confidentiels), et explicité dans les docs de fournisseurs. citeturn25search1191turn25search1192

**Exemple TS (génération `S256`)** :
```ts
// Générer code_verifier & code_challenge (S256)
const code_verifier = base64url(randomBytes(64));
const code_challenge = base64url(sha256(code_verifier));
// Envoyer code_challenge=S256 à /authorize, puis code_verifier à /token
```
> Paramètres et longueurs exactes sont détaillés dans le RFC et les guides techniques. citeturn25search1188turn25search1190

---

## 3) **Nonce & State** — Replay & **CSRF**
- **`state`** : valeur opaqu e anti‑**CSRF** pour corréler requête/retour ; à **stocker côté client** et valider **à l’octet** au callback. citeturn25search1206turn25search1208
- **`nonce`** (OIDC) : anti‑**rejouage d’ID token** et **injection** ; utile surtout en OIDC et avec implicit, remplacé côté OAuth par **PKCE** pour les **public clients**. citeturn25search1163turn25search1162
- **CSRF** général : tokens anti‑CSRF, `SameSite`, Fetch Metadata, et pas d’actions critiques via **GET**. citeturn25search1211

**Snippet (validation `state`)** :
```ts
// À l’init
const state = base64url(randomBytes(32));
session.set('oauth_state', state);
redirectToAS(`/authorize?...&state=${encodeURIComponent(state)}`);

// Au callback
const returned = urlParams.get('state');
if (returned !== session.get('oauth_state')) throw new Error('invalid_state');
```
> Les SDK sérieux gèrent automatiquement **state/nonce**, mais vérifie leurs options. citeturn25search1206

---

## 4) **Redirect URI** : exact matching & pièges modernes
- **Exiger** une **correspondance exacte** (pas de préfixes, pas de wildcards). citeturn25search1171
- Éviter confusions **path/params** et pollution des paramètres (attaques observées en 2023). citeturn25search1169
- Suivre les restrictions propres aux plateformes (ex. Microsoft Entra). citeturn25search1170

---

## 5) **Token theft** & **rejouage** — défenses modernes
La **réutilisation de tokens** (accès/refresh) est aujourd’hui une tactique courante pour **bypasser MFA** et obtenir un accès **furtif**. citeturn25search1194

Contre‑mesures :
- **Sender‑constraining** (DPoP/mTLS) pour rendre un token **inutilisable** hors de son contexte. citeturn25search1174
- **Refresh Token Rotation** + **détection de réutilisation** ; privilégier rotation pour **SPAs** et mobiles. citeturn25search1181turn25search1178
- **Tokens courts** + **downscoping** (audience/scopes précis). citeturn25search1174
- **Surveillance** : logs d’accès, détection d’**applications OAuth malveillantes** (consent phishing, device code abuse), alignée avec **MITRE ATT&CK T1528**. citeturn25search1198turn25search1196

> Les incidents SaaS récents montrent l’impact d’un **seul token** oublié ou non roté. citeturn25search1195

---

## 6) **Browser‑Based & Native Apps** — patterns recommandés
- **SPA/Browse r** : suivre le BCP “**Browser‑Based Apps**” (en cours de finalisation) ; préférer **Code+PKCE**, éviter impl icit, et architectures **BFF** pour isoler tokens côté serveur. citeturn25search1184turn25search1186
- **Native Apps (RFC 8252)** : utiliser **system browser** (pas WebView), boucles **loopback/https claimed**, et **PKCE**. citeturn25search1200turn25search1201

**Diagramme BFF (Mermaid)** :
```mermaid
flowchart LR
  Browser[SPA] -->|Session cookie (HttpOnly)| BFF[Backend For Frontend]
  BFF -->|Code+PKCE| AS[Authorization Server]
  BFF --> API[Resource Server]
  subgraph Security
  BFF:::secure -->|Stores tokens server‑side| Vault[(Secrets)]
  classDef secure fill:#DDE,stroke:#333,stroke-width:1px;
```
> Le draft BCP détaille menaces JavaScript et compare **BFF** vs autres patterns. citeturn25search1186

---

## 7) **Mix‑Up**, **Referer/History leakage**, autres attaques
- **Mix‑Up** : protéger via **issuer identification** et **redirect URIs distincts** ; le BCP fournit contre‑mesures mises à jour. citeturn25search1213turn25search1215
- **Recherche académique** : analyses formelles et attaques (state leak, 307 redirect, IdP mix‑up). citeturn25search1217
- **Leackage Referer/History** : éviter tokens/ codes dans l’URL, utiliser `response_mode=form_post`, headers et hygiene côté AS/client. citeturn25search1213
- **Attaques cross‑app** sur plateformes d’intégration (COAT/CORF) : inscrire **app differentiation**, durcir l’account linking. citeturn25search1214turn25search1216

---

## 8) Checklist **production‑ready**
1. **Code+PKCE obligatoire**, y compris **SPA/native**. citeturn25search1174
2. **Redirect URIs** : exact match, pas de wildcard ; contrôler path/params. citeturn25search1174turn25search1169
3. **state**/`nonce` gérés, validés ; **CSRF** défenses activées. citeturn25search1206turn25search1211
4. **Tokens courts**, **audience/scopes** minimaux ; **downscoping** systématique. citeturn25search1174
5. **Sender‑constrained** (DPoP/mTLS) pour APIs sensibles. citeturn25search1174
6. **Refresh Token Rotation** + **re‑use detection** ; adapter lifetimes. citeturn25search1181turn25search1178
7. **BFF** côté SPA si possible ; **server‑side token storage**. citeturn25search1186
8. **Monitoring** des consentements/applications OAuth ; alertes sur permissions excessives. citeturn25search1198turn25search1196

---

## 9) Exercices
1. **PKCE end‑to‑end** : fais un flow Code+PKCE côté client et vérifie l’échange `/token` avec `code_verifier`. citeturn25search1188
2. **CSRF** : implémente la génération/stockage/validation `state` et teste un callback injecté (doit être refusé). citeturn25search1206
3. **Rotation RT** : configure la **Refresh Token Rotation** (re‑use detection), mesure l’impact sur UX et logs. citeturn25search1181turn25search1178
4. **BFF** : isole tokens côté serveur et compare aux appels direct API depuis SPA (latence, sécurité).

---

## 10) Références
- **RFC 9700** (BCP) : menaces, contre‑mesures, dépréciations (implicit, etc.). citeturn25search1174turn25search1213
- **PKCE** (RFC 7636) : mécanisme S256/`plain`, paramètres et menaces visées. citeturn25search1188turn25search1190
- **Native Apps** (RFC 8252) : usage system browser, loopback/https claimed. citeturn25search1200
- **Browser‑Based Apps** (draft BCP) : patterns & menaces JavaScript. citeturn25search1184turn25search1186
- **CSRF & state/nonce** : docs pratiques et cheat sheets. citeturn25search1206turn25search1211
- **Token theft & ATT&CK** : guides opérationnels & techniques. citeturn25search1194turn25search1198
- **Redirect URI** : études récentes et bonnes pratiques éditeurs. citeturn25search1169turn25search1170
