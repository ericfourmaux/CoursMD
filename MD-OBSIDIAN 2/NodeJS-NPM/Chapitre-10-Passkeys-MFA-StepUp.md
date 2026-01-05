
# Chapitre 10 — MFA, Passkeys (WebAuthn) & Step‑up (ACR/AMR)

> **Objectif** : renforcer l’authentification avec **MFA**, activer les **passkeys/WebAuthn** pour
> une UX **passwordless** résiliente au phishing, et mettre en place du **step‑up authentication**
> via **ACR/AMR** pour protéger les opérations sensibles.

---

## 1) Passkeys & WebAuthn — concepts clés
- **Passkeys** sont des identifiants FIDO® basés sur **WebAuthn**/**CTAP** (FIDO2), synchronisables
  entre appareils (multi‑device) et résistants au phishing par **clé publique** liée au domaine. citeturn14search547turn14search575
- WebAuthn **Level 2** (W3C) normalise l’API pour créer/utiliser des **PublicKeyCredentials** avec
  attestation, vérification d’utilisateur (UV) et options avancées. citeturn14search565
- Les **authenticators** peuvent être *platform* (Windows Hello, Touch ID, Face ID) ou *roaming*
  (clé USB/NFC/BLE) ; la **clé privée** ne quitte jamais l’appareil. citeturn14search566

### Pourquoi c’est plus sûr
- Pas de secret partagé — le serveur ne stocke que la **clé publique**. citeturn14search561
- **Lié au domaine** (origin binding) → anti‑phishing par design. citeturn14search561
- Peut fonctionner **passwordless** ou en **MFA** (facteur possession + UV). citeturn14search559turn14search562

---

## 2) Activer **Passkeys** dans Auth0 (Database connections)
1. Dans le **Dashboard Auth0** → **Authentication → Database → Passkeys** : activer et
   configurer l’expérience Universal Login (signup/login). citeturn14search571
2. Les flux supportés : **signup** (email + création passkey), **login** (autofill/select),
   **account reset** via Universal Login. citeturn14search571
3. Avec **MFA activé**, une étape supplémentaire peut être requise selon la politique/risk. citeturn14search571

> **WebAuthn en MFA** : Auth0 accepte **security keys** et **device biometrics** ; l’UV (PIN/biométrie)
> permet d’atteindre une authentification multi‑facteurs en **une seule étape**. citeturn14search564turn14search559

---

## 3) Intégrer côté **Express** (Regular Web App)
### 3.1 OIDC avec `express-openid-connect`
```js
// npm i express-openid-connect
import express from 'express';
import { auth } from 'express-openid-connect';

const app = express();
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  baseURL: 'http://localhost:3000',
  issuerBaseURL: 'https://<tenant>.us.auth0.com',
  clientID: '<CLIENT_ID>',
  secret: process.env.SESSION_SECRET
}));

app.get('/profile', (req, res) => {
  // L’ID Token contient souvent les *claims* ACR/AMR
  const user = req.oidc.user; // décodé par le SDK
  res.json({
    sub: user?.sub,
    acr: user?.acr,           // niveau d’assurance demandé/satisfait
    amr: user?.amr            // méthodes d’auth (ex: ["pwd","otp","fido"])
  });
});
```
> Le champ **`acr`** et le tableau **`amr`** suivent OIDC Core, avec valeurs AMR normalisées par **RFC 8176**. citeturn14search558turn14search554

### 3.2 Exiger un niveau d’assurance (**Step‑up**) via `acr_values`
```js
// Exemple: demander un niveau phishing-resistant (ex.: "phr") pour une opération sensible
app.get('/transfer', (req, res) => {
  // redirige vers /authorize avec acr_values et prompt selon le besoin
  const url = req.oidc?.issuer?.authorization_endpoint;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: '<CLIENT_ID>',
    redirect_uri: 'http://localhost:3000/callback',
    scope: 'openid profile email',
    acr_values: 'phr', // voir les valeurs supportées par l’OP
    prompt: 'login'    // force réauth si nécessaire
  });
  res.redirect(`${url}?${params}`);
});
```
> Le **step‑up** consiste à demander un **ACR** plus fort pour l’ID Token (via `acr_values`). Des profils
> définissent des **ACR** comme *phishing‑resistant* (et *hardware‑key‑phishing‑resistant*). citeturn14search553
> Un protocole **OAuth Step‑Up Challenge** permet au **Resource Server** de signaler au client
> qu’un auth plus fort ou plus récent est requis. citeturn14search578

---

## 4) WebAuthn côté navigateur (aperçu)
> Si tu veux du **DIY** (sans passer par Universal Login), des libs comme **SimpleWebAuthn** aident
> à générer les options (`navigator.credentials.create/get`) pour des **passkeys** discoverables
> (`residentKey`) avec **userVerification** requis/préféré. citeturn14search576

```ts
// Exemple serveur (TypeScript) : pousser des options de création avec passkeys
import { generateRegistrationOptions } from '@simplewebauthn/server';

const opts = await generateRegistrationOptions({
  rpName: 'Mini-projet', rpID: 'localhost',
  userID: 'u1', userName: 'eric@example.com',
  authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' }
});
// côté client: navigator.credentials.create({ publicKey: opts })
```

---

## 5) MFA — facteurs et politiques
- Facteurs **Auth0**: push (Guardian), SMS/voice **OTP**, TOTP apps, **WebAuthn** (security keys
  & device biometrics), email OTP, Duo. citeturn14search564
- **API MFA**: endpoints de challenge/verify (OTP/OOB/recovery). citeturn14search560
- **ASP.NET & Web**: docs illustrent Passkeys & MFA (utile pour patterns cross‑stack). citeturn14search574turn14search563

---

## 6) Bonnes pratiques
- **Toujours HTTPS** (WebAuthn nécessite contexte sécurisé) & CSP strict. citeturn14search561
- Vérifier et **journaliser `acr`/`amr`** sur les endpoints sensibles ; imposer `max_age` ou `prompt=login`
  pour réauthentifier si l’auth est trop ancienne. citeturn14search577
- Offrir **recovery** (device perdu) via **synced passkeys** + facteur de secours (TOTP/email) selon
  politique risque. citeturn14search575
- Pour entreprises: envisager **Enterprise Attestation** & gouvernance WebAuthn L2 si pertinent. citeturn14search567

---

## 7) Exercices
1. **Activer Passkeys** dans ton tenant Auth0 (Database connection) et tester signup/login (Universal Login). citeturn14search571
2. **MFA WebAuthn** : activer Device Biometrics & Security Keys ; vérifier qu’un login avec UV
   **n’exige pas** une étape MFA supplémentaire selon la politique. citeturn14search559
3. **Step‑up** : sur `/transfer`, rediriger avec `acr_values` (ex. `phr`) et contrôler que l’ID Token
   retourné contient `acr=phr` ; rejeter si absent. citeturn14search553
4. **AMR** : journaliser les méthodes dans `amr` (ex. `pwd`, `otp`, `fido`) et tracer les accès
   sensibles selon la méthode utilisée. citeturn14search554
5. (Optionnel) **DIY WebAuthn** : intégrer **SimpleWebAuthn** pour une route d’enrôlement passkey
   dans le mini‑projet ; exiger `residentKey` + `userVerification`. citeturn14search576

---

## 8) Références
- Auth0 Passkeys (Universal Login) ; WebAuthn en MFA ; facteurs MFA ; API MFA. citeturn14search571turn14search559turn14search564turn14search560
- WebAuthn L2 (W3C), intro/historique & concepts ; MDN WebAuthn. citeturn14search565turn14search570turn14search568turn14search561
- FIDO2 (CTAP/WebAuthn) & specs. citeturn14search547turn14search552
- ACR/AMR (OIDC, RFC 8176) & step‑up (RFC 9470, guides Okta). citeturn14search554turn14search553turn14search578turn14search577
- SimpleWebAuthn (passkeys). citeturn14search576
