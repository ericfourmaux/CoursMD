
# 📘 Chapitre 17 — Architecture Front à grande échelle : État global avancé, événements cross‑app, observabilité & SLO

> 🎯 **Objectifs du chapitre**
> - Structurer un **état global avancé** (domaines, normalisation, persistance, offline) et des **flux** robustes (CQRS/event‑sourcing – aperçu).
> - Implémenter des **événements cross‑app** (entre onglets/micro‑frontends) via **BroadcastChannel**, **postMessage**, **Service Worker**, **SharedWorker**.
> - Mettre en place l’**observabilité** côté front : logs structurés, **traces** (Trace Context), **Web Vitals**, erreurs et **source maps**.
> - Définir des **SLO/SLI/SLA**, des **budgets d’erreurs** et un **monitoring** avec alertes.
> - Renforcer la **résilience** (retry/backoff, circuit‑breaker, kill‑switch/feature flags) et la **sécurité** (CSP, Trusted Types, postMessage origin).
> - Industrialiser la **qualité** (tests contractuels & MSW, budgets de performance en CI).

---

## 🧠 1) État global avancé — Modèle & règles

### 🔍 Principes
- **Découper par domaines** (ex. `tasks`, `users`, `settings`) et **normaliser** les entités.
- **Actions**/commandes **pures** et **événements** tracés (journalisation des changements).
- **Persistance sélective** (storage) et **stratégies offline** (merges, LWW/CRDT – aperçu).

### 💡 Normalisation & sélecteurs (Pinia)
```ts
// stores/entities.ts
import { defineStore } from 'pinia';
export type Id = string;
export type User = { id: Id; name: string };
export type Task = { id: Id; title: string; assigneeId?: Id };

export const useEntities = defineStore('entities', {
  state: () => ({ users: {} as Record<Id, User>, tasks: {} as Record<Id, Task> }),
  getters: {
    getUser: (s) => (id: Id) => s.users[id],
    getTask: (s) => (id: Id) => s.tasks[id],
    tasksByAssignee: (s) => (uid: Id) => Object.values(s.tasks).filter(t => t.assigneeId === uid),
  },
  actions: {
    upsertUsers(xs: User[]) { for (const u of xs) this.users[u.id] = u; },
    upsertTasks(xs: Task[]) { for (const t of xs) this.tasks[t.id] = t; },
  }
});
```

### 💡 Journal d’événements (simplifié)
```ts
// services/event-log.ts
export type DomainEvent = { type: string; payload: unknown; ts: number };
const LOG_KEY = 'event-log';
export const eventLog = {
  append(e: DomainEvent){
    const xs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as DomainEvent[];
    xs.push(e); localStorage.setItem(LOG_KEY, JSON.stringify(xs));
  },
  read(){ return JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as DomainEvent[]; }
};
```

---

## 🧠 2) Événements **cross‑app** (onglets/MFE)

### 💡 BroadcastChannel — multi‑onglets
```ts
// cross/broadcast.ts
const bc = new BroadcastChannel('kanban-channel');
export function publish(type: string, detail: unknown){ bc.postMessage({ type, detail, ts: Date.now() }); }
export function subscribe(handler: (msg: any) => void){ bc.onmessage = (ev) => handler(ev.data); }
```

### 💡 postMessage — micro‑frontends/iframes
```ts
// host ↔ iframe
// host
const iframe = document.querySelector('iframe')!;
iframe.contentWindow?.postMessage({ type: 'refresh', ts: Date.now() }, 'https://remote.example');
// remote
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://host.example') return; // ✅ vérifier origin
  if (e.data?.type === 'refresh') { /* ... */ }
});
```

### 💡 Service Worker — diffusion aux clients
```ts
// sw.js (service worker)
self.addEventListener('message', async (ev) => {
  const clientsList = await self.clients.matchAll();
  for (const c of clientsList) c.postMessage({ type: 'invalidate-cache' });
});
// page
navigator.serviceWorker.controller?.postMessage({ type: 'broadcast', payload: {} });
```

### 💡 SharedWorker — bus partagé entre onglets
```ts
// shared-worker.js
onconnect = (e) => {
  const port = e.ports[0]; port.onmessage = (evt) => { /* route */ };
};
// page
const worker = new SharedWorker('/shared-worker.js');
worker.port.postMessage({ type: 'ping' });
```

---

## 🧠 3) Observabilité côté front

### 🔍 Piliers
- **Logs structurés** (JSON), niveaux (`info`, `warn`, `error`), **correlation id**.
- **Traces** (W3C Trace Context: `traceparent`) pour relier des actions utilisateur à des appels API.
- **Métriques**: **Web Vitals** (LCP/CLS/INP), tailles bundles, erreurs JS.

