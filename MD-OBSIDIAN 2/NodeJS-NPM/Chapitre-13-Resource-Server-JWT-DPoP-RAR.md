
# Chapitre 13 — Resource Server : validation des tokens & enforcement (JWT Access Tokens, DPoP, Resource Indicators, RAR)

> **Objectif** : apprendre à construire un **Resource Server** robuste :
> — valider des **JWT Access Tokens** conformes **RFC 9068**,
> — vérifier **DPoP** (Proof‑of‑Possession) côté API,
> — exploiter **audience** / **resource indicators** (**RFC 8707**) et **RAR** (**RFC 9396**),
> — se protéger des **mix‑up attacks** avec **RFC 9207**, et appliquer les règles **Bearer** (**RFC 6750**).

---

## 1) JWT Access Tokens — profil **RFC 9068**
- Le RFC **9068** standardise un **profil JWT** pour les **access tokens**, avec en-tête `typ="at+jwt"` et des **claims requis** tels que `iss`, `sub`, `aud`, `exp`, `iat`, `jti`, et `client_id`. Il vise l’interopérabilité entre AS/RS sans introspection systématique. citeturn18search786turn18search790
- Plusieurs fournisseurs (ex. Auth0) proposent un **dialecte RFC 9068** avec différences par rapport au profile maison (ex. `client_id` vs `azp`, présence de `jti`). citeturn18search789
- **Conséquence** : côté API, on **vérifie** la signature (via **JWKS**), puis :
  `iss` (doit correspondre à l’AS), `aud` (doit pointer la ressource/API), `exp/iat` (horodatage), `jti` (rejeu), `client_id` (client émetteur), `scope`/`permissions`. citeturn18search786

---

## 2) Bearer vs Sender‑Constrained
- Par défaut, un **Bearer token** peut être utilisé par « quiconque le possède » ; il doit donc être protégé en stockage et transport (RFC **6750**). citeturn18search758turn18search763
- Pour contrer vol/rejeu, on peut **contraindre le détenteur** (sender‑constraining) :
  - **mTLS** (RFC **8705**) — couvert au chap. 12.
  - **DPoP** (RFC **9449**) — **preuve au niveau applicatif** avec un JWT « DPoP Proof » portant `htm`, `htu`, `jti`, `iat` (et `ath` quand un access token est envoyé), signature via la **clé privée** du client ; le token émis est **lié** au **thumbprint** (`jkt`) de la **clé publique**. citeturn18search752turn18search779

---

## 3) Audience & **Resource Indicators** (**RFC 8707**)
- Les **resource indicators** permettent au client d’indiquer explicitement l’**API ciblée** via le paramètre `resource` lors des demandes d’autorisation ou de token ; l’AS peut ainsi **mouler** le token (audience, chiffrement) pour **une** ressource spécifique. citeturn18search770
- Bonnes pratiques : **un token par ressource** (URI absolue), aud **strict**, erreurs telles que `invalid_target` si ressource inconnue. citeturn18search774

---

## 4) **RAR** — Rich Authorization Requests (**RFC 9396**)
- RAR ajoute `authorization_details` (JSON) pour exprimer des **autorisations fines** : `type`, `locations` (proche de `resource`), `actions`, `datatypes`, `identifier`, `privileges`… Utile pour paiements, partage de fichier, e‑santé, etc. citeturn18search764turn18search766
- Le RS peut exiger que l’AT contienne ces détails (JWT **9068**, token **introspection**, ou **JAR/JARM** vus au chap. 11), et **appliquer** ces contraintes à chaque requête. citeturn18search765

---

## 5) **Issuer Identification** (**RFC 9207**) — anti **mix‑up**
- L’AS **peut inclure** `iss` dans la **réponse d’autorisation** pour que le client identifie la source ; contre‑mesure aux **mix‑up attacks** quand plusieurs AS sont impliqués. Côté RS, **valider** `iss` du token contre le **issuer** attendu. citeturn18search792

---

