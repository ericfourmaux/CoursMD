
# 📘 Chapitre 13 — Déploiement & Environnements

> 🎯 **Objectifs du chapitre**
> - Comprendre les **types d’environnements** (dev, test, staging, prod) et les **variables d’environnement** / **secrets**.
> - Mettre en place un **déploiement continu** d’une app Vue 3 (TS) vers **Netlify**, **Vercel** ou **GitHub Pages**.
> - Gérer **feature flags**, **prévisualisations** (preview), **cache/CDN**, **domaines & TLS**.
> - Appliquer des **stratégies de déploiement** (blue‑green, canary, rollback) et des **monitors** (RUM/Core Web Vitals, disponibilité).
> - Produire une **check‑list** de mise en prod et un **plan de rollback**.

---

## 🧠 1. Environnements & variables

### 🔍 Définition
- **Environnements**: espaces d’exécution distincts (ex. `DEV` → développement; `STAGING` → pré‑prod; `PROD` → production).
- **Variables d’environnement**: clés/valeurs injectées au **build** ou au **runtime** (ne pas committer de secrets!).

### ✅ Bonnes pratiques
- Séparer **config** du **code** (12‑factor). 
- Utiliser des **secrets** chiffrés côté plateforme (Netlify/Vercel/GitHub). 
- Préférer **envs par environnement** et **noms explicites** (`API_URL`, `FEATURE_X_ENABLED`).

### 💡 Exemple d’injection au build (Webpack DefinePlugin)
```ts
// webpack.prod.js
new DefinePlugin({
  __API_URL__: JSON.stringify(process.env.API_URL || 'https://api.example.com'),
  __FEATURE_KANBAN__: JSON.stringify(process.env.FEATURE_KANBAN === 'true')
});
```
```ts
// usage
declare const __API_URL__: string;
declare const __FEATURE_KANBAN__: boolean;
```

### 💡 Injection **runtime** (SPA)
```html
<!-- public/env.json, servi par CDN -->
{
  "API_URL": "https://api.example.com",
  "FEATURE_KANBAN": true
}
```
```ts
// charge au démarrage
async function loadRuntimeEnv(){
  const res = await fetch('/env.json');
  (window as any).__ENV__ = await res.json();
}
```

---

## 🧠 2. Plateformes de déploiement (Vue 3)

### 📦 Netlify (build‑and‑deploy)
- **Build command**: `npm run build`
- **Publish directory**: `dist/`
- **Env vars**: `Site settings > Build & deploy > Environment`
- **Redirects/Headers**: `_redirects` et `_headers` à la racine `dist`
```txt
# _redirects
/*  /index.html  200
```
```txt
# _headers
/*
  Cache-Control: public, max-age=31536000, immutable
```

### 📦 Vercel
- **Framework preset**: Vue
- **Build**: `npm run build`
- **Output**: `dist/`
- **Env vars**: `Project > Settings > Environment Variables`
- **Previews**: déploiements par **pull request** (URLs uniques)

### 📦 GitHub Pages
- **Action**: `peaceiris/actions-gh-pages` ou `crazy-max/ghaction-github-pages`
- **Branch**: `gh-pages`
- **Base**: SPA → redirection vers `index.html`

---

## 🧠 3. CI/CD — Workflows de déploiement

### 💡 GitHub Actions vers Netlify (deploy token)
```yaml
name: Deploy Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Deploy
        run: npx netlify deploy --prod --dir=dist --auth=${{ secrets.NETLIFY_AUTH_TOKEN }} --site ${{ secrets.NETLIFY_SITE_ID }}
```

### 💡 GitHub Actions vers Vercel
```yaml
name: Deploy Vercel
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Vercel Deploy
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 💡 GitHub Pages (SPA)
```yaml
name: Deploy GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20.x', cache: 'npm' }
      - run: npm ci && npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🧠 4. Stratégies de déploiement

### 🔵 Blue‑Green
- **Deux environnements** (Blue/Green) → on bascule le **trafic** vers Green après validation.
- **Rollback** rapide → re‑pointer vers Blue.

### 🟡 Canary
- Déployer à un **petit pourcentage** d’utilisateurs → observer → étendre.
- Utiliser **feature flags** pour gating.

### 🔁 Rollback
- **Automatique** si health checks KO; sinon manuel via re‑déploiement de la **release précédente**.

### 💡 Feature flags (client)
```ts
const flags = { NEW_DASHBOARD: (window as any).__ENV__?.FEATURE_NEW_DASHBOARD === true };
if (flags.NEW_DASHBOARD) {
  // activer nouveau code
} else {
  // ancien comportement
}
```

---

## 🧠 5. Cache, CDN & en‑têtes

### ✅ Bonnes pratiques
- Fichiers **hashés** (ex. `app.[contenthash].js`) + `Cache-Control: immutable`.
- **HTML** avec cache court (ex. `max-age=0, must-revalidate`).
- **Preload** des assets critiques.

