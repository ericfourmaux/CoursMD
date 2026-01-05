
# 📗 Chapitre 1 — Qu’est-ce que Node.js ?

> [!NOTE] Objectifs du chapitre
> - Donner une **définition précise** de Node.js (runtime JavaScript côté serveur).
> - Expliquer **pourquoi** Node.js (modèle non bloquant, événementiel, écosystème npm).
> - Comprendre l’**architecture** (V8, libuv, bindings C++, Event Loop) et le **modèle de concurrence**.
> - Distinguer **Node** du **navigateur** (APIs, sécurité, cas d’usage).
> - Mettre en pratique via **exemples concrets** et petites **formules/théories en JavaScript**.

---

## 🔍 Définition rigoureuse

**Node.js** est un **runtime d’exécution JavaScript** basé sur le moteur **V8** (le même que Chrome) qui permet d’exécuter du code JS **hors du navigateur**, principalement pour des applications côté serveur, des outils CLI et des scripts d’automatisation.

- **Runtime** : environnement qui fournit un moteur JS (V8) + des APIs **spécifiques à Node** (fichiers, réseau, processus).
- **Modèle non bloquant** : les opérations d’Entrée/Sortie (I/O) sont **asynchrones** et gérées via un **Event Loop**.
- **Événementiel** : Node **programme des callbacks** (ou `async/await`) déclenchés lorsque les I/O sont prêtes.

> [!INFO] Composants majeurs
> - **V8** : compile et exécute le JavaScript (JIT compilation).
> - **libuv** : bibliothèque C qui fournit la boucle d’événements, un **thread pool** pour certaines tâches I/O et des primitives système multi-plateformes.
> - **Bindings C++** : pont entre Node et V8/libuv.
> - **APIs Node** : modules comme `fs`, `http`, `path`, `process`, etc.

🧩 **Analogie** : Node est un **chef d’orchestre**. Il ne joue pas tous les instruments lui-même (les I/O système le font), mais **coordonne** les musiciens (callbacks) pour que la musique (votre application) reste fluide.

---

## 🧠 Le **pourquoi** : motivations et cas d’usage

- **Unifier** : même langage (JS) côté **front** et **back**.
- **Performance I/O** : idéal pour serveurs à **fort trafic** et **nombreuses connexions** (chat, API temps réel, proxies, microservices) grâce au **non-blocking I/O**.
- **Simplicité de déploiement** : un binaire Node, des scripts npm.
- **Écosystème npm** : accès à **des centaines de milliers de packages**.

> [!TIP] Règle d’or
> Node excelle lorsqu’il y a **beaucoup d’attente I/O** (réseau, disque). Pour des tâches **CPU intensives**, envisagez `worker_threads`, un service séparé ou un langage/outil dédié.

---

## 🆚 Node vs Navigateur : différences essentielles

- **APIs disponibles**
  - Navigateur : `document`, `window`, `fetch`, DOM, Web APIs.
  - Node : **pas de DOM**, mais `fs`, `http`, `process`, `Buffer`, `stream`, etc.
- **Sécurité**
  - Navigateur : sandboxé, accès disque interdit.
  - Node : accès au système de fichiers, processus, réseau — **responsabilité du développeur**.
- **Module system**
  - Navigateur (moderne) : ES Modules (`import/export`).
  - Node : **supporte ESM** et **CommonJS** (`require/module.exports`).

> [!WARNING] Erreur fréquente
> Essayer d’utiliser `document.querySelector` dans Node → **erreur** : Node n’a **pas** de DOM.

---

## ⏳ Modèle de concurrence : **Event Loop**, macrotâches & microtâches

Node exécute votre code JavaScript sur un **thread principal** (single-threaded pour JS) et délègue les I/O à **libuv**. Les callbacks reviennent via la **boucle d’événements**.

- **Macrotâches** : timers (`setTimeout`), I/O callbacks, `setImmediate`.
- **Microtâches** : Promises (jobs), `process.nextTick`.
- **Priorité** : les **microtâches** sont drainées **avant** de revenir aux macrotâches.

🧪 **Exemple d’ordonnancement**
```js
console.log('A');
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('B');

// Ordre typique :
// A
// B
// nextTick
// promise
// (puis) timeout ou immediate (selon phase et contexte)
```

> [!NOTE]
> `process.nextTick` est **drainé avant** les Promises, qui sont elles-mêmes avant les macrotâches. Évitez d’en abuser (risque de starvation des macrotâches).

---