## 6) Middleware Node/Express — validation **JWT AT (RFC 9068)**
```js
// middleware/jwtAccessToken.js
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwks = jwksClient({ jwksUri: process.env.JWKS_URI });
function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyJwtAccessToken(expectedIssuer, expectedAudience, opts = {}) {
  const { clockSkewSec = 60 } = opts;
  const seenJti = new Set(); // remplacer par un store persistant (Redis) pour rejets/rejeu

  return (req, res, next) => {
    const auth = req.headers['authorization'] || '';
    const m = auth.match(/^Bearer\s+(.*)$/i);
    if (!m) return res.status(401).json({ error: 'invalid_token' });
    const token = m[1];

    jwt.verify(token, getKey, {
      algorithms: ['RS256', 'ES256'],
      clockTolerance: clockSkewSec,
      issuer: expectedIssuer,
      audience: expectedAudience,
      complete: true
    }, (err, decodedFull) => {
      if (err) return res.status(401).json({ error: 'invalid_token', details: err.message });
      const { header, payload } = decodedFull;
      // RFC 9068: typ "at+jwt"
      if (header.typ !== 'at+jwt') return res.status(401).json({ error: 'invalid_token_type' });
      // jti anti-rejeu
      if (payload.jti && seenJti.has(payload.jti)) {
        return res.status(401).json({ error: 'token_replay_detected' });
      }
      if (payload.jti) seenJti.add(payload.jti);
      // scope/authorization_details: exposer aux handlers
      req.token = { claims: payload, header };
      next();
    });
  };
}
```
> Vérifie signature via **JWKS**, `iss`, `aud`, `exp/iat`, `typ=at+jwt`, `jti` (rejeu) — conformément au **profil RFC 9068** et aux usages **Bearer RFC 6750**. Adapter le store `seenJti` (Redis) en prod. citeturn18search786turn18search758

---

## 7) Middleware **DPoP** côté API (vérification de la preuve)
- **Principe** : pour chaque requête avec AT, le client ajoute `DPoP: <proof-JWT>` ; le RS vérifie :
  - signature par la **clé privée** correspondante,
  - `htm` & `htu` (méthode/URL) **correspondent** à la requête,
  - `iat` dans la **fenêtre** (skew), `jti` **non réutilisé**,
  - et si AT présent, `ath` = hash base64url‑SHA256 du token.
  - La **liaison** (binding) : le token possède une confirmation (`cnf.jkt`) égale au thumbprint du **JWK public** utilisé par le client. citeturn18search752turn18search756

### Exemple (avec **oauth4webapi**) — vérification DPoP
```js
// middleware/dpop.js
import * as oauth from 'oauth4webapi';

// cache des jti vus (à remplacer par store persistant)
const seenProofJti = new Set();

export function verifyDpop(asMeta, clientMeta, opts = {}) {
  const { iatMaxAgeSec = 300, leewaySec = 30 } = opts;
  return async (req, res, next) => {
    const dpopProof = req.headers['dpop'];
    if (!dpopProof) return res.status(401).json({ error: 'missing_dpop_proof' });

    try {
      // oauth4webapi n’expose pas une API unique « validateDpopProof » côté RS,
      // mais fournit utilitaires/structures pour gérer DPoP (nonces, handle). On illustre ici la logique :
      const { protectedHeader, payload } = oauth.decodeJwt(dpopProof); // pseudo: à implémenter
      // Vérifier signature avec JWK dans header (jwk) → via WebCrypto, alg ES256/RS256
      // Vérifier htm/htu
      if (payload.htm.toUpperCase() !== req.method.toUpperCase()) {
        return res.status(401).json({ error: 'invalid_dpop_htm' });
      }
      const reqUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
      if (payload.htu !== reqUrl.toString()) {
        return res.status(401).json({ error: 'invalid_dpop_htu' });
      }
      // iat fenêtre
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - payload.iat) > iatMaxAgeSec + leewaySec) {
        return res.status(401).json({ error: 'invalid_dpop_iat' });
      }
      // jti unique
      if (seenProofJti.has(payload.jti)) {
        return res.status(401).json({ error: 'dpop_replay_detected' });
      }
      seenProofJti.add(payload.jti);
      // ath (si Authorization: Bearer ...)
      const auth = req.headers['authorization'] || '';
      const m = auth.match(/^Bearer\s+(.*)$/i);
      if (m) {
        const token = m[1];
        const ath = await oauth.calculateTokenHash(token); // pseudo util
        if (payload.ath !== ath) {
          return res.status(401).json({ error: 'invalid_dpop_ath' });
        }
      }
      // Binding: comparer cnf.jkt du token aux jwk du proof
      // (suppose que req.token.claims est défini par middleware JWT précédent)
      const jkt = req.token?.claims?.cnf?.jkt;
      if (jkt && jkt !== oauth.calculateJwkThumbprint(protectedHeader.jwk)) {
        return res.status(401).json({ error: 'dpop_binding_mismatch' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'invalid_dpop_proof', details: e.message });
    }
  };
}
```
> La logique de vérification DPoP suit **RFC 9449** : `htm/htu`, `iat`, `jti`, `ath`, **binding** via `cnf.jkt`. Les SDKs (ex. **oauth4webapi**) gèrent aussi **nonce** côté AS/RS. citeturn18search752turn18search776turn18search777
> Des guides éditeurs (Auth0/Okta) détaillent la mise en œuvre et les modes **Required/Allowed** côté RS. citeturn18search742turn18search746

