
# ⏳ Chapitre 4 — Event Loop & modèle non bloquant

> [!NOTE] Objectifs du chapitre
> - Comprendre **l’Event Loop** (phases : **timers**, **pending callbacks**, **idle/prepare**, **poll**, **check**, **close**). citeturn6search119  
> - Maîtriser la **priorité des files** : **`process.nextTick`**, **microtasks** (Promesses/`queueMicrotask`), **macrotasks** (timers/I/O). citeturn6search127turn6search114  
> - Saisir les différences **`setTimeout` vs `setImmediate`** et leurs **implications**. citeturn6search103  
> - Voir le rôle de **libuv** (polling, thread pool) et mesurer l’activité via **`perf_hooks`** (`performance.now`, **ELU**). citeturn6search140turn6search130  
> - Appliquer des **patterns** non bloquants et savoir **déporter** le CPU intensif avec **`worker_threads`** ou **cluster**. citeturn6search96turn6search90

---

## 4.1 🔍 Définition synthétique

**Event Loop (boucle d’événements)** : orchestrateur qui **exécute des callbacks** dans des **phases** successives, assurant du **I/O non bloquant** sur un thread JS unique. Phases principales : **timers**, **pending callbacks**, **idle/prepare**, **poll**, **check**, **close** (FIFO par phase). citeturn6search119  
**libuv** implémente l’Event Loop et **abstrait** les mécanismes bas niveau (`epoll`, `kqueue`, `IOCP`, event ports) + **thread pool** pour certaines opérations (fichiers, DNS…). citeturn6search140

> [!INFO]
> L’Event Loop traite chaque phase **jusqu’à vider sa file** (ou atteindre un quota), puis passe à la suivante. Certaines opérations replanifient des évènements **pendant** le `poll`, influençant le timing des timers. citeturn6search119

🧩 **Analogie (cuisine)** : Le **chef** (Event Loop) prend les commandes en **tournées** (phases). Les **commis** (libuv + OS) préparent les plats (I/O). Le chef déroule les commandes prêtes selon leur **file** et ne s’arrête jamais tant qu’il reste des plats à servir.

---

## 4.2 🧭 Les phases en détail

- **timers** : exécute les callbacks de **`setTimeout`/`setInterval`** dont le délai est arrivé (**pas** une garantie de millisecondes exactes). citeturn6search119  
- **pending callbacks** : I/O callbacks **différés** à l’itération suivante (ex : erreurs TCP). citeturn6search119  
- **idle / prepare** : **interne** à Node/libuv (préparation avant `poll`). citeturn6search119  
- **poll** : **récupère** de **nouveaux événements I/O** et exécute les callbacks liés ; peut **bloquer** si rien à faire (calcul du **timeout** en fonction des timers). citeturn6search119turn6search123  
- **check** : exécute les callbacks **`setImmediate`**. citeturn6search119  
- **close** : callbacks de fermeture (ex : `socket.on('close')`). citeturn6search119

> [!NOTE]
> Le **`poll`** peut dormir **jusqu’au prochain I/O** ou jusqu’au **prochain timer** : le timeout transmis au poll est **calculé** depuis l’échéance la plus proche des timers. citeturn6search123

---

## 4.3 🔐 Files de priorité : `nextTick`, **microtasks** et **macrotasks**

- **`process.nextTick`** : file **spéciale** traitée **avant** les microtasks et **à la fin** de l’opération courante (donc **avant** de repasser par les phases). Abus ⇒ **starvation** des autres files. citeturn6search127  
- **Microtasks** : gérées par **V8** (Promesses, `queueMicrotask`) ; épuisées **entièrement** avant d’enchaîner sur la prochaine tâche macro. citeturn6search114turn6search115  
- **Macrotasks** : timers/I/O (`setTimeout`, `setImmediate`) planifiées via les **phases** de l’Event Loop. citeturn6search103

**Ordre typique (CommonJS)** : `nextTick` → microtasks (Promesses/`queueMicrotask`) → macrotasks (`setImmediate`/timers). citeturn6search103

**Exemple d’ordonnancement**
```js
console.log('A');
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('B');
// A, B, nextTick, promise, (puis) immediate/timeout selon phases
```