## 📐 Mini-théorie en JavaScript (formules utiles)

### 1) Temps de réponse approximatif (latence)

Pour une requête qui effectue **k** opérations I/O **indépendantes**, la latence totale peut être **approximée** par :

```js
const cpu = 3;        // ms, temps CPU pur (par ex. sérialiser JSON)
const ioTimes = [80, 40, 100]; // ms, latences I/O indépendantes

// Latence totale ≈ max(ioTimes) + cpu
const totalLatencyMs = Math.max(...ioTimes) + cpu; // 100 + 3 = 103ms
```

> [!INFO]
> En non-bloquant, on **n’attend pas séquentiellement** chaque I/O. Les I/O indépendantes peuvent se **superposer** : la latence **tend vers** le **maximum** plutôt que la **somme**.

### 2) Débit (throughput) et concurrence logique

Avec `Promise.all`, lancer **n** requêtes parallèles (I/O bound) augmente le **débit** sans bloquer l’event loop :

```js
async function fetchAll(urls, fetchFn) {
  const start = Date.now();
  await Promise.all(urls.map(u => fetchFn(u)));
  const elapsed = Date.now() - start;
  return { elapsed, n: urls.length };
}

// Débit ≈ n / (elapsed / 1000)
// Si chaque I/O prend ~100ms et qu'elles sont indépendantes,
// le temps total peut rester proche de 100ms au lieu de 100ms * n.
```

> [!TIP]
> Le **throughput** dépend des limites en aval (DB, API, socket). Utilisez un **pool** ou un **limiteur de concurrence** pour éviter la saturation.

### 3) Coût d’un code bloquant vs non bloquant

```js
// Bloquant (synchrone)
const fs = require('fs');
const start = Date.now();
const a = fs.readFileSync('a.txt', 'utf8');
const b = fs.readFileSync('b.txt', 'utf8');
const c = fs.readFileSync('c.txt', 'utf8');
const syncElapsed = Date.now() - start; // ≈ ta + tb + tc

// Non bloquant (asynchrone)
const fsp = require('fs/promises');
(async () => {
  const startAsync = Date.now();
  const [aa, bb, cc] = await Promise.all([
    fsp.readFile('a.txt', 'utf8'),
    fsp.readFile('b.txt', 'utf8'),
    fsp.readFile('c.txt', 'utf8'),
  ]);
  const asyncElapsed = Date.now() - startAsync; // ≈ max(ta, tb, tc)
})();
```

---

## 🧪 Premiers pas : vérifier, exécuter, REPL

### ✅ Vérifier l’installation
```sh
node -v
npm -v
```

### ▶️ REPL (console interactive Node)
```sh
node
> 2 + 2
4
> [1,2,3].map(x => x * 2)
[ 2, 4, 6 ]
```

### 📝 Script minimal
`hello.js` :
```js
console.log('Bonjour depuis Node.js !');
```
Exécuter :
```sh
node hello.js
```

> [!TIP]
> Utilisez `node --watch file.js` (versions récentes) ou `nodemon` pour relancer automatiquement votre script.

---

## 🌐 Exemple concret : serveur HTTP minimal

Créez `server.js` :
```js
import http from 'node:http'; // ESM (Node >= 18 recommande ESM)

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ ok: true, path: req.url }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
```

`package.json` (pour activer ESM) :
```json
{
  "name": "chapitre-1-node-intro",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}
```

Lancer :
```sh
npm run start
```

> [!WARNING]
> En **CommonJS**, vous écririez `const http = require('http');`. Ne mélangez pas CJS et ESM sans comprendre les **interopérations**.

---

## 📁 Fichiers : sync vs async, Buffers

### Lecture synchrone (bloquante)
```js
const fs = require('fs');
const data = fs.readFileSync('./data.txt'); // Buffer
console.log('Taille (octets):', data.length);
```

### Lecture asynchrone (recommandée)
```js
import { readFile } from 'node:fs/promises';
const buf = await readFile('./data.txt');
const text = buf.toString('utf8');
console.log('Contenu:', text);
```

> [!NOTE]
> **Buffer** représente des données binaires brutes. `toString()` décode en texte selon l’encodage.

---

## 🔌 Réseau & non-blocking I/O (concept clé)

Node **n’attend pas** que l’I/O finisse : le **callback** est planifié. Votre thread JS reste disponible pour d’autres tâches.