---

## 8) Enforcement des **scopes** & `authorization_details`
```js
// middleware/authorize.js
export function requireScopes(...required) {
  return (req, res, next) => {
    const scopes = (req.token?.claims?.scope || '').split(' ').filter(Boolean);
    const ok = required.every(s => scopes.includes(s));
    if (!ok) return res.status(403).json({ error: 'insufficient_scope' });
    next();
  };
}

export function requireAuthorizationDetail(type, predicate) {
  return (req, res, next) => {
    const details = req.token?.claims?.authorization_details || [];
    const match = details.find(d => d.type === type && (!predicate || predicate(d)));
    if (!match) return res.status(403).json({ error: 'insufficient_authorization_details' });
    next();
  };
}
```
> Exemple de contrôle **RBAC/ABAC** : `scope` (RFC 6750) et `authorization_details` (RFC 9396) au niveau des routes. citeturn18search758turn18search764

---

## 9) Exercices
1. **JWT AT (9068)** : active le dialecte **RFC 9068** côté AS, puis mets en place `verifyJwtAccessToken()` avec validation `typ=at+jwt`, `iss/aud`, `jti` (anti‑rejeu). citeturn18search786turn18search789
2. **DPoP** : exige `DPoP` sur une route sensible (`/payments`). Implémente la vérif `htm/htu/iat/jti/ath` et la **liaison** `cnf.jkt`. Teste avec un client qui génère les proofs. citeturn18search752
3. **Resource Indicators** : demande des tokens avec `resource=https://api.example.com/orders` et vérifie que `aud` cible correctement l’API ; refuse `invalid_target` pour une ressource non enregistrée. citeturn18search770turn18search774
4. **RAR** : définis un type `payment_initiation` avec `actions=['transfer']`, `identifier='acc-123'`, et **applique** ces contraintes côté RS via `requireAuthorizationDetail`. citeturn18search764turn18search769
5. **Anti mix‑up** : assure que tes clients valident l’`iss` renvoyé par l’AS et que le RS contrôle `iss` du token contre son **issuer** attendu. citeturn18search792

---

## 10) Références
- **JWT Access Tokens** : **RFC 9068**, vue d’ensemble oauth.net. citeturn18search786turn18search790
- **DPoP** : **RFC 9449**, guides & playground. citeturn18search752turn18search755
- **Resource Indicators** : **RFC 8707** & guides. citeturn18search770turn18search771
- **RAR** : **RFC 9396** & notes d’implémentation. citeturn18search764turn18search767
- **Issuer Identification** : **RFC 9207**. citeturn18search792
- **Bearer** : **RFC 6750**. citeturn18search758
- **SDKs/Libs** : **oauth4webapi** (DPoP) docs. citeturn18search776