### 💡 Exemple `_headers` (Netlify)
```txt
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src https://api.example.com
```

---

## 🧠 6. Domaines, DNS & TLS

### 🔍 Étapes
- Ajouter un **domaine** personnalisé (ex. `exemple.com`) sur la plateforme.
- Configurer **DNS** (CNAME/A/AAAA) vers Netlify/Vercel.
- Activer **certificat TLS** (Let’s Encrypt géré par la plateforme).
- Activer **HSTS** et redirection **HTTPS**.

---

## 🧠 7. Monitoring & Observabilité (Front)

### ✅ Indicateurs
- **Disponibilité** (uptime), **latences** (
TTFB, LCP, INP), **erreurs JS**.
- **RUM** (Real User Monitoring) pour métriques réelles.

### 💡 Web Vitals reporter (client)
```ts
import { onCLS, onLCP, onINP } from 'web-vitals';
function report(name: string, value: number){
  navigator.sendBeacon('/rum', JSON.stringify({ name, value, ts: Date.now() }));
}
onCLS((m)=>report('CLS', m.value));
onLCP((m)=>report('LCP', m.value));
onINP((m)=>report('INP', m.value));
```

### 🧮 JS — Estimer disponibilité mensuelle (SLO)
```js
// dispo (%) = 100 * (1 - downtime_minutes / total_minutes)
function availabilityPercent(downtimeMinutes, daysInMonth = 30){
  const total = daysInMonth * 24 * 60;
  return Math.round(100 * (1 - downtimeMinutes / total) * 100) / 100;
}
console.log('SLO 99.9% => max downtime ~', Math.round((1 - 0.999) * 30 * 24 * 60), 'min/mois');
```

---

## 🧠 8. Sécurité & secrets

### ✅ Bonnes pratiques
- **Ne jamais** committer des **secrets**.
- Utiliser des **tokens** à portée limitée (scopes minimaux).
- Activer **CSP**, **Subresource Integrity** (SRI) pour assets tiers.

### 💡 SRI
```html
<script src="https://cdn.example.com/lib.min.js"
  integrity="sha384-B6w..." crossorigin="anonymous"></script>
```

---

## 🧠 9. Plan de déploiement pas à pas (prod)

1. **Merge PR** (tests verts, coverage OK, audit Lighthouse acceptable).
2. **CI Build** (cache npm, artefacts créés, Webpack prod).
3. **Déploiement** (Netlify/Vercel/GH Pages) avec **envs** prod.
4. **Smoke tests** (routes clés, API en ligne, assets chargés).
5. **Monitoring actif** (RUM, logs d’erreur), **alertes** configurées.
6. **Post‑deploy**: créer **tag** de release, mettre à jour **CHANGELOG**, publier **notes**.

---

## 🧪 10. Exercices guidés

1. **Netlify/Vercel**: Configurez un déploiement depuis `main` + **preview** sur PR.
2. **Env vars**: Ajoutez `__API_URL__` et vérifiez son usage au runtime.
3. **Headers**: Ajoutez `_headers` (CSP/HSTS) et testez via DevTools.
4. **Flags**: Ajoutez `FEATURE_KANBAN` et conditionnez une section de l’UI.
5. **Monitoring**: Envoyez LCP/CLS/INP vers un endpoint `/rum` (mock) et affichez un **dashboard** simple.
6. **Rollback**: Simulez un déploiement KO et restaurez la release précédente.

---

## ✅ 11. Check‑list Déploiement

- [ ] CI passe (lint/build/tests/coverage).
- [ ] Env vars/secrets présents côté plateforme.
- [ ] Cache/CDN configurés (assets hashés, HTML no‑cache).
- [ ] Headers de sécurité (CSP/HSTS) appliqués.
- [ ] Monitoring (Web Vitals + erreurs) actif.
- [ ] Plan de rollback **documenté**.
- [ ] Release taggée + CHANGELOG mis à jour.

---

## 📦 Livrable du chapitre
Un **déploiement** automatisé (Netlify/Vercel/GitHub Pages) avec **envs** séparés, **feature flags**, **headers** de sécurité, **cache/CDN**, **monitoring** et **plan de rollback**.

---

## 🔚 Résumé essentiel du Chapitre 13
- Les **environnements** isolent configuration et secrets; injectez la config au **build** ou au **runtime**.
- Les plateformes **Netlify/Vercel/GitHub Pages** facilitent le **CI/CD** et les **previews**.
- Les stratégies **blue‑green/canary** réduisent le risque; **rollback** doit être instantané.
- Le **cache/CDN** + **headers de sécurité** améliorent performance et sécurité.
- Le **monitoring** (RUM + Web Vitals) et un **plan de déploiement** solide assurent une prod fiable.

---

> Prochain chapitre: **Electron (Desktop avec Tech Web)** — intégration Vue + TS dans Electron, packaging et sécurité.