🧪 **Expérience simple** (mesure de latence)
```js
import { readFile } from 'node:fs/promises';

const start = Date.now();
const p1 = readFile('a.txt', 'utf8');
const p2 = readFile('b.txt', 'utf8');
const p3 = readFile('c.txt', 'utf8');

const [a, b, c] = await Promise.all([p1, p2, p3]);
console.log('Total (ms) ≈ max des latences individuelles:', Date.now() - start);
```

---

## 🔗 Callbacks, Promises et `async/await`

### Callback style
```js
const fs = require('fs');
fs.readFile('file.txt', 'utf8', (err, content) => {
  if (err) return console.error(err);
  console.log(content);
});
```

### Promises
```js
const fsp = require('fs/promises');
fsp.readFile('file.txt', 'utf8')
  .then(content => console.log(content))
  .catch(console.error);
```

### `async/await` (syntaxe moderne)
```js
import { readFile } from 'node:fs/promises';

try {
  const content = await readFile('file.txt', 'utf8');
  console.log(content);
} catch (err) {
  console.error(err);
}
```

> [!TIP]
> Préférez `async/await` pour un **flux lisible** et des **erreurs** gérées par `try/catch`.

---

## ⚠️ Pièges et bonnes pratiques (dès le début)

- **Évitez le bloquant** (`readFileSync`, boucles CPU lourdes) sur le thread principal.
- **Erreurs asynchrones** : toujours `.catch(...)` ou `try/catch` pour Promises.
- **Variables d’environnement** : ne **hardcodez** pas les secrets; utilisez `process.env`.
- **Logs** : structurez (JSON), ajoutez des **timestamps**.
- **Interop ESM/CJS** : choisissez un format et restez cohérent.

> [!WARNING]
> Une boucle `while(true){}` ou un tri lourd sur de gros tableaux peut **geler** l’event loop. Pour le CPU intensif → `worker_threads`.

---

## 📚 Lexique rapide

- **Runtime** : environnement d’exécution.
- **V8** : moteur JS (Google).
- **libuv** : boucle d’événements + I/O multi-plateformes.
- **Event Loop** : mécanisme qui **ordonnance** callbacks et microtâches.
- **Non-blocking I/O** : I/O asynchrones, thread JS libre.
- **Buffer** : données binaires.
- **CommonJS / ESM** : deux systèmes de modules supportés par Node.

---

## 🧪 Atelier express (10 minutes)

1. Créez un dossier `chapitre-1/`.
2. Initialisez `package.json` :
   ```sh
   npm init -y
   ```
3. Ajoutez `type: "module"` dans `package.json`.
4. Créez `server.js` (voir plus haut).
5. Lancez `npm run start` et testez `GET /`.
6. Modifiez la réponse pour renvoyer l’heure courante (`new Date().toISOString()`).

---

## 🧭 Questions de compréhension

- Pourquoi Node est-il adapté aux **I/O** intensives ?
- Quelles sont les différences majeures entre **Node** et le **navigateur** ?
- Expliquez l’ordre d’exécution entre `nextTick`, Promises et `setTimeout`.
- Pourquoi `Promise.all` peut **réduire la latence** totale ?

---

## 🧩 Check-list de fin de chapitre

- [x] Je sais **ce qu’est Node** (runtime JS basé sur V8).
- [x] Je comprends le **modèle non bloquant** et l’**Event Loop**.
- [x] Je peux créer un **serveur HTTP** minimal.
- [x] Je sais quand **éviter** le code **bloquant**.

---

## 📘 Résumé des points essentiels

- **Node.js** : runtime JS côté serveur appuyé sur **V8** et **libuv**.
- **Non-blocking I/O** : le thread JS reste libre; les I/O sont **asynchrones**, orchestrées par l’**Event Loop**.
- **Microtâches** (Promises, `nextTick`) sont traitées **avant** les macrotâches (timers, I/O callbacks).
- **ESM** est la voie moderne (`import/export`) ; **CommonJS** reste largement utilisé.
- **Cas d’usage** : APIs, services temps réel, CLI, gateways, proxies; évitez les workloads **CPU intensifs** sans offloading.
- **Pratique** : démarrez par un **serveur HTTP minimal**, utilisez `async/await`, évitez le **bloquant**.

---

### 📎 Métadonnées Obsidian
- Tags : `#NodeJS` `#Introduction` `#Runtime` `#EventLoop` `#NonBlockingIO`
- Icônes suggérées : 📗 (chapitre), 🔍 (définition), ⏳ (event loop), 🌐 (HTTP), 🧪 (exemples), ⚠️ (pièges), 💡 (tips)