### 💡 Logger structuré + trace id
```ts
// obs/logger.ts
function tid(){ return (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2); }
export const logger = {
  info(msg: string, ctx: Record<string, unknown> = {}){ console.log(JSON.stringify({ level:'info', msg, ...ctx })); },
  error(msg: string, err?: unknown, ctx: Record<string, unknown> = {}){
    console.error(JSON.stringify({ level:'error', msg, err: String(err), ...ctx }));
  }
};
const TRACE_ID = tid(); // à propager dans fetch headers
```

### 💡 Propager `traceparent`
```ts
// obs/fetch.ts
export async function GET(url: string){
  const traceparent = `00-${TRACE_ID}-${Math.random().toString(16).slice(2)}-01`;
  return fetch(url, { headers: { traceparent } });
}
```

### 💡 Capturer Web Vitals
```ts
import { onLCP, onCLS, onINP } from 'web-vitals';
function send(name: string, value: number){ navigator.sendBeacon('/rum', JSON.stringify({ name, value, t: Date.now() })); }
onLCP((m)=>send('LCP', m.value));
onCLS((m)=>send('CLS', m.value));
onINP((m)=>send('INP', m.value));
```

### 💡 Erreurs & source maps
```ts
window.addEventListener('error', (e) => logger.error('onerror', e.error));
window.addEventListener('unhandledrejection', (e) => logger.error('unhandledrejection', e.reason));
// 📦 Publier les source maps en prod côté serveur pour décoder les stacks.
```

---

## 🧠 4) SLO/SLI/SLA & budget d’erreurs

### 🔍 Définitions
- **SLI**: indicateur (ex. `% de LCP ≤ 2.5s`, **availability** %, **error rate**).
- **SLO**: objectif sur l’SLI (ex. **99%** des LCP ≤ 2.5s sur mobile réel).
- **SLA**: engagement contractuel (optionnel côté produit).
- **Budget d’erreurs**: 1 − SLO (ex. SLO 99.9% ⇒ budget 0.1%).

### 💡 Formules JS
```js
// Disponibilité mensuelle
function availabilityPercent(downtimeMinutes, days=30){
  const total = days * 24 * 60; return Math.round(10000 * (1 - downtimeMinutes/total)) / 100; // %
}
// Budget d’erreurs brûlé (ex: rate observé vs autorisé)
function errorBudgetBurn(observedRate, slo){
  const budget = 1 - slo; return Math.round((observedRate / budget) * 100);
}
console.log('SLO 99.9% ⇒ budget', 1-0.999, '— burn', errorBudgetBurn(0.03, 0.97), '%');
```

### ✅ Alerte & triage
- Définir des **seuils** (ex. LCP médiane > 3s, INP p95 > 300ms).
- **Alerter** (webhook/Email/Teams) & lier à un **runbook**.

---

## 🧠 5) Résilience — retry/backoff, circuit‑breaker, kill‑switch

### 💡 Retry avec backoff + jitter
```ts
export async function retry<T>(fn: () => Promise<T>, max=5, base=200, factor=2){
  for(let i=0;i<max;i++){
    try{ return await fn(); }catch(e){
      const jitter = Math.random()*50; const ms = base * Math.pow(factor, i) + jitter;
      await new Promise(r=>setTimeout(r, ms));
    }
  }
  throw new Error('Échec après retries');
}
```

### 💡 Circuit breaker
```ts
// obs/circuit.ts
export function circuitBreaker(){
  let state: 'closed'|'open'|'half' = 'closed'; let fails=0; const threshold=3; const timeout=5000; let openedAt=0;
  async function exec<T>(fn: ()=>Promise<T>): Promise<T>{
    if(state==='open' && Date.now()-openedAt < timeout) throw new Error('Circuit open');
    if(state==='open' && Date.now()-openedAt >= timeout) state='half';
    try{ const res = await fn(); if(state==='half'){ state='closed'; fails=0; } return res; }
    catch(e){ fails++; if(fails>=threshold){ state='open'; openedAt=Date.now(); } throw e; }
  }
  return { exec, state: ()=>state };
}
```

### 💡 Kill‑switch / Feature flags
```ts
// flags.ts
export const flags = { NEW_SEARCH: false, FAST_PATH: true } as const;
if (flags.NEW_SEARCH) { /* activer nouvelle recherche */ }
```

---

## 🧠 6) Sécurité à grande échelle