> [!WARNING]
> En **ESM**, l’ordre peut **varier** (le module est chargé via une tâche asynchrone), ce qui influence l’exécution relative de `Promise.then`/`nextTick`. citeturn6search103

**`queueMicrotask` vs `process.nextTick`**
```js
queueMicrotask(() => console.log('microtask'));
process.nextTick(() => console.log('nextTick'));
// nextTick avant microtask (file Node vérifiée en premier) 
```
> [!INFO]
> `queueMicrotask` utilise la **file V8** et `nextTick` la **file Node** ; `nextTick` est **prioritaire** à chaque tour de boucle. citeturn6search85turn6search129

---

## 4.4 ⏱️ `setTimeout` vs `setImmediate`

- **`setTimeout(fn, 0)`** : callback à la phase **timers** (après expiration) ; l’exécution réelle dépend du temps passé dans les autres phases. citeturn6search119  
- **`setImmediate(fn)`** : callback à la phase **check** — **immédiatement après** la fin du `poll`. Pratique pour exécuter du code **après** I/O. citeturn6search103

**Démo**
```js
const fs = await import('node:fs/promises');
await fs.writeFile('x.txt', 'data');
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate')); // souvent avant timeout
```
> [!TIP]
> Pour post-traiter un I/O **juste après** `poll`, préférez **`setImmediate`**. Pour **temporiser**, utilisez `setTimeout`. citeturn6search103

---

## 4.5 🧫 Microtasks & Promises : bonnes pratiques

- Les callbacks **Promesses** passent par la **file microtasks** et sont **épuisés** avant la reprise de la boucle (risque d’**orage de microtasks** si vous enchaînez trop de `.then`). citeturn6search115  
- `queueMicrotask` fournit un contrôle **fin** pour planifier des actions **immédiates** post‑tâche sans impliquer de timers. citeturn6search114

**Détection simple d’un “orage” de microtasks**
```js
let safety = 0;
function spinMicrotasks() {
  queueMicrotask(() => {
    if (++safety > 1e4) throw new Error('Microtask storm');
    spinMicrotasks();
  });
}
spinMicrotasks();
```

---

## 4.6 🧱 libuv : poll & thread pool

libuv **sonde** les événements I/O via `epoll`/`kqueue`/`IOCP` selon la plateforme, calcule un **timeout** (prochain timer) et **réveille** la boucle quand un évènement est prêt. citeturn6search140  
Certaines opérations (FS, DNS, crypto) utilisent le **thread pool** de libuv — votre JS reste **libre**, les résultats reviennent en **callbacks**. citeturn6search140

> [!NOTE]
> La sémantique `uv_run` montre l’ordre : **timers → pending → idle → prepare → (poll) → pending → check → closing**. citeturn6search138

---

## 4.7 📏 Mesurer, diagnostiquer & optimiser

- **`perf_hooks.performance.now()`** : horloge haute résolution pour mesurer des segments. citeturn6search130  
- **ELU** (*Event Loop Utilization*) via `performance.eventLoopUtilization()` : ratio du temps **actif** de la boucle — utile pour **détecter** des blocages. citeturn6search134

**Exemple**
```js
import { performance } from 'node:perf_hooks';
const start = performance.now();
// … travail I/O / CPU …
console.log('ms =', performance.now() - start);

const { utilization } = performance.eventLoopUtilization();
console.log('ELU =', utilization.toFixed(3));
```

> [!TIP]
> Utilisez des **marques/mesures** avec `PerformanceObserver` pour instrumenter des blocs clés. citeturn6search130

---

## 4.8 ⚡ CPU intensif : quand sortir de l’Event Loop

- **`worker_threads`** : exécute du JS en **parallèle** (partage mémoire via `SharedArrayBuffer`/transfert `ArrayBuffer`) ; idéal pour **CPU‑bound**. citeturn6search96  
- **`cluster`** : **multi‑processus** partageant le même port (scaler multi‑cœurs avec isolation). citeturn6search90

