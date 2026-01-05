
# Chapitre 21 — **Observabilité & Audit OAuth/OIDC** : traces, logs, métriques & détection

> **Objectif** : mettre en place une **observabilité de bout en bout** de tes flux OAuth/OIDC (clients, AS, gateway, APIs) : **traces distribuées** (W3C Trace Context + OpenTelemetry), **logs structurés** et **métriques**, intégration **SIEM** (Auth0/Okta/Entra), et **détection** des abus (ex. **MITRE ATT&CK T1528 — Steal Application Access Token**).  
> Bénéfices : raccourcir le MTTR, durcir la sécurité et augmenter l’auditabilité sans fuite de données sensibles.

---

## 1) Les **trois piliers** d’observabilité appliqués à OAuth/OIDC
- **Traces** : suivre une requête **de bout en bout** (client → AS → gateway → API) pour diagnostiquer latence, erreurs et propagation de contexte. OpenTelemetry (OTel) standardise instrumentation et export. 
- **Métriques** : taux d’erreur sur `/authorize`/`/token`, latence de validation JWT, taux d’introspection, réussite MFA, etc. 
- **Logs** : événements **structurés** (auth réussie/échouée, consent, rotation des refresh tokens, limites de taux, erreurs) corrélés aux traces et métriques.

---

## 2) Propagation de **trace context** (W3C)
- Utilise les en‑têtes **`traceparent`** (version, trace‑id, parent‑id, flags) et **`tracestate`** (données vendor) pour corréler les appels **HTTP** à travers services.  
- Recommandé par les clouds (ex. Google Cloud Trace) : privilégier `traceparent` et gérer compatibilité historique si nécessaire.

---

## 3) **OpenTelemetry** en Node/Express (API & gateway)
- **Auto‑instrumentation** Node via `@opentelemetry/sdk-node` + `@opentelemetry/auto-instrumentations-node` (HTTP/Express).  
- Guides pratiques (Uptrace, SigNoz) pour exporter traces/métriques/ logs vers backends (OTLP).

**Snippet (initialisation OTel — Node/TS)** :
```ts
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT, // https://otel-backend/v1/traces
    headers: { 'api-key': process.env.OTEL_API_KEY }
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});
sdk.start();
// Lancer l'app avec: NODE_OPTIONS="--require ./tracing.js" node app.js
```

---

## 4) **Logging sans fuite** — tokens & PII
- **Ne jamais** logger **les tokens** (access/refresh/id) ou secrets ; logge uniquement des **identifiants sûrs** : `iss`, `aud`, `client_id`, `sub` et **`jti`** (ID unique du JWT) quand pertinent.  
- Respecter les BCP **JWT** (choix d’algorithmes, validation stricte de l’algo, signature, expiration, chiffrement si nécessaire).  
- **RFC 9068** : les AT JWT incluent **`jti`**, utile pour corrélation, détection de rejouage et révocation (côté serveur si tu maintiens un registre/blacklist).

**Exemple (middleware Express — logs structurés, sans fuite)** :
```ts
import pino from 'pino';
import { jwtVerify, createRemoteJWKSet } from 'jose';
const logger = pino({ level: 'info' });

export function auditAuth() {
  const jwks = createRemoteJWKSet(new URL(process.env.JWKS_URI!));
  return async (req, res, next) => {
    const tp = req.headers['traceparent'] as string | undefined; // W3C
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    try {
      // Ne JAMAIS logger le token brut
      const { payload, protectedHeader } = await jwtVerify(token, jwks, {
        issuer: process.env.ISSUER,
        audience: process.env.AUDIENCE,
        typ: 'at+jwt',
      });
      // Log minimal : pas de PII, pas de token
      logger.info({
        event: 'oauth.access_token.validated',
        traceparent: tp,
        iss: payload.iss, aud: payload.aud, sub: payload.sub,
        client_id: payload.client_id, jti: payload.jti,
        alg: protectedHeader.alg
      });
      next();
    } catch (e) {
      logger.warn({ event: 'oauth.access_token.invalid', traceparent: tp, error: String(e) });
      res.status(401).send('invalid_token');
    }
  };
}
```

---

## 5) **Auth0** — logs & streaming vers SIEM
- Auth0 fournit des **tenant logs** (auth, API, admin), codes d’événements détaillés, filtrables et exportables.  
- **CLI** : `auth0 logs list --filter "type:f"` ; support JSON/CSV et **Log Streams** vers Splunk/Datadog.  
- Les logs capturent **stages/prompt** (login, consent, MFA…) pour l’analyse d’expérience et la traçabilité sécurité.

---