### ✅ CSP, Trusted Types, postMessage origin
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self https://api.example.com';">
<script>
// Trusted Types (Chrome) — créer une policy pour éviter les injections
// window.trustedTypes?.createPolicy('default', { createHTML: (s) => s });
</script>
```
```ts
// postMessage — valider origin & shape
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted.remote') return;
  if (typeof e.data !== 'object' || !('type' in e.data)) return;
});
```

### ✅ Dépendances & secrets
- **Audit** régulier (`npm audit`), mises à jour.
- **Aucun secret** en front; utiliser **envs** build/CI (Chap. 13).

---

## 🧠 7) Tests à l’échelle — **contractuels** & **MSW**

### 💡 JSON Schema + Ajv (contrats API)
```ts
import Ajv from 'ajv';
const schema = { type:'object', required:['id','name'], properties:{ id:{type:'string'}, name:{type:'string'} } } as const;
const ajv = new Ajv(); const validate = ajv.compile(schema);
export function assertUser(x: unknown){ if(!validate(x)) throw new Error('Invalid User'); }
```

### 💡 Mock Service Worker (MSW)
```ts
// msw/handlers.ts
import { rest } from 'msw';
export const handlers = [
  rest.get('/api/users', (_req, res, ctx) => res(ctx.json([{ id:'u1', name:'Eric' }])) )
];
```

---

## 🧠 8) Budgets de performance & CI

### 💡 Vérifier la taille des bundles 
```js
// tools/bundlesize-check.js (exemple)
import fs from 'fs';
const budgetKB = 200;
const files = fs.readdirSync('./dist');
const totalKB = files.filter(f=>f.endsWith('.js')).map(f=>fs.statSync('./dist/'+f).size/1024).reduce((a,b)=>a+b,0);
if (totalKB > budgetKB){
  console.error(`❌ Budget dépassé: ${Math.round(totalKB)}KB > ${budgetKB}KB`);
  process.exit(1);
}
console.log(`✅ Budget OK: ${Math.round(totalKB)}KB ≤ ${budgetKB}KB`);
```

---

## 🧪 9) Exercices guidés

1. **BroadcastChannel**: synchronisez un champ de recherche entre deux onglets.
2. **postMessage**: envoyez un évènement `refresh` d’un host vers un remote, avec **origin** validé.
3. **Web Vitals**: envoyez LCP/CLS/INP vers `/rum` et tracez le p95 au dashboard.
4. **SLO**: définissez des SLO (LCP/INP, availability), calculez le **budget d’erreurs** et vos **seuils d’alerte**.
5. **Circuit breaker**: appliquez‑le autour d’un `fetch` instable; observez l’état `open/half/closed`.
6. **Contracts**: validez un `UserDTO` via Ajv; faites échouer un test si le contrat n’est pas respecté.
7. **CI budget**: ajoutez le script **bundlesize** et faites échouer le build au‑delà de 200KB.

---

## ✅ 10) Check‑list Architecture large échelle

- [ ] Stores par **domaines** et **entités** normalisées.
- [ ] Bus cross‑app (BroadcastChannel/postMessage/Worker) **sécurisé** (origin/shape).
- [ ] **Logs structurés**, `traceparent` propagé, Web Vitals collectés.
- [ ] **SLO/SLI** définis + **budgets d’erreurs** + alertes/runbook.
- [ ] **Retry/backoff**, **circuit‑breaker**, **flags/kill‑switch** en place.
- [ ] **CSP/Trusted Types**, audits deps, **secrets** côté build/CI.
- [ ] Tests **contractuels**, MSW, **budgets de perf** en CI.

---

## 📦 Livrable du chapitre
Un **squelette d’architecture front** prêt pour la production :
- **Stores** normalisés + journal d’événements.
- **Canaux** cross‑app sécurisés (BroadcastChannel/postMessage/Workers).
- **Observabilité** (logger, trace, Web Vitals, erreurs) + **SLO** documentés.
- **Résilience** (retry/backoff/circuit‑breaker/flags) + **CI budget**.

---

## 🔚 Résumé essentiel
- À grande échelle, **organisation** des données et **communication** entre parties (onglets/MFE) sont clés.
- L’**observabilité** côté front rend les incidents **visibles** et **corrélables**.
- Les **SLO/SLI** guident les **alertes** et les **budgets d’erreurs**; la **résilience** protège l’expérience.
- La **sécurité** (CSP, Trusted Types, validation d’origin) et la **qualité** (tests contractuels, budgets CI) soutiennent la **fiabilité**.

---

> Prochain chapitre: **Fin du parcours & plan d’évolution** — consolider ton portfolio, cibler les sujets à renforcer (algos, tooling, UX), et stratégie d’entretiens.