**Exemple (schéma d’intention)**
```js
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
if (isMainThread) {
  new Worker(new URL('./heavy.js', import.meta.url), { workerData: 42 });
} else {
  // heavy.js
  // calcule intensivement sans bloquer le thread principal
  parentPort.postMessage(workerData ** 2);
}
```

> [!WARNING]
> Les Workers n’aident **pas** pour I/O — l’Event Loop + libuv sont déjà **optimisés** pour ces cas. citeturn6search96

---

## 4.9 🧮 Mini‑théories / “formules” en JavaScript

### 4.9.1 **Latence totale** avec I/O indépendantes
```js
const cpu = 3;               // ms (sérialisation, mapping)
const io = [80, 40, 100];    // ms (indépendantes)
const total = Math.max(...io) + cpu; // ≈ 103 ms
```

### 4.9.2 **Throughput** avec concurrence `k`
```js
function throughput(nReq, elapsedMs) {
  return nReq / (elapsedMs / 1000);
}
```

### 4.9.3 **Starvation guard** (priorité `nextTick`)
```js
let count = 0;
function safeNextTick(fn) {
  process.nextTick(() => {
    if (++count > 1000) throw new Error('Starvation: trop de nextTick');
    fn();
  });
}
```

### 4.9.4 **Échantillonnage ELU**
```js
import { performance } from 'node:perf_hooks';
const a = performance.eventLoopUtilization();
setTimeout(() => {
  const b = performance.eventLoopUtilization();
  const delta = {
    idle: b.idle - a.idle,
    active: b.active - a.active,
    utilization: (b.utilization - a.utilization),
  };
  console.log('ΔELU ~', delta);
}, 1000);
```

---

## 4.10 ⚠️ Pièges & bonnes pratiques

- **Évitez le bloquant** (boucles lourdes, `readFileSync`) : préférez I/O **asynchrones** ou **Workers**. citeturn6search96  
- **`process.nextTick`** : à utiliser **avec parcimonie** (risque de **starvation**). citeturn6search127  
- **Choisir `setImmediate`** pour post‑I/O ; `setTimeout` pour **temporiser**. citeturn6search103  
- **Mesurez** (ELU, `performance.now`) pour détecter des **hot paths** et vérifier vos optimisations. citeturn6search130

---

## 4.11 🧭 Questions de compréhension

1) Citer les **phases** de l’Event Loop et leur rôle. citeturn6search119  
2) Expliquer la **priorité** entre `nextTick`, microtasks et macrotasks. citeturn6search127turn6search114  
3) Quand préférer **`setImmediate`** à **`setTimeout(…, 0)`** ? citeturn6search103  
4) Que mesure **ELU** et comment l’utiliser ? citeturn6search134  
5) Pourquoi **`worker_threads`** n’aide pas les opérations **I/O** ? citeturn6search96

---

## 4.12 🧩 Check‑list de fin de chapitre

- [x] Je **comprends** les **phases** et le rôle de **libuv**.  
- [x] Je sais **prévoir l’ordre** `nextTick` → microtasks → macrotasks.  
- [x] Je distingue `setTimeout` de `setImmediate`.  
- [x] J’instrumente mon code avec **`perf_hooks`** et je surveille l’**ELU**.  
- [x] Je **déporte** les calculs lourds via **Workers** (ou **cluster** si nécessaire).

---

## 4.13 📘 Résumé des points essentiels

- L’Event Loop exécute des **phases** ordonnées (timers → pending → idle/prepare → **poll** → **check** → close). citeturn6search119  
- **Priorités** : `nextTick` > **microtasks** (Promesses/`queueMicrotask`) > **macrotasks** (`setImmediate`/timers). citeturn6search103  
- `setImmediate` vise l’après‑I/O ; `setTimeout` temporise via **timers**. citeturn6search103  
- **libuv** gère le **polling** des I/O et fournit un **thread pool** ; Node reste **non bloquant** sur I/O. citeturn6search140  
- **Mesure** : `performance.now` & **ELU** pour objectiver les blocages ; CPU → **`worker_threads`** ou **cluster**. citeturn6search130turn6search96turn6search90

---

### 📎 Téléchargement (Chapitre 4)
- **Fichier Obsidian** : `04-event-loop.md` (ce document).