## 6) **Okta** — System Log (API & console)
- **System Log API** : JSON temps quasi‑réel pour auth, MFA, tokens API, administratifs ; requêtes **expression filters** (acteur, cible, eventType).  
- Cheatsheets de requêtes pour **sign‑in**, **MFA**, IP, session… (UI **Reports > System Log**).  
- Note : l’activité des **API tokens** visible surtout sur appels **PUT/POST/DELETE** (pas les GET).

---

## 7) **Microsoft Entra ID** (Azure AD) — Audit & Sign‑in
- **Audit logs** : changements sur apps, groupes, utilisateurs ; détails avec **Correlation ID**, acteurs/cibles ; **IP** reflète l’IP du **client OAuth**.  
- **Catalogue d’activités** pour filtrer par catégories (ex. ApplicationManagement, Policy…).  
- **Consents** : audit des **grants** à des applications (Entra / Purview) avec rétention 30–180 jours (selon portail/licence).  
- **Erreurs AADSTS** : diagnostics avec trace/correlation IDs dans les réponses OAuth.

---

## 8) **Détection** de vol/abus de tokens (MITRE ATT&CK **T1528**)
- **T1528** : vol de **application access tokens** (OAuth/JWT, API keys, IMDS, CI/CD). Mets en place : **rotation**, **sender‑constrained tokens** (DPoP/mTLS), surveillance des **apps OAuth** (consent phishing).  
- **Signals** utiles (Entra Sign‑in / SIEM) : anomalie de `clientAppUsed`, `authenticationProtocol`, ressources/aud inhabituelles, scopes anormaux.

---

## 9) **API Security (OWASP 2023)** & logs
- La liste OWASP **API Top 10 (2023)** replace « Insufficient Logging & Monitoring » par **API10: Unsafe Consumption of APIs**, mais **l’audit** reste critique pour **BOLA/BOPLA**, misconfig, SSRF, etc.  
- En pratique : journaliser **qui** a accédé **à quel objet** et **par quel client**, corrélés aux scopes/rôles pour prouver l’autorisation.

---

## 10) **Zero Trust** pour API/gateway (NIST SP 800‑207)
- **ZTA** : pas de confiance implicite ; **PE/PA/PEP** (Policy Engine/Administrator/Enforcement Point) appliquent politiques dynamiques basées sur **télémetrie** et **identité** ; chaque requête est vérifiée.  
- Applique‑le à ton **API gateway** (Phantom Token + mTLS/DPoP + OPA) pour **auditer** décisions et retraçage des accès.

---

## 11) **Playbook** observabilité OAuth/OIDC (pas à pas)
1. **Activer OTel** sur **gateway & APIs** (HTTP/Express), exporter vers OTLP (Backends : Grafana Tempo/SigNoz/Uptrace/Datadog).  
2. **Propager `traceparent`** partout (client → AS → gateway → API).  
3. **Logger sans fuite** : pas de tokens bruts ; seulement `iss`, `aud`, `client_id`, `sub`, `jti`, codes d’événements, `traceparent`.  
4. **Brancher SIEM** (Auth0 Log Streams / Okta System Log API / Entra Audit & Sign‑in).  
5. **Détections** : tokens hors contexte, consent applicatif soudain, clients inconnus ; T1528 → audit apps OAuth et **révocation** `jti`.  
6. **Dashboards** : taux d’erreur `/authorize`/`/token`, latence de validation JWT, tentatives invalides, MFA, consent, rotation RT.

---

## 12) **Exercices**
1. **Traces** : instrumente `@opentelemetry/*` sur ton mini‑projet Express et vérifie la présence de `traceparent` dans les appels API.  
2. **Logs** : ajoute le middleware **auditAuth** (ci‑dessus) et démontre des journaux sans fuite, corrélés par `traceparent`.  
3. **SIEM** : exporte **Auth0 logs** (CLI ou Log Streams) puis crée une règle “exchanges échoués”.  
4. **Entra/Okta** : exécute une requête pour **consents** et **sign‑ins** suspects (pays, appareils, clients) et documente les actions.

---

## 13) Références
- **OpenTelemetry/Node & Express** : docs et guides.
- **W3C Trace Context (`traceparent`, `tracestate`)** : standard & format.
- **Auth0** logs & streaming, codes d’événements, prompts.
- **Okta** System Log & queries.
- **Microsoft Entra** audit/sign‑ins & consents.
- **MITRE ATT&CK T1528** & détections.
- **JWT BCP** & bonnes pratiques de logging.
- **OWASP API Security 2023**.
- **NIST SP 800‑207 (Zero Trust)**.
